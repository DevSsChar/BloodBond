import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/models/DonationDrive.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Update a specific drive
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
    const {
      title,
      description,
      location,
      date,
      start_time,
      end_time,
      required_blood_types,
      contact_number,
      status
    } = body;

    // Verify the drive belongs to this bloodbank
    const existingDrive = await DonationDrive.findOne({
      _id: id,
      organizer_id: auth.userId,
      organizer_type: 'bloodbank_admin'
    });

    if (!existingDrive) {
      return NextResponse.json(
        { error: "Drive not found or access denied" },
        { status: 404 }
      );
    }

    // Validate date if provided
    if (date) {
      const driveDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (driveDate < today) {
        return NextResponse.json(
          { error: "Drive date must be in the future" },
          { status: 400 }
        );
      }
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (start_time && !timeRegex.test(start_time)) {
      return NextResponse.json(
        { error: "Invalid start time format" },
        { status: 400 }
      );
    }
    if (end_time && !timeRegex.test(end_time)) {
      return NextResponse.json(
        { error: "Invalid end time format" },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update the drive
    const updatedDrive = await DonationDrive.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(date && { date: new Date(date) }),
        ...(start_time && { start_time }),
        ...(end_time && { end_time }),
        ...(required_blood_types && { required_blood_types }),
        ...(contact_number && { contact_number }),
        ...(status && { status })
      },
      { new: true }
    ).populate('organizer_id', 'name email');

    return NextResponse.json({
      success: true,
      message: "Drive updated successfully",
      drive: updatedDrive
    });

  } catch (error) {
    console.error("Error updating drive:", error);
    return NextResponse.json(
      { error: "Failed to update drive" },
      { status: 500 }
    );
  }
}

// Delete a specific drive
export async function DELETE(req, { params }) {
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

    // Check if drive has registrations
    const DriveRegistration = require("@/models/DriveRegistration.js");
    const registrationCount = await DriveRegistration.countDocuments({
      drive_id: id
    });

    if (registrationCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete drive with existing registrations. Cancel the drive instead." },
        { status: 400 }
      );
    }

    // Delete the drive
    await DonationDrive.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Drive deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting drive:", error);
    return NextResponse.json(
      { error: "Failed to delete drive" },
      { status: 500 }
    );
  }
}