import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Doner from "@/models/Doner.js";
import User from "@/models/user.js";
import BloodBank from "@/models/BloodBank.js";
import { getServerSession } from "next-auth";

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

// GET - Find donors based on criteria
export async function GET(req) {
  try {
    console.log("Donors API called - Starting...");
    
    const session = await getServerSession();
    console.log("Session:", session ? "Found" : "Not found");
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    console.log("Database connected");

    // Get current user (blood bank admin)
    const currentUser = await User.findOne({ email: session.user.email });
    console.log("Current user found:", currentUser ? "Yes" : "No");
    console.log("User role:", currentUser?.role);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is blood bank admin
    if (currentUser.role !== 'bloodbank_admin') {
      console.log("Access denied - not blood bank admin");
      return NextResponse.json(
        { error: 'Access denied. Blood bank admin role required.' },
        { status: 403 }
      );
    }

    // Get blood bank location
    const bloodBank = await BloodBank.findOne({ user_id: currentUser._id });
    console.log("Blood bank found:", bloodBank ? "Yes" : "No");
    console.log("Blood bank location:", bloodBank?.location);
    
    // If no blood bank found or no location, return donors without distance filtering
    let bloodBankLat, bloodBankLng;
    let useDistanceFilter = false;
    
    if (bloodBank && bloodBank.location && bloodBank.location.coordinates && 
        Array.isArray(bloodBank.location.coordinates) && bloodBank.location.coordinates.length === 2) {
      [bloodBankLng, bloodBankLat] = bloodBank.location.coordinates;
      useDistanceFilter = true;
      console.log("Using distance filter with coordinates:", bloodBankLat, bloodBankLng);
    } else {
      console.log("No valid blood bank location found - skipping distance filter");
    }

    const { searchParams } = new URL(req.url);
    const maxDistance = parseFloat(searchParams.get("maxDistance")) || 50;
    const criticalOnly = searchParams.get("criticalOnly") === "true";
    const bloodType = searchParams.get("bloodType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    console.log("Query params:", { maxDistance, criticalOnly, bloodType, status, search });

    // Build query
    let query = {};
    
    if (criticalOnly) {
      query.is_critical_ready = true;
    }
    
    if (bloodType) {
      query.blood_type = bloodType;
    }

    if (status) {
      query.status = status;
    }

    // Only require location data if we're using distance filtering
    if (useDistanceFilter) {
      query.current_location = { $exists: true, $ne: null };
    }

    console.log("MongoDB query:", query);

    // Find donors
    const donors = await Doner.find(query)
      .populate('user_id', 'name email')
      .sort({ created_at: -1 });

    console.log("Found donors count:", donors.length);

    let processedDonors = donors;

    // Apply distance filtering only if we have blood bank location
    if (useDistanceFilter) {
      const donorsWithDistance = donors
        .map(donor => {
          if (!donor.current_location || !donor.current_location.coordinates) {
            return null;
          }
          
          const [donorLng, donorLat] = donor.current_location.coordinates;
          const distance = calculateDistance(bloodBankLat, bloodBankLng, donorLat, donorLng);
          
          return {
            ...donor.toObject(),
            distance: Math.round(distance * 10) / 10
          };
        })
        .filter(donor => donor !== null && donor.distance <= maxDistance);

      processedDonors = donorsWithDistance;
      console.log("Donors within distance:", processedDonors.length);
    } else {
      // If no distance filtering, add a default distance or null
      processedDonors = donors.map(donor => ({
        ...donor.toObject(),
        distance: null
      }));
    }

    // Apply search filter if provided
    let filteredDonors = processedDonors;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredDonors = processedDonors.filter(donor => {
        const user = donor.user_id;
        return (
          searchRegex.test(user?.name || '') ||
          searchRegex.test(user?.email || '') ||
          searchRegex.test(donor.mobile_number || '') ||
          searchRegex.test(donor.address || '')
        );
      });
    }

    // Sort by distance (closest first) if distance filtering is enabled
    if (useDistanceFilter) {
      filteredDonors.sort((a, b) => a.distance - b.distance);
    }

    // Transform data for frontend
    const transformedDonors = filteredDonors.map(donor => ({
      _id: donor._id,
      name: donor.user_id?.name || 'Unknown',
      email: donor.user_id?.email || 'No email',
      mobile_number: donor.mobile_number || 'No phone',
      blood_type: donor.blood_type,
      age: donor.age,
      address: donor.address || 'No address provided',
      last_donation_date: donor.last_donation_date || new Date('2024-01-01'),
      total_donations: donor.total_donations || 0,
      status: donor.status || 'Active',
      is_critical_ready: donor.is_critical_ready || false,
      distance: donor.distance,
      coordinates: donor.current_location?.coordinates || null,
      created_at: donor.created_at,
      updated_at: donor.updated_at
    }));

    console.log("Final transformed donors count:", transformedDonors.length);

    const response = {
      success: true,
      donors: transformedDonors,
      total: transformedDonors.length,
      bloodBankLocation: useDistanceFilter ? {
        latitude: bloodBankLat,
        longitude: bloodBankLng,
        name: bloodBank.name
      } : null,
      filters: {
        maxDistance,
        criticalOnly,
        bloodType,
        status,
        search,
        distanceFilterEnabled: useDistanceFilter
      }
    };

    console.log("Returning response with donors:", response.total);
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error in donors API:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch donors: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new donor
export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Create new donor
    const newDonor = new Doner(data);
    await newDonor.save();
    
    return NextResponse.json({
      success: true,
      donor: newDonor
    });

  } catch (error) {
    console.error('Error creating donor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}