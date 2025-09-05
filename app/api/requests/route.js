import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/model/BloodRequest.js";
import User from "@/model/user.js";
import BloodBank from "@/model/BloodBank.js";
import BloodInventory from "@/model/BloodInventory.js";
import { authenticateRole } from "@/lib/roleAuth.js";

export async function POST(req) {
  // Protect route - only hospitals and users can create blood requests
  const auth = await authenticateRole(req, ['hospital', 'user']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

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
  // Protect route - all authenticated users can view requests
  const auth = await authenticateRole(req);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const bloodbank_id = searchParams.get("bloodbank_id");
    const status = searchParams.get("status");
    const request_type = searchParams.get("request_type");
    
    let query = {};
    
    // Role-based filtering
    if (auth.role === 'user' && user_id) {
      // Users can only see their own requests
      query.user_id = user_id;
    } else if (auth.role === 'bloodbank_admin') {
      // Blood banks can see requests to their banks
      if (bloodbank_id) query.bloodbank_id = bloodbank_id;
    } else if (auth.role === 'hospital') {
      // Hospitals can see all requests or filter by their requests
      if (user_id) query.user_id = user_id;
      if (bloodbank_id) query.bloodbank_id = bloodbank_id;
    }
    
    // Apply additional filters
    if (status) query.status = status;
    if (request_type) query.request_type = request_type;
    
    const requests = await BloodRequest.find(query)
      .populate('user_id', 'name email')
      .populate('bloodbank_id', 'name address')
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