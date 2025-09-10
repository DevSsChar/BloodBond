import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import HospitalInventoryLog from "@/model/HospitalInventoryLog.js";
import User from "@/model/user.js";
import { getToken } from "next-auth/jwt";

// GET - Fetch hospital inventory logs
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const bloodType = searchParams.get('bloodType');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query = { hospital_id: userId };
    
    if (bloodType) {
      query.blood_type = bloodType;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get logs with pagination
    const logs = await HospitalInventoryLog.find(query)
      .populate('performed_by', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await HospitalInventoryLog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate summary statistics for the current filters
    const summaryPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalUnitsAdded: {
            $sum: {
              $cond: [{ $gt: ["$units_changed", 0] }, "$units_changed", 0]
            }
          },
          totalUnitsRemoved: {
            $sum: {
              $cond: [{ $lt: ["$units_changed", 0] }, { $abs: "$units_changed" }, 0]
            }
          },
          actionBreakdown: {
            $push: "$action"
          }
        }
      }
    ];

    const summaryResult = await HospitalInventoryLog.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalTransactions: 0,
      totalUnitsAdded: 0,
      totalUnitsRemoved: 0,
      actionBreakdown: []
    };

    // Count actions
    const actionCounts = {};
    if (summary.actionBreakdown) {
      summary.actionBreakdown.forEach(action => {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });
    }
    summary.actionCounts = actionCounts;
    delete summary.actionBreakdown;

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      summary
    });

  } catch (error) {
    console.error("Error fetching hospital inventory logs:", error);
    return NextResponse.json({ error: 'Failed to fetch inventory logs' }, { status: 500 });
  }
}
