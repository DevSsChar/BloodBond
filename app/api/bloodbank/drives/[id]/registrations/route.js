import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/models/DonationDrive.js";
import DriveRegistration from "@/models/DriveRegistration.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Get registrations for a specific drive
export async function GET(req, { params }) {
  const auth = await authenticateRole(req, ['bloodbank_admin']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const { id } = params;

    // Verify the drive belongs to this bloodbank
    const drive = await DonationDrive.findOne({
      _id: id,
      organizer_id: auth.userId,
      organizer_type: 'bloodbank_admin'
    });

    if (!drive) {
      return NextResponse.json(
        { error: "Drive not found or access denied" },
        { status: 404 }
      );
    }

    // Get all registrations for this drive
    const registrations = await DriveRegistration.find({
      drive_id: id
    })
    .populate('donor_id', 'name email phone blood_type')
    .sort({ registration_date: -1 });

    // Group registrations by status
    const stats = {
      total: registrations.length,
      registered: registrations.filter(r => r.status === 'registered').length,
      attended: registrations.filter(r => r.status === 'attended').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length
    };

    return NextResponse.json({
      success: true,
      drive,
      registrations,
      stats
    });

  } catch (error) {
    console.error("Error fetching drive registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// Update registration status (for attendance tracking)
export async function PATCH(req, { params }) {
  const auth = await authenticateRole(req, ['bloodbank_admin']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const { id } = params;
    const body = await req.json();
    const { registration_id, status } = body;

    // Validate status
    const validStatuses = ['registered', 'attended', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Verify the drive belongs to this bloodbank
    const drive = await DonationDrive.findOne({
      _id: id,
      organizer_id: auth.userId,
      organizer_type: 'bloodbank_admin'
    });

    if (!drive) {
      return NextResponse.json(
        { error: "Drive not found or access denied" },
        { status: 404 }
      );
    }

    // Update registration status
    const registration = await DriveRegistration.findOneAndUpdate(
      { _id: registration_id, drive_id: id },
      { 
        status,
        attendance_date: status === 'attended' ? new Date() : undefined
      },
      { new: true }
    ).populate('donor_id', 'name email phone blood_type');

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration status updated successfully",
      registration
    });

  } catch (error) {
    console.error("Error updating registration status:", error);
    return NextResponse.json(
      { error: "Failed to update registration status" },
      { status: 500 }
    );
  }
}