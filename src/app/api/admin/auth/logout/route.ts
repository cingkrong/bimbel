import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Admin berhasil logout." });
  response.cookies.delete("admin_session");
  return response;
}

