import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonorContactRequest from "@/models/DonorContactRequest.js";
import Donor from "@/models/Doner.js";

export async function GET(req) {
  try {
    await connectDB();
    
    // Get all DonorContactRequests for debugging
    const allRequests = await DonorContactRequest.find({})
      .populate('requesterId', 'name email role')
      .populate('donorId', 'user_id blood_type')
      .sort({ requestDate: -1 });

    // Get all Donors for reference
    const allDonors = await Donor.find({}).select('_id user_id blood_type');

    console.log("📊 Debug Info:");
    console.log("Total DonorContactRequests:", allRequests.length);
    console.log("Total Donors:", allDonors.length);
    
    return NextResponse.json({
      success: true,
      requests: allRequests,
      donors: allDonors,
      debug: {
        totalRequests: allRequests.length,
        totalDonors: allDonors.length
      }
    });

  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error.message },
      { status: 500 }
    );
  }
}