import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonorContactRequest from "@/model/DonorContactRequest.js";
import Donor from "@/model/Doner.js";
import User from "@/model/user.js";

export async function POST(req) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { donorUserId, requesterUserId, bloodType, urgencyLevel, message } = body;

    // Find the donor by user_id
    const donor = await Donor.findOne({ user_id: donorUserId });
    if (!donor) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404 }
      );
    }

    // Verify requester exists
    const requester = await User.findById(requesterUserId);
    if (!requester) {
      return NextResponse.json(
        { error: "Requester not found" },
        { status: 404 }
      );
    }

    // Create the request
    const newRequest = await DonorContactRequest.create({
      requesterId: requesterUserId,
      donorId: donor._id,
      bloodType: bloodType || 'A+',
      urgencyLevel: urgencyLevel || 'High',
      message: message || 'Urgent blood needed for patient'
    });

    const populatedRequest = await DonorContactRequest.findById(newRequest._id)
      .populate('requesterId', 'name email role')
      .populate('donorId', 'user_id blood_type');

    console.log("✅ Created test DonorContactRequest:", populatedRequest);

    return NextResponse.json({
      success: true,
      request: populatedRequest
    });

  } catch (error) {
    console.error("❌ Error creating test request:", error);
    return NextResponse.json(
      { error: "Failed to create test request", details: error.message },
      { status: 500 }
    );
  }
}