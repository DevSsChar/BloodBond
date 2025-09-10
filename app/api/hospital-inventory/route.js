import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import HospitalInventory from "@/model/HospitalInventory.js";
import HospitalInventoryLog from "@/model/HospitalInventoryLog.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

// POST - Add new inventory item or update existing
export async function POST(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    
    // Verify user is a hospital
    const user = await User.findById(userId);
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      blood_type, 
      units_available, 
      expiry_date, 
      batch_number,
      minimum_stock_level,
      maximum_capacity,
      action = 'received'
    } = data;

    // Convert empty strings to null for ObjectId fields
    const cleanBatchNumber = batch_number && batch_number.trim() !== '' ? batch_number : null;

    // Validate required fields
    if (!blood_type || units_available === undefined || !expiry_date) {
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

    // Check if inventory item already exists for this blood type
    const existingItem = await HospitalInventory.findOne({
      hospital_id: userId,
      blood_type,
      batch_number: cleanBatchNumber,
      status: 'available'
    });

    let inventoryItem;
    let logAction = action;
    let unitsChanged = parseInt(units_available);
    let unitsBefore = 0;

    if (existingItem) {
      // Update existing item
      unitsBefore = existingItem.units_available;
      existingItem.units_available += parseInt(units_available);
      
      if (minimum_stock_level !== undefined) {
        existingItem.minimum_stock_level = minimum_stock_level;
      }
      if (maximum_capacity !== undefined) {
        existingItem.maximum_capacity = maximum_capacity;
      }
      
      inventoryItem = await existingItem.save();
      logAction = 'received';
    } else {
      // Create new inventory item
      inventoryItem = await HospitalInventory.create({
        hospital_id: userId,
        blood_type,
        units_available: parseInt(units_available),
        expiry_date: expiryDateObj,
        batch_number,
        minimum_stock_level: minimum_stock_level || 5,
        maximum_capacity: maximum_capacity || 100
      });
    }

    // Log the inventory change
    await HospitalInventoryLog.create({
      hospital_id: userId,
      blood_type,
      action: logAction,
      units_changed: unitsChanged,
      units_before: unitsBefore,
      units_after: inventoryItem.units_available,
      batch_number,
      expiry_date: expiryDateObj,
      performed_by: userId,
      notes: `${logAction === 'received' ? 'Added' : 'Updated'} inventory via hospital management`
    });

    return NextResponse.json({
      success: true,
      message: existingItem ? 'Inventory updated successfully' : 'Inventory item added successfully',
      item: inventoryItem
    });

  } catch (error) {
    console.error("Error managing hospital inventory:", error);
    return NextResponse.json({ error: 'Failed to manage inventory' }, { status: 500 });
  }
}

// GET - Fetch hospital inventory
export async function GET(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    
    // Verify user is a hospital
    const user = await User.findById(userId);
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    // Get all inventory items for this hospital
    const inventory = await HospitalInventory.find({ 
      hospital_id: userId,
      status: { $in: ['available', 'reserved'] }
    })
    .sort({ blood_type: 1, expiry_date: 1 });

    // Calculate summary statistics
    const summary = {
      totalUnits: 0,
      reservedUnits: 0,
      bloodTypes: {},
      lowStockAlerts: [],
      expiringItems: []
    };

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    inventory.forEach(item => {
      summary.totalUnits += item.units_available;
      summary.reservedUnits += item.units_reserved;
      
      // Group by blood type
      if (!summary.bloodTypes[item.blood_type]) {
        summary.bloodTypes[item.blood_type] = {
          available: 0,
          reserved: 0,
          items: 0
        };
      }
      
      summary.bloodTypes[item.blood_type].available += item.units_available;
      summary.bloodTypes[item.blood_type].reserved += item.units_reserved;
      summary.bloodTypes[item.blood_type].items += 1;

      // Check for low stock alerts
      if (item.units_available <= item.minimum_stock_level) {
        summary.lowStockAlerts.push({
          bloodType: item.blood_type,
          currentUnits: item.units_available,
          minimumLevel: item.minimum_stock_level,
          itemId: item._id
        });
      }

      // Check for expiring items
      if (item.expiry_date <= sevenDaysFromNow) {
        summary.expiringItems.push({
          bloodType: item.blood_type,
          units: item.units_available,
          expiryDate: item.expiry_date,
          daysUntilExpiry: Math.ceil((item.expiry_date - now) / (24 * 60 * 60 * 1000)),
          itemId: item._id
        });
      }
    });

    return NextResponse.json({
      success: true,
      inventory,
      summary
    });

  } catch (error) {
    console.error("Error fetching hospital inventory:", error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// PUT - Update inventory item (use, reserve, etc.)
export async function PUT(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    
    // Verify user is a hospital
    const user = await User.findById(userId);
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      itemId, 
      action, 
      units, 
      patient_id, 
      notes 
    } = data;

    if (!itemId || !action || units === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: itemId, action, units' 
      }, { status: 400 });
    }

    const inventoryItem = await HospitalInventory.findOne({
      _id: itemId,
      hospital_id: userId
    });

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const unitsBefore = inventoryItem.units_available;
    const reservedBefore = inventoryItem.units_reserved;
    let unitsChanged = 0;
    let logAction = action;

    switch (action) {
      case 'use':
        if (inventoryItem.units_available < units) {
          return NextResponse.json({ error: 'Insufficient units available' }, { status: 400 });
        }
        inventoryItem.units_available -= units;
        unitsChanged = -units;
        break;

      case 'reserve':
        if (inventoryItem.units_available < units) {
          return NextResponse.json({ error: 'Insufficient units available for reservation' }, { status: 400 });
        }
        inventoryItem.units_available -= units;
        inventoryItem.units_reserved += units;
        unitsChanged = -units;
        break;

      case 'unreserve':
        if (inventoryItem.units_reserved < units) {
          return NextResponse.json({ error: 'Insufficient reserved units' }, { status: 400 });
        }
        inventoryItem.units_reserved -= units;
        inventoryItem.units_available += units;
        unitsChanged = units;
        break;

      case 'expire':
        inventoryItem.status = 'expired';
        unitsChanged = -inventoryItem.units_available;
        inventoryItem.units_available = 0;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await inventoryItem.save();

    // Log the inventory change
    await HospitalInventoryLog.create({
      hospital_id: userId,
      blood_type: inventoryItem.blood_type,
      action: logAction,
      units_changed: unitsChanged,
      units_before: unitsBefore,
      units_after: inventoryItem.units_available,
      patient_id,
      batch_number: inventoryItem.batch_number,
      expiry_date: inventoryItem.expiry_date,
      performed_by: userId,
      notes: notes || `${action} operation via hospital management`
    });

    return NextResponse.json({
      success: true,
      message: `Inventory ${action} completed successfully`,
      item: inventoryItem
    });

  } catch (error) {
    console.error("Error updating hospital inventory:", error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
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
    
    // Verify user is a hospital
    const user = await User.findById(userId);
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const inventoryItem = await HospitalInventory.findOne({
      _id: itemId,
      hospital_id: userId
    });

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Log the deletion
    await HospitalInventoryLog.create({
      hospital_id: userId,
      blood_type: inventoryItem.blood_type,
      action: 'deleted',
      units_changed: -inventoryItem.units_available,
      units_before: inventoryItem.units_available,
      units_after: 0,
      batch_number: inventoryItem.batch_number,
      expiry_date: inventoryItem.expiry_date,
      performed_by: userId,
      notes: 'Inventory item deleted via hospital management'
    });

    await HospitalInventory.findByIdAndDelete(itemId);

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting hospital inventory:", error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
