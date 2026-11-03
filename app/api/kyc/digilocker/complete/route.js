import connectDB from "@/db/connectDB.mjs";
import EmergencyAadhaarVerification from "@/models/EmergencyAadhaarVerification.js";
import {
  extractAadhaarName,
  extractAadhaarSubjectKey,
} from "@/lib/aadhaarXml.js";
import { hashAadhaarSubject, sandboxRequest } from "@/lib/sandbox.js";
import { NextResponse } from "next/server";

const VERIFICATION_TTL_MS = 2 * 60 * 60 * 1000;

async function fetchAadhaarXml(sessionId) {
  const doc = await sandboxRequest(
    `/kyc/digilocker/sessions/${sessionId}/documents/aadhaar`,
    { method: "GET" }
  );
  const fileUrl = doc?.data?.files?.[0]?.url;
  if (!fileUrl) {
    throw new Error("Aadhaar document URL not returned from Sandbox");
  }
  const xmlRes = await fetch(fileUrl);
  if (!xmlRes.ok) {
    throw new Error("Failed to download Aadhaar document");
  }
  return xmlRes.text();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    if (!state) {
      return NextResponse.json({ error: "state is required" }, { status: 400 });
    }

    await connectDB();
    const record = await EmergencyAadhaarVerification.findOne({
      client_state: state,
    });
    if (!record) {
      return NextResponse.json(
        { error: "Verification session not found" },
        { status: 404 }
      );
    }

    if (record.status === "verified" && record.expires_at > new Date()) {
      return NextResponse.json({
        success: true,
        status: "verified",
        verificationId: record._id.toString(),
        verifiedName: record.verified_name,
      });
    }

    const statusRes = await sandboxRequest(
      `/kyc/digilocker/sessions/${record.sandbox_session_id}/status`,
      { method: "GET" }
    );
    const sessionStatus = statusRes?.data?.status;

    if (sessionStatus === "failed") {
      record.status = "failed";
      record.failure_reason = "DigiLocker consent failed";
      await record.save();
      return NextResponse.json({
        success: false,
        status: "failed",
        error: "Aadhaar verification was not completed",
      });
    }

    if (sessionStatus === "expired") {
      record.status = "expired";
      await record.save();
      return NextResponse.json({
        success: false,
        status: "expired",
        error: "Verification session expired. Please try again.",
      });
    }

    if (sessionStatus !== "succeeded") {
      return NextResponse.json({
        success: true,
        status: sessionStatus || "pending",
        pending: true,
      });
    }

    const xml = await fetchAadhaarXml(record.sandbox_session_id);
    const subjectKey = extractAadhaarSubjectKey(xml);
    if (!subjectKey) {
      record.status = "failed";
      record.failure_reason = "Could not read Aadhaar identifier from document";
      await record.save();
      return NextResponse.json(
        { error: "Could not verify Aadhaar document" },
        { status: 422 }
      );
    }

    const aadhaarSubjectRef = hashAadhaarSubject(subjectKey);
    const verifiedName = extractAadhaarName(xml);
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

    record.status = "verified";
    record.aadhaar_subject_ref = aadhaarSubjectRef;
    record.verified_name = verifiedName;
    record.verified_at = new Date();
    record.expires_at = expiresAt;
    await record.save();

    return NextResponse.json({
      success: true,
      status: "verified",
      verificationId: record._id.toString(),
      verifiedName,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("DigiLocker complete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete Aadhaar verification" },
      { status: 500 }
    );
  }
}
