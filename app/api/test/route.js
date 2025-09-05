import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json({ 
    message: "Test endpoint working", 
    timestamp: new Date().toISOString() 
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Test POST endpoint called with:", body);
    return NextResponse.json({ 
      message: "Test POST working", 
      receivedData: body,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json({ 
      error: "Test endpoint failed", 
      details: error.message 
    }, { status: 500 });
  }
}
