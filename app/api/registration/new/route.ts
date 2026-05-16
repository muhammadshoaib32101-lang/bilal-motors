
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ── POST /api/registration/new ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    const required = ["name", "fatherName", "maker", "modelYear", "chassisNo", "engineNo", "date"];
    for (const field of required) {
      if (!b[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const [maxRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sr_no), 0) + 1 AS next_sr FROM new_registrations"
    );
    const nextSrNo = (maxRows as RowDataPacket[])[0].next_sr;

    const savedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO new_registrations
         (sr_no, name, father_name, cnic, phone, maker, model_year, color,
          engine_cc, chassis_no, engine_no, reg_no_new,
          doc_reg_card, doc_no_plates, doc_file,
          amount, remarks, date, saved_time, fingerprint_img)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nextSrNo,
        b.name, b.fatherName, b.cnic || null, b.phone || null,
        b.maker, b.modelYear, b.color || null,
        b.engineCC || null, b.chassisNo, b.engineNo, b.regNoNew || null,
        b.docs?.["Registration Card"] ? 1 : 0,
        b.docs?.["Number Plates"] ? 1 : 0,
        b.docs?.["File"] ? 1 : 0,
        b.amount || null, b.remarks || null,
        b.date,
        savedTime,
        b.fingerprint || null,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      serialNumber: nextSrNo,
    }, { status: 201 });

  } catch (err: any) {
    console.error("[POST /api/registration/new]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
