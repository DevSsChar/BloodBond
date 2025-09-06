import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/model/BloodRequest.js";
import User from "@/model/user.js";
import BloodBank from "@/model/BloodBank.js";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const userOnly = searchParams.get("userOnly") === "true"; // Flag to get only user's requests
    const checkEmergency = searchParams.get("checkEmergency") === "true"; // Flag to check if user has emergency requests
    
    // Get JWT token to check if user is authenticated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If userOnly is true, get requests based on user's email (from their account)
    if (userOnly && token && token.userId) {
      const user = await User.findById(token.userId);
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Get all requests made with this user's email address
      const userRequests = await BloodRequest.find({
        $or: [
          { requested_by_user: user._id },
          { requested_by_hospital: user._id },
          { emergency_requester_email: user.email }
        ]
      })
      .populate('requested_by_user', 'name email mobile_number')
      .populate('requested_by_hospital', 'name email mobile_number')
      .populate('bloodbank_id', 'name address contact_number email')
      .sort({ requested_date: -1 });

      // Check if any request is fulfilled
      const hasFulfilledRequest = userRequests.some(req => req.status === 'accepted');
      
      if (hasFulfilledRequest) {
        // Show all fulfilled requests
        const fulfilledRequests = userRequests.filter(req => req.status === 'accepted');
        return NextResponse.json({ 
          requests: fulfilledRequests, 
          type: 'fulfilled',
          message: 'Showing all your fulfilled requests'
        }, { status: 200 });
      } else {
        // Show only active (pending) requests
        const activeRequests = userRequests.filter(req => req.status === 'pending');
        return NextResponse.json({ 
          requests: activeRequests, 
          type: 'active',
          message: activeRequests.length > 0 ? 'Showing your active requests' : 'No active requests found'
        }, { status: 200 });
      }
    }

    // Quick emergency check for navbar
    if (checkEmergency && email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      let emergencyQuery = {};
      if (user) {
        // User exists, check their requests
        emergencyQuery.$or = [
          { requested_by_user: user._id, request_type: 'emergency' },
          { requested_by_hospital: user._id, request_type: 'emergency' },
          { emergency_requester_email: email.toLowerCase(), request_type: 'emergency' }
        ];
      } else {
        // No user found, check emergency requests only
        emergencyQuery = {
          emergency_requester_email: email.toLowerCase(),
          request_type: 'emergency'
        };
      }
      
      const emergencyRequests = await BloodRequest.find(emergencyQuery);
      return NextResponse.json({ 
        requests: emergencyRequests,
        hasEmergencyRequests: emergencyRequests.length > 0
      }, { status: 200 });
    }
    
    // Search logic for manual email/ID search
    if (!email && !id) {
      return NextResponse.json(
        { error: "Email or request ID is required" },
        { status: 400 }
      );
    }

    let query = {};
    let searchByEmail = false;
    
    if (email) {
      searchByEmail = true;
      // Search by email - check both logged-in users and emergency requests
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        // User exists, find their requests
        query.$or = [
          { requested_by_user: user._id },
          { requested_by_hospital: user._id },
          { emergency_requester_email: email.toLowerCase() }
        ];
      } else {
        // No user found, search emergency requests only
        query.emergency_requester_email = email.toLowerCase();
      }
    } else if (id) {
      // Search by request ID - return single request
      query._id = id;
    }
    
    if (searchByEmail) {
      // For email search, get all requests for that email
      const allRequests = await BloodRequest.find(query)
        .populate('requested_by_user', 'name email mobile_number')
        .populate('requested_by_hospital', 'name email mobile_number')
        .populate('bloodbank_id', 'name address contact_number email')
        .sort({ requested_date: -1 });

      if (!allRequests || allRequests.length === 0) {
        return NextResponse.json(
          { error: "No requests found for this email" },
          { status: 404 }
        );
      }

      // Check if any request is fulfilled
      const hasFulfilledRequest = allRequests.some(req => req.status === 'accepted');
      
      if (hasFulfilledRequest) {
        // Show all fulfilled requests
        const fulfilledRequests = allRequests.filter(req => req.status === 'accepted');
        return NextResponse.json({ 
          requests: fulfilledRequests, 
          type: 'fulfilled',
          message: 'Showing all fulfilled requests for this email'
        }, { status: 200 });
      } else {
        // Show only active (pending) requests
        const activeRequests = allRequests.filter(req => req.status === 'pending');
        return NextResponse.json({ 
          requests: activeRequests, 
          type: 'active',
          message: activeRequests.length > 0 ? 'Showing active requests for this email' : 'No active requests found for this email'
        }, { status: 200 });
      }
    } else {
      // For ID search, return single request
      const request = await BloodRequest.findOne(query)
        .populate('requested_by_user', 'name email mobile_number')
        .populate('requested_by_hospital', 'name email mobile_number')
        .populate('bloodbank_id', 'name address contact_number email')
        .sort({ requested_date: -1 });

      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ request }, { status: 200 });
    }
  } catch (error) {
    console.error("Error tracking blood request:", error);
    return NextResponse.json(
      { error: "Failed to track blood request" },
      { status: 500 }
    );
  }
}
