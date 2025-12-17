import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";

// Update donor stats when a request is accepted
export async function POST(req) {
  try {
    // Get session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { activity, incrementAcceptedRequests = false } = body;

    const donor = await Donor.findOne({ user_id: token.sub });
    
    if (!donor) {
      return NextResponse.json({
        error: "Donor profile not found"
      }, { status: 404 });
    }

    // Build update object
    const updateData = {};
    
    if (incrementAcceptedRequests) {
      updateData.$inc = { accepted_requests: 1 };
    }
    
    if (activity) {
      updateData.$push = {
        recent_activity: {
          $each: [activity],
          $slice: -10 // Keep only the last 10 activities
        }
      };
    }

    const updatedDonor = await Donor.findOneAndUpdate(
      { user_id: token.sub },
      updateData,
      { new: true }
    );

    if (!updatedDonor) {
      return NextResponse.json(
        { error: "Failed to update donor stats" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Donor stats updated successfully",
      acceptedRequests: updatedDonor.accepted_requests,
      totalActivities: updatedDonor.recent_activity?.length || 0
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating donor stats:", error);
    return NextResponse.json(
      { error: "Failed to update donor stats" },
      { status: 500 }
    );
  }
}