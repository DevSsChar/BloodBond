import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import User from "@/model/user";

export async function POST(req) {
  try {
    await connectDB();

    // Clear all user roles (for testing purposes)
    const result = await User.updateMany(
      {}, // Update all users
      { $unset: { role: 1 } } // Remove the role field
    );

    console.log('Cleared roles for all users:', result);

    return NextResponse.json(
      { 
        message: "All user roles cleared successfully", 
        modifiedCount: result.modifiedCount 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear roles error:", error);
    return NextResponse.json(
      { error: "Failed to clear user roles" },
      { status: 500 }
    );
  }
}
