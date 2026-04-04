import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/models/BloodRequest.js";
import User from "@/models/user.js";
import BloodBank from "@/models/BloodBank.js";
import BloodInventory from "@/models/BloodInventory.js";
import Doner from "@/models/Doner.js";
import DonorContactRequest from "@/models/DonorContactRequest.js";
import InAppNotification from "@/models/InAppNotification.js";
import { getToken } from "next-auth/jwt";
import { getFeatureFlags } from "@/lib/featureFlags.js";

const LOW_STOCK_THRESHOLD = Number(process.env.REPLACEMENT_LOW_STOCK_THRESHOLD || 5);
const DIRE_SHORTAGE_THRESHOLD = Number(process.env.DIRE_SHORTAGE_THRESHOLD || 2);

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildReplacementMessage({ bloodBank, request, remainingUnits }) {
  return [
    `Emergency replenishment request from ${bloodBank?.name || "a blood bank"}.`,
    `A patient request for ${request.blood_type} (${request.units_required} unit(s)) has been fulfilled from stock.`,
    "Please donate any blood type you are eligible to give to replenish general inventory.",
    `Current post-issue stock for requested type: ${Math.max(0, remainingUnits)} unit(s).`
  ].join(" ");
}

async function createDonorReplacementNotification({ donor, bloodBank, request }) {
  if (!donor?.user_id) return;

  const donorUserId = donor.user_id?._id || donor.user_id;
  await InAppNotification.create({
    user_id: donorUserId,
    type: "system",
    title: "Urgent Replacement Donation Request",
    message: `${bloodBank?.name || "A blood bank"} requested your help to replenish inventory for an emergency ${request.blood_type} request (${request.units_required} unit(s)).`
  });
}

