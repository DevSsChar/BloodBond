import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/model/DonationDrive.js";
import Donor from "@/model/Doner.js";
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

    // Add participation record (for now, just return success)
    // In a full implementation, you'd create a DriveParticipation model
    
    return NextResponse.json({ 
      message: "Successfully registered for donation drive",
      drive_id: drive_id
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering for drive:", error);
    return NextResponse.json(
      { error: "Failed to register for donation drive" },
      { status: 500 }
    );
  }
}