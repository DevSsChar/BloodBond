import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import User from "@/models/User";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { user_id, name, address, latitude, longitude, contact_number } = body;

    // Validate required fields
    if (!user_id || !name || !address || !latitude || !longitude || !contact_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user exists and has bloodbank_admin role
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "bloodbank_admin") {
      return NextResponse.json(
        { error: "User is not registered as a blood bank administrator" },
        { status: 403 }
      );
    }

    // Check if blood bank already exists for this user
    const existingBloodBank = await BloodBank.findOne({ user_id });
    if (existingBloodBank) {
      return NextResponse.json(
        { error: "Blood bank already exists for this user" },
        { status: 409 }
      );
    }

    // Create new blood bank
    const newBloodBank = await BloodBank.create({
      user_id,
      name,
      address,
      latitude,
      longitude,
      contact_number
    });

    return NextResponse.json(
      { message: "Blood bank created successfully", bloodBank: newBloodBank },
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