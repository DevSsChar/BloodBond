import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DriveRegistration from "@/models/DriveRegistration.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Get all drives that the donor has registered for
export async function GET(req) {
  const auth = await authenticateRole(req, ['user']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const registrations = await DriveRegistration.find({
      donor_id: auth.userId
    })
    .populate({
      path: 'drive_id',
      populate: {
        path: 'organizer_id',
        select: 'name email'
      }
    })
    .sort({ registration_date: -1 });

    return NextResponse.json({
      success: true,
      registrations
    });
  } catch (error) {
    console.error("Error fetching registered drives:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered drives" },
      { status: 500 }
    );
  }
}