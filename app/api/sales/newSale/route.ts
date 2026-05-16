import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // 1. Validation 
    const required = [
      "customer_name", "father_name", "phone", "date", "address",
      "brand", "model_year", "engine_cc", "color",
      "chassis_no", "engine_no", "reg_no", "status",
      "sale_price", "received_amount", "balance_amount",
    ];

    for (const field of required) {
      if (!b[field] && b[field] !== 0) {
        return NextResponse.json({ success: false, message: `Missing: ${field}` }, { status: 400 });
      }
    }

    // 2. Database Insert (Now including Witness Fields)
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO sales
          (customer_name, father_name, phone, date, cnic, address,
           brand, model_year, engine_cc, color,
           chassis_no, engine_no, reg_no, status,
           sale_price, received_amount, balance_amount, remarks,
           doc_cnic, doc_file, doc_smart_card, doc_number_plates, biometric,
           witness1_name, witness1_phone, witness1_cnic,
           witness2_name, witness2_phone, witness2_cnic)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.customer_name, b.father_name, b.phone, b.date, b.cnic || null, b.address,
        b.brand, b.model_year, b.engine_cc, b.color,
        b.chassis_no, b.engine_no, b.reg_no, b.status,
        b.sale_price, b.received_amount, b.balance_amount,
        b.remarks || null,
        b.doc_cnic, b.doc_file, b.doc_smart_card, b.doc_number_plates, b.biometric,
        b.witness1_name || null, b.witness1_phone || null, b.witness1_cnic || null,
        b.witness2_name || null, b.witness2_phone || null, b.witness2_cnic || null
      ]
    );

    return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
  } catch (err: any) {
    console.error("Database Error:", err);
    return NextResponse.json({ success: false, message: "Database error" }, { status: 500 });
  }
}