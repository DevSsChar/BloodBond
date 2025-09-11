import connectDB from '@/db/connectDB.mjs';
import BloodInventory from '@/model/BloodInventory.js';
import HospitalInventory from '@/model/HospitalInventory.js';
import HospitalInventoryLog from '@/model/HospitalInventoryLog.js';
import HospitalRequest from '@/model/HospitalRequest.js';
import User from '@/model/user.js';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route.js';

// GET - Fetch hospital requests
export async function GET(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const userId = session.user.id;

    let filter = {};
    
    if (role === 'hospital') {
      // Hospitals see only their own requests
      filter.hospital_id = userId;
    } else if (role === 'bloodbank') {
      // Blood banks see only requests directed specifically to them
      filter.bloodbank_id = userId;
    } else {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await HospitalRequest.find(filter)
      .populate('hospital_id', 'name email')
      .populate('bloodbank_id', 'name email')
      .populate('responded_by', 'name email')
      .sort({ created_at: -1 });

    return NextResponse.json({ 
      success: true, 
      requests,
      count: requests.length 
    });

  } catch (error) {
    console.error('Error fetching hospital requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch requests',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new hospital request
export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is a hospital
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      bloodbank_id,
      request_type,
      blood_type,
      units_requested,
      urgency_level,
      patient_details,
      reason,
      hospital_location,
      search_radius
    } = data;

    // Validation
    if (!bloodbank_id || !request_type || !blood_type || !units_requested || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: bloodbank_id, request_type, blood_type, units_requested, reason' 
      }, { status: 400 });
    }

    // Verify blood bank exists
    const bloodBank = await User.findById(bloodbank_id);
    if (!bloodBank || bloodBank.role !== 'bloodbank_admin') {
      return NextResponse.json({ error: 'Invalid blood bank ID' }, { status: 400 });
    }

    // Validate patient details if request type is patient
    if (request_type === 'patient') {
      if (!patient_details?.name || !patient_details?.age || !patient_details?.condition) {
        return NextResponse.json({ 
          error: 'Patient details (name, age, condition) are required for patient requests' 
        }, { status: 400 });
      }
    }

    // Create the request
    const hospitalRequest = new HospitalRequest({
      hospital_id: session.user.id,
      bloodbank_id,
      request_type,
      blood_type,
      units_requested: parseInt(units_requested),
      urgency_level: urgency_level || 'medium',
      patient_details: request_type === 'patient' ? patient_details : undefined,
      reason,
      hospital_location: hospital_location || {},
      search_radius: search_radius || 10
    });

    await hospitalRequest.save();

    // Populate the created request for response
    await hospitalRequest.populate('hospital_id', 'name email');
    await hospitalRequest.populate('bloodbank_id', 'name email');

    return NextResponse.json({ 
      success: true, 
      message: 'Hospital request created successfully',
      request: hospitalRequest 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating hospital request:', error);
    return NextResponse.json({ 
      error: 'Failed to create request',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update request status (accept/reject)
export async function PUT(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is a blood bank admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'bloodbank_admin') {
      return NextResponse.json({ error: 'Access denied. Blood bank admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');
    
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const data = await req.json();
    const { status, response_message } = data;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (accepted/rejected) is required' }, { status: 400 });
    }

    // Find the request
    const hospitalRequest = await HospitalRequest.findById(requestId);
    if (!hospitalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify the blood bank is the one responding
    if (hospitalRequest.bloodbank_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to respond to this request' }, { status: 403 });
    }

    if (hospitalRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 });
    }

    // If accepting, check inventory and update accordingly
    if (status === 'accepted') {
      // Check blood bank inventory
      const inventory = await BloodInventory.findOne({
        bloodbank_id: session.user.id,
        blood_type: hospitalRequest.blood_type
      });

      if (!inventory || inventory.units_available < hospitalRequest.units_requested) {
        return NextResponse.json({ 
          error: 'Insufficient blood units available in inventory' 
        }, { status: 400 });
      }

      // Reduce blood bank inventory
      inventory.units_available -= hospitalRequest.units_requested;
      await inventory.save();

      // If request is for inventory (not patient), add to hospital inventory
      if (hospitalRequest.request_type === 'inventory') {
        let hospitalInventory = await HospitalInventory.findOne({
          hospital_id: hospitalRequest.hospital_id,
          blood_type: hospitalRequest.blood_type
        });

        if (hospitalInventory) {
          hospitalInventory.units_available += hospitalRequest.units_requested;
          await hospitalInventory.save();
        } else {
          // Create new hospital inventory entry
          hospitalInventory = new HospitalInventory({
            hospital_id: hospitalRequest.hospital_id,
            blood_type: hospitalRequest.blood_type,
            units_available: hospitalRequest.units_requested,
            expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
            batch_number: `BB-${Date.now()}`,
            minimum_stock_level: 5,
            maximum_capacity: 100
          });
          await hospitalInventory.save();
        }

        // Log the inventory change
        const inventoryLog = new HospitalInventoryLog({
          hospital_id: hospitalRequest.hospital_id,
          blood_type: hospitalRequest.blood_type,
          action: 'received',
          units_changed: hospitalRequest.units_requested,
          previous_units: hospitalInventory.units_available - hospitalRequest.units_requested,
          new_units: hospitalInventory.units_available,
          reason: `Blood received from blood bank request #${hospitalRequest._id}`,
          performed_by: session.user.id
        });
        await inventoryLog.save();
      }

      // Update request status to fulfilled for accepted requests
      hospitalRequest.status = 'fulfilled';
    } else {
      hospitalRequest.status = status;
    }

    hospitalRequest.response_message = response_message;
    hospitalRequest.responded_by = session.user.id;
    hospitalRequest.responded_at = new Date();

    await hospitalRequest.save();

    // Populate for response
    await hospitalRequest.populate('hospital_id', 'name email');
    await hospitalRequest.populate('bloodbank_id', 'name email');
    await hospitalRequest.populate('responded_by', 'name email');

    return NextResponse.json({ 
      success: true, 
      message: `Request ${status} successfully`,
      request: hospitalRequest 
    });

  } catch (error) {
    console.error('Error updating hospital request:', error);
    return NextResponse.json({ 
      error: 'Failed to update request',
      details: error.message 
    }, { status: 500 });
  }
}
