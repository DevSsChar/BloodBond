import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import HospitalProfile from "@/model/HospitalProfile.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();

    // Get the JWT token to identify the current user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, address, latitude, longitude, contact_number } = body;

    console.log("Hospital registration for user ID:", token.userId);

    // Validate required fields
    if (!name || !address || !latitude || !longitude || !contact_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the existing user
    const user = await User.findById(token.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user has the correct role
    if (user.role !== 'hospital') {
      return NextResponse.json(
        { error: "Invalid role for hospital registration" },
        { status: 403 }
      );
    }

    // Update user profile with basic information only
    const updatedUser = await User.findByIdAndUpdate(
      token.userId,
      { 
        name,
        isRegistrationComplete: true // Mark registration as complete
        // Don't update mobile_number in User model - it goes to Hospital model
      },
      { new: true }
    );

    // Create or update hospital profile
    const existingHospital = await HospitalProfile.findOne({ user_id: token.userId });
    let hospital;
    
    if (existingHospital) {
      hospital = await HospitalProfile.findByIdAndUpdate(
        existingHospital._id,
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
      hospital = await HospitalProfile.create({
        user_id: token.userId,
        name,
        address,
        latitude,
        longitude,
        contact_number,
      });
    }

    console.log("Hospital registration completed:", {
      userId: updatedUser._id,
      registrationComplete: updatedUser.isRegistrationComplete
    });

    return NextResponse.json(
      { 
        message: "Hospital registered successfully", 
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isRegistrationComplete: updatedUser.isRegistrationComplete
        },
        hospital: hospital 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Hospital registration error:", error);
    return NextResponse.json(
      { error: "Failed to register hospital" },
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