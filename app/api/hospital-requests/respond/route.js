import connectDB from '@/db/connectDB.mjs';
import BloodBank from '@/model/BloodBank.js';
import BloodInventory from '@/model/BloodInventory.js';
import HospitalInventory from '@/model/HospitalInventory.js';
import HospitalInventoryLog from '@/model/HospitalInventoryLog.js';
import HospitalRequest from '@/model/HospitalRequest.js';
import User from '@/model/user.js';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route.js';

export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'bloodbank_admin') {
      return NextResponse.json({ error: 'Access denied. Blood bank admin role required.' }, { status: 403 });
    }

    const { request_id, action, message } = await req.json();

    if (!request_id || !action || !['accepted', 'rejected'].includes(action)) {
      return NextResponse.json({ 
        error: 'Missing required fields or invalid action' 
      }, { status: 400 });
    }

    // Find the request (don't populate bloodbank_id yet to handle both User ID and BloodBank ID cases)
    const hospitalRequest = await HospitalRequest.findById(request_id)
      .populate('hospital_id', 'name email');

    if (!hospitalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if request is still pending
    if (hospitalRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: `Request has already been ${hospitalRequest.status}` 
      }, { status: 400 });
    }

    // Verify this blood bank can respond to this request (for both accepted and rejected)
    const currentUserBloodBank = await BloodBank.findOne({ user_id: userId });
    if (!currentUserBloodBank) {
      return NextResponse.json({ 
        error: 'Blood bank profile not found' 
      }, { status: 404 });
    }

    // The hospital request might have bloodbank_id as either User ID or BloodBank ID
    const requestedBloodBank = await BloodBank.findOne({
      $or: [
        { _id: hospitalRequest.bloodbank_id },
        { user_id: hospitalRequest.bloodbank_id }
      ]
    });
    
    if (!requestedBloodBank || requestedBloodBank._id.toString() !== currentUserBloodBank._id.toString()) {
      return NextResponse.json({ 
        error: 'This request is not assigned to your blood bank' 
      }, { status: 403 });
    }

    // Update request status
    hospitalRequest.status = action;
    hospitalRequest.response_message = message;
    hospitalRequest.responded_by = userId;
    hospitalRequest.responded_at = new Date();

    if (action === 'accepted') {
      // Check blood inventory availability using the blood bank ID
      console.log('Looking for inventory with:', {
        bloodbank_id: currentUserBloodBank._id,
        blood_type: hospitalRequest.blood_type,
        units_requested: hospitalRequest.units_requested
      });
      
      const bloodInventory = await BloodInventory.findOne({
        bloodbank_id: currentUserBloodBank._id,
        blood_type: hospitalRequest.blood_type,
        units_available: { $gte: hospitalRequest.units_requested }
      });

      console.log('Found inventory:', bloodInventory);
      
      // Also check if there's any inventory for this blood type (regardless of units)
      const anyInventory = await BloodInventory.findOne({
        bloodbank_id: currentUserBloodBank._id,
        blood_type: hospitalRequest.blood_type
      });
      
      console.log('Any inventory for this blood type:', anyInventory);

      if (!bloodInventory) {
        const availableUnits = anyInventory ? anyInventory.units_available : 0;
        return NextResponse.json({ 
          error: `Insufficient blood units available in inventory. Available: ${availableUnits} units, Requested: ${hospitalRequest.units_requested} units` 
        }, { status: 400 });
      }

      // Reduce blood bank inventory
      bloodInventory.units_available -= hospitalRequest.units_requested;
      await bloodInventory.save();

      // If request type is inventory (not patient), add to hospital inventory
      if (hospitalRequest.request_type === 'inventory') {
        try {
          // Check if hospital inventory item exists
          let hospitalInventory = await HospitalInventory.findOne({
            hospital_id: hospitalRequest.hospital_id._id,
            blood_type: hospitalRequest.blood_type
          });

          if (hospitalInventory) {
            // Update existing inventory
            const oldUnits = hospitalInventory.units_available;
            hospitalInventory.units_available += hospitalRequest.units_requested;
            hospitalInventory.last_updated = new Date();
            await hospitalInventory.save();

            // Log the inventory change
            await new HospitalInventoryLog({
              hospital_id: hospitalRequest.hospital_id._id,
              inventory_item_id: hospitalInventory._id,
              action: 'received',
              units_changed: hospitalRequest.units_requested,
              units_before: oldUnits,
              units_after: hospitalInventory.units_available,
              blood_type: hospitalRequest.blood_type,
              reason: `Received from blood bank: ${hospitalRequest.bloodbank_id.name}`,
              reference_type: 'hospital_request',
              reference_id: hospitalRequest._id
            }).save();
          } else {
            // Create new inventory item
            hospitalInventory = new HospitalInventory({
              hospital_id: hospitalRequest.hospital_id._id,
              blood_type: hospitalRequest.blood_type,
              units_available: hospitalRequest.units_requested,
              expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
              batch_number: `BB-${Date.now()}`,
              minimum_stock_level: 5,
              maximum_capacity: 100
            });
            await hospitalInventory.save();

            // Log the inventory creation
            await new HospitalInventoryLog({
              hospital_id: hospitalRequest.hospital_id._id,
              inventory_item_id: hospitalInventory._id,
              action: 'received',
              units_changed: hospitalRequest.units_requested,
              units_before: 0,
              units_after: hospitalRequest.units_requested,
              blood_type: hospitalRequest.blood_type,
              reason: `Initial stock from blood bank: ${hospitalRequest.bloodbank_id.name}`,
              reference_type: 'hospital_request',
              reference_id: hospitalRequest._id
            }).save();
          }
        } catch (inventoryError) {
          console.error('Error updating hospital inventory:', inventoryError);
          // Rollback blood bank inventory change
          bloodInventory.units_available += hospitalRequest.units_requested;
          await bloodInventory.save();
          
          return NextResponse.json({ 
            error: 'Failed to update hospital inventory' 
          }, { status: 500 });
        }
      }

      hospitalRequest.status = 'fulfilled';
    }

    await hospitalRequest.save();

    return NextResponse.json({
      success: true,
      message: `Request ${action} successfully`,
      request: hospitalRequest
    });

  } catch (error) {
    console.error('Error responding to hospital request:', error);
    return NextResponse.json({ 
      error: 'Failed to respond to request',
      details: error.message 
    }, { status: 500 });
  }
}
