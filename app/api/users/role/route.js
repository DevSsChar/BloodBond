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

    const body = await req.json();
    const { role } = body;

    // Validate role
    const allowedRoles = ["user", "hospital", "bloodbank_admin"];
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    console.log("Updating role for user ID:", token.userId, "to role:", role);

    // Update user role in database
    const updatedUser = await User.findByIdAndUpdate(
      token.userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found with ID:", token.userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Successfully updated user role:", updatedUser);

    return NextResponse.json(
      { 
        message: "Role updated successfully", 
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
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
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

    // Fetch user data including role
    const user = await User.findById(token.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          age: user.age,
          blood_type: user.blood_type,
          mobile_number: user.mobile_number
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
