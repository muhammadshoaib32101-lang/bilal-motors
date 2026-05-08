import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ── GET /api/sales/newSale/[id] ────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
          id, customer_name, father_name, phone,
          DATE_FORMAT(date, '%Y-%m-%d') AS date,
          cnic, address, brand, model_year, engine_cc, color,
          chassis_no, engine_no, reg_no, status,
          sale_price, received_amount, balance_amount, remarks,
          doc_cnic, doc_file, doc_smart_card, doc_number_plates, biometric,
          witness1_name, witness1_phone, witness1_cnic,
          witness2_name, witness2_phone, witness2_cnic
       FROM sales WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("[GET /api/sales/newSale/[id]]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── PUT /api/sales/newSale/[id] (Update) ───────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const b = await req.json();
    await pool.query<ResultSetHeader>(
      `UPDATE sales SET
        customer_name=?, father_name=?, phone=?, date=?, cnic=?, address=?,
        brand=?, model_year=?, engine_cc=?, color=?, chassis_no=?, engine_no=?,
        reg_no=?, status=?, sale_price=?, received_amount=?, balance_amount=?, remarks=?,
        doc_cnic=?, doc_file=?, doc_smart_card=?, doc_number_plates=?, biometric=?,
        witness1_name=?, witness1_phone=?, witness1_cnic=?,
        witness2_name=?, witness2_phone=?, witness2_cnic=?
       WHERE id = ?`,
      [
        b.customer_name, b.father_name, b.phone, b.date, b.cnic, b.address,
        b.brand, b.model_year, b.engine_cc, b.color, b.chassis_no, b.engine_no,
        b.reg_no, b.status, b.sale_price, b.received_amount, b.balance_amount, b.remarks,
        b.doc_cnic, b.doc_file, b.doc_smart_card, b.doc_number_plates, b.biometric,
        b.witness1_name, b.witness1_phone, b.witness1_cnic,
        b.witness2_name, b.witness2_phone, b.witness2_cnic,
        id,
      ]
    );
    return NextResponse.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.error("[PUT /api/sales/newSale/[id]]", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ── DELETE /api/sales/newSale/[id] ─────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM sales WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/sales/newSale/[id]]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
