import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/models/BloodRequest.js";
import EmergencyAadhaarVerification from "@/models/EmergencyAadhaarVerification.js";
import User from "@/models/user.js";
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
      relationToPatient,
      aadhaarVerificationId
    } = body;

    const derivedHospitalLocation = hospitalLocation || (
      latitude !== null && longitude !== null
        ? `Current location (${latitude}, ${longitude})`
        : null
    );

    if (!aadhaarVerificationId) {
      return NextResponse.json(
        { error: "Aadhaar verification is required before submitting an emergency request" },
        { status: 400 }
      );
    }

    const verification = await EmergencyAadhaarVerification.findById(
      aadhaarVerificationId
    );
    if (
      !verification ||
      verification.status !== "verified" ||
      !verification.aadhaar_subject_ref ||
      !verification.expires_at ||
      verification.expires_at < new Date()
    ) {
      return NextResponse.json(
        { error: "Aadhaar verification is missing or expired. Please verify again." },
        { status: 403 }
      );
    }
    if (verification.used_by_request) {
      return NextResponse.json(
        { error: "This Aadhaar verification was already used for a request." },
        { status: 409 }
      );
    }

    const duplicateOpen = await BloodRequest.findOne({
      aadhaar_subject_ref: verification.aadhaar_subject_ref,
      request_type: "emergency",
      status: { $in: ["pending", "accepted", "shortage_pending"] },
    });
    if (duplicateOpen) {
      return NextResponse.json(
        {
          error:
            "An open emergency request already exists for this Aadhaar identity. Track the existing request or wait until it is resolved.",
          existingRequestId: duplicateOpen._id,
        },
        { status: 409 }
      );
    }

    // Validate required fields
    if (!patientName || !contactNumber || !bloodType || !unitsRequired || !emergencyDetails || !selectedBloodBankId) {
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
      hospital_location: derivedHospitalLocation,
      user_latitude: latitude,
      user_longitude: longitude,
      aadhaar_verification_id: verification._id,
      aadhaar_subject_ref: verification.aadhaar_subject_ref,
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

    verification.used_by_request = emergencyRequest._id;
    await verification.save();

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
