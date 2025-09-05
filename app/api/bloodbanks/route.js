import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodBank from "@/model/BloodBank.js";
import User from "@/model/user.js";
import { authenticateRole } from "@/lib/roleAuth.js";

export async function POST(req) {
  // Protect route - only blood bank admins can create blood banks, allow incomplete registration
  const auth = await authenticateRole(req, ['bloodbank_admin'], true);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const body = await req.json();
    const { name, address, latitude, longitude, contact_number } = body;

    console.log("Blood bank registration for user ID:", auth.user._id);

    // Validate required fields
    if (!name || !address || !latitude || !longitude || !contact_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user profile with basic information only
    const updatedUser = await User.findByIdAndUpdate(
      auth.user._id,
      { 
        name,
        isRegistrationComplete: true // Mark registration as complete
        // Don't update mobile_number in User model - it goes to BloodBank model
      },
      { new: true }
    );

    // Create or update blood bank profile
    const existingBloodBank = await BloodBank.findOne({ user_id: auth.user._id });
    let bloodBank;
    
    if (existingBloodBank) {
      bloodBank = await BloodBank.findByIdAndUpdate(
        existingBloodBank._id,
        {
          name,
          address,
          latitude,
          longitude,
          contact_number,
        },
        { new: true }
      );
    } else {
      bloodBank = await BloodBank.create({
        user_id: auth.user._id,
        name,
        address,
        latitude,
        longitude,
        contact_number
      });
    }

    console.log("Blood bank registration completed:", {
      userId: updatedUser._id,
      registrationComplete: updatedUser.isRegistrationComplete
    });

    return NextResponse.json(
      { 
        message: "Blood bank registered successfully", 
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isRegistrationComplete: updatedUser.isRegistrationComplete
        },
        bloodBank: bloodBank 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Blood bank creation error:", error);
    return NextResponse.json(
      { error: "Failed to create blood bank" },
      { status: 500 }
    );
  }
}

// Get all blood banks or filter by ID
export async function GET(req) {
  // Allow public access to view blood banks (for emergency requests, donations, etc.)
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    
    if (user_id) {
      // Get specific blood bank
      const bloodBank = await BloodBank.findOne({ user_id });
      
      if (!bloodBank) {
        return NextResponse.json(
          { error: "Blood bank not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ bloodBank }, { status: 200 });
    } else {
      // Get all blood banks
      const bloodBanks = await BloodBank.find();
      return NextResponse.json({ bloodBanks }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching blood banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood banks" },
      { status: 500 }
    );
  }
}

// Update a blood bank
export async function PUT(req) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { user_id, name, address, latitude, longitude, contact_number } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (contact_number) updateData.contact_number = contact_number;
    
    const updatedBloodBank = await BloodBank.findOneAndUpdate(
      { user_id },
      updateData,
      { new: true }
    );
    
    if (!updatedBloodBank) {
      return NextResponse.json(
        { error: "Blood bank not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Blood bank updated successfully", bloodBank: updatedBloodBank },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blood bank update error:", error);
    return NextResponse.json(
      { error: "Failed to update blood bank" },
      { status: 500 }
    );
  }
}