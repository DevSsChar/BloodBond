import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HospitalProfile from "@/models/HospitalProfile";
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

    // Verify user exists and has hospital role
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "hospital") {
      return NextResponse.json(
        { error: "User is not registered as a hospital" },
        { status: 403 }
      );
    }

    // Check if profile already exists
    const existingProfile = await HospitalProfile.findOne({ user_id });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Hospital profile already exists for this user" },
        { status: 409 }
      );
    }

    // Create new hospital profile
    const newProfile = await HospitalProfile.create({
      user_id,
      name,
      address,
      latitude,
      longitude,
      contact_number
    });

    return NextResponse.json(
      { message: "Hospital profile created successfully", profile: newProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Hospital profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create hospital profile" },
      { status: 500 }
    );
  }
}

// Get all hospitals or filter by ID
export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    
    if (user_id) {
      // Get specific hospital profile
      const profile = await HospitalProfile.findOne({ user_id });
      
      if (!profile) {
        return NextResponse.json(
          { error: "Hospital profile not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ profile }, { status: 200 });
    } else {
      // Get all hospital profiles
      const profiles = await HospitalProfile.find();
      return NextResponse.json({ profiles }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching hospital profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospital profiles" },
      { status: 500 }
    );
  }
}

// Update a hospital profile
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
    
    const updatedProfile = await HospitalProfile.findOneAndUpdate(
      { user_id },
      updateData,
      { new: true }
    );
    
    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Hospital profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Hospital profile updated successfully", profile: updatedProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Hospital profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update hospital profile" },
      { status: 500 }
    );
  }
}