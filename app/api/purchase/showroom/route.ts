
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ── GET /api/purchase/showroom?search=xxx ───────────────────
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const like = `%${search}%`;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         id,
         sr_no,
         showroom_name, phone,
         DATE_FORMAT(date, '%d-%m-%Y') AS date,
         address,
         brand, model_year, engine_cc, color,
         chassis_no, engine_no, reg_no, status,
         purchase_price, paid_amount, balance_amount, expenses, sale_price,
         remarks,
         doc_cnic, doc_file, doc_smart_card, doc_number_plates, biometric,
         saved_time,
         witness1_name, witness1_phone, witness1_cnic,
         witness2_name, witness2_phone, witness2_cnic,
         created_at
       FROM showroom_purchases
       WHERE
         showroom_name LIKE ? OR phone     LIKE ? OR address  LIKE ? OR
         chassis_no    LIKE ? OR engine_no LIKE ? OR reg_no   LIKE ?
       ORDER BY sr_no ASC`,
      [like, like, like, like, like, like]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[GET /api/purchase/showroom]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── POST /api/purchase/showroom ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    const required = [
      "showroomName", "phone", "address", "date",
      "brand", "modelYear", "engineCC", "color",
      "chassisNo", "engineNo", "regNo", "status",
      "purchasePrice", "paidAmount", "balanceAmount",
    ];
    for (const field of required) {
      if (!b[field] && b[field] !== 0) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get next sr_no
    const [maxRows] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(sr_no), 0) + 1 AS next_sr FROM showroom_purchases"
    );
    const nextSrNo = (maxRows as RowDataPacket[])[0].next_sr;

    // Capture current time
    const savedTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO showroom_purchases
         (sr_no, showroom_name, phone, address, date,
          brand, model_year, engine_cc, color,
          chassis_no, engine_no, reg_no, status,
          purchase_price, paid_amount, balance_amount, expenses, sale_price,
          remarks,
          doc_cnic, doc_file, doc_smart_card, doc_number_plates, biometric,
          saved_time,
          witness1_name, witness1_phone, witness1_cnic,
          witness2_name, witness2_phone, witness2_cnic)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nextSrNo,
        b.showroomName, b.phone, b.address, b.date,
        b.brand, b.modelYear, b.engineCC, b.color,
        b.chassisNo, b.engineNo, b.regNo, b.status,
        parseFloat(b.purchasePrice),
        parseFloat(b.paidAmount),
        parseFloat(b.balanceAmount),
        parseFloat(b.expenses) || 0,
        parseFloat(b.salePrice) || 0,
        b.remarks || null,
        b.topDocs?.CNIC ? 1 : 0,
        b.topDocs?.File ? 1 : 0,
        b.topDocs?.["Smart card"] ? 1 : 0,
        b.topDocs?.["Number plates"] ? 1 : 0,
        b.biometric || null,
        savedTime,
        b.witness1Name || null,
        b.witness1Phone || null,
        b.witness1Cnic || null,
        b.witness2Name || null,
        b.witness2Phone || null,
        b.witness2Cnic || null,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      serialNumber: nextSrNo,
    }, { status: 201 });

  } catch (err: any) {
    console.error("[POST /api/purchase/showroom]", err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Duplicate chassis/engine/reg number" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}