import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM showroom_settings LIMIT 1"
    );
    const row = rows[0];
    const settings = row
      ? { ...row, showroom_id: `Sh${String(row.id).padStart(3, "0")}` }
      : { showroom_id: "Sh001" };
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { showroomName, ownerName, address, mobileNumbers, gmail, instagram, facebook, website } =
      await req.json();

    const mobileJson = JSON.stringify(Array.isArray(mobileNumbers) ? mobileNumbers : []);

    await pool.query(
      `INSERT INTO showroom_settings (id, showroom_name, owner_name, address, mobile_numbers, gmail, instagram, facebook, website)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         showroom_name   = VALUES(showroom_name),
         owner_name      = VALUES(owner_name),
         address         = VALUES(address),
         mobile_numbers  = VALUES(mobile_numbers),
         gmail           = VALUES(gmail),
         instagram       = VALUES(instagram),
         facebook        = VALUES(facebook),
         website         = VALUES(website)`,
      [showroomName ?? "", ownerName ?? "", address ?? "", mobileJson,
       gmail ?? "", instagram ?? "", facebook ?? "", website ?? ""]
    );

    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
