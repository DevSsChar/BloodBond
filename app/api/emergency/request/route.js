import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/model/BloodRequest.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    
    // Get user token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

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
      selectedBloodBankId
    } = body;

    // Validate required fields
    if (!patientName || !contactNumber || !bloodType || !unitsRequired || !hospitalLocation || !emergencyDetails || !selectedBloodBankId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create emergency blood request
    const emergencyRequest = await BloodRequest.create({
      requested_by_user: user._id,
      bloodbank_id: selectedBloodBankId,
      blood_type: bloodType,
      units_required: parseInt(unitsRequired),
      request_type: "emergency",
      status: "pending",
      emergency_contact_name: patientName,
      emergency_contact_mobile: contactNumber,
      // Store additional emergency details in a custom field (we might need to update the model)
      emergency_details: emergencyDetails,
      hospital_location: hospitalLocation,
      user_latitude: latitude,
      user_longitude: longitude
    });

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