async function assignReplacementDonor({ request, bloodBank, requesterId, remainingUnits }) {
  const bankCoordinates = bloodBank?.location?.coordinates;
  const hasBankCoordinates = Array.isArray(bankCoordinates) && bankCoordinates.length === 2;

  const donorQuery = {
    user_id: { $ne: requesterId }
  };

  if (remainingUnits <= DIRE_SHORTAGE_THRESHOLD) {
    donorQuery.is_critical_ready = true;
  }

  let donors = await Doner.find(donorQuery).populate("user_id", "name email");

  if (remainingUnits > DIRE_SHORTAGE_THRESHOLD) {
    donors = donors.sort((a, b) => {
      const aReady = a.is_critical_ready ? 1 : 0;
      const bReady = b.is_critical_ready ? 1 : 0;
      return bReady - aReady;
    });
  }

  let rankedDonors = donors;
  if (hasBankCoordinates) {
    const [bankLng, bankLat] = bankCoordinates;
    rankedDonors = donors
      .map((donor) => {
        const coords = donor?.current_location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;
        const [donorLng, donorLat] = coords;
        return {
          donor,
          distance: calculateDistance(bankLat, bankLng, donorLat, donorLng)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .map((entry) => entry.donor);

    if (rankedDonors.length === 0) {
      rankedDonors = donors;
    }
  }

  for (const donor of rankedDonors) {
    const existingPending = await DonorContactRequest.findOne({
      requesterId,
      donorId: donor._id,
      status: "pending"
    });

    if (existingPending) continue;

    const message = buildReplacementMessage({ bloodBank, request, remainingUnits });
    const created = await DonorContactRequest.create({
      requesterId,
      donorId: donor._id,
      bloodType: request.blood_type,
      urgencyLevel: "High",
      message
    });

    await createDonorReplacementNotification({ donor, bloodBank, request });

    return {
      donor,
      contactRequest: created,
      message
    };
  }

  return null;
}

export async function POST(req) {
  try {
    await connectDB();
    const featureFlags = getFeatureFlags();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const body = await req.json();
    const { 
      blood_type, 
      units_required, 
      bloodbank_id,
      request_type,
      emergency_contact_name,
      emergency_contact_mobile
    } = body;

    const effectiveRequestType = request_type || (user.role === "hospital" ? "normal" : "emergency");

    // Validate required fields
    if (!blood_type || !units_required || !bloodbank_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify blood bank exists
    const bloodBank = await BloodBank.findById(bloodbank_id);
    if (!bloodBank) {
      return NextResponse.json(
        { error: "Blood bank not found" },
        { status: 404 }
      );
    }

    // Validate units is a positive number
    if (units_required <= 0) {
      return NextResponse.json(
        { error: "Units required must be a positive number" },
        { status: 400 }
      );
    }

    // Emergency contact validation for emergency requests
    if (effectiveRequestType === "emergency" && user.role === "user") {
      if (!emergency_contact_name || !emergency_contact_mobile) {
        return NextResponse.json(
          { error: "Emergency contact information is required for emergency requests" },
          { status: 400 }
        );
      }
    }

    // Create the blood request with appropriate fields
    const requestData = {
      blood_type,
      units_required,
      bloodbank_id,
      request_type: effectiveRequestType,
      status: "pending",
      requested_date: new Date(),
      emergency_contact_name,
      emergency_contact_mobile,
      replacement_needed: effectiveRequestType === "emergency"
    };

    // Set the requester based on role
    if (user.role === "hospital") {
      requestData.requested_by_hospital = userId;
    } else {
      requestData.requested_by_user = userId;
    }

    const inventory = await BloodInventory.findOne({
      bloodbank_id,
      blood_type
    });
    const availableUnits = inventory?.units_available || 0;

    requestData.inventory_checked_at = new Date();
    requestData.inventory_units_before = availableUnits;

    if (featureFlags.strictInventoryGateEnabled && availableUnits < Number(units_required)) {
      requestData.status = "shortage_pending";
      requestData.shortage_reason = `Insufficient stock at request creation (${availableUnits}/${units_required} units available).`;
    }

    const newRequest = await BloodRequest.create(requestData);

    return NextResponse.json(
      { 
        message:
          newRequest.status === "shortage_pending"
            ? "Request recorded with shortage status. Blood bank will handle donor assignment directly."
            : `${effectiveRequestType || "Blood"} request created successfully`,
        request: newRequest 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Blood request creation error:", error);
    return NextResponse.json(
      { error: "Failed to create blood request" },
      { status: 500 }
    );
  }
}

// Get blood requests - with role-based filtering
export async function GET(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const request_type = searchParams.get("request_type");
    
    let query = {};
    
    // Role-based filtering
    if (user.role === 'user') {
      // Users can see their own requests (including emergency requests)
      query.$or = [
        { requested_by_user: userId },
        { emergency_requester_email: user.email } // For emergency requests made before login
      ];
    } else if (user.role === 'bloodbank_admin') {
      // Blood banks can see requests to their banks
      const bloodBank = await BloodBank.findOne({ user_id: userId });
      if (bloodBank) {
        query.bloodbank_id = bloodBank._id;
      } else {
        return NextResponse.json({ requests: [] }, { status: 200 });
      }
    } else if (user.role === 'hospital') {
      // Hospitals can see all requests or filter by their requests
      query.requested_by_hospital = userId;
    }
    
    // Apply additional filters
    if (status) query.status = status;
    if (request_type) query.request_type = request_type;
    
    const requests = await BloodRequest.find(query)
      .populate('requested_by_user', 'name email mobile_number')
      .populate('requested_by_hospital', 'name email mobile_number')
      .populate('bloodbank_id', 'name address contact_number email')
      .populate({
        path: 'replacement_donor_id',
        populate: { path: 'user_id', select: 'name email mobile_number' }
      })
      .sort({ requested_date: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood requests" },
      { status: 500 }
    );
  }
}

// Update request status - only by bloodbank admin
export async function PUT(req) {
  try {
    await connectDB();
    const featureFlags = getFeatureFlags();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const body = await req.json();
    const { request_id, status, fulfilled_date, rejection_reason, replacement_donor_id } = body;
    
    if (!request_id || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
        { status: 400 }
      );
    }

    // Verify status is valid
    if (!["accepted", "rejected", "pending", "shortage_pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'accepted', 'shortage_pending', or 'rejected'" },
        { status: 400 }
      );
    }

    // If rejecting, rejection reason is mandatory
    if (status === "rejected" && !rejection_reason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting a request" },
        { status: 400 }
      );
    }

    // Verify user exists and is a blood bank admin
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "bloodbank_admin") {
      return NextResponse.json(
        { error: "Only blood bank administrators can update request status" },
        { status: 403 }
      );
    }
    
    // Find the request
    const request = await BloodRequest.findById(request_id);
    if (!request) {
      return NextResponse.json(
        { error: "Blood request not found" },
        { status: 404 }
      );
    }
    
    // Verify the admin manages this blood bank
    const bloodBank = await BloodBank.findOne({
      _id: request.bloodbank_id,
      user_id: userId
    });

    if (!bloodBank) {
      return NextResponse.json(
        { error: "Not authorized to update status for this blood bank's requests" },
        { status: 403 }
      );
    }

    let inventoryUnitsAfter = null;
    let replacementAssignmentResult = null;

    // If accepting the request, check inventory and update
    if (status === "accepted") {
      const inventory = await BloodInventory.findOne({
        bloodbank_id: request.bloodbank_id,
        blood_type: request.blood_type
      });
      const availableUnits = inventory?.units_available || 0;

      if (!inventory || availableUnits < request.units_required) {
        let shortageAssignmentResult = null;

        const isEmergencyShortage =
          featureFlags.emergencyAutoReplacementEnabled &&
          request.request_type === "emergency";

        // Emergency shortages must include an explicit replacement donor selection.
        if (isEmergencyShortage) {
          if (!replacement_donor_id) {
            if (featureFlags.strictInventoryGateEnabled) {
              return NextResponse.json(
                {
                  error: "Not enough blood units available. Please select a replacement donor.",
                  shortage: true,
                  requiresManualReplacement: true
                },
                { status: 409 }
              );
            }

            return NextResponse.json(
              { error: "Not enough blood units available to fulfill this request" },
              { status: 400 }
            );
          }

          const donor = await Doner.findById(replacement_donor_id).populate("user_id", "name email mobile_number");
          if (!donor) {
            return NextResponse.json(
              { error: "Selected donor not found. Please choose another donor." },
              { status: 400 }
            );
          }

          const message = buildReplacementMessage({ bloodBank, request, remainingUnits: availableUnits });
          const contactRequest = await DonorContactRequest.create({
            requesterId: userId,
            donorId: donor._id,
            bloodType: request.blood_type,
            urgencyLevel: "High",
            message
          });
          await createDonorReplacementNotification({ donor, bloodBank, request });
          shortageAssignmentResult = { donor, contactRequest, message };
        }

        const updateDataParams = {
          status: shortageAssignmentResult ? "accepted" : "shortage_pending",
          fulfilled_date: shortageAssignmentResult ? new Date() : null,
          inventory_checked_at: new Date(),
          inventory_units_before: availableUnits,
          inventory_units_after: availableUnits,
          shortage_reason: `Insufficient stock during acceptance (${availableUnits}/${request.units_required} units available).`,
          replacement_needed: request.request_type === "emergency"
        };

        if (shortageAssignmentResult) {
          updateDataParams.replacement_assignment_status = "assigned";
          updateDataParams.replacement_donor_id = shortageAssignmentResult.donor._id;
          updateDataParams.replacement_contact_request_id = shortageAssignmentResult.contactRequest._id;
          updateDataParams.replacement_message = shortageAssignmentResult.message;
        } else if (request.request_type === "emergency") {
          updateDataParams.replacement_assignment_status = "not_found";
        }

        const shortageRequest = await BloodRequest.findByIdAndUpdate(
          request_id,
          updateDataParams,
          { new: true }
        );

        if (featureFlags.strictInventoryGateEnabled) {
          // If replacement donor was selected for emergency shortage, treat as successful shortage workflow.
          if (isEmergencyShortage && shortageAssignmentResult) {
            return NextResponse.json(
              {
                message: "Shortage recorded and replacement donor assigned.",
                request: shortageRequest,
                shortage: true,
                replacementDonorAssigned: true,
                replacementDonorId: shortageAssignmentResult.donor._id,
                replacementDonor: {
                  donorId: shortageAssignmentResult.donor._id,
                  name: shortageAssignmentResult.donor?.user_id?.name || null,
                  email: shortageAssignmentResult.donor?.user_id?.email || null,
                  mobile: shortageAssignmentResult.donor?.mobile_number || null
                },
                replacementContactRequestId: shortageAssignmentResult?.contactRequest?._id || null
              },
              { status: 200 }
            );
          }

          return NextResponse.json(
            {
              error: "Not enough blood units available. Status updated to Shortage Pending and replacement checked.",
              request: shortageRequest,
              shortage: true,
              replacementDonorAssigned: Boolean(shortageAssignmentResult),
              replacementDonorId: shortageAssignmentResult?.donor?._id || null,
              replacementContactRequestId: shortageAssignmentResult?.contactRequest?._id || null
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: "Not enough blood units available to fulfill this request" },
          { status: 400 }
        );
      }

      await BloodInventory.findByIdAndUpdate(
        inventory._id,
        { units_available: availableUnits - request.units_required }
      );

      inventoryUnitsAfter = availableUnits - request.units_required;

      const shouldAssignReplacement =
        featureFlags.emergencyAutoReplacementEnabled &&
        request.request_type === "emergency" &&
        inventoryUnitsAfter <= LOW_STOCK_THRESHOLD;

      if (shouldAssignReplacement) {
        replacementAssignmentResult = await assignReplacementDonor({
          request,
          bloodBank,
          requesterId: userId,
          remainingUnits: inventoryUnitsAfter
        });
      }
    }
    
    // Update request status
    const updateData = { 
      status,
      fulfilled_date: status === "accepted" ? (fulfilled_date || new Date()) : null,
      rejection_reason: status === "rejected" ? rejection_reason : null,
      shortage_reason: status === "shortage_pending" ? rejection_reason || "Stock is currently unavailable." : null
    };

    if (status === "accepted") {
      updateData.inventory_checked_at = new Date();
      updateData.inventory_units_after = inventoryUnitsAfter;
      updateData.replacement_needed = request.request_type === "emergency";

      if (replacementAssignmentResult) {
        updateData.replacement_assignment_status = "assigned";
        updateData.replacement_donor_id = replacementAssignmentResult.donor._id;
        updateData.replacement_contact_request_id = replacementAssignmentResult.contactRequest._id;
        updateData.replacement_message = replacementAssignmentResult.message;
      } else if (request.request_type === "emergency" && inventoryUnitsAfter <= LOW_STOCK_THRESHOLD) {
        updateData.replacement_assignment_status = "not_found";
      } else {
        updateData.replacement_assignment_status = "not_required";
      }
    }
    
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      request_id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(
      { 
        message: `Blood request ${status}`, 
        request: updatedRequest,
        replacementDonorAssigned: Boolean(replacementAssignmentResult),
        replacementDonorId: replacementAssignmentResult?.donor?._id || null,
        replacementContactRequestId: replacementAssignmentResult?.contactRequest?._id || null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blood request update error:", error);
    return NextResponse.json(
      { error: "Failed to update blood request" },
      { status: 500 }
    );
  }
}