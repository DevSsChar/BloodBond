import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();

    // Get the JWT token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    console.log("Marking registration as complete for user ID:", token.userId);

    // Update user registration status
    const updatedUser = await User.findByIdAndUpdate(
      token.userId,
      { isRegistrationComplete: true },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found with ID:", token.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Successfully marked registration as complete:", updatedUser);

    return NextResponse.json(
      { 
        message: "Registration marked as complete", 
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          role: updatedUser.role,
          isRegistrationComplete: updatedUser.isRegistrationComplete
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete registration error:", error);
    return NextResponse.json(
      { error: "Failed to mark registration as complete" },
      { status: 500 }
    );
  }
}
