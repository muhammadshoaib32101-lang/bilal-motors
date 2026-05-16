"use client";

import { useState, useEffect, CSSProperties, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// --- Types --------------------------------------------------------------------

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

// --- Constants ----------------------------------------------------------------

const NAV_ITEMS = ["Inventory", "Sales", "Purchase", "Registration", "Settings"];

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);

const FIXED_BUYER_NAME = "New Bilal Motors";
const FIXED_BUYER_CNIC = "37406-1234567-0";
const FIXED_CONTACTS   = "0300-5257278, 0333-5766432, 0313-5479941";

// --- Styles -------------------------------------------------------------------

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#d8dde6", LABEL = "#444b5a", MUTED = "#8a909e";

const s: Record<string, CSSProperties> = {
  page:        { fontFamily: "'DM Sans', sans-serif", background: "#f5f6f8", minHeight: "100vh", color: "#2a2d35" },
  nav:         { background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 40px", display: "flex", alignItems: "center", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,.06)" },
  brand:       { fontSize: "1.2rem", fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" },
  navLinks:    { display: "flex", alignItems: "stretch", height: "100%", flex: 1, gap: 4 },
  navLink:     { display: "flex", alignItems: "center", padding: "0 18px", fontSize: ".875rem", fontWeight: 500, color: LABEL, background: "none", border: "none", cursor: "pointer", position: "relative", textDecoration: "none", transition: "color .18s", flexDirection: "column", justifyContent: "center" },
  navLinkActive: { color: TEAL, fontWeight: 600 },
  navUnderline:  { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: TEAL, borderRadius: "2px 2px 0 0" },
  navActions:  { display: "flex", gap: 10, marginLeft: "auto" },
  btnLogout:   { background: ACCENT, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  pageHeader:  { background: TEAL, color: "#fff", padding: "14px 40px", fontSize: "1rem", fontWeight: 600 },
  card:        { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, margin: "28px 40px", padding: "28px 32px 32px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" },
  cardTopRow:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  cardTitle:   { fontSize: ".95rem", fontWeight: 700, color: "#2a2d35", marginBottom: 2 },
  cardSubtitle:{ fontSize: ".78rem", color: MUTED },
  searchRow:   { display: "flex", gap: 10, marginBottom: 10, alignItems: "center" },
  filterRow:   { display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" as const, padding: "12px 14px", background: "#f9fafb", border: `1px solid ${BORDER}`, borderRadius: 8 },
  searchInput: { flex: 1, background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "9px 14px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit" },
  filterLabel: { fontSize: ".75rem", fontWeight: 700, color: MUTED, whiteSpace: "nowrap" as const, textTransform: "uppercase" as const, letterSpacing: ".5px" },
  filterSelect:       { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px", fontSize: ".81rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", cursor: "pointer", minWidth: 120 },
  filterSelectActive: { background: "#edf7f7", border: `1.5px solid ${TEAL}`, borderRadius: 6, padding: "7px 10px", fontSize: ".81rem", color: TEAL, outline: "none", fontFamily: "inherit", cursor: "pointer", minWidth: 120, fontWeight: 600 },
  btnClearFilters: { background: "none", color: ACCENT, border: `1px solid ${ACCENT}`, padding: "6px 12px", borderRadius: 6, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  activeFilterBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: "2px 10px", fontSize: ".72rem", fontWeight: 700, color: "#2e7d32" },
  btnSearch:   { background: TEAL, color: "#fff", border: "none", padding: "9px 24px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnReset:    { background: "#2a2d35", color: "#fff", border: "none", padding: "9px 24px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  tableWrapper:{ overflowX: "auto" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: ".82rem" },
  thead:       { background: "#3a3f4b", color: "#fff" },
  th:          { padding: "11px 14px", fontWeight: 600, fontSize: ".78rem", textAlign: "left" as const, whiteSpace: "nowrap" },
  thAction:    { padding: "11px 14px", fontWeight: 600, fontSize: ".78rem", textAlign: "right" as const },
  trEven:      { background: "#f5f6f8" },
  trOdd:       { background: "#eceef1" },
  td:          { padding: "11px 14px", color: "#2a2d35", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" },
  tdAction:    { padding: "11px 14px", textAlign: "right" as const, borderBottom: `1px solid ${BORDER}` },
  actionBtns:  { display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" },
  btnPrint:    { background: "none", border: "none", cursor: "pointer", color: TEAL, padding: 4, display: "flex", alignItems: "center" },
  btnView:     { background: "none", border: "none", cursor: "pointer", color: TEAL, padding: 4, display: "flex", alignItems: "center" },
  tableFooter: { marginTop: 16, fontSize: ".8rem", color: MUTED, display: "flex", gap: 16, alignItems: "center" },
  emptyRow:    { textAlign: "center" as const, padding: "40px 0", color: MUTED, fontSize: ".85rem" },
  toast:       { position: "fixed", bottom: 32, right: 32, padding: "12px 22px", borderRadius: 8, color: "#fff", fontSize: ".85rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.18)" },
  toastSuccess:{ background: "#1a7a4a" },
  toastError:  { background: "#c0392b" },
};

// --- SVG Icons ----------------------------------------------------------------

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

// --- Inline Badge Components --------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const isNew = status === "Brand New";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px", borderRadius: 4, fontSize: ".72rem", fontWeight: 700,
      background: isNew ? "#e8f5e9" : "#fff3e0",
      color:      isNew ? "#2e7d32" : "#e65100",
      border:     `1px solid ${isNew ? "#a5d6a7" : "#ffcc80"}`,
      whiteSpace: "nowrap",
    }}>
      {status || "-"}
    </span>
  );
}

function TypeBadge({ type }: { type: "Individual" | "Showroom" }) {
  const isInd = type === "Individual";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px", borderRadius: 4, fontSize: ".72rem", fontWeight: 700,
      background: isInd ? "#e8f0fe" : "#f3e5f5",
      color:      isInd ? "#3949ab" : "#7b1fa2",
      border:     `1px solid ${isInd ? "#c5cae9" : "#e1bee7"}`,
      whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

// --- Shared Print CSS ---------------------------------------------------------

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
  .bio-col  { flex: 1; border-left: 1px solid #ddd; padding-left: 16px; }
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
  .w-sig-block  { flex: 1.2; }
  .sig-line { width: 100%; border-bottom: 1px solid #888; height: 30px; display: block; }
  .sig-label-text { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-top: 3px; }
  .sec-divider { border: none; border-top: 1px solid #ddd; margin: 13px 0 15px; }
  .doc-footer { border-top: 1.5px solid #1a1a1a; margin-top: 18px; padding-top: 9px; text-align: center; font-size: 10.5px; color: #333; font-weight: 500; }
  .doc-footer .contact-label { font-weight: 700; margin-right: 4px; }
  @media print { body { font-size: 11px; } .page { padding: 14px 18px; } @page { margin: 8mm 10mm; size: A4; } }
`;

// --- Print functions ----------------------------------------------------------

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
  const bioHtml  = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">-</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet â€“ New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Individual)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Seller Details</div><div class="row"><div class="f"><div class="f-label">Seller Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${v(rec.fatherName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${v(rec.cnic)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Seller Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

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
  const bioHtml  = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">-</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet â€“ New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Showroom)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Showroom Details</div><div class="row"><div class="f"><div class="f-label">Showroom Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

function printReceipt(rec: InventoryRecord) {
  if (rec.purchaseType === "Individual") printIndividualReceipt(rec);
  else printShowroomReceipt(rec);
}

// --- View Modal (read-only) ---------------------------------------------------

const ms: Record<string, CSSProperties> = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(10,20,30,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" },
  drawer:       { background: "#fff", width: "min(860px, 96vw)", maxHeight: "92vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  drawerHead:   { background: TEAL, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
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
  btnPrint:     { background: TEAL, color: "#fff", border: "none", padding: "8px 24px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 },
};

function ViewModal({ rec, onClose }: { rec: InventoryRecord; onClose: () => void }) {
  const isIndividual = rec.purchaseType === "Individual";

  const checkedDocs = [
    rec.docCnic && "CNIC",
    rec.docFile && "File",
    rec.docSmartCard && "Smart Card",
    rec.docNumberPlates && "Number Plates",
  ].filter(Boolean) as string[];

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.drawer} onClick={e => e.stopPropagation()}>

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
                      ? checkedDocs.map(d => <span key={d} style={ms.docChip}>{d}</span>)
                      : <span style={{ fontSize: ".82rem", color: MUTED }}>No documents received</span>}
                  </div>
                </div>
                <div style={{ flex: 1, borderLeft: `1px solid ${BORDER}`, paddingLeft: 20 }}>
                  <div style={{ fontSize: ".72rem", fontWeight: 600, color: LABEL, marginBottom: 8 }}>Bio-Metric</div>
                  {rec.biometric
                    ? <span style={ms.bioChip}>â— {rec.biometric}</span>
                    : <span style={{ fontSize: ".82rem", color: MUTED }}>-</span>}
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
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function InventoryPage() {
  const router   = useRouter();
  const pathname = usePathname();

  const NAV_ROUTES: Record<string, string> = {
    Inventory:    "/dashboard/inventory",
    Sales:        "/dashboard/sales/newSale",
    Purchase:     "/dashboard/purchase",
    Registration: "/dashboard/registration",
    Export:       "/dashboard/export",
    Settings:     "/dashboard/settings",
  };

  const activeNav = NAV_ITEMS.find(item => pathname.startsWith(NAV_ROUTES[item])) ?? "";

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

  const handleLogout = () => router.push("/auth/login");

  const hasActiveFilters = !!(filterType || filterBrand || filterYear || filterStatus || filterEngineCC);
  const activeFilterCount = [filterType, filterBrand, filterYear, filterStatus, filterEngineCC].filter(Boolean).length;

  const getFilterStyle = (val: string) => val ? s.filterSelectActive : s.filterSelect;

  return (
    <div style={s.page}>

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          {toast.msg}
        </div>
      )}

      {viewRec && (
        <ViewModal rec={viewRec} onClose={() => setViewRec(null)} />
      )}

      {/* Navbar */}
      <nav style={s.nav}>
        <span style={s.brand}>Bilal Motors</span>
        <div style={s.navLinks}>
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => router.push(NAV_ROUTES[item])}
              style={{ ...s.navLink, ...(activeNav === item ? s.navLinkActive : {}) }}
            >
              {item}
              {activeNav === item && <span style={s.navUnderline} />}
            </button>
          ))}
        </div>
        <div style={s.navActions}>
          <button style={s.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Page header */}
      <div style={s.pageHeader}>Inventory Management</div>

      {/* Main card */}
      <div style={s.card}>

        {/* Card title row */}
        <div style={s.cardTopRow}>
          <div>
            <p style={s.cardTitle}>
              Vehicle Inventory
              {hasActiveFilters && (
                <span style={{ ...s.activeFilterBadge, marginLeft: 10 }}>
                  {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                </span>
              )}
            </p>
            <p style={s.cardSubtitle}>All Purchased Vehicles - Individual & Showroom Records (Read-Only)</p>
          </div>
        </div>

        {/* Search row */}
        <div style={s.searchRow}>
          <input
            type="text"
            placeholder="Search by Chassis No, Engine No, Reg. No, Seller Name, Phone, Brand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={s.searchInput}
          />
          <button onClick={handleSearch} style={s.btnSearch}>Search</button>
          <button onClick={handleReset}  style={s.btnReset}>Reset</button>
        </div>

        {/* Filter row */}
        <div style={s.filterRow}>
          <span style={s.filterLabel}>Filters:</span>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={getFilterStyle(filterType)}
          >
            <option value="">Type</option>
            <option value="Individual">Individual</option>
            <option value="Showroom">Showroom</option>
          </select>

          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            style={getFilterStyle(filterBrand)}
          >
            <option value="">Brand</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            style={getFilterStyle(filterYear)}
          >
            <option value="">Year</option>
            {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>

          <select
            value={filterEngineCC}
            onChange={e => setFilterEngineCC(e.target.value)}
            style={getFilterStyle(filterEngineCC)}
          >
            <option value="">Engine CC</option>
            {["70 cc","100 cc","125 cc","150 cc","200 cc","250 cc","660 cc","800 cc","1000 cc","1200 cc","1300 cc","1500 cc","1600 cc","1800 cc","2000 cc","2400 cc","2700 cc","3000 cc"].map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={getFilterStyle(filterStatus)}
          >
            <option value="">Status</option>
            <option value="Brand New">Brand New</option>
            <option value="Used">Used</option>
          </select>

          {hasActiveFilters && (
            <button onClick={handleClearFilters} style={s.btnClearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                <th style={s.th}>Sr No.</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Seller / Showroom</th>
                <th style={s.th}>Brand</th>
                <th style={s.th}>Year</th>
                <th style={s.th}>Engine CC</th>
                <th style={s.th}>Color</th>
                <th style={s.th}>Chassis No.</th>
                <th style={s.th}>Engine No.</th>
                <th style={s.th}>Reg. No.</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Purchase Price</th>
                <th style={s.thAction}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} style={s.emptyRow}>Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={13} style={s.emptyRow}>
                    {hasActiveFilters || searchQuery
                      ? "No records match your search or filters."
                      : "No inventory records found."}
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={`${rec.purchaseType}-${rec.id}`} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={s.td}>{rec.srNo}</td>
                    <td style={s.td}><TypeBadge type={rec.purchaseType} /></td>
                    <td style={s.td}>{rec.sellerName || "-"}</td>
                    <td style={s.td}>{rec.brand || "-"}</td>
                    <td style={s.td}>{rec.modelYear || "-"}</td>
                    <td style={s.td}>{rec.engineCC || "-"}</td>
                    <td style={s.td}>{rec.color || "-"}</td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: ".8rem" }}>{rec.chassisNo || "-"}</td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: ".8rem" }}>{rec.engineNo || "-"}</td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: ".8rem" }}>{rec.regNo || "-"}</td>
                    <td style={s.td}><StatusBadge status={rec.status} /></td>
                    <td style={{ ...s.td, fontWeight: 600 }}>
                      PKR {Number(rec.purchasePrice).toLocaleString()}
                    </td>
                    <td style={s.tdAction}>
                      <div style={s.actionBtns}>
                        <button style={s.btnPrint} onClick={() => printReceipt(rec)} title="Print Receipt">
                          <IconPrint />
                        </button>
                        <button style={s.btnView} onClick={() => setViewRec(rec)} title="View Details">
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

        {/* Footer */}
        <div style={s.tableFooter}>
          <span>{records.length} Record{records.length !== 1 ? "s" : ""} In Total</span>
          {hasActiveFilters && (
            <span style={{ color: TEAL, fontWeight: 600 }}>
              Â· Filtered view
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

