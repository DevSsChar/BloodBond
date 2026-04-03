import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/models/Doner.js";
import User from "@/models/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  console.log("🔵 Donor registration endpoint called");
  try {
    console.log("🔵 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    // Get the JWT token to identify the current user
    console.log("🔵 Getting JWT token...");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("🔵 Token received:", { userId: token?.userId, email: token?.email });
    
    if (!token || !token.userId) {
      console.log("❌ No valid token or userId");
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    console.log("🔵 Parsing request body...");
    const body = await req.json();
    const { name, date_of_birth, age, weight, blood_type, mobile_number, emergency_contact_mobile } = body;
    console.log("🔵 Request data:", { name, date_of_birth, age, weight, blood_type, mobile_number, emergency_contact_mobile });

    console.log("Donor registration for user ID:", token.userId);

    // Validate required fields
    if (!name || !date_of_birth || !age || !weight || !blood_type || !mobile_number || !emergency_contact_mobile) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedDob = new Date(date_of_birth);
    if (Number.isNaN(parsedDob.getTime())) {
      return NextResponse.json(
        { error: "Invalid date_of_birth" },
        { status: 400 }
      );
    }

    // Validate weight requirement
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue < 50) {
      console.log("❌ Weight requirement not met:", weight);
      return NextResponse.json(
        { error: "Weight must be at least 50kg to be eligible as a donor" },
        { status: 400 }
      );
    }

    // Find the existing user
    console.log("🔵 Finding user in database...");
    const user = await User.findById(token.userId);
    console.log("🔵 User found:", { id: user?._id, email: user?.email, role: user?.role });
    if (!user) {
      console.log("❌ User not found in database");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user has the correct role
    if (user.role !== 'user') {
      console.log("❌ Invalid role for donor registration:", user.role);
      return NextResponse.json(
        { error: "Invalid role for donor registration" },
        { status: 403 }
      );
    }

    // Update user profile with basic user information only (avoid fields that might have unique constraints)
    console.log("🔵 Updating user profile...");
    let updatedUser;
    try {
      updatedUser = await User.findByIdAndUpdate(
        token.userId,
        { 
          $set: {
            name,
            isRegistrationComplete: true // Mark registration as complete
          }
          // age, weight, blood_type, and mobile_number are stored in role-specific models
        },
        { new: true }
      );
      console.log("✅ User updated:", { id: updatedUser._id, isRegistrationComplete: updatedUser.isRegistrationComplete });
    } catch (userUpdateError) {
      console.log("⚠️ User update failed, but continuing with donor profile creation:", userUpdateError.message);
      // If user update fails due to constraints, we can still create the donor profile
      // Just mark registration complete separately
      await User.updateOne(
        { _id: token.userId },
        { $set: { isRegistrationComplete: true } }
      );
      // Get the updated user
      updatedUser = await User.findById(token.userId);
    }

    // Create or update donor profile with donor-specific information
    console.log("🔵 Creating/updating donor profile...");
    const existingDonor = await Donor.findOne({ user_id: token.userId });
    let donor;
    
    if (existingDonor) {
      console.log("🔵 Updating existing donor profile...");
      donor = await Donor.findByIdAndUpdate(
        existingDonor._id,
        {
          date_of_birth: parsedDob,
          age,
          weight,  // Add weight field
          blood_type,
          mobile_number,
          emergency_contact_mobile,
        },
        { new: true }
      );
    } else {
      console.log("🔵 Creating new donor profile...");
      donor = await Donor.create({
        user_id: token.userId,
        date_of_birth: parsedDob,
        age,
        weight,  // Add weight field
        blood_type,
        mobile_number,
        emergency_contact_mobile,
        total_donations: 0
      });
    }
    console.log("✅ Donor profile created/updated:", donor._id);

    console.log("Donor registration completed:", {
      userId: updatedUser._id,
      registrationComplete: updatedUser.isRegistrationComplete
    });

    console.log("✅ Registration successful, sending response");
    return NextResponse.json(
      { 
        message: "Donor registered successfully", 
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isRegistrationComplete: updatedUser.isRegistrationComplete
        },
        donor: donor 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Donor registration error:", error);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to register donor", details: error.message },
      { status: 500 }
    );
  }
}