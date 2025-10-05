import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/models/DonationDrive.js";
import Donor from "@/models/Doner.js";
import DriveRegistration from "@/models/DriveRegistration.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Register for a donation drive
export async function POST(req) {
  // Protect route - only donors can participate
  const auth = await authenticateRole(req, ['user']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const body = await req.json();
    const { drive_id } = body;

    if (!drive_id) {
      return NextResponse.json(
        { error: "Drive ID is required" },
        { status: 400 }
      );
    }

    // Check if drive exists and is future
    const drive = await DonationDrive.findById(drive_id);
    if (!drive) {
      return NextResponse.json(
        { error: "Donation drive not found" },
        { status: 404 }
      );
    }

    if (new Date(drive.date) < new Date()) {
      return NextResponse.json(
        { error: "Cannot register for past donation drives" },
        { status: 400 }
      );
    }

    // Check if donor exists
    const donor = await Donor.findOne({ user_id: auth.userId });
    if (!donor) {
      return NextResponse.json(
        { error: "Donor profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Check if already registered
    const existingRegistration = await DriveRegistration.findOne({
      donor_id: auth.userId,
      drive_id: drive_id
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this donation drive" },
        { status: 400 }
      );
    }

    // Create new registration
    const registration = new DriveRegistration({
      donor_id: auth.userId,
      drive_id: drive_id,
      status: 'registered'
    });

    await registration.save();
    
    return NextResponse.json({ 
      success: true,
      message: "Successfully registered for donation drive",
      registration: {
        id: registration._id,
        drive_id: drive_id,
        status: registration.status,
        registration_date: registration.registration_date
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering for drive:", error);
    return NextResponse.json(
      { error: "Failed to register for donation drive" },
      { status: 500 }
    );
  }
}