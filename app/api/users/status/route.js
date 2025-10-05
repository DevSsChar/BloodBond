import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import User from "@/models/user.js";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }
    // Support either our custom userId or default .sub
    const userId = token.userId || token.sub;
    if (!userId) {
      console.warn("Status route: token present but missing userId/sub", token);
      return NextResponse.json(
        { error: "Unauthorized - No user id in token" },
        { status: 401 }
      );
    }

    console.log("[users/status] Fetching user status", {
      userId,
      tokenUserId: token.userId,
      tokenSub: token.sub,
      tokenRole: token.role,
      tokenIsReg: token.isRegistrationComplete
    });

    await connectDB();

    // Find user in database
  const user = await User.findById(userId);
    
    if (!user) {
      console.log("User not found with ID:", token.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("[users/status] DB user doc:", {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isRegistrationComplete: user.isRegistrationComplete,
      updatedAt: user.updatedAt
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
