
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

// ── PUT /api/registration/transfer/[id] ─────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const b = await req.json();
    await pool.query<ResultSetHeader>(
      `UPDATE transfer_registrations SET
         name=?, father_name=?, cnic=?, phone=?,
         maker=?, model_year=?,
         reg_no_old=?, reg_no_new=?, chassis_no=?, engine_no=?,
         doc_reg_card=?, doc_no_plates=?, doc_file=?,
         amount=?, remarks=?, date=?
       WHERE id = ?`,
      [
        b.name, b.father_name, b.cnic || null, b.phone || null,
        b.maker, b.model_year,
        b.reg_no_old || null, b.reg_no_new || null, b.chassis_no, b.engine_no,
        b.doc_reg_card, b.doc_no_plates, b.doc_file,
        b.amount || null, b.remarks || null, b.date,
        id,
      ]
    );
    return NextResponse.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.error("[PUT /api/registration/transfer/[id]]", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// ── DELETE /api/registration/transfer/[id] ───────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM transfer_registrations WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/registration/transfer/[id]]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
