import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // This endpoint just returns success to trigger a session refresh
    // The actual session refresh happens on the client side
    return NextResponse.json(
      { message: "Session refresh triggered" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error triggering session refresh:", error);
    return NextResponse.json(
      { error: "Failed to trigger session refresh" },
      { status: 500 }
    );
  }
}
