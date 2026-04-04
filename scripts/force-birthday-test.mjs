import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

import connectDB from "../db/connectDB.mjs";
import User from "../models/user.js";
import Doner from "../models/Doner.js";
import InAppNotification from "../models/InAppNotification.js";

async function forceBirthday() {
  try {
    await connectDB();
    console.log("Connected to DB...");

    const email = "devatchar@gmail.com"; // Your test email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} not found.`);
      process.exit(1);
    }

    const donor = await Doner.findOne({ user_id: user._id });
    if (!donor) {
      console.log("Donor profile not found for this user.");
      process.exit(1);
    }

    // Force the birthday notification
    await InAppNotification.create({
      user_id: user._id,
      type: "birthday_reminder",
      title: "Happy Birthday from BloodBond 🎉",
      message: `Happy Birthday ${user.name}! Thank you for being part of our life-saving donor community.`,
      send_date: new Date(),
      metadata: { donorId: donor._id }
    });

    // Force the recent activity log
    await Doner.findByIdAndUpdate(donor._id, {
      $push: {
        recent_activity: {
          $each: [{
            type: 'system',
            description: "It's your birthday! Thanks for being an amazing donor.",
            date: new Date()
          }],
          $position: 0 // Insert at the top of the list!
        }
      }
    });

    console.log("✅ Successfully injected Birthday Notification and Recent Activity!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

forceBirthday();