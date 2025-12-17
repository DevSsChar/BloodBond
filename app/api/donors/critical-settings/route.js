import { NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";

// Update donor critical service settings (simplified - no radius)
export async function PUT(req) {
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
    const { is_critical_ready, current_location } = body;

    if (typeof is_critical_ready !== 'boolean') {
      return NextResponse.json(
        { error: "is_critical_ready must be a boolean" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData = { is_critical_ready };
    
    // Add location if provided
    if (current_location && current_location.coordinates) {
      const [lng, lat] = current_location.coordinates;
      if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        updateData.current_location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }

    // Find and update donor by user_id from token
    const updatedDonor = await Donor.findOneAndUpdate(
      { user_id: token.sub },
      updateData,
      { new: true, upsert: false }
    );

    if (!updatedDonor) {
      return NextResponse.json(
        { error: "Donor profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: "Critical service settings updated successfully",
      is_critical_ready: updatedDonor.is_critical_ready,
      current_location: updatedDonor.current_location
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating critical service settings:", error);
    return NextResponse.json(
      { error: "Failed to update critical service settings" },
      { status: 500 }
    );
  }
}

// Get donor critical service settings (simplified)
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
        error: "Donor profile not found",
        debug: { user_id: token.sub, email: token.email }
      }, { status: 404 });
    }
    
    return NextResponse.json({
      is_critical_ready: donor.is_critical_ready || false,
      current_location: donor.current_location || { type: 'Point', coordinates: [0, 0] }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching critical service settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch critical service settings" },
      { status: 500 }
    );
  }
}