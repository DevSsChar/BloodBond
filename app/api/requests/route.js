import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/models/BloodRequest.js";
import User from "@/models/user.js";
import BloodBank from "@/models/BloodBank.js";
import BloodInventory from "@/models/BloodInventory.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    
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
      emergency_contact_mobile,
      emergency_requester_email,
      emergency_requester_name,
      emergency_requester_mobile
    } = body;

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
      requested_date: new Date(),
      emergency_contact_name,
      emergency_contact_mobile
    };

    // Set the requester based on role
    if (user.role === "hospital") {
      requestData.requested_by_hospital = userId;
    } else {
      requestData.requested_by_user = userId;
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
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const body = await req.json();
    const { request_id, status, fulfilled_date, rejection_reason } = body;
    
    if (!request_id || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
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
      fulfilled_date: status === "accepted" ? (fulfilled_date || new Date()) : null,
      rejection_reason: status === "rejected" ? rejection_reason : null
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