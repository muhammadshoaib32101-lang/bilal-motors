"use client";

import { useState, useEffect, CSSProperties, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../_components/Sidebar";
import { dmSans } from "../_components/fonts";
import { UserIcon } from "../_components/icons";

/* Types */

interface InventoryRecord {
  id: number;
  srNo: number;
  purchaseType: "Individual" | "Showroom";
  sellerName: string;
  fatherName: string;
  phoneNumber: string;
  date: string;
  savedTime?: string;
  cnic: string;
  address: string;
  brand: string;
  modelYear: string;
  engineCC: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  regNo: string;
  status: string;
  purchasePrice: number;
  paidAmount: number;
  balanceAmount: number;
  expenses: number;
  salePrice: number;
  remarks: string;
  docCnic: number;
  docFile: number;
  docSmartCard: number;
  docNumberPlates: number;
  biometric: string;
  witness1Name?: string;
  witness1Phone?: string;
  witness1Cnic?: string;
  witness2Name?: string;
  witness2Phone?: string;
  witness2Cnic?: string;
}

/* Constants */

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);

const FIXED_BUYER_NAME = "New Bilal Motors";
const FIXED_BUYER_CNIC = "37406-1234567-0";
const FIXED_CONTACTS   = "0300-5257278, 0333-5766432, 0313-5479941";

/* Styles */

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#e7e8ec", LABEL = "#444b5a", MUTED = "#8a909e";

