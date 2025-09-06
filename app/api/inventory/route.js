import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodInventory from "@/model/BloodInventory.js";
import BloodBank from "@/model/BloodBank.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    
    // Find blood bank profile for this user
    const bloodBank = await BloodBank.findOne({ user_id: userId });
    if (!bloodBank) {
      return NextResponse.json({ error: 'Blood bank profile not found' }, { status: 404 });
    }

    const data = await req.json();
    const { blood_type, units_available, expiry_date } = data;

    // Validate required fields
    if (!blood_type || !units_available || !expiry_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: blood_type, units_available, expiry_date' 
      }, { status: 400 });
    }

    // Validate units is a non-negative number
    if (units_available < 0) {
      return NextResponse.json({ error: "Units available must be a non-negative number" }, { status: 400 });
    }

    // Validate expiry date is in the future
    const expiryDateObj = new Date(expiry_date);
    if (isNaN(expiryDateObj) || expiryDateObj <= new Date()) {
      return NextResponse.json({ error: "Expiry date must be a valid future date" }, { status: 400 });
    }

    // Create new inventory item
    const inventoryItem = await BloodInventory.create({
      bloodbank_id: bloodBank._id,
      blood_type,
      units_available: parseInt(units_available),
      expiry_date: expiryDateObj
    });

    return NextResponse.json({
      success: true,
      message: 'Inventory item added successfully',
      item: inventoryItem
    });

  } catch (error) {
    console.error("Error adding inventory item:", error);
    return NextResponse.json({ error: 'Failed to add inventory item' }, { status: 500 });
  }
}

// GET - Fetch inventory for blood bank
export async function GET(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      console.log('GET /api/inventory - No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    console.log('GET /api/inventory - User ID:', userId);
    
    // Find blood bank profile for this user
    const bloodBank = await BloodBank.findOne({ user_id: userId });
    if (!bloodBank) {
      console.log('GET /api/inventory - No blood bank profile found for user:', userId);
      // Return empty inventory instead of error to handle gracefully
      return NextResponse.json({
        success: true,
        inventory: [],
        totalUnits: 0,
        message: 'No blood bank profile found. Please complete your blood bank registration.'
      });
    }

    console.log('GET /api/inventory - Blood bank found:', bloodBank._id);

    // Get all inventory items for this blood bank
    const inventory = await BloodInventory.find({ bloodbank_id: bloodBank._id })
      .sort({ blood_type: 1, expiry_date: 1 });

    console.log('GET /api/inventory - Found', inventory.length, 'inventory items');

    return NextResponse.json({
      success: true,
      inventory: inventory,
      totalUnits: inventory.reduce((sum, item) => sum + item.units_available, 0)
    });

  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// PUT - Update inventory item
export async function PUT(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const data = await req.json();
    
    // Find blood bank profile for this user
    const bloodBank = await BloodBank.findOne({ user_id: userId });
    if (!bloodBank) {
      return NextResponse.json({ error: 'Blood bank profile not found' }, { status: 404 });
    }

    const { itemId, units_available, expiry_date } = data;
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Validate units is a non-negative number
    if (units_available !== undefined && units_available < 0) {
      return NextResponse.json({ error: "Units available must be a non-negative number" }, { status: 400 });
    }

    // Validate expiry date is in the future
    if (expiry_date) {
      const expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj) || expiryDateObj <= new Date()) {
        return NextResponse.json({ error: "Expiry date must be a valid future date" }, { status: 400 });
      }
    }

    // Update inventory item (only if it belongs to this blood bank)
    const updateData = {};
    if (units_available !== undefined) updateData.units_available = parseInt(units_available);
    if (expiry_date) updateData.expiry_date = new Date(expiry_date);

    const updatedItem = await BloodInventory.findOneAndUpdate(
      { _id: itemId, bloodbank_id: bloodBank._id },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

// DELETE - Remove inventory item
export async function DELETE(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Find blood bank profile for this user
    const bloodBank = await BloodBank.findOne({ user_id: userId });
    if (!bloodBank) {
      return NextResponse.json({ error: 'Blood bank profile not found' }, { status: 404 });
    }

    // Delete inventory item (only if it belongs to this blood bank)
    const deletedItem = await BloodInventory.findOneAndDelete({
      _id: itemId,
      bloodbank_id: bloodBank._id
    });

    if (!deletedItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}