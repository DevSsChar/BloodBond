import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import DonorContactRequest from '@/model/DonorContactRequest';
import User from '@/model/user';
import Doner from '@/model/Doner';
import connectDB from '@/db/connectDB';

export async function PATCH(request) {
  try {
    await connectDB();
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId, action } = await request.json(); // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get donor profile
    const donor = await Doner.findOne({ user_id: user._id });
    if (!donor) {
      return NextResponse.json(
        { error: 'Donor profile not found' },
        { status: 404 }
      );
    }

    // Find and update the request
    const contactRequest = await DonorContactRequest.findOne({
      _id: requestId,
      donorId: donor._id,
      status: 'pending'
    });

    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Request not found or already responded' },
        { status: 404 }
      );
    }

    contactRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    contactRequest.responseDate = new Date();
    
    await contactRequest.save();

    return NextResponse.json({
      message: `Request ${action}ed successfully`,
      request: contactRequest
    });

  } catch (error) {
    console.error('Error responding to donor contact request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}