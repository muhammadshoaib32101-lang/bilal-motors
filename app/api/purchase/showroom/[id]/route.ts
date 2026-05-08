
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ── GET  /api/purchase/showroom/[id] ─────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         id,
         showroom_name, phone,
         DATE_FORMAT(date, '%Y-%m-%d') AS date,
         address,
         brand, model_year, engine_cc, color,
         chassis_no, engine_no, reg_no, status,
         purchase_price, paid_amount, balance_amount, expenses, sale_price,
         remarks,
         doc_cnic, doc_file, doc_smart_card, doc_number_plates, biometric,
         witness1_name, witness1_phone, witness1_cnic,
         witness2_name, witness2_phone, witness2_cnic
       FROM showroom_purchases
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("[GET /api/purchase/showroom/[id]]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── PUT  /api/purchase/showroom/[id] ─────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const b = await req.json();
    await pool.query<ResultSetHeader>(
      `UPDATE showroom_purchases SET
         showroom_name=?, phone=?, date=?, address=?,
         brand=?, model_year=?, engine_cc=?, color=?,
         chassis_no=?, engine_no=?, reg_no=?, status=?,
         purchase_price=?, paid_amount=?, balance_amount=?, expenses=?, sale_price=?,
         remarks=?,
         doc_cnic=?, doc_file=?, doc_smart_card=?, doc_number_plates=?, biometric=?,
         witness1_name=?, witness1_phone=?, witness1_cnic=?,
         witness2_name=?, witness2_phone=?, witness2_cnic=?
       WHERE id = ?`,
      [
        b.showroom_name, b.phone, b.date, b.address,
        b.brand, b.model_year, b.engine_cc, b.color,
        b.chassis_no, b.engine_no, b.reg_no, b.status,
        b.purchase_price, b.paid_amount, b.balance_amount, b.expenses, b.sale_price,
        b.remarks,
        b.doc_cnic, b.doc_file, b.doc_smart_card, b.doc_number_plates, b.biometric,
        b.witness1_name, b.witness1_phone, b.witness1_cnic,
        b.witness2_name, b.witness2_phone, b.witness2_cnic,
        id,
      ]
    );
    return NextResponse.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.error("[PUT /api/purchase/showroom/[id]]", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ── DELETE /api/purchase/showroom/[id] ───────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM showroom_purchases WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/purchase/showroom/[id]]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
