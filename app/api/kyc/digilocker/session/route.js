import connectDB from "@/db/connectDB.mjs";
import EmergencyAadhaarVerification from "@/models/EmergencyAadhaarVerification.js";
import {
  getDigilockerRedirectBase,
  getSandboxConfig,
  hashAadhaarSubject,
  isDigilockerDevBypassEnabled,
  sandboxRequest,
} from "@/lib/sandbox.js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();

    if (isDigilockerDevBypassEnabled()) {
      const clientState = crypto.randomBytes(16).toString("hex");
      const record = await EmergencyAadhaarVerification.create({
        client_state: clientState,
        sandbox_session_id: `dev-bypass-${clientState}`,
        status: "verified",
        aadhaar_subject_ref: hashAadhaarSubject(`dev-bypass:${clientState}`),
        verified_name: "Dev bypass",
        verified_at: new Date(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      return NextResponse.json({
        success: true,
        devBypass: true,
        verificationId: record._id.toString(),
        verifiedName: record.verified_name,
      });
    }

    const { apiKey, apiSecret } = getSandboxConfig();
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error:
            "Sandbox API is not configured. Set SANDBOX_API_KEY and SANDBOX_API_SECRET.",
        },
        { status: 503 }
      );
    }

    const appUrl = getDigilockerRedirectBase(req);
    if (!appUrl || !appUrl.startsWith("https://")) {
      return NextResponse.json(
        {
          error:
            "DigiLocker needs an HTTPS return URL. For local HTTP: add DIGILOCKER_DEV_BYPASS=true to .env.local (dev only). For real DigiLocker: set SANDBOX_REDIRECT_URL or APP_URL to an https URL (ngrok or your deploy) and open the app on that URL.",
        },
        { status: 400 }
      );
    }

    const clientState = crypto.randomBytes(16).toString("hex");
    const redirectUrl = `${appUrl}/emergency/digilocker-return?state=${clientState}`;

    const init = await sandboxRequest("/kyc/digilocker/sessions/init", {
      method: "POST",
      body: JSON.stringify({
        "@entity": "in.co.sandbox.kyc.digilocker.session.request",
        flow: "signin",
        redirect_url: redirectUrl,
        doc_types: ["aadhaar"],
        purpose: "Emergency blood request verification",
        requestor_name: "BloodBond",
      }),
    });

    const sessionId = init?.data?.session_id;
    const authorizationUrl = init?.data?.authorization_url;
    if (!sessionId || !authorizationUrl) {
      return NextResponse.json(
        { error: "Invalid response from Sandbox when starting DigiLocker session" },
        { status: 502 }
      );
    }

    await EmergencyAadhaarVerification.create({
      client_state: clientState,
      sandbox_session_id: sessionId,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      authorizationUrl,
      state: clientState,
    });
  } catch (error) {
    console.error("DigiLocker session init error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start Aadhaar verification" },
      { status: 500 }
    );
  }
}
