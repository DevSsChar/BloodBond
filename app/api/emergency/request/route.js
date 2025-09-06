import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/model/BloodRequest.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    
    // Get user token (optional for emergency requests)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    const body = await req.json();
    const {
      patientName,
      contactNumber,
      bloodType,
      unitsRequired,
      hospitalLocation,
      emergencyDetails,
      latitude,
      longitude,
      selectedBloodBankId,
      isLoggedIn,
      userEmail,
      requesterName,
      requesterEmail,
      relationToPatient
    } = body;

    // Validate required fields
    if (!patientName || !contactNumber || !bloodType || !unitsRequired || !hospitalLocation || !emergencyDetails || !selectedBloodBankId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Additional validation for non-logged-in users
    if (!isLoggedIn && (!requesterName || !requesterEmail || !relationToPatient)) {
      return NextResponse.json(
        { error: "Requester information is required for emergency access" },
        { status: 400 }
      );
    }

    let user = null;
    
    // Handle logged-in users
    if (token && isLoggedIn) {
      user = await User.findOne({ email: token.email });
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    // Create emergency blood request
    const emergencyRequestData = {
      bloodbank_id: selectedBloodBankId,
      blood_type: bloodType,
      units_required: parseInt(unitsRequired),
      request_type: "emergency",
      status: "pending",
      emergency_contact_name: patientName,
      emergency_contact_mobile: contactNumber,
      emergency_details: emergencyDetails,
      hospital_location: hospitalLocation,
      user_latitude: latitude,
      user_longitude: longitude
    };

    // Add user reference for logged-in users, or store requester info for non-logged-in users
    if (user) {
      emergencyRequestData.requested_by_user = user._id;
    } else {
      // Store requester information for non-logged-in emergency requests
      emergencyRequestData.emergency_requester_name = requesterName;
      emergencyRequestData.emergency_requester_email = requesterEmail;
      emergencyRequestData.relation_to_patient = relationToPatient;
      emergencyRequestData.requested_by_user = null; // No user reference
    }

    const emergencyRequest = await BloodRequest.create(emergencyRequestData);

    return NextResponse.json({
      success: true,
      message: "Emergency blood request submitted successfully",
      requestId: emergencyRequest._id,
      data: emergencyRequest
    });

  } catch (error) {
    console.error("Emergency request error:", error);
    return NextResponse.json(
      { error: "Failed to submit emergency request" },
      { status: 500 }
    );
  }
}
