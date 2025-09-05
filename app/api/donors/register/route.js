import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import Donor from "@/model/Doner";
import User from "@/model/user";
import bcrypt from "bcrypt";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, age, blood_type, mobile_number, email, emergency_contact_mobile, role } = body;

    // Validate required fields
    if (!name || !blood_type || !emergency_contact_mobile || !mobile_number || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUserByMobile = await User.findOne({ mobile_number });
    if (existingUserByMobile) {
      return NextResponse.json(
        { error: "Mobile number already registered" },
        { status: 409 }
      );
    }

    // Create new user first
    const newUser = await User.create({
      name,
      age,
      blood_type,
      mobile_number,
      email,
      password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password for OAuth users
      role: 'user'
    });

    // Create donor profile
    const newDonor = await Donor.create({
      user_id: newUser._id,
      blood_type,
      emergency_contact_mobile,
      total_donations: 0
    });

    return NextResponse.json(
      { message: "Donor registered successfully", user: newUser, donor: newDonor },
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