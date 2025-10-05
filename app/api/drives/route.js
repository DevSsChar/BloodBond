import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/models/DonationDrive.js";
import User from "@/models/user.js";
import HospitalProfile from "@/models/HospitalProfile.js";
import BloodBank from "@/models/BloodBank.js";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { 
      organizer_id, 
      organizer_type, 
      title, 
      description, 
      location, 
      date, 
      start_time, 
      end_time, 
      required_blood_types,
      contact_number 
    } = body;

    // Validate required fields
    if (!organizer_id || !organizer_type || !title || !description || 
        !location || !date || !start_time || !end_time || !contact_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate organizer_type
    if (organizer_type !== "hospital" && organizer_type !== "bloodbank") {
      return NextResponse.json(
        { error: "Invalid organizer type. Must be 'hospital' or 'bloodbank'" },
        { status: 400 }
      );
    }

    // Verify user exists and has appropriate role
    const user = await User.findById(organizer_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user has permission to create donation drives
    if ((organizer_type === "hospital" && user.role !== "hospital") || 
        (organizer_type === "bloodbank" && user.role !== "bloodbank_admin")) {
      return NextResponse.json(
        { error: "User does not have permission to create this type of donation drive" },
        { status: 403 }
      );
    }

    // Verify the organizer profile exists
    if (organizer_type === "hospital") {
      const hospitalProfile = await HospitalProfile.findOne({ user_id: organizer_id });
      if (!hospitalProfile) {
        return NextResponse.json(
          { error: "Hospital profile not found for this user" },
          { status: 404 }
        );
      }
    } else {
      const bloodBankProfile = await BloodBank.findOne({ user_id: organizer_id });
      if (!bloodBankProfile) {
        return NextResponse.json(
          { error: "Blood bank profile not found for this user" },
          { status: 404 }
        );
      }
    }

    // Validate date is in the future
    const driveDate = new Date(date);
    if (isNaN(driveDate) || driveDate <= new Date()) {
      return NextResponse.json(
        { error: "Donation drive date must be in the future" },
        { status: 400 }
      );
    }

    // Create new donation drive
    const newDrive = await DonationDrive.create({
      organizer_id,
      organizer_type,
      title,
      description,
      location,
      date: driveDate,
      start_time,
      end_time,
      required_blood_types: required_blood_types || [],
      contact_number
    });

    return NextResponse.json(
      { message: "Donation drive created successfully", drive: newDrive },
      { status: 201 }
    );
  } catch (error) {
    console.error("Donation drive creation error:", error);
    return NextResponse.json(
      { error: "Failed to create donation drive" },
      { status: 500 }
    );
  }
}

// Get all donation drives or filter by various parameters
export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const organizer_id = searchParams.get("organizer_id");
    const organizer_type = searchParams.get("organizer_type");
    const future_only = searchParams.get("future_only");
    
    let query = {};
    
    if (organizer_id) {
      query.organizer_id = organizer_id;
    }
    
    if (organizer_type) {
      if (organizer_type !== "hospital" && organizer_type !== "bloodbank") {
        return NextResponse.json(
          { error: "Invalid organizer type filter" },
          { status: 400 }
        );
      }
      query.organizer_type = organizer_type;
    }
    
    // Filter for future drives only if requested
    if (future_only === "true") {
      query.date = { $gt: new Date() };
    }
    
    // Get drives and sort by date (upcoming first)
    const drives = await DonationDrive.find(query).sort({ date: 1 });
    
    return NextResponse.json({ drives }, { status: 200 });
  } catch (error) {
    console.error("Error fetching donation drives:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation drives" },
      { status: 500 }
    );
  }
}

// Update a donation drive - only by the original creator
export async function PUT(req) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { 
      drive_id, 
      user_id, // ID of user making the request
      title, 
      description, 
      location, 
      date, 
      start_time, 
      end_time,
      required_blood_types,
      contact_number 
    } = body;
    
    if (!drive_id || !user_id) {
      return NextResponse.json(
        { error: "Drive ID and User ID are required" },
        { status: 400 }
      );
    }
    
    // Find the drive
    const drive = await DonationDrive.findById(drive_id);
    if (!drive) {
      return NextResponse.json(
        { error: "Donation drive not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this drive
    if (drive.organizer_id.toString() !== user_id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to update this donation drive" },
        { status: 403 }
      );
    }
    
    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (date) {
      const driveDate = new Date(date);
      if (isNaN(driveDate) || driveDate <= new Date()) {
        return NextResponse.json(
          { error: "Donation drive date must be in the future" },
          { status: 400 }
        );
      }
      updateData.date = driveDate;
    }
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (required_blood_types) updateData.required_blood_types = required_blood_types;
    if (contact_number) updateData.contact_number = contact_number;
    
    const updatedDrive = await DonationDrive.findByIdAndUpdate(
      drive_id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(
      { message: "Donation drive updated successfully", drive: updatedDrive },
      { status: 200 }
    );
  } catch (error) {
    console.error("Donation drive update error:", error);
    return NextResponse.json(
      { error: "Failed to update donation drive" },
      { status: 500 }
    );
  }
}

// Delete a donation drive - only by the original creator
export async function DELETE(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const drive_id = searchParams.get("id");
    const user_id = searchParams.get("user_id");
    
    if (!drive_id || !user_id) {
      return NextResponse.json(
        { error: "Drive ID and User ID are required" },
        { status: 400 }
      );
    }
    
    // Find the drive
    const drive = await DonationDrive.findById(drive_id);
    if (!drive) {
      return NextResponse.json(
        { error: "Donation drive not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this drive
    if (drive.organizer_id.toString() !== user_id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to delete this donation drive" },
        { status: 403 }
      );
    }
    
    await DonationDrive.findByIdAndDelete(drive_id);
    
    return NextResponse.json(
      { message: "Donation drive deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Donation drive deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete donation drive" },
      { status: 500 }
    );
  }
}