import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    console.log("Fetching current user status for user ID:", token.userId);

    await connectDB();

    // Find user in database
    const user = await User.findById(token.userId);
    
    if (!user) {
      console.log("User not found with ID:", token.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Current user status:", {
      id: user._id,
      email: user.email,
      role: user.role,
      isRegistrationComplete: user.isRegistrationComplete
    });

    return NextResponse.json(
      { 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isRegistrationComplete: user.isRegistrationComplete,
          name: user.name
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}
