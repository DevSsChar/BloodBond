import { NextResponse } from 'next/server';
import connectDB from '@/db/connectDB.mjs';
import User from '@/model/user';
import BloodBank from '@/model/BloodBank';
import BloodInventory from '@/model/BloodInventory';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function POST(req) {
  try {
    await connectDB();
    
    const token = await getToken({ req, secret });
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = token.sub;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'hospital') {
      return NextResponse.json({ error: 'Access denied. Hospital role required.' }, { status: 403 });
    }

    const {
      blood_type,
      hospital_latitude,
      hospital_longitude,
      search_radius = 10
    } = await req.json();

    console.log('Search params:', { blood_type, hospital_latitude, hospital_longitude, search_radius });

    if (!blood_type || !hospital_latitude || !hospital_longitude) {
      return NextResponse.json({ 
        error: 'Blood type and location coordinates are required' 
      }, { status: 400 });
    }

    // Find all blood banks from BloodBank model (which has location data)
    const bloodBankData = await BloodBank.find({
      latitude: { $exists: true },
      longitude: { $exists: true }
    }).populate('user_id', 'name email role');

    console.log(`Found ${bloodBankData.length} blood banks with location data`);

    const bloodBanksWithinRadius = [];
    const allBloodBanksWithDistance = [];

    for (const bankData of bloodBankData) {
      // Skip if user_id is not a blood bank admin
      if (!bankData.user_id || bankData.user_id.role !== 'bloodbank_admin') {
        continue;
      }

      const { latitude, longitude } = bankData;
      
      if (latitude && longitude) {
        const distance = calculateDistance(
          hospital_latitude,
          hospital_longitude,
          latitude,
          longitude
        );

        // Check inventory for this blood bank
        const inventory = await BloodInventory.findOne({
          bloodbank_id: bankData._id,
          blood_type: blood_type,
          units_available: { $gt: 0 }
        });

        console.log(`Blood bank ${bankData.name} - Distance: ${distance}km, Inventory:`, inventory);

        const availableUnits = inventory ? inventory.units_available : 0;
        const hasBloodType = availableUnits > 0;

        const bankInfo = {
          bloodbank_id: bankData.user_id._id,
          name: bankData.name,
          email: bankData.user_id.email,
          address: bankData.address,
          latitude: latitude,
          longitude: longitude,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          available_units: availableUnits,
          has_blood_type: hasBloodType,
          within_radius: distance <= search_radius
        };

        // Add to all banks list for fallback
        allBloodBanksWithDistance.push(bankInfo);

        // Only add to within radius if actually within radius
        if (distance <= search_radius) {
          bloodBanksWithinRadius.push(bankInfo);
        }
      }
    }

    // Sort banks within radius by availability first, then by distance
    bloodBanksWithinRadius.sort((a, b) => {
      // Priority: has blood type > closer distance
      if (a.has_blood_type !== b.has_blood_type) {
        return b.has_blood_type - a.has_blood_type;
      }
      return a.distance - b.distance;
    });

    // Sort all banks by distance for fallback (nearest banks outside radius)
    allBloodBanksWithDistance.sort((a, b) => a.distance - b.distance);

    // Separate available and unavailable blood banks within radius
    const availableBloodBanks = bloodBanksWithinRadius.filter(bb => bb.has_blood_type);
    const unavailableWithinRadius = bloodBanksWithinRadius.filter(bb => !bb.has_blood_type);

    // For nearest banks, show closest ones outside radius if no results within radius
    let nearestBloodBanks = unavailableWithinRadius;
    if (bloodBanksWithinRadius.length === 0) {
      // No banks within radius, show closest 5 banks regardless of distance
      nearestBloodBanks = allBloodBanksWithDistance.slice(0, 5);
    }

    console.log(`Search results: ${availableBloodBanks.length} available within ${search_radius}km, ${nearestBloodBanks.length} nearest/fallback`);

    return NextResponse.json({
      success: true,
      blood_type,
      search_radius,
      hospital_location: {
        latitude: hospital_latitude,
        longitude: hospital_longitude
      },
      available_blood_banks: availableBloodBanks,
      nearest_blood_banks: nearestBloodBanks,
      total_available: availableBloodBanks.length,
      total_within_radius: bloodBanksWithinRadius.length,
      total_searched: allBloodBanksWithDistance.length,
      debug: {
        total_bloodbanks_found: bloodBankData.length,
        banks_within_radius: bloodBanksWithinRadius.length,
        all_banks_processed: allBloodBanksWithDistance.length
      }
    });

  } catch (error) {
    console.error('Error finding blood banks:', error);
    return NextResponse.json({ 
      error: 'Failed to find blood banks',
      details: error.message 
    }, { status: 500 });
  }
}