const ms: Record<string, CSSProperties> = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(10,20,30,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" },
  drawer:       { background: "#fff", width: "min(860px, 96vw)", maxHeight: "92vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  drawerHead:   { background: "#16171b", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  drawerTitle:  { color: "#fff", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 10 },
  drawerBadge:  { background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: ".75rem", fontWeight: 600 },
  headActions:  { display: "flex", gap: 8, alignItems: "center" },
  btnHeadPrint: { background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.35)", borderRadius: 7, padding: "6px 16px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnHeadClose: { background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 7, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  body:         { overflowY: "auto", flex: 1 },
  viewBody:     { padding: "24px 28px" },
  sectionBlock: { marginBottom: 22 },
  sectionLabel: { fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".8px", color: MUTED, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  fieldGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px 20px" },
  fieldItem:    { display: "flex", flexDirection: "column" as const, gap: 3 },
  fieldItemWide:{ display: "flex", flexDirection: "column" as const, gap: 3, gridColumn: "span 2" },
  fLabel:       { fontSize: ".68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px" },
  fValue:       { fontSize: ".85rem", fontWeight: 500, color: "#2a2d35" },
  docChip:      { display: "inline-flex", alignItems: "center", gap: 5, background: "#f0f6f0", border: "1px solid #c3dfc3", borderRadius: 5, padding: "3px 10px", fontSize: ".75rem", fontWeight: 600, color: "#1a5c2a", marginRight: 6, marginBottom: 4 },
  bioChip:      { display: "inline-flex", alignItems: "center", gap: 5, background: "#f0f4ff", border: "1px solid #c0cbf0", borderRadius: 5, padding: "3px 10px", fontSize: ".75rem", fontWeight: 600, color: "#2a3a8a" },
  footer:       { padding: "16px 28px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "#fafbfc" },
  btnClose:     { background: "#fff", color: LABEL, border: `1px solid ${BORDER}`, padding: "8px 24px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer" },
  btnPrint:     { background: "#16171b", color: "#fff", border: "none", padding: "8px 24px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 },
};

/* SVG Icons */

function IconPrint() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* Inline Badge Components */

function StatusBadge({ status }: { status: string }) {
  const isNew = status === "Brand New";
  return (
    <span className={`inv-badge ${isNew ? "inv-badge-new" : "inv-badge-used"}`}>
      {isNew ? "New" : status || "-"}
    </span>
  );
}

function TypeBadge({ type }: { type: "Individual" | "Showroom" }) {
  const isInd = type === "Individual";
  return (
    <span className={`inv-badge ${isInd ? "inv-badge-ind" : "inv-badge-showroom"}`}>
      {type}
    </span>
  );
}

/* Shared Print CSS */

const SHARED_PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 11.5px; line-height: 1.4; }
  .page { padding: 22px 30px 18px; max-width: 780px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2.5px solid #1a1a1a; margin-bottom: 14px; }
  .header-left h1 { font-size: 20px; font-weight: 800; letter-spacing: 0.3px; color: #1a1a1a; margin-bottom: 2px; }
  .header-left .shop-addr { font-size: 10.5px; color: #444; margin-bottom: 3px; }
  .header-left .tagline { font-size: 10px; color: #666; font-style: italic; }
  .header-right { text-align: right; }
  .header-right .sheet-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; text-align: left; }
  .header-right table { margin-left: auto; border-collapse: collapse; }
  .header-right td { font-size: 10.5px; padding: 1px 0; color: #333; }
  .header-right td:first-child { padding-right: 6px; color: #666; }
  .header-right td:last-child { font-weight: 700; text-align: left; }
  .section { margin-bottom: 16px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #1a1a1a; padding-bottom: 5px; border-bottom: 1.5px solid #1a1a1a; margin-bottom: 11px; }
  .row { display: flex; gap: 0; margin-bottom: 7px; }
  .row:last-child { margin-bottom: 0; }
  .f { display: flex; flex-direction: column; flex: 1; padding-right: 14px; }
  .f:last-child { padding-right: 0; }
  .f-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 2px; }
  .f-value { font-size: 12px; font-weight: 500; color: #1a1a1a; border-bottom: 1px dashed #bbb; padding-bottom: 4px; min-height: 22px; }
  .f-full { flex: 0 0 100%; padding-right: 0; }
  .price-box { border: 1px solid #ccc; border-radius: 5px; padding: 12px 14px; background: #fafafa; }
  .price-row { display: flex; gap: 0; margin-bottom: 10px; }
  .price-row:last-child { margin-bottom: 0; }
  .pf { flex: 1; padding-right: 14px; }
  .pf:last-child { padding-right: 0; }
  .pf-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 2px; }
  .pf-value { font-size: 14px; font-weight: 800; color: #1a1a1a; border-bottom: 1px dashed #bbb; padding-bottom: 3px; }
  .remarks-row { border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; }
  .remarks-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 3px; }
  .remarks-value { font-size: 11.5px; font-weight: 400; color: #333; min-height: 16px; }
  .docs-bio-wrapper { display: flex; gap: 0; align-items: flex-start; }
  .docs-col { flex: 1.4; padding-right: 20px; }
  .bio-col { flex: 1; border-left: 1px solid #ddd; padding-left: 16px; }
  .docs-bio-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #1a1a1a; margin-bottom: 7px; }
  .docs-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .doc-chip { border: 1px solid #888; border-radius: 3px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; color: #1a1a1a; }
  .bio-chip { display: inline-block; border: 1px solid #888; border-radius: 3px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; color: #1a1a1a; }
  .none-text { font-size: 11px; color: #888; }
  .witness-grid { display: flex; gap: 20px; }
  .witness-col { flex: 1; }
  .witness-col:first-child { padding-right: 20px; border-right: 1px solid #ddd; }
  .w-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 2px; }
  .w-value { font-size: 12px; font-weight: 500; color: #1a1a1a; border-bottom: 1px dashed #bbb; padding-bottom: 4px; min-height: 22px; margin-bottom: 9px; }
  .w-cnic-sig { display: flex; gap: 14px; margin-top: 4px; }
  .w-cnic-block { flex: 1; }
  .w-sig-block { flex: 1.2; }
  .sig-line { width: 100%; border-bottom: 1px solid #888; height: 30px; display: block; }
  .sig-label-text { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-top: 3px; }
  .sec-divider { border: none; border-top: 1px solid #ddd; margin: 13px 0 15px; }
  .doc-footer { border-top: 1.5px solid #1a1a1a; margin-top: 18px; padding-top: 9px; text-align: center; font-size: 10.5px; color: #333; font-weight: 500; }
  .doc-footer .contact-label { font-weight: 700; margin-right: 4px; }
  @media print { body { font-size: 11px; } .page { padding: 14px 18px; } @page { margin: 8mm 10mm; size: A4; } }
`;

/* Print functions */

function printIndividualReceipt(rec: InventoryRecord) {
  const serialNumber = String(rec.srNo).padStart(4, "0");
  const savedTime    = rec.savedTime ?? "-";
  const formatDate   = (d: string) => {
    if (!d) return "-";
    if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(d)) return d;
    try {
      const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
      return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
    } catch { return d; }
  };
  const v = (x?: string | number) => x !== undefined && x !== null && String(x).trim() !== "" ? String(x) : "-";
  const checkedDocs = [rec.docCnic && "CNIC", rec.docFile && "File", rec.docSmartCard && "Smart Card", rec.docNumberPlates && "Number Plates"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0 ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("") : `<span class="none-text">No documents received</span>`;
  const bioHtml  = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">—</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet – New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Individual)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Seller Details</div><div class="row"><div class="f"><div class="f-label">Seller Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${v(rec.fatherName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${v(rec.cnic)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Seller Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

function printShowroomReceipt(rec: InventoryRecord) {
  const serialNumber = String(rec.srNo).padStart(4, "0");
  const savedTime    = rec.savedTime ?? "-";
  const formatDate   = (d: string) => {
    if (!d) return "-";
    if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(d)) return d;
    try {
      const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
      return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
    } catch { return d; }
  };
  const v = (x?: string | number) => x !== undefined && x !== null && String(x).trim() !== "" ? String(x) : "-";
  const checkedDocs = [rec.docCnic && "CNIC", rec.docFile && "File", rec.docSmartCard && "Smart Card", rec.docNumberPlates && "Number Plates"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0 ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("") : `<span class="none-text">No documents received</span>`;
  const bioHtml  = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">—</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet – New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Showroom)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Showroom Details</div><div class="row"><div class="f"><div class="f-label">Showroom Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

function printReceipt(rec: InventoryRecord) {
  if (rec.purchaseType === "Individual") printIndividualReceipt(rec);
  else printShowroomReceipt(rec);
}

/* View Modal (read-only) */

function ViewModal({ rec, onClose }: { rec: InventoryRecord; onClose: () => void }) {
  const isIndividual = rec.purchaseType === "Individual";

  const checkedDocs = [
    rec.docCnic && "CNIC",
    rec.docFile && "File",
    rec.docSmartCard && "Smart Card",
    rec.docNumberPlates && "Number Plates",
  ].filter(Boolean) as string[];

  return (
    <motion.div
      style={ms.overlay}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        style={ms.drawer}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >

        {/* Header */}
        <div style={ms.drawerHead}>
          <div style={ms.drawerTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            Inventory Record
            <span style={ms.drawerBadge}>SR-{String(rec.srNo).padStart(4, "0")}</span>
            <span style={{
              background: rec.purchaseType === "Individual" ? "rgba(100,130,240,.25)" : "rgba(180,100,220,.25)",
              color: "#fff",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: ".72rem",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,.2)",
            }}>
              {rec.purchaseType}
            </span>
          </div>
          <div style={ms.headActions}>
            <button style={ms.btnHeadPrint} onClick={() => printReceipt(rec)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Receipt
            </button>
            <button style={ms.btnHeadClose} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={ms.body}>
          <div style={ms.viewBody}>

            {/* Seller / Showroom */}
            <div style={ms.sectionBlock}>
              <div style={ms.sectionLabel}>{isIndividual ? "Seller Details" : "Showroom Details"}</div>
              <div style={ms.fieldGrid}>
                <div style={ms.fieldItem}><span style={ms.fLabel}>{isIndividual ? "Seller Name" : "Showroom Name"}</span><span style={ms.fValue}>{rec.sellerName || "-"}</span></div>
                {isIndividual && <div style={ms.fieldItem}><span style={ms.fLabel}>Father Name</span><span style={ms.fValue}>{rec.fatherName || "-"}</span></div>}
                <div style={ms.fieldItem}><span style={ms.fLabel}>Phone</span><span style={ms.fValue}>{rec.phoneNumber || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Date</span><span style={ms.fValue}>{rec.date || "-"}</span></div>
                {isIndividual && <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{rec.cnic || "-"}</span></div>}
                <div style={ms.fieldItemWide}><span style={ms.fLabel}>Address</span><span style={ms.fValue}>{rec.address || "-"}</span></div>
              </div>
            </div>

            {/* Vehicle */}
            <div style={ms.sectionBlock}>
              <div style={ms.sectionLabel}>Vehicle Details</div>
              <div style={ms.fieldGrid}>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Brand</span><span style={ms.fValue}>{rec.brand || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Model Year</span><span style={ms.fValue}>{rec.modelYear || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Engine CC</span><span style={ms.fValue}>{rec.engineCC || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Color</span><span style={ms.fValue}>{rec.color || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Chassis No.</span><span style={ms.fValue}>{rec.chassisNo || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Engine No.</span><span style={ms.fValue}>{rec.engineNo || "-"}</span></div>
                <div style={ms.fieldItem}><span style={ms.fLabel}>Reg. No.</span><span style={ms.fValue}>{rec.regNo || "-"}</span></div>
                <div style={ms.fieldItem}>
                  <span style={ms.fLabel}>Status</span>
                  <span style={{ marginTop: 2 }}><StatusBadge status={rec.status} /></span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={ms.sectionBlock}>
              <div style={ms.sectionLabel}>Pricing Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 20px", marginBottom: 12 }}>
                <div style={{ background: "#f5faf7", border: "1px solid #cce5d4", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#4a7a5a", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 4 }}>Purchase Price</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1a4a2a" }}>PKR {Number(rec.purchasePrice).toLocaleString()}</div>
                </div>
                <div style={{ background: "#f5f7fa", border: "1px solid #c8d4e5", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#4a5a7a", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 4 }}>Paid Amount</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2a4a" }}>PKR {Number(rec.paidAmount).toLocaleString()}</div>
                </div>
                <div style={{ background: rec.balanceAmount > 0 ? "#fdf5f0" : "#f5faf7", border: `1px solid ${rec.balanceAmount > 0 ? "#f0c8a8" : "#cce5d4"}`, borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: rec.balanceAmount > 0 ? "#8a4a1a" : "#4a7a5a", textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 4 }}>Balance</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: rec.balanceAmount > 0 ? "#c0391b" : "#1a4a2a" }}>PKR {Number(rec.balanceAmount).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                <div style={{ background: "#fafafa", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 4 }}>Expenses</div>
                  <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#2a2d35" }}>PKR {Number(rec.expenses).toLocaleString()}</div>
                </div>
                <div style={{ background: "#fafafa", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 4 }}>Sale Price</div>
                  <div style={{ fontSize: ".9rem", fontWeight: 700, color: "#2a2d35" }}>PKR {Number(rec.salePrice).toLocaleString()}</div>
                </div>
              </div>
              {rec.remarks && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#fafafa", border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                  <div style={ms.fLabel}>Remarks</div>
                  <div style={{ ...ms.fValue, marginTop: 3 }}>{rec.remarks}</div>
                </div>
              )}
            </div>

            {/* Documents & Biometric */}
            <div style={ms.sectionBlock}>
              <div style={ms.sectionLabel}>Documents & Biometric</div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1.4 }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 600, color: LABEL, marginBottom: 8 }}>Received Documents</div>
                  <div>
                    {checkedDocs.length > 0
                      ? checkedDocs.map(d => <span key={d} style={ms.docChip}>✓ {d}</span>)
                      : <span style={{ fontSize: ".82rem", color: MUTED }}>No documents received</span>}
                  </div>
                </div>
                <div style={{ flex: 1, borderLeft: `1px solid ${BORDER}`, paddingLeft: 20 }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 600, color: LABEL, marginBottom: 8 }}>Bio-Metric</div>
                  {rec.biometric
                    ? <span style={ms.bioChip}>● {rec.biometric}</span>
                    : <span style={{ fontSize: ".82rem", color: MUTED }}>—</span>}
                </div>
              </div>
            </div>

            {/* Witnesses */}
            <div style={ms.sectionBlock}>
              <div style={ms.sectionLabel}>Witnesses</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
                {[
                  { label: "First Witness",  name: rec.witness1Name, phone: rec.witness1Phone, cnic: rec.witness1Cnic },
                  { label: "Second Witness", name: rec.witness2Name, phone: rec.witness2Phone, cnic: rec.witness2Cnic },
                ].map(w => (
                  <div key={w.label} style={{ padding: "12px 16px", background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                    <div style={{ fontSize: ".68rem", fontWeight: 700, color: TEAL, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 10 }}>{w.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={ms.fieldItem}><span style={ms.fLabel}>Name</span><span style={ms.fValue}>{w.name || "-"}</span></div>
                      <div style={ms.fieldItem}><span style={ms.fLabel}>Phone</span><span style={ms.fValue}>{w.phone || "-"}</span></div>
                      <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{w.cnic || "-"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={ms.footer}>
          <button style={ms.btnClose} onClick={onClose}>Close</button>
          <button style={ms.btnPrint} onClick={() => printReceipt(rec)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* Main Page */

export default function InventoryPage() {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [filterType,     setFilterType]     = useState("");
  const [filterBrand,    setFilterBrand]    = useState("");
  const [filterYear,     setFilterYear]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterEngineCC, setFilterEngineCC] = useState("");
  const [records,       setRecords]       = useState<InventoryRecord[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [viewRec,       setViewRec]       = useState<InventoryRecord | null>(null);
  const [toast,         setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRecords = useCallback(async (
    search: string,
    type: string,
    brand: string,
    year: string,
    status: string,
    engineCC: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, type, brand, year, status, engineCC });
      const res  = await fetch(`/api/inventory?${params}`);
      if (!res.ok) { showToast(`Failed to load records (${res.status}).`, "error"); return; }
      const json = await res.json();
      if (json.success) setRecords(json.data);
      else showToast(json.message || "Failed to load records.", "error");
    } catch {
      showToast("Network error. Could not load records.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRecords("", "", "", "", "", "");
  }, [fetchRecords]);

  // Filters auto-apply when changed
  useEffect(() => {
    fetchRecords(searchQuery, filterType, filterBrand, filterYear, filterStatus, filterEngineCC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterBrand, filterYear, filterStatus, filterEngineCC]);

  const handleSearch = () => fetchRecords(searchQuery, filterType, filterBrand, filterYear, filterStatus, filterEngineCC);

  const handleReset = () => {
    setSearchQuery("");
    setFilterType("");
    setFilterBrand("");
    setFilterYear("");
    setFilterStatus("");
    setFilterEngineCC("");
    fetchRecords("", "", "", "", "", "");
  };

  const handleClearFilters = () => {
    setFilterType("");
    setFilterBrand("");
    setFilterYear("");
    setFilterStatus("");
    setFilterEngineCC("");
    fetchRecords(searchQuery, "", "", "", "", "");
  };

  const hasActiveFilters = !!(filterType || filterBrand || filterYear || filterStatus || filterEngineCC);
  const activeFilterCount = [filterType, filterBrand, filterYear, filterStatus, filterEngineCC].filter(Boolean).length;
  const canReset = !!searchQuery || hasActiveFilters;

  return (
    <div className={dmSans.className + " inv-shell"}>
      <style>{`
        .inv-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .inv-main { flex: 1; min-width: 0; }

        .inv-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid ${BORDER};
        }
        .inv-breadcrumb { font-size: .95rem; color: #16171b; font-weight: 700; }
        .inv-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57; transition: background .15s;
        }
        .inv-avatar:hover { background: #eef0f2; }

        .inv-content { padding: 32px; }

        .inv-card {
          background: #fff; border: 1px solid ${BORDER}; border-radius: 14px;
          padding: 28px 30px 30px; box-shadow: 0 4px 18px rgba(20,20,25,.05);
        }
        .inv-card-top { margin-bottom: 20px; }
        .inv-card-title { font-size: 1rem; font-weight: 700; color: #16171b; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .inv-card-subtitle { font-size: .8rem; color: ${MUTED}; margin-top: 3px; }
        .inv-filter-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 12px;
          padding: 2px 10px; font-size: .72rem; font-weight: 700; color: #2e7d32;
        }

        .inv-search-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .inv-search-input {
          flex: 1; min-width: 220px; background: #fafbfc; border: 1px solid ${BORDER};
          border-radius: 8px; padding: 10px 16px; font-size: .85rem; color: #16171b;
          outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s;
        }
        .inv-search-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); }
        .inv-btn {
          border: none; border-radius: 8px; padding: 10px 24px; font-size: .84rem;
          font-weight: 600; cursor: pointer; font-family: inherit;
          transition: transform .15s, box-shadow .15s, background .15s;
        }
        .inv-btn:hover { transform: translateY(-1px); }
        .inv-btn:active { transform: translateY(0); }
        .inv-btn-teal { background: ${TEAL}; color: #fff; }
        .inv-btn-teal:hover { background: #143a3a; box-shadow: 0 6px 16px rgba(26,74,74,.25); }
        .inv-btn-dark { background: #16171b; color: #fff; }
        .inv-btn-dark:hover { background: #000; box-shadow: 0 6px 16px rgba(0,0,0,.2); }
        .inv-btn:disabled { background: #e3e5e9; color: #a7abb3; cursor: not-allowed; box-shadow: none; transform: none; }

        .inv-filter-row {
          display: flex; gap: 10px; margin-bottom: 22px; align-items: center; flex-wrap: wrap;
          padding: 12px 16px; background: #fafbfc; border: 1px solid ${BORDER}; border-radius: 10px;
        }
        .inv-filter-label {
          font-size: .72rem; font-weight: 700; color: ${MUTED}; white-space: nowrap;
          text-transform: uppercase; letter-spacing: .5px;
        }
        .inv-select {
          appearance: none; -webkit-appearance: none; -moz-appearance: none;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238a909e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 10px center;
          background-size: 15px; border: 1px solid ${BORDER}; border-radius: 8px;
          padding: 8px 32px 8px 13px; font-size: .81rem; color: #2a2d35; outline: none;
          font-family: inherit; cursor: pointer; min-width: 130px;
          transition: border-color .15s, background-color .15s, box-shadow .15s;
        }
        .inv-select:hover { border-color: #c7cbd1; }
        .inv-select:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); }
        .inv-select-active {
          background-color: #edf7f7;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231a4a4a' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          border: 1.5px solid ${TEAL}; color: ${TEAL}; font-weight: 600;
        }
        .inv-btn-clear {
          background: none; color: ${ACCENT}; border: 1px solid ${ACCENT};
          padding: 6px 14px; border-radius: 7px; font-size: .78rem; font-weight: 600;
          cursor: pointer; margin-left: auto; font-family: inherit; transition: background .15s;
        }
        .inv-btn-clear:hover { background: rgba(224,90,43,.08); }

        .inv-table-wrapper { overflow-x: auto; border-radius: 10px; }
        .inv-table { width: 100%; min-width: 1080px; table-layout: fixed; border-collapse: collapse; font-size: .78rem; }
        .inv-table th, .inv-table td { box-sizing: border-box; }
        .inv-thead { background: #16171b; color: #fff; }
        .inv-th { padding: 10px 8px; font-weight: 600; font-size: .72rem; text-align: left; white-space: nowrap; }
        .inv-th-action { padding: 10px 8px; font-weight: 600; font-size: .72rem; text-align: left; }
        .inv-table th:nth-child(1),  .inv-table td:nth-child(1)  { width: 50px; }
        .inv-table th:nth-child(2),  .inv-table td:nth-child(2)  { width: 90px; }
        .inv-table th:nth-child(3),  .inv-table td:nth-child(3)  { width: 160px; }
        .inv-table th:nth-child(4),  .inv-table td:nth-child(4)  { width: 80px; }
        .inv-table th:nth-child(5),  .inv-table td:nth-child(5)  { width: 55px; }
        .inv-table th:nth-child(6),  .inv-table td:nth-child(6)  { width: 75px; }
        .inv-table th:nth-child(7),  .inv-table td:nth-child(7)  { width: 60px; }
        .inv-table th:nth-child(8),  .inv-table td:nth-child(8)  { width: 85px; }
        .inv-table th:nth-child(9),  .inv-table td:nth-child(9)  { width: 85px; }
        .inv-table th:nth-child(10), .inv-table td:nth-child(10) { width: 90px; }
        .inv-table th:nth-child(11), .inv-table td:nth-child(11) { width: 60px; }
        .inv-table th:nth-child(12), .inv-table td:nth-child(12) { width: 105px; }
        .inv-table th:nth-child(13), .inv-table td:nth-child(13) { width: 65px; }
        .inv-tr { transition: background .12s; }
        .inv-tr-even { background: #fff; }
        .inv-tr-odd { background: #fafbfc; }
        .inv-tr:hover { background: #f0f4f4; }
        .inv-td { padding: 9px 8px; color: #2a2d35; border-bottom: 1px solid ${BORDER}; overflow-wrap: break-word; }
        .inv-td-nowrap { white-space: nowrap; }
        .inv-td-mono { font-family: 'SFMono-Regular', Consolas, monospace; font-size: .76rem; white-space: nowrap; }
        .inv-td-action { padding: 9px 8px; text-align: right; border-bottom: 1px solid ${BORDER}; }
        .inv-action-btns { display: flex; gap: 6px; justify-content: flex-end; align-items: center; }
        .inv-icon-btn {
          background: none; border: none; cursor: pointer; color: ${TEAL};
          padding: 6px; display: flex; align-items: center; border-radius: 6px;
          transition: background .15s, transform .15s;
        }
        .inv-icon-btn:hover { background: #edf7f7; transform: scale(1.08); }
        .inv-empty-row { text-align: center; padding: 48px 0; color: ${MUTED}; font-size: .85rem; }

        .inv-badge {
          display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 5px;
          font-size: .72rem; font-weight: 700; white-space: nowrap; border: 1px solid transparent;
        }
        .inv-badge-new { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
        .inv-badge-used { background: #fff3e0; color: #e65100; border-color: #ffcc80; }
        .inv-badge-ind { background: #e8f0fe; color: #3949ab; border-color: #c5cae9; }
        .inv-badge-showroom { background: #f3e5f5; color: #7b1fa2; border-color: #e1bee7; }

        .inv-table-footer { margin-top: 16px; font-size: .8rem; color: ${MUTED}; display: flex; gap: 16px; align-items: center; }
        .inv-table-footer-filtered { color: ${TEAL}; font-weight: 600; }

        .inv-toast {
          position: fixed; bottom: 32px; right: 32px; padding: 12px 22px; border-radius: 8px;
          color: #fff; font-size: .85rem; font-weight: 600; z-index: 9999;
          box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .inv-toast-success { background: #1a7a4a; }
        .inv-toast-error { background: #c0392b; }

        @media (max-width: 900px) {
          .inv-shell { flex-direction: column; }
          .inv-content { padding: 20px; }
        }
        @media (max-width: 640px) {
          .inv-card { padding: 20px 16px 22px; }
          .inv-search-row { flex-direction: column; }
          .inv-btn { width: 100%; }
        }
      `}</style>

      <Sidebar />

      <div className="inv-main">
        <div className="inv-topbar">
          <span className="inv-breadcrumb">Inventory Management</span>
          <button className="inv-avatar" aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="inv-content">
          <AnimatePresence>
            {toast && (
              <motion.div
                className={`inv-toast ${toast.type === "success" ? "inv-toast-success" : "inv-toast-error"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewRec && <ViewModal rec={viewRec} onClose={() => setViewRec(null)} />}
          </AnimatePresence>

          <motion.div
            className="inv-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >

            <div className="inv-card-top">
              <p className="inv-card-title">
                Vehicle Inventory
                {hasActiveFilters && (
                  <span className="inv-filter-badge">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </p>
              <p className="inv-card-subtitle">All Purchased Vehicles – Individual & Showroom Records (Read-Only)</p>
            </div>

            <div className="inv-search-row">
              <input
                type="text"
                placeholder="Search through CNIC, Phone No, Chassis No, Engine No & Registration No etc"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="inv-search-input"
              />
              <button onClick={handleSearch} className="inv-btn inv-btn-teal">Search</button>
              <button onClick={handleReset} disabled={!canReset} className="inv-btn inv-btn-dark">Reset</button>
            </div>

            <div className="inv-filter-row">
              <span className="inv-filter-label">Filters:</span>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className={`inv-select ${filterType ? "inv-select-active" : ""}`}
              >
                <option value="">Type</option>
                <option value="Individual">Individual</option>
                <option value="Showroom">Showroom</option>
              </select>

              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className={`inv-select ${filterBrand ? "inv-select-active" : ""}`}
              >
                <option value="">Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className={`inv-select ${filterYear ? "inv-select-active" : ""}`}
              >
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>

              <select
                value={filterEngineCC}
                onChange={e => setFilterEngineCC(e.target.value)}
                className={`inv-select ${filterEngineCC ? "inv-select-active" : ""}`}
              >
                <option value="">Engine CC</option>
                {["70 cc","100 cc","125 cc","150 cc","200 cc","250 cc","660 cc","800 cc","1000 cc","1200 cc","1300 cc","1500 cc","1600 cc","1800 cc","2000 cc","2400 cc","2700 cc","3000 cc"].map(cc => (
                  <option key={cc} value={cc}>{cc}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={`inv-select ${filterStatus ? "inv-select-active" : ""}`}
              >
                <option value="">Status</option>
                <option value="Brand New">Brand New</option>
                <option value="Used">Used</option>
              </select>

              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="inv-btn-clear">
                  &#x00D7; Clear Filters
                </button>
              )}
            </div>

            <div className="inv-table-wrapper">
              <table className="inv-table">
                <thead className="inv-thead">
                  <tr>
                    <th className="inv-th">Sr No.</th>
                    <th className="inv-th">Type</th>
                    <th className="inv-th">Seller / Showroom</th>
                    <th className="inv-th">Brand</th>
                    <th className="inv-th">Year</th>
                    <th className="inv-th">Engine CC</th>
                    <th className="inv-th">Color</th>
                    <th className="inv-th">Chassis No.</th>
                    <th className="inv-th">Engine No.</th>
                    <th className="inv-th">Reg. No.</th>
                    <th className="inv-th">Status</th>
                    <th className="inv-th">Purchase Price</th>
                    <th className="inv-th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} className="inv-empty-row">Loading</td></tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="inv-empty-row">
                        {hasActiveFilters || searchQuery
                          ? "No records match your search or filters."
                          : "No inventory records found."}
                      </td>
                    </tr>
                  ) : (
                    records.map((rec, i) => (
                      <tr key={`${rec.purchaseType}-${rec.id}`} className={`inv-tr ${i % 2 === 0 ? "inv-tr-even" : "inv-tr-odd"}`}>
                        <td className="inv-td inv-td-nowrap">{rec.srNo}</td>
                        <td className="inv-td inv-td-nowrap"><TypeBadge type={rec.purchaseType} /></td>
                        <td className="inv-td">{rec.sellerName || "-"}</td>
                        <td className="inv-td inv-td-nowrap">{rec.brand || "-"}</td>
                        <td className="inv-td inv-td-nowrap">{rec.modelYear || "-"}</td>
                        <td className="inv-td inv-td-nowrap">{rec.engineCC || "-"}</td>
                        <td className="inv-td inv-td-nowrap">{rec.color || "-"}</td>
                        <td className="inv-td inv-td-mono">{rec.chassisNo || "-"}</td>
                        <td className="inv-td inv-td-mono">{rec.engineNo || "-"}</td>
                        <td className="inv-td inv-td-mono">{rec.regNo || "-"}</td>
                        <td className="inv-td inv-td-nowrap"><StatusBadge status={rec.status} /></td>
                        <td className="inv-td inv-td-nowrap" style={{ fontWeight: 600 }}>
                          PKR {Number(rec.purchasePrice).toLocaleString()}
                        </td>
                        <td className="inv-td-action">
                          <div className="inv-action-btns">
                            <button className="inv-icon-btn" onClick={() => printReceipt(rec)} title="Print Receipt">
                              <IconPrint />
                            </button>
                            <button className="inv-icon-btn" onClick={() => setViewRec(rec)} title="View Details">
                              <IconEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="inv-table-footer">
              <span>{records.length} Record{records.length !== 1 ? "s" : ""} In Total</span>
              {hasActiveFilters && (
                <span className="inv-table-footer-filtered">· Filtered view</span>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
