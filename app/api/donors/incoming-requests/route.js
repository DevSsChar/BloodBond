import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/model/Doner.js";
import DonorContactRequest from "@/model/DonorContactRequest.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    await connectDB();
    
    // Get the JWT token to identify the current user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    // Find the donor profile for this user
    const donor = await Donor.findOne({ user_id: token.userId });
    
    if (!donor) {
      return NextResponse.json(
        { error: "Donor profile not found" },
        { status: 404 }
      );
    }

    console.log("🔵 Fetching requests for donor:", donor._id);

    // Fetch DonorContactRequests made to this specific donor
    const donorContactRequests = await DonorContactRequest.find({
      donorId: donor._id,
      status: { $in: ['pending', 'accepted'] }, // Only show active requests
      expiresAt: { $gt: new Date() } // Only non-expired requests
    })
    .populate('requesterId', 'name email role')
    .sort({ requestDate: -1 })
    .lean();

    console.log("🔵 Found DonorContactRequests:", donorContactRequests.length);

    // Transform DonorContactRequests to match the expected format
    const transformedRequests = donorContactRequests.map(request => ({
      _id: request._id,
      type: 'donor_contact_request',
      blood_type: request.bloodType,
      urgency: request.urgencyLevel.toLowerCase(),
      message: request.message,
      requester_name: request.requesterId?.name,
      requester_email: request.requesterId?.email,
      requester_role: request.requesterId?.role,
      contact_email: request.requesterId?.email,
      created_at: request.requestDate,
      expires_at: request.expiresAt,
      status: request.status,
      distance: 0 // Not applicable for direct requests
    }));

    console.log("✅ Transformed requests:", transformedRequests.length);

    return NextResponse.json({
      success: true,
      requests: transformedRequests
    });

  } catch (error) {
    console.error("❌ Error fetching incoming requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch incoming requests", details: error.message },
      { status: 500 }
    );
  }
}