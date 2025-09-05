import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BloodRequest from "@/models/BloodRequest";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";
import BloodInventory from "@/models/BloodInventory";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { 
      user_id,
      blood_type, 
      units_required, 
      bloodbank_id,
      request_type,
      emergency_contact_name,
      emergency_contact_mobile
    } = body;

    // Validate required fields
    if (!user_id || !blood_type || !units_required || !bloodbank_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(user_id);
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

    // Check request type permissions
    if (request_type === "normal" && user.role !== "hospital") {
      return NextResponse.json(
        { error: "Only hospitals can create normal blood requests" },
        { status: 403 }
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
    if (request_type === "emergency" && user.role === "user") {
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
      request_type: request_type || (user.role === "hospital" ? "normal" : "emergency"),
      status: "pending",
      emergency_contact_name,
      emergency_contact_mobile
    };

    // Set the requester based on role
    if (user.role === "hospital") {
      requestData.requested_by_hospital = user_id;
    } else {
      requestData.requested_by_user = user_id;
    }

    const newRequest = await BloodRequest.create(requestData);

    return NextResponse.json(
      { 
        message: `${request_type || 'Blood'} request created successfully`, 
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
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const bloodbank_id = searchParams.get("bloodbank_id");
    const status = searchParams.get("status");
    const request_type = searchParams.get("request_type");
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let query = {};
    
    // Apply role-based filtering
    if (user.role === "bloodbank_admin") {
      // Blood bank admins can see requests for their blood banks
      if (!bloodbank_id) {
        // Get all blood banks managed by this admin
        const bloodBanks = await BloodBank.find({ user_id });
        const bloodBankIds = bloodBanks.map(bank => bank._id);
        
        if (bloodBankIds.length === 0) {
          return NextResponse.json({ requests: [] }, { status: 200 });
        }
        
        query.bloodbank_id = { $in: bloodBankIds };
      } else {
        // Verify admin manages this blood bank
        const bloodBank = await BloodBank.findOne({
          _id: bloodbank_id,
          user_id
        });

        if (!bloodBank) {
          return NextResponse.json(
            { error: "Not authorized to view requests for this blood bank" },
            { status: 403 }
          );
        }
        
        query.bloodbank_id = bloodbank_id;
      }
    } else if (user.role === "hospital") {
      // Hospitals see their own requests
      query.requested_by_hospital = user_id;
    } else {
      // Regular users see their own requests
      query.requested_by_user = user_id;
    }
    
    // Additional filters
    if (status && ["pending", "accepted", "rejected"].includes(status)) {
      query.status = status;
    }
    
    if (request_type && ["normal", "emergency"].includes(request_type)) {
      query.request_type = request_type;
    }
    
    // Get requests and sort by date (newest first)
    const requests = await BloodRequest.find(query).sort({ requested_date: -1 });
    
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
  await connectDB();
  
  try {
    const body = await req.json();
    const { admin_id, request_id, status, fulfilled_date } = body;
    
    if (!admin_id || !request_id || !status) {
      return NextResponse.json(
        { error: "Admin ID, request ID, and status are required" },
        { status: 400 }
      );
    }

    // Verify status is valid
    if (!["accepted", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'accepted', or 'rejected'" },
        { status: 400 }
      );
    }

    // Verify user exists and is a blood bank admin
    const user = await User.findById(admin_id);
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
      user_id: admin_id
    });

    if (!bloodBank) {
      return NextResponse.json(
        { error: "Not authorized to update status for this blood bank's requests" },
        { status: 403 }
      );
    }

    // If accepting the request, check inventory and update
    if (status === "accepted") {
      // Find the relevant inventory
      const inventory = await BloodInventory.findOne({
        bloodbank_id: request.bloodbank_id,
        blood_type: request.blood_type
      });

      // Check if there's enough blood available
      if (!inventory || inventory.units_available < request.units_required) {
        return NextResponse.json(
          { error: "Not enough blood units available to fulfill this request" },
          { status: 400 }
        );
      }

      // Update inventory
      await BloodInventory.findByIdAndUpdate(
        inventory._id,
        { units_available: inventory.units_available - request.units_required }
      );
    }
    
    // Update request status
    const updateData = { 
      status,
      fulfilled_date: status === "accepted" ? (fulfilled_date || new Date()) : null
    };
    
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      request_id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(
      { 
        message: `Blood request ${status}`, 
        request: updatedRequest 
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