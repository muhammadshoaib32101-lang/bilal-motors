
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  try {
    const search       = req.nextUrl.searchParams.get("search")?.trim() || "";
    const filterBrand  = req.nextUrl.searchParams.get("brand")  || "";
    const filterYear   = req.nextUrl.searchParams.get("year")   || "";
    const filterStatus   = req.nextUrl.searchParams.get("status")   || "";
    const filterEngineCC = req.nextUrl.searchParams.get("engineCC") || "";
    const filterType     = req.nextUrl.searchParams.get("type")     || "";

    const like = `%${search}%`;

    const indConds: string[] = [];
    const shConds:  string[] = [];
    const indParams: unknown[] = [];
    const shParams:  unknown[] = [];

    if (search) {
      indConds.push(
        `(seller_name LIKE ? OR father_name LIKE ? OR phone LIKE ? OR cnic LIKE ? OR chassis_no LIKE ? OR engine_no LIKE ? OR reg_no LIKE ? OR brand LIKE ?)`
      );
      indParams.push(like, like, like, like, like, like, like, like);

      shConds.push(
        `(showroom_name LIKE ? OR phone LIKE ? OR chassis_no LIKE ? OR engine_no LIKE ? OR reg_no LIKE ? OR brand LIKE ?)`
      );
      shParams.push(like, like, like, like, like, like);
    }
    if (filterBrand) {
      indConds.push(`brand = ?`);  indParams.push(filterBrand);
      shConds.push(`brand = ?`);   shParams.push(filterBrand);
    }
    if (filterYear) {
      indConds.push(`model_year = ?`);  indParams.push(filterYear);
      shConds.push(`model_year = ?`);   shParams.push(filterYear);
    }
    if (filterStatus) {
      indConds.push(`status = ?`);     indParams.push(filterStatus);
      shConds.push(`status = ?`);      shParams.push(filterStatus);
    }
    if (filterEngineCC) {
      indConds.push(`engine_cc = ?`);  indParams.push(filterEngineCC);
      shConds.push(`engine_cc = ?`);   shParams.push(filterEngineCC);
    }

    const indWhere = indConds.length ? `WHERE ${indConds.join(" AND ")}` : "";
    const shWhere  = shConds.length  ? `WHERE ${shConds.join(" AND ")}`  : "";

    const SEL_IND = `
      SELECT
        id, sr_no AS srNo, 'Individual' AS purchaseType,
        seller_name AS sellerName, father_name AS fatherName,
        phone AS phoneNumber, DATE_FORMAT(date,'%d-%m-%Y') AS date,
        cnic, address, brand, model_year AS modelYear, engine_cc AS engineCC,
        color, chassis_no AS chassisNo, engine_no AS engineNo, reg_no AS regNo,
        status, purchase_price AS purchasePrice, paid_amount AS paidAmount,
        balance_amount AS balanceAmount, expenses, sale_price AS salePrice,
        remarks, doc_cnic AS docCnic, doc_file AS docFile,
        doc_smart_card AS docSmartCard, doc_number_plates AS docNumberPlates,
        biometric, saved_time AS savedTime,
        witness1_name AS witness1Name, witness1_phone AS witness1Phone, witness1_cnic AS witness1Cnic,
        witness2_name AS witness2Name, witness2_phone AS witness2Phone, witness2_cnic AS witness2Cnic,
        created_at AS createdAt
      FROM individual_purchases ${indWhere}`;

    const SEL_SH = `
      SELECT
        id, sr_no AS srNo, 'Showroom' AS purchaseType,
        showroom_name AS sellerName, '' AS fatherName,
        phone AS phoneNumber, DATE_FORMAT(date,'%d-%m-%Y') AS date,
        '' AS cnic, address, brand, model_year AS modelYear, engine_cc AS engineCC,
        color, chassis_no AS chassisNo, engine_no AS engineNo, reg_no AS regNo,
        status, purchase_price AS purchasePrice, paid_amount AS paidAmount,
        balance_amount AS balanceAmount, expenses, sale_price AS salePrice,
        remarks, doc_cnic AS docCnic, doc_file AS docFile,
        doc_smart_card AS docSmartCard, doc_number_plates AS docNumberPlates,
        biometric, saved_time AS savedTime,
        witness1_name AS witness1Name, witness1_phone AS witness1Phone, witness1_cnic AS witness1Cnic,
        witness2_name AS witness2Name, witness2_phone AS witness2Phone, witness2_cnic AS witness2Cnic,
        created_at AS createdAt
      FROM showroom_purchases ${shWhere}`;

    let rows: RowDataPacket[];

    if (filterType === "Individual") {
      [rows] = await pool.query<RowDataPacket[]>(
        `${SEL_IND} ORDER BY sr_no ASC`,
        indParams
      );
    } else if (filterType === "Showroom") {
      [rows] = await pool.query<RowDataPacket[]>(
        `${SEL_SH} ORDER BY sr_no ASC`,
        shParams
      );
    } else {
      [rows] = await pool.query<RowDataPacket[]>(
        `(${SEL_IND}) UNION ALL (${SEL_SH}) ORDER BY createdAt DESC`,
        [...indParams, ...shParams]
      );
    }

    return NextResponse.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("[GET /api/inventory]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
