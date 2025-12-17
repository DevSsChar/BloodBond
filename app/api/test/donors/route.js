import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";

// Simple test endpoint to check all donors and their critical status
export async function GET(req) {
  try {
    await connectDB();
    
    // Find all donors and return their critical status
    const donors = await Donor.find({}).select('user_id is_critical_ready current_location');
    
    return NextResponse.json({
      message: "All donor critical statuses",
      count: donors.length,
      donors: donors.map(donor => ({
        user_id: donor.user_id,
        is_critical_ready: donor.is_critical_ready,
        has_location: !!donor.current_location
      }))
    }, { status: 200 });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch donor data", details: error.message },
      { status: 500 }
    );
  }
}