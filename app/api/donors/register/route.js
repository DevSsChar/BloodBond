import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Donor from "@/models/Donor";
import User from "@/models/User";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { user_id, blood_type, emergency_contact_mobile } = body;

    // Validate required fields
    if (!user_id || !blood_type || !emergency_contact_mobile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if donor already exists for this user
    const existingDonor = await Donor.findOne({ user_id });
    if (existingDonor) {
      return NextResponse.json(
        { error: "Donor profile already exists for this user" },
        { status: 409 }
      );
    }

    // Create new donor
    const newDonor = await Donor.create({
      user_id,
      blood_type,
      emergency_contact_mobile,
      total_donations: 0
    });

    return NextResponse.json(
      { message: "Donor registered successfully", donor: newDonor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Donor registration error:", error);
    return NextResponse.json(
      { error: "Failed to register donor" },
      { status: 500 }
    );
  }
}