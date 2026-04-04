import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/db/connectDB.mjs";
import InAppNotification from "@/models/InAppNotification.js";

export async function GET(req) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !(token.userId || token.sub)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = Number(searchParams.get("limit") || 20);

    const query = { user_id: userId };
    if (unreadOnly) query.is_read = false;

    const notifications = await InAppNotification.find(query)
      .sort({ send_date: -1 })
      .limit(Math.min(limit, 100));

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !(token.userId || token.sub)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.userId || token.sub;
    const { notificationId, markAllRead } = await req.json();

    if (markAllRead) {
      await InAppNotification.updateMany(
        { user_id: userId, is_read: false },
        { $set: { is_read: true } }
      );

      return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const updated = await InAppNotification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { $set: { is_read: true } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
