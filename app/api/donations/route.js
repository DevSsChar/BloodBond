import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donation from "@/models/Donation.js";
import User from "@/models/user.js";
import Donor from "@/models/Doner.js";
import { authenticateRole } from "@/lib/roleAuth.js";

export async function POST(req) {
  // Protect route - only donors and blood banks can create donations
  const auth = await authenticateRole(req, ['user', 'bloodbank_admin']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    const body = await req.json();
    const { donor_id, bloodbank_id, blood_type, units_donated } = body;

    // Validate required fields
    if (!donor_id || !bloodbank_id || !blood_type || !units_donated) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate units donated is a positive number
    if (units_donated <= 0) {
      return NextResponse.json(
        { error: "Units donated must be a positive number" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(donor_id);
    if (!user) {
      return NextResponse.json(
        { error: "Donor not found" },
        { status: 404 }
      );
    }

    // Create new donation record
    const newDonation = await Donation.create({
      donor_id,
      bloodbank_id,
      blood_type,
      units_donated,
      donation_date: new Date()
    });

    // Update donor's total donations count if donor profile exists
    try {
      await Donor.findOneAndUpdate(
        { user_id: donor_id },
        { $inc: { total_donations: 1 } }
      );
    } catch (error) {
      // Continue even if donor profile update fails
      console.error("Error updating donor profile:", error);
    }

    return NextResponse.json(
      { message: "Donation recorded successfully", donation: newDonation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Donation registration error:", error);
    return NextResponse.json(
      { error: "Failed to register donation" },
      { status: 500 }
    );
  }
}

// Get all donations or filter by donor
export async function GET(req) {
  // Protect route - all authenticated users can view donations
  const auth = await authenticateRole(req);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const donor_id = searchParams.get("donor_id");
    const bloodbank_id = searchParams.get("bloodbank_id");
    
    let query = {};
    
    // Role-based filtering
    if (auth.role === 'user' && donor_id) {
      // Donors can only see their own donations
      query.donor_id = donor_id;
    } else if (auth.role === 'bloodbank_admin' && bloodbank_id) {
      // Blood banks can see donations to their bank
      query.bloodbank_id = bloodbank_id;
    } else if (auth.role === 'hospital') {
      // Hospitals can see all donations (for emergency requests)
      // No additional filtering
    } else {
      // Apply filters if provided
      if (donor_id) query.donor_id = donor_id;
      if (bloodbank_id) query.bloodbank_id = bloodbank_id;
    }
    
    const donations = await Donation.find(query).sort({ donation_date: -1 });
    
    return NextResponse.json({ donations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}