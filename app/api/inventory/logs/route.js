import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import InventoryLog from "@/models/InventoryLog";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { admin_id, bloodbank_id, action, blood_type, units_changed } = body;

    // Validate required fields
    if (!admin_id || !bloodbank_id || !action || !blood_type || units_changed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate action type
    if (!["add", "remove", "update"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add', 'remove', or 'update'" },
        { status: 400 }
      );
    }

    // Verify user exists and is a blood bank admin
    const user = await User.findById(admin_id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "bloodbank_admin") {
      return NextResponse.json(
        { error: "User is not authorized to manage inventory logs" },
        { status: 403 }
      );
    }

    // Verify the blood bank exists and is managed by this admin
    const bloodBank = await BloodBank.findOne({
      _id: bloodbank_id,
      user_id: admin_id
    });

    if (!bloodBank) {
      return NextResponse.json(
        { error: "Blood bank not found or not managed by this admin" },
        { status: 404 }
      );
    }

    // Create new inventory log entry
    const newLog = await InventoryLog.create({
      admin_id,
      bloodbank_id,
      action,
      blood_type,
      units_changed,
      log_date: new Date()
    });

    return NextResponse.json(
      { message: "Inventory log created successfully", log: newLog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Inventory log creation error:", error);
    return NextResponse.json(
      { error: "Failed to create inventory log" },
      { status: 500 }
    );
  }
}

// Get inventory logs - only accessible to the blood bank admin
export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const admin_id = searchParams.get("admin_id");
    const bloodbank_id = searchParams.get("bloodbank_id");
    const blood_type = searchParams.get("blood_type");
    const action = searchParams.get("action");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    
    // Admin ID is required for authorization
    if (!admin_id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }
    
    // Verify user is a blood bank admin
    const user = await User.findById(admin_id);
    if (!user || user.role !== "bloodbank_admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    // Build query
    let query = { admin_id };
    
    if (bloodbank_id) {
      // Verify this admin manages this blood bank
      const bloodBank = await BloodBank.findOne({
        _id: bloodbank_id,
        user_id: admin_id
      });

      if (!bloodBank) {
        return NextResponse.json(
          { error: "Unauthorized access to this blood bank's logs" },
          { status: 403 }
        );
      }
      
      query.bloodbank_id = bloodbank_id;
    } else {
      // Get all blood banks managed by this admin
      const bloodBanks = await BloodBank.find({ user_id: admin_id });
      const bloodBankIds = bloodBanks.map(bank => bank._id);
      
      if (bloodBankIds.length === 0) {
        // Admin doesn't manage any blood banks
        return NextResponse.json({ logs: [] }, { status: 200 });
      }
      
      query.bloodbank_id = { $in: bloodBankIds };
    }
    
    if (blood_type) {
      query.blood_type = blood_type;
    }
    
    if (action) {
      if (!["add", "remove", "update"].includes(action)) {
        return NextResponse.json(
          { error: "Invalid action filter" },
          { status: 400 }
        );
      }
      query.action = action;
    }
    
    // Date range filtering
    if (start_date || end_date) {
      query.log_date = {};
      
      if (start_date) {
        const startDateObj = new Date(start_date);
        if (!isNaN(startDateObj)) {
          query.log_date.$gte = startDateObj;
        }
      }
      
      if (end_date) {
        const endDateObj = new Date(end_date);
        if (!isNaN(endDateObj)) {
          // Add one day to include the end date
          endDateObj.setDate(endDateObj.getDate() + 1);
          query.log_date.$lt = endDateObj;
        }
      }
    }
    
    // Get logs and sort by date (newest first)
    const logs = await InventoryLog.find(query).sort({ log_date: -1 });
    
    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory logs" },
      { status: 500 }
    );
  }
}

// Delete a log entry (only by the admin who created it)
export async function DELETE(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const log_id = searchParams.get("id");
    const admin_id = searchParams.get("admin_id");
    
    if (!log_id || !admin_id) {
      return NextResponse.json(
        { error: "Log ID and Admin ID are required" },
        { status: 400 }
      );
    }
    
    // Find the log
    const log = await InventoryLog.findById(log_id);
    if (!log) {
      return NextResponse.json(
        { error: "Inventory log not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this log
    if (log.admin_id.toString() !== admin_id.toString()) {
      return NextResponse.json(
        { error: "Not authorized to delete this inventory log" },
        { status: 403 }
      );
    }
    
    await InventoryLog.findByIdAndDelete(log_id);
    
    return NextResponse.json(
      { message: "Inventory log deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Inventory log deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory log" },
      { status: 500 }
    );
  }
}