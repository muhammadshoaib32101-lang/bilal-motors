
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const type   = req.nextUrl.searchParams.get("type")   || "New Registration";
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const like   = `%${search}%`;

    let rows: RowDataPacket[];

    if (type === "New Registration") {
      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
           id,
           sr_no          AS srNo,
           name,
           father_name    AS fatherName,
           cnic,
           phone,
           maker,
           model_year     AS modelYear,
           reg_no_new     AS regNoNew,
           NULL           AS regNoOld,
           chassis_no     AS chassisNo,
           engine_no      AS engineNo,
           doc_reg_card   AS docRegCard,
           doc_no_plates  AS docNoPlates,
           doc_file       AS docFile,
           amount,
           remarks,
           DATE_FORMAT(date, '%Y-%m-%d') AS date,
           saved_time     AS savedTime,
           created_at     AS createdAt
         FROM new_registrations
         WHERE
           name        LIKE ? OR father_name LIKE ? OR maker      LIKE ? OR
           chassis_no  LIKE ? OR engine_no   LIKE ? OR reg_no_new LIKE ?
         ORDER BY sr_no ASC`,
        [like, like, like, like, like, like]
      );
    } else {
      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
           id,
           sr_no          AS srNo,
           name,
           father_name    AS fatherName,
           cnic,
           phone,
           maker,
           model_year     AS modelYear,
           reg_no_new     AS regNoNew,
           reg_no_old     AS regNoOld,
           chassis_no     AS chassisNo,
           engine_no      AS engineNo,
           doc_reg_card   AS docRegCard,
           doc_no_plates  AS docNoPlates,
           doc_file       AS docFile,
           amount,
           remarks,
           DATE_FORMAT(date, '%Y-%m-%d') AS date,
           saved_time     AS savedTime,
           created_at     AS createdAt
         FROM transfer_registrations
         WHERE
           name        LIKE ? OR father_name LIKE ? OR maker      LIKE ? OR
           chassis_no  LIKE ? OR engine_no   LIKE ? OR reg_no_new LIKE ? OR
           reg_no_old  LIKE ?
         ORDER BY sr_no ASC`,
        [like, like, like, like, like, like, like]
      );
    }

    return NextResponse.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("[GET /api/registration/history]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
