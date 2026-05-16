import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, username, email, phone, password } = await req.json();

    if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username.trim(), email.trim()]
    );

    if ((existing as RowDataPacket[]).length > 0) {
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (full_name, username, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      [fullName.trim(), username.trim(), email.trim(), phone?.trim() || null, hashed]
    );

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
