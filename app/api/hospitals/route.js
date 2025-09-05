import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import HospitalProfile from "@/model/HospitalProfile.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Accept either custom token.userId (our jwt callback) or default NextAuth token.sub
    const userId = token.userId || token.sub;
    if (!userId) {
      console.error("Hospital registration: Missing userId in token", token);
      return Response.json({ error: 'Unauthorized - No user id' }, { status: 401 });
    }

    // Extract data from form
    const data = await req.json();
    console.log("Hospital registration token:", { userId, tokenUserId: token.userId, tokenSub: token.sub });
    console.log("Hospital registration payload:", data);

    // Load user then set registration complete (avoid silent no-op if userId invalid)
    let user = await User.findById(userId);
    if (!user) {
      console.error("Hospital registration: User not found with ID:", userId);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const wasComplete = user.isRegistrationComplete;
    if (!user.isRegistrationComplete) {
      user.isRegistrationComplete = true;
      await user.save();
    }

    console.log("Hospital registration: User completion status -> before:", wasComplete, "after:", user.isRegistrationComplete);

    // Ensure we don't create duplicate profile (idempotent check)
    let existingProfile = await HospitalProfile.findOne({ user_id: user._id });
    if (existingProfile) {
      console.log("Hospital registration: Existing profile found, updating", existingProfile._id);
      existingProfile.name = data.name ?? existingProfile.name;
      existingProfile.address = data.address ?? existingProfile.address;
      if (data.latitude) existingProfile.latitude = parseFloat(data.latitude);
      if (data.longitude) existingProfile.longitude = parseFloat(data.longitude);
      existingProfile.contact_number = data.contact_number ?? existingProfile.contact_number;
      await existingProfile.save();
    } else {
      existingProfile = await HospitalProfile.create({
        user_id: user._id,
        name: data.name,
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        contact_number: data.contact_number
      });
      console.log("Hospital registration: New hospital profile created:", existingProfile._id);
    }

    // Echo back definitive state from DB
    return Response.json({
      success: true,
      message: 'Hospital profile saved',
      isRegistrationComplete: user.isRegistrationComplete,
      profileId: existingProfile._id
    });

  } catch (error) {
    console.error("Hospital registration error:", error);
    return Response.json({ error: 'Failed to create hospital profile', details: error.message }, { status: 500 });
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