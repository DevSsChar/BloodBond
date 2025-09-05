import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import HospitalProfile from "@/model/HospitalProfile";
import User from "@/model/user";
import bcrypt from "bcrypt";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, address, latitude, longitude, contact_number, email, role } = body;

    // Validate required fields
    if (!name || !address || !latitude || !longitude || !contact_number || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUserByMobile = await User.findOne({ mobile_number: contact_number });
    if (existingUserByMobile) {
      return NextResponse.json(
        { error: "Contact number already registered" },
        { status: 409 }
      );
    }

    // Create new user first
    const newUser = await User.create({
      name,
      mobile_number: contact_number,
      email,
      password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password for OAuth users
      role: 'hospital'
    });

    // Create new hospital profile
    const newProfile = await HospitalProfile.create({
      user_id: newUser._id,
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