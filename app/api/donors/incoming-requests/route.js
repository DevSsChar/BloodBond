import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Donor from "@/model/Doner.js";
import BloodRequest from "@/model/BloodRequest.js";
import HospitalRequest from "@/model/HospitalRequest.js";
import { authenticateRole } from "@/lib/roleAuth.js";

// Get incoming urgent requests near donor's location
export async function GET(req) {
  // Protect route - only donors can view their incoming requests
  const auth = await authenticateRole(req, ['user']);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  await connectDB();

  try {
    // Find donor and their critical service settings
    const donor = await Donor.findOne({ user_id: auth.userId });
    if (!donor) {
      return NextResponse.json(
        { error: "Donor profile not found" },
        { status: 404 }
      );
    }

    // If donor is not ready for critical service, return empty array
    if (!donor.is_critical_ready) {
      return NextResponse.json({
        message: "Critical service is disabled",
        requests: []
      }, { status: 200 });
    }

    // Get donor's location and service radius
    const donorLocation = donor.current_location;
    const serviceRadius = donor.critical_service_radius || 10;
    
    if (!donorLocation || !donorLocation.coordinates || 
        donorLocation.coordinates[0] === 0 && donorLocation.coordinates[1] === 0) {
      return NextResponse.json({
        message: "Location not set",
        requests: []
      }, { status: 200 });
    }

    const [donorLng, donorLat] = donorLocation.coordinates;

    // Helper function to calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Find urgent blood requests that match donor's blood type and are within range
    const urgentRequests = [];

    // Check BloodRequest collection for urgent requests
    const bloodRequests = await BloodRequest.find({
      status: 'pending',
      is_urgent: true,
      blood_type: donor.blood_type
    }).populate('user_id', 'name email').sort({ created_at: -1 });

    for (const request of bloodRequests) {
      if (request.location && request.location.coordinates) {
        const [reqLng, reqLat] = request.location.coordinates;
        const distance = calculateDistance(donorLat, donorLng, reqLat, reqLng);
        
        if (distance <= serviceRadius) {
          urgentRequests.push({
            _id: request._id,
            type: 'blood_request',
            blood_type: request.blood_type,
            units_needed: request.units_needed,
            urgency: 'urgent',
            patient_name: request.user_id?.name || 'Anonymous',
            contact_email: request.user_id?.email,
            location: request.hospital_location || 'Not specified',
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            created_at: request.created_at,
            emergency_details: request.emergency_details
          });
        }
      }
    }

    // Check HospitalRequest collection for urgent patient requests
    const hospitalRequests = await HospitalRequest.find({
      status: 'pending',
      request_type: 'patient',
      blood_type: donor.blood_type
    }).populate('hospital_id', 'name email').sort({ created_at: -1 });

    for (const request of hospitalRequests) {
      if (request.hospital_location && 
          typeof request.hospital_location === 'object' && 
          request.hospital_location.coordinates) {
        const [reqLng, reqLat] = request.hospital_location.coordinates;
        const distance = calculateDistance(donorLat, donorLng, reqLat, reqLng);
        
        if (distance <= serviceRadius) {
          urgentRequests.push({
            _id: request._id,
            type: 'hospital_request',
            blood_type: request.blood_type,
            units_needed: request.units_needed,
            urgency: 'critical',
            hospital_name: request.hospital_id?.name || 'Unknown Hospital',
            contact_email: request.hospital_id?.email,
            location: request.hospital_location.address || 'Hospital location',
            distance: Math.round(distance * 10) / 10,
            created_at: request.created_at,
            patient_name: request.patient_details?.name,
            patient_condition: request.patient_details?.condition
          });
        }
      }
    }

    // Sort by distance (closest first)
    urgentRequests.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      requests: urgentRequests.slice(0, 10), // Limit to 10 most recent/closest
      total: urgentRequests.length,
      donor_location: {
        latitude: donorLat,
        longitude: donorLng
      },
      service_radius: serviceRadius
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch incoming requests" },
      { status: 500 }
    );
  }
}