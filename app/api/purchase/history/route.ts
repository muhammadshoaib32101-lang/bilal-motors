
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const type   = req.nextUrl.searchParams.get("type")   || "Individual Purchase";
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const like   = `%${search}%`;

    let rows: RowDataPacket[];

    if (type === "Individual Purchase") {
      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
           id,
           sr_no        AS srNo,
           seller_name  AS sellerName,
           father_name  AS fatherName,
           phone        AS phoneNumber,
           DATE_FORMAT(date, '%Y-%m-%d') AS date,
           cnic,
           address,
           brand,
           model_year   AS modelYear,
           engine_cc    AS engineCC,
           color,
           chassis_no   AS chassisNo,
           engine_no    AS engineNo,
           reg_no       AS regNo,
           status,
           purchase_price  AS purchasePrice,
           paid_amount     AS paidAmount,
           balance_amount  AS balanceAmount,
           expenses,
           sale_price      AS salePrice,
           remarks,
           doc_cnic        AS docCnic,
           doc_file        AS docFile,
           doc_smart_card  AS docSmartCard,
           doc_number_plates AS docNumberPlates,
           biometric,
           saved_time      AS savedTime,
           witness1_name   AS witness1Name,
           witness1_phone  AS witness1Phone,
           witness1_cnic   AS witness1Cnic,
           witness2_name   AS witness2Name,
           witness2_phone  AS witness2Phone,
           witness2_cnic   AS witness2Cnic,
           created_at      AS createdAt
         FROM individual_purchases
         WHERE
           seller_name LIKE ? OR father_name LIKE ? OR phone     LIKE ? OR
           cnic        LIKE ? OR chassis_no  LIKE ? OR engine_no LIKE ? OR reg_no LIKE ?
         ORDER BY sr_no ASC`,
        [like, like, like, like, like, like, like]
      );
    } else {
      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
           id,
           sr_no         AS srNo,
           showroom_name AS sellerName,
           ''            AS fatherName,
           phone         AS phoneNumber,
           DATE_FORMAT(date, '%Y-%m-%d') AS date,
           ''            AS cnic,
           address,
           brand,
           model_year    AS modelYear,
           engine_cc     AS engineCC,
           color,
           chassis_no    AS chassisNo,
           engine_no     AS engineNo,
           reg_no        AS regNo,
           status,
           purchase_price  AS purchasePrice,
           paid_amount     AS paidAmount,
           balance_amount  AS balanceAmount,
           expenses,
           sale_price      AS salePrice,
           remarks,
           doc_cnic        AS docCnic,
           doc_file        AS docFile,
           doc_smart_card  AS docSmartCard,
           doc_number_plates AS docNumberPlates,
           biometric,
           saved_time      AS savedTime,
           witness1_name   AS witness1Name,
           witness1_phone  AS witness1Phone,
           witness1_cnic   AS witness1Cnic,
           witness2_name   AS witness2Name,
           witness2_phone  AS witness2Phone,
           witness2_cnic   AS witness2Cnic,
           created_at      AS createdAt
         FROM showroom_purchases
         WHERE
           showroom_name LIKE ? OR phone     LIKE ? OR chassis_no LIKE ? OR
           engine_no     LIKE ? OR reg_no    LIKE ? OR address    LIKE ?
         ORDER BY sr_no ASC`,
        [like, like, like, like, like, like]
      );
    }

    // srNo now comes directly from DB — no re-mapping needed
    return NextResponse.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("[GET /api/purchase/history]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}