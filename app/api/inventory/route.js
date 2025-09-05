import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BloodInventory from "@/models/BloodInventory";
import BloodBank from "@/models/BloodBank";
import User from "@/models/User";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { admin_id, bloodbank_id, blood_type, units_available, expiry_date } = body;

    // Validate required fields
    if (!admin_id || !bloodbank_id || !blood_type || units_available === undefined || !expiry_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        { error: "User is not authorized to manage blood inventory" },
        { status: 403 }
      );
    }

    // Validate units is a non-negative number
    if (units_available < 0) {
      return NextResponse.json(
        { error: "Units available must be a non-negative number" },
        { status: 400 }
      );
    }

    // Validate expiry date is in the future
    const expiryDateObj = new Date(expiry_date);
    if (isNaN(expiryDateObj) || expiryDateObj <= new Date()) {
      return NextResponse.json(
        { error: "Expiry date must be a valid future date" },
        { status: 400 }
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

    // Check if inventory entry already exists for this blood bank and blood type
    const existingInventory = await BloodInventory.findOne({
      bloodbank_id,
      blood_type
    });

    let inventoryEntry;
    
    if (existingInventory) {
      // Update existing inventory
      inventoryEntry = await BloodInventory.findByIdAndUpdate(
        existingInventory._id,
        {
          units_available,
          expiry_date: expiryDateObj,
          date_of_entry: new Date() // Update the entry date
        },
        { new: true }
      );
    } else {
      // Create new inventory entry
      inventoryEntry = await BloodInventory.create({
        bloodbank_id,
        blood_type,
        units_available,
        expiry_date: expiryDateObj
      });
    }

    return NextResponse.json(
      { 
        message: existingInventory ? "Blood inventory updated" : "Blood inventory created", 
        inventory: inventoryEntry 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Blood inventory error:", error);
    return NextResponse.json(
      { error: "Failed to manage blood inventory" },
      { status: 500 }
    );
  }
}

// Get blood inventory - can be accessed by anyone but with admin-specific controls
export async function GET(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const admin_id = searchParams.get("admin_id"); 
    const bloodbank_id = searchParams.get("bloodbank_id");
    const blood_type = searchParams.get("blood_type");
    
    let query = {};
    
    // If admin_id is provided, verify it's a bloodbank admin and show only their banks
    if (admin_id) {
      const user = await User.findById(admin_id);
      if (!user || user.role !== "bloodbank_admin") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        );
      }
      
      // Get all blood banks managed by this admin
      if (!bloodbank_id) {
        const bloodBanks = await BloodBank.find({ user_id: admin_id });
        const bloodBankIds = bloodBanks.map(bank => bank._id);
        
        if (bloodBankIds.length === 0) {
          return NextResponse.json({ inventory: [] }, { status: 200 });
        }
        
        query.bloodbank_id = { $in: bloodBankIds };
      } else {
        // Verify this admin manages this blood bank
        const bloodBank = await BloodBank.findOne({
          _id: bloodbank_id,
          user_id: admin_id
        });

        if (!bloodBank) {
          return NextResponse.json(
            { error: "Unauthorized access to this blood bank's inventory" },
            { status: 403 }
          );
        }
        
        query.bloodbank_id = bloodbank_id;
      }
    } 
    // Public access - specific bloodbank only
    else if (bloodbank_id) {
      query.bloodbank_id = bloodbank_id;
    }
    
    if (blood_type) {
      query.blood_type = blood_type;
    }
    
    // Filter out expired inventory
    query.expiry_date = { $gt: new Date() };
    
    const inventory = await BloodInventory.find(query);
    
    return NextResponse.json({ inventory }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blood inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch blood inventory" },
      { status: 500 }
    );
  }
}

// Update blood inventory - only by bloodbank admin
export async function PUT(req) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { admin_id, inventory_id, units_available, expiry_date } = body;
    
    if (!admin_id || !inventory_id) {
      return NextResponse.json(
        { error: "Admin ID and Inventory ID are required" },
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
        { error: "User is not authorized to manage blood inventory" },
        { status: 403 }
      );
    }
    
    // Find the inventory entry
    const inventoryEntry = await BloodInventory.findById(inventory_id);
    if (!inventoryEntry) {
      return NextResponse.json(
        { error: "Inventory entry not found" },
        { status: 404 }
      );
    }
    
    // Verify the admin manages this blood bank
    const bloodBank = await BloodBank.findOne({
      _id: inventoryEntry.bloodbank_id,
      user_id: admin_id
    });

    if (!bloodBank) {
      return NextResponse.json(
        { error: "Not authorized to modify this inventory entry" },
        { status: 403 }
      );
    }
    
    const updateData = {};
    if (units_available !== undefined) {
      if (units_available < 0) {
        return NextResponse.json(
          { error: "Units available must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.units_available = units_available;
    }
    
    if (expiry_date) {
      const expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj) || expiryDateObj <= new Date()) {
        return NextResponse.json(
          { error: "Expiry date must be a valid future date" },
          { status: 400 }
        );
      }
      updateData.expiry_date = expiryDateObj;
    }
    
    const updatedInventory = await BloodInventory.findByIdAndUpdate(
      inventory_id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(
      { message: "Blood inventory updated successfully", inventory: updatedInventory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blood inventory update error:", error);
    return NextResponse.json(
      { error: "Failed to update blood inventory" },
      { status: 500 }
    );
  }
}

// Delete inventory entry - only by bloodbank admin
export async function DELETE(req) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(req.url);
    const inventory_id = searchParams.get("id");
    const admin_id = searchParams.get("admin_id");
    
    if (!inventory_id || !admin_id) {
      return NextResponse.json(
        { error: "Inventory ID and Admin ID are required" },
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
        { error: "User is not authorized to manage blood inventory" },
        { status: 403 }
      );
    }
    
    // Find the inventory entry
    const inventoryEntry = await BloodInventory.findById(inventory_id);
    if (!inventoryEntry) {
      return NextResponse.json(
        { error: "Inventory entry not found" },
        { status: 404 }
      );
    }
    
    // Verify the admin manages this blood bank
    const bloodBank = await BloodBank.findOne({
      _id: inventoryEntry.bloodbank_id,
      user_id: admin_id
    });

    if (!bloodBank) {
      return NextResponse.json(
        { error: "Not authorized to delete this inventory entry" },
        { status: 403 }
      );
    }
    
    await BloodInventory.findByIdAndDelete(inventory_id);
    
    return NextResponse.json(
      { message: "Blood inventory entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blood inventory deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete blood inventory entry" },
      { status: 500 }
    );
  }
}