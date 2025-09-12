import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import DonationDrive from "@/model/DonationDrive.js";
import User from "@/model/user.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Get all drives for a bloodbank
export async function GET(req) {
  const auth = await authenticateRole(req, ['bloodbank_admin']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const drives = await DonationDrive.find({
      organizer_id: auth.userId,
      organizer_type: 'bloodbank_admin'
    })
    .populate('organizer_id', 'name email')
    .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      drives
    });
  } catch (error) {
    console.error("Error fetching bloodbank drives:", error);
    return NextResponse.json(
      { error: "Failed to fetch drives" },
      { status: 500 }
    );
  }
}

// Create a new donation drive
export async function POST(req) {
  try {
    console.log('POST /api/bloodbank/drives - Starting...');
    
    const auth = await authenticateRole(req, ['bloodbank_admin']);
    if (!auth.success) {
      console.log('POST /api/bloodbank/drives - Auth failed:', auth.error);
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    console.log('POST /api/bloodbank/drives - Auth successful for user:', auth.userId);
    console.log('POST /api/bloodbank/drives - Full auth object:', auth);
    
    await connectDB();
    console.log('POST /api/bloodbank/drives - DB connected');

    const body = await req.json();
    console.log('POST /api/bloodbank/drives - Request body:', body);
    const {
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
    if (!title || !description || !location || !date || !start_time || !end_time || !contact_number) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const driveDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (driveDate < today) {
      return NextResponse.json(
        { error: "Drive date must be in the future" },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json(
        { error: "Invalid time format" },
        { status: 400 }
      );
    }

    // Create new drive
    const driveData = {
      organizer_id: auth.userId,
      organizer_type: 'bloodbank_admin',
      title,
      description,
      location,
      date: driveDate,
      start_time,
      end_time,
      required_blood_types: required_blood_types || [],
      contact_number
    };
    
    console.log('POST /api/bloodbank/drives - Creating drive with data:', driveData);
    
    const newDrive = new DonationDrive(driveData);

    await newDrive.save();

    // Populate organizer info for response
    await newDrive.populate('organizer_id', 'name email');

    console.log('POST /api/bloodbank/drives - Drive created successfully:', newDrive._id);
    
    console.log('POST /api/bloodbank/drives - Drive created successfully:', newDrive._id);
    
    return NextResponse.json({
      success: true,
      message: "Donation drive created successfully",
      drive: newDrive
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/bloodbank/drives - Error creating drive:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to create donation drive", details: error.message },
      { status: 500 }
    );
  }
}