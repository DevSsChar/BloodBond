import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";

// Simple test to directly update a donor's critical status
export async function GET(req) {
  try {
    await connectDB();
    
    // Get the first donor
    const donor = await Donor.findOne();
    
    if (!donor) {
      return NextResponse.json({
        error: "No donors found in database"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: "Current donor status",
      donor_id: donor._id,
      user_id: donor.user_id,
      is_critical_ready: donor.is_critical_ready,
      current_location: donor.current_location
    }, { status: 200 });
  } catch (error) {
    console.error("Error in test:", error);
    return NextResponse.json(
      { error: "Database error", details: error.message },
      { status: 500 }
    );
  }
}

// Test endpoint to toggle critical status
export async function POST(req) {
  try {
    await connectDB();
    
    // Get the first donor and toggle their status
    const donor = await Donor.findOne();
    
    if (!donor) {
      return NextResponse.json({
        error: "No donors found in database"
      }, { status: 404 });
    }
    
    const newStatus = !donor.is_critical_ready;
    
    const updatedDonor = await Donor.findByIdAndUpdate(
      donor._id,
      { is_critical_ready: newStatus },
      { new: true }
    );
    
    return NextResponse.json({
      message: "Donor status updated",
      previous_status: donor.is_critical_ready,
      new_status: updatedDonor.is_critical_ready,
      donor_id: updatedDonor._id
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating donor:", error);
    return NextResponse.json(
      { error: "Update failed", details: error.message },
      { status: 500 }
    );
  }
}