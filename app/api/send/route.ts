import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ ...body, message: "ok" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error fetching repo data" },
      { status: 500 }
    );
  }
}
