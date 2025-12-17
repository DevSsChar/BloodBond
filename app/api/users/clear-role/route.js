import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import User from "@/models/user";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  await connectDB();

  try {
    // Get the JWT token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.userId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    console.log("Clearing role for user ID:", token.userId);

    // Clear user role in database
    const updatedUser = await User.findByIdAndUpdate(
      token.userId,
      { role: null },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found with ID:", token.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Successfully cleared user role:", updatedUser);

    return NextResponse.json(
      { 
        message: "Role cleared successfully", 
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          role: updatedUser.role,
          name: updatedUser.name
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Role clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear role" },
      { status: 500 }
    );
  }
}
