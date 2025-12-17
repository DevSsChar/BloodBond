import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import DonorContactRequest from '@/models/DonorContactRequest';
import User from '@/models/user';
import Doner from '@/models/Doner';
import connectDB from '@/db/connectDB';

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

    const { donorId, bloodType, urgencyLevel, message } = await request.json();

    // Get requester details
    const requester = await User.findOne({ email: session.user.email });
    if (!requester) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if donor exists
    const donor = await Doner.findById(donorId);
    if (!donor) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending request to this donor
    const existingRequest = await DonorContactRequest.findOne({
      requesterId: requester._id,
      donorId: donorId,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request to this donor' },
        { status: 400 }
      );
    }

    // Create new contact request
    const contactRequest = new DonorContactRequest({
      requesterId: requester._id,
      donorId: donorId,
      bloodType: bloodType,
      urgencyLevel: urgencyLevel || 'Medium',
      message: message
    });

    await contactRequest.save();

    return NextResponse.json({
      message: 'Contact request sent successfully',
      requestId: contactRequest._id
    });

  } catch (error) {
    console.error('Error creating donor contact request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get('donorId');
    const type = searchParams.get('type'); // 'sent' or 'received'

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let query = {};
    
    if (type === 'received') {
      // Get requests received by this donor
      const donor = await Doner.findOne({ user_id: user._id });
      if (!donor) {
        return NextResponse.json({ 
          pendingRequests: [],
          acceptedRequests: [],
          rejectedRequests: []
        });
      }
      
      // Get requests grouped by status
      const [pendingRequests, acceptedRequests, rejectedRequests] = await Promise.all([
        DonorContactRequest.find({ donorId: donor._id, status: 'pending' })
          .populate('requesterId', 'name email')
          .sort({ createdAt: -1 }),
        DonorContactRequest.find({ donorId: donor._id, status: 'accepted' })
          .populate('requesterId', 'name email')
          .sort({ responseDate: -1 }),
        DonorContactRequest.find({ donorId: donor._id, status: 'rejected' })
          .populate('requesterId', 'name email')
          .sort({ responseDate: -1 })
      ]);
      
      return NextResponse.json({ 
        pendingRequests,
        acceptedRequests,
        rejectedRequests
      });
      
    } else if (donorId) {
      // Get specific request status for a donor
      query = {
        requesterId: user._id,
        donorId: donorId,
        status: 'pending'
      };
    } else {
      // Get all requests sent by this user
      query.requesterId = user._id;
    }

    const requests = await DonorContactRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('donorId', 'name email mobile_number blood_type')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });

  } catch (error) {
    console.error('Error fetching donor contact requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}