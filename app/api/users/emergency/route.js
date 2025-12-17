import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB.mjs";
import BloodRequest from "@/models/BloodRequest";
// import { authMiddleware, roleCheck } from "@/lib/auth";

export async function POST(req) {
  await connectDB();

  const auth = await authMiddleware(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Only "user" role allowed
  const roleError = roleCheck(auth.user, "user");
  if (roleError) {
    return NextResponse.json({ error: roleError.error }, { status: roleError.status });
  }

  try {
    const body = await req.json();
    const { bloodbank_id, blood_type, units_required } = body;

    if (!bloodbank_id || !blood_type || !units_required) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newRequest = await BloodRequest.create({
      requested_by_user: auth.user.id,
      bloodbank_id,
      blood_type,
      units_required,
      request_type: "emergency"
    });

    return NextResponse.json({ message: "Emergency request created", request: newRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
