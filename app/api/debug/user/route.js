import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import User from "@/model/user";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
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

    // Fetch user data including role
    const user = await User.findById(token.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log('DEBUG - User from database:', {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return NextResponse.json(
      { 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          hasRole: user.role !== null && user.role !== undefined
        },
        token: {
          userId: token.userId,
          role: token.role
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Debug fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user debug info" },
      { status: 500 }
    );
  }
}
