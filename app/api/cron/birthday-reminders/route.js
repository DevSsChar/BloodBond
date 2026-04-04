import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import Doner from "@/models/Doner.js";
import InAppNotification from "@/models/InAppNotification.js";
import { getFeatureFlags } from "@/lib/featureFlags.js";

function isSameMonthDay(date, now) {
  return date.getUTCMonth() === now.getUTCMonth() && date.getUTCDate() === now.getUTCDate();
}

export async function POST(req) {
  try {
    const cronSecret = req.headers.get("x-cron-secret");
    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized cron invocation" }, { status: 401 });
    }

    const featureFlags = getFeatureFlags();
    if (!featureFlags.birthdayRemindersEnabled) {
      return NextResponse.json({ message: "Birthday reminders are disabled", created: 0 }, { status: 200 });
    }

    await connectDB();

    const now = new Date();
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const donors = await Doner.find({
      date_of_birth: { $ne: null },
      user_id: { $ne: null }
    }).populate("user_id", "name");

    const birthdayDonors = donors.filter((donor) => {
      if (!donor.date_of_birth) return false;
      return isSameMonthDay(new Date(donor.date_of_birth), now);
    });

    let createdCount = 0;

    for (const donor of birthdayDonors) {
      const existing = await InAppNotification.findOne({
        user_id: donor.user_id._id,
        type: "birthday_reminder",
        send_date: { $gte: dayStart, $lte: dayEnd }
      });

      if (existing) continue;

      const title = "Happy Birthday from BloodBond";
      const message = `Happy Birthday ${donor.user_id?.name || "Donor"}! Thank you for being part of our life-saving donor community.`;

      await InAppNotification.create({
        user_id: donor.user_id._id,
        type: "birthday_reminder",
        title,
        message,
        send_date: new Date(),
        metadata: {
          donorId: donor._id
        }
      });

      createdCount += 1;
    }

    return NextResponse.json({
      message: "Birthday reminder job completed",
      totalBirthdayDonors: birthdayDonors.length,
      created: createdCount
    }, { status: 200 });
  } catch (error) {
    console.error("Birthday reminder job failed:", error);
    return NextResponse.json({ error: "Birthday reminder job failed" }, { status: 500 });
  }
}
