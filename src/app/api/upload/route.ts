import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder for file upload - ready for S3/Supabase integration
  return NextResponse.json({ error: "Upload not configured" }, { status: 501 });
}
