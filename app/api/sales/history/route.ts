// app/api/sales/history/route.ts
//
// GET /api/sales/history?search=xxx
//
// Returns paginated/searchable sales records for the Sales History table.
// Search works across: customer CNIC, phone, chassis no, engine no, reg no.

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const like   = `%${search}%`;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         id,
         customer_name     AS customerName,
         father_name       AS fatherName,
         phone             AS phoneNumber,
         DATE_FORMAT(date, '%Y-%m-%d') AS date, -- Changed to YYYY-MM-DD to fix NaN print error
         cnic,
         address,
         brand,
         model_year        AS modelYear,
         engine_cc         AS engineCC,
         color,
         chassis_no        AS chassisNo,
         engine_no         AS engineNo,
         reg_no            AS regNo,
         status,
         sale_price        AS salePrice,
         received_amount   AS receivedAmount,
         balance_amount    AS balanceAmount,
         remarks,
         doc_cnic          AS docCnic,
         doc_file          AS docFile,
         doc_smart_card    AS docSmartCard,
         doc_number_plates AS docNumberPlates,
         biometric,
         -- Added Witness Fields mapped to camelCase --
         witness1_name     AS witness1Name,
         witness1_phone    AS witness1Phone,
         witness1_cnic     AS witness1Cnic,
         witness2_name     AS witness2Name,
         witness2_phone    AS witness2Phone,
         witness2_cnic     AS witness2Cnic,
         ---------------------------------------------
         created_at        AS createdAt
       FROM sales
       WHERE
         cnic          LIKE ? OR
         phone         LIKE ? OR
         chassis_no    LIKE ? OR
         engine_no     LIKE ? OR
         reg_no        LIKE ? OR
         customer_name LIKE ? OR
         father_name   LIKE ?
       ORDER BY created_at ASC`,
      [like, like, like, like, like, like, like]
    );

    // Add sequential srNo for the table display
    const data = rows.map((row, i) => ({ srNo: i + 1, ...row }));

    return NextResponse.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error("[GET /api/sales/history]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}