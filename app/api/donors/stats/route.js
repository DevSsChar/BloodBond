import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";

// Get donor statistics and recent activity
export async function GET(req) {
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

    const donor = await Donor.findOne({ user_id: token.sub });
    
    if (!donor) {
      return NextResponse.json({
        error: "Donor profile not found"
      }, { status: 404 });
    }

    // Calculate stats from donor record
    const stats = {
      totalDonations: donor.total_donations || 0,
      livesSaved: (donor.total_donations || 0) * 3, // Estimate: each donation can save up to 3 lives
      acceptedRequests: donor.accepted_requests || 0,
      recentActivity: donor.recent_activity || []
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching donor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor stats" },
      { status: 500 }
    );
  }
}