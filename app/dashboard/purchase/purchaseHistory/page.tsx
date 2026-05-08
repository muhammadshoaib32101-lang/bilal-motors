"use client";

import { useState, useEffect, CSSProperties, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type PurchaseType = "Individual Purchase" | "Showroom Purchase";

interface PurchaseRecord {
  id: number;
  srNo: number;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: string[] = ["Inventory", "Sales", "Purchase", "Registration", "Export", "Settings"];
const TABS: string[] = ["Individual Purchase", "Showroom Purchase", "Purchase History"];
const PURCHASE_TYPES: PurchaseType[] = ["Individual Purchase", "Showroom Purchase"];

const FIXED_BUYER_NAME = "New Bilal Motors";
const FIXED_BUYER_CNIC = "37406-1234567-0";
const FIXED_CONTACTS = "0300-5257278, 0333-5766432, 0313-5479941";

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);
const ENGINE_CC = ["70 cc", "100 cc", "125 cc", "150 cc", "200 cc", "250 cc", "660 cc", "800 cc", "1000 cc", "1200 cc", "1300 cc", "1500 cc", "1600 cc", "1800 cc", "2000 cc", "2400 cc", "2700 cc", "3000 cc"];
const COLORS = ["White", "Silver", "Black", "Grey", "Red", "Blue", "Beige", "Brown", "Green", "Golden", "Maroon", "Pearl White", "Champagne"];
const STATUSES = ["Brand New", "Used"];
const BOTTOM_DOCS = ["Advance bio-metric", "After sale bio-metric", "Pending bio-metric"];

// ─── Styles ───────────────────────────────────────────────────────────────────

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#d8dde6", LABEL = "#444b5a", MUTED = "#8a909e";

const s: Record<string, CSSProperties> = {
  page: { fontFamily: "'DM Sans', sans-serif", background: "#f5f6f8", minHeight: "100vh", color: "#2a2d35" },
  nav: { background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 40px", display: "flex", alignItems: "center", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,.06)" },
  brand: { fontSize: "1.2rem", fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" },
  navLinks: { display: "flex", alignItems: "stretch", height: "100%", flex: 1, gap: 4 },
  navLink: { display: "flex", alignItems: "center", padding: "0 18px", fontSize: ".875rem", fontWeight: 500, color: LABEL, background: "none", border: "none", cursor: "pointer", position: "relative", textDecoration: "none", transition: "color .18s", flexDirection: "column", justifyContent: "center" },
  navLinkActive: { color: TEAL, fontWeight: 600 },
  navUnderline: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: TEAL, borderRadius: "2px 2px 0 0" },
  navActions: { display: "flex", gap: 10, marginLeft: "auto" },
  btnLogout: { background: ACCENT, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  pageHeader: { background: TEAL, color: "#fff", padding: "14px 40px", fontSize: "1rem", fontWeight: 600 },
  tabsBar: { background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 40px", display: "flex" },
  tab: { padding: "11px 28px", fontSize: ".85rem", fontWeight: 500, color: MUTED, background: "none", border: "none", borderBottom: "2px solid transparent", cursor: "pointer" },
  tabActive: { color: "#2a2d35", fontWeight: 600, borderBottom: `2px solid ${TEAL}` },
  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, margin: "28px 40px", padding: "28px 32px 32px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" },
  cardTopRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  cardTitle: { fontSize: ".95rem", fontWeight: 700, color: "#2a2d35", marginBottom: 2 },
  cardSubtitle: { fontSize: ".78rem", color: MUTED },
  typeSelect: { background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 32px 8px 12px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", cursor: "pointer", appearance: "auto", minWidth: 180 },
  searchRow: { display: "flex", gap: 10, marginBottom: 20, alignItems: "center" },
  searchInput: { flex: 1, background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "9px 14px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit" },
  btnSearch: { background: TEAL, color: "#fff", border: "none", padding: "9px 24px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnReset: { background: "#2a2d35", color: "#fff", border: "none", padding: "9px 24px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: ".82rem" },
  thead: { background: "#3a3f4b", color: "#fff" },
  th: { padding: "11px 14px", fontWeight: 600, fontSize: ".78rem", textAlign: "left" as const, whiteSpace: "nowrap" },
  thAction: { padding: "11px 14px", fontWeight: 600, fontSize: ".78rem", textAlign: "right" as const },
  trEven: { background: "#f5f6f8" },
  trOdd: { background: "#eceef1" },
  td: { padding: "11px 14px", color: "#2a2d35", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" },
  tdAction: { padding: "11px 14px", textAlign: "right" as const, borderBottom: `1px solid ${BORDER}` },
  actionBtns: { display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" },
  btnPrint: { background: "none", border: "none", cursor: "pointer", color: TEAL, padding: 4, display: "flex", alignItems: "center" },
  btnView: { background: "none", border: "none", cursor: "pointer", color: TEAL, padding: 4, display: "flex", alignItems: "center" },
  btnDelete: { background: "none", border: "none", cursor: "pointer", color: "#e74c3c", padding: 4, display: "flex", alignItems: "center" },
  tableFooter: { marginTop: 16, fontSize: ".8rem", color: MUTED },
  emptyRow: { textAlign: "center" as const, padding: "40px 0", color: MUTED, fontSize: ".85rem" },
  toast: { position: "fixed", bottom: 32, right: 32, padding: "12px 22px", borderRadius: 8, color: "#fff", fontSize: ".85rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.18)" },
  toastSuccess: { background: "#1a7a4a" },
  toastError: { background: "#c0392b" },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

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

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Shared print CSS ─────────────────────────────────────────────────────────

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

// ─── Print functions (unchanged) ──────────────────────────────────────────────

function printIndividualReceipt(rec: PurchaseRecord) {
  const serialNumber = String(rec.srNo).padStart(4, "0");
  const savedTime = rec.savedTime ?? "—";
  const formatDate = (d: string) => {
    if (!d) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
    try {
      const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
      return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
    } catch { return d; }
  };
  const v = (x?: string | number) => x !== undefined && x !== null && String(x).trim() !== "" ? String(x) : "—";
  const checkedDocs = [rec.docCnic && "CNIC", rec.docFile && "File", rec.docSmartCard && "Smart Card", rec.docNumberPlates && "Number Plates"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0 ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("") : `<span class="none-text">No documents received</span>`;
  const bioHtml = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">—</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet – New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Individual)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Seller Details</div><div class="row"><div class="f"><div class="f-label">Seller Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${v(rec.fatherName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${v(rec.cnic)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Seller Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

function printShowroomReceipt(rec: PurchaseRecord) {
  const serialNumber = String(rec.srNo).padStart(4, "0");
  const savedTime = rec.savedTime ?? "—";
  const formatDate = (d: string) => {
    if (!d) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
    try {
      const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
      return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
    } catch { return d; }
  };
  const v = (x?: string | number) => x !== undefined && x !== null && String(x).trim() !== "" ? String(x) : "—";
  const checkedDocs = [rec.docCnic && "CNIC", rec.docFile && "File", rec.docSmartCard && "Smart Card", rec.docNumberPlates && "Number Plates"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0 ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("") : `<span class="none-text">No documents received</span>`;
  const bioHtml = rec.biometric ? `<span class="bio-chip">&#9679; ${rec.biometric}</span>` : `<span class="none-text">—</span>`;
  const w1Name = v(rec.witness1Name), w1Phone = v(rec.witness1Phone), w1Cnic = v(rec.witness1Cnic);
  const w2Name = v(rec.witness2Name), w2Phone = v(rec.witness2Phone), w2Cnic = v(rec.witness2Cnic);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Purchase Sheet – New Bilal Motors</title><style>${SHARED_PRINT_CSS}</style></head><body><div class="page"><div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Shop No. 34, Liaq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Purchase Sheet (Showroom)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td></tr></table></div></div><div class="section"><div class="section-title">Showroom Details</div><div class="row"><div class="f"><div class="f-label">Showroom Name</div><div class="f-value">${v(rec.sellerName)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phoneNumber)}</div></div></div><div class="row"><div class="f f-full"><div class="f-label">Address</div><div class="f-value">${v(rec.address)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand / Maker</div><div class="f-value">${v(rec.brand)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${v(rec.engineCC)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${v(rec.color)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div><div class="f"><div class="f-label">Registration No.</div><div class="f-value">${v(rec.regNo)}</div></div><div class="f"><div class="f-label">Status</div><div class="f-value">${v(rec.status)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Buyer Details</div><div class="row"><div class="f" style="flex:1.4"><div class="f-label">Buyer Name</div><div class="f-value">${FIXED_BUYER_NAME}</div></div><div class="f" style="flex:1"><div class="f-label">CNIC</div><div class="f-value">${FIXED_BUYER_CNIC}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Pricing Details</div><div class="price-box"><div class="price-row"><div class="pf"><div class="pf-label">Purchase Price</div><div class="pf-value">RS. ${v(rec.purchasePrice)}</div></div><div class="pf"><div class="pf-label">Paid Amount</div><div class="pf-value">RS. ${v(rec.paidAmount)}</div></div><div class="pf"><div class="pf-label">Balance Amount</div><div class="pf-value">RS. ${v(rec.balanceAmount)}</div></div></div><div class="remarks-row"><div class="remarks-label">Remarks</div><div class="remarks-value">${v(rec.remarks)}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="docs-bio-wrapper"><div class="docs-col"><div class="docs-bio-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div><div class="bio-col"><div class="docs-bio-header">Bio-Metric Status</div><div>${bioHtml}</div></div></div></div><hr class="sec-divider"/><div class="section"><div class="section-title">Witnesses Details</div><div class="witness-grid"><div class="witness-col"><div class="w-label">Name of First Witness</div><div class="w-value">${w1Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w1Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w1Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div><div class="witness-col"><div class="w-label">Name of Second Witness</div><div class="w-value">${w2Name}</div><div class="w-label">Phone No.</div><div class="w-value">${w2Phone}</div><div class="w-cnic-sig"><div class="w-cnic-block"><div class="w-label">CNIC</div><div class="w-value" style="margin-bottom:0">${w2Cnic}</div></div><div class="w-sig-block"><span class="sig-line"></span><div class="sig-label-text">Signature</div></div></div></div></div></div><div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div></div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

function printReceipt(rec: PurchaseRecord, type: PurchaseType) {
  if (type === "Individual Purchase") printIndividualReceipt(rec);
  else printShowroomReceipt(rec);
}

// ─── View / Edit Modal ────────────────────────────────────────────────────────

const ms: Record<string, CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,20,30,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" },
  drawer: { background: "#fff", width: "min(820px, 96vw)", maxHeight: "92vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  drawerHead: { background: TEAL, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  drawerTitle: { color: "#fff", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 10 },
  drawerBadge: { background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: ".75rem", fontWeight: 600 },
  drawerTypeBadge: { background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.85)", borderRadius: 6, padding: "2px 10px", fontSize: ".72rem", fontWeight: 600 },
  headActions: { display: "flex", gap: 8, alignItems: "center" },
  btnHeadEdit: { background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.35)", borderRadius: 7, padding: "6px 16px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnHeadClose: { background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 7, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  body: { overflowY: "auto", flex: 1 },
  viewBody: { padding: "24px 28px" },
  sectionBlock: { marginBottom: 22 },
  sectionLabel: { fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".8px", color: MUTED, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "12px 20px" },
  fieldItem: { display: "flex", flexDirection: "column" as const, gap: 3 },
  fieldItemWide: { display: "flex", flexDirection: "column" as const, gap: 3, gridColumn: "span 2" },
  fLabel: { fontSize: ".68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px" },
  fValue: { fontSize: ".85rem", fontWeight: 500, color: "#2a2d35" },
  docChip: { display: "inline-flex", alignItems: "center", gap: 5, background: "#f0f6f0", border: "1px solid #c3dfc3", borderRadius: 5, padding: "3px 10px", fontSize: ".75rem", fontWeight: 600, color: "#1a5c2a", marginRight: 6, marginBottom: 4 },
  bioChip: { display: "inline-flex", alignItems: "center", gap: 5, background: "#f0f4ff", border: "1px solid #c0cbf0", borderRadius: 5, padding: "3px 10px", fontSize: ".75rem", fontWeight: 600, color: "#2a3a8a" },
  editSection: { padding: "20px 28px", borderBottom: `1px solid ${BORDER}` },
  editSectionLabel: { fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".8px", color: MUTED, marginBottom: 14 },
  editGrid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px 20px" },
  editGrid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 20px" },
  editField: { display: "flex", flexDirection: "column" as const, gap: 5 },
  editLabel: { fontSize: ".72rem", fontWeight: 600, color: LABEL },
  editInput: { background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const },
  editSelect: { background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const, cursor: "pointer" },
  footer: { padding: "16px 28px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "#fafbfc" },
  btnCancel: { background: "#fff", color: LABEL, border: `1px solid ${BORDER}`, padding: "8px 24px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer" },
  btnSave: { background: TEAL, color: "#fff", border: "none", padding: "8px 28px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer" },
  btnSaving: { background: "#5a8a8a", color: "#fff", border: "none", padding: "8px 28px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "not-allowed" },
};

function ViewEditModal({
  rec,
  type,
  onClose,
  onUpdated,
  showToast,
}: {
  rec: PurchaseRecord;
  type: PurchaseType;
  onClose: () => void;
  onUpdated: (updated: PurchaseRecord) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const isIndividual = type === "Individual Purchase";
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<PurchaseRecord>({ ...rec });

  const setF = (key: keyof PurchaseRecord, val: string | number) =>
    setEdit(p => ({ ...p, [key]: val }));

  const calcBalance = () => {
    const pp = parseFloat(String(edit.purchasePrice)) || 0;
    const pa = parseFloat(String(edit.paidAmount)) || 0;
    setF("balanceAmount", pp - pa);
  };

  const handleSave = async () => {
    setSaving(true);
    const endpoint = isIndividual
      ? `/api/purchase/individual/${rec.id}`
      : `/api/purchase/showroom/${rec.id}`;
    try {
      const payload = isIndividual ? {
        seller_name: edit.sellerName,
        father_name: edit.fatherName,
        phone: edit.phoneNumber,
        date: edit.date,
        cnic: edit.cnic,
        address: edit.address,
        brand: edit.brand,
        model_year: edit.modelYear,
        engine_cc: edit.engineCC,
        color: edit.color,
        chassis_no: edit.chassisNo,
        engine_no: edit.engineNo,
        reg_no: edit.regNo,
        status: edit.status,
        purchase_price: Number(edit.purchasePrice) || 0,
        paid_amount: Number(edit.paidAmount) || 0,
        balance_amount: Number(edit.balanceAmount) || 0,
        expenses: Number(edit.expenses) || 0,
        sale_price: Number(edit.salePrice) || 0,
        remarks: edit.remarks,
        doc_cnic: edit.docCnic,
        doc_file: edit.docFile,
        doc_smart_card: edit.docSmartCard,
        doc_number_plates: edit.docNumberPlates,
        biometric: edit.biometric,
        witness1_name: edit.witness1Name,
        witness1_phone: edit.witness1Phone,
        witness1_cnic: edit.witness1Cnic,
        witness2_name: edit.witness2Name,
        witness2_phone: edit.witness2Phone,
        witness2_cnic: edit.witness2Cnic,
      } : {
        showroom_name: edit.sellerName,
        phone: edit.phoneNumber,
        address: edit.address,
        brand: edit.brand,
        model_year: edit.modelYear,
        engine_cc: edit.engineCC,
        color: edit.color,
        chassis_no: edit.chassisNo,
        engine_no: edit.engineNo,
        reg_no: edit.regNo,
        status: edit.status,
        purchase_price: Number(edit.purchasePrice) || 0,
        paid_amount: Number(edit.paidAmount) || 0,
        balance_amount: Number(edit.balanceAmount) || 0,
        expenses: Number(edit.expenses) || 0,
        sale_price: Number(edit.salePrice) || 0,
        remarks: edit.remarks,
        doc_cnic: edit.docCnic,
        doc_file: edit.docFile,
        doc_smart_card: edit.docSmartCard,
        doc_number_plates: edit.docNumberPlates,
        biometric: edit.biometric,
        witness1_name: edit.witness1Name,
        witness1_phone: edit.witness1Phone,
        witness1_cnic: edit.witness1Cnic,
        witness2_name: edit.witness2Name,
        witness2_phone: edit.witness2Phone,
        witness2_cnic: edit.witness2Cnic,
      };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Record updated successfully.", "success");
        onUpdated(edit);
        setMode("view");
      } else {
        showToast(json.message || "Update failed.", "error");
      }
    } catch {
      showToast("Network error during update.", "error");
    } finally {
      setSaving(false);
    }
  };

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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Purchase Record
            <span style={ms.drawerBadge}>SR-{String(rec.srNo).padStart(4, "0")}</span>
            <span style={ms.drawerTypeBadge}>{isIndividual ? "Individual" : "Showroom"}</span>
          </div>
          <div style={ms.headActions}>
            {mode === "view" && (
              <button style={ms.btnHeadEdit} onClick={() => setMode("edit")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Record
              </button>
            )}
            {mode === "edit" && (
              <button style={{ ...ms.btnHeadEdit, background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.2)" }} onClick={() => { setEdit({ ...rec }); setMode("view"); }}>
                ← Back to View
              </button>
            )}
            <button style={ms.btnHeadClose} onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={ms.body}>
          {mode === "view" ? (
            <div style={ms.viewBody}>

              {/* Seller / Showroom */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>{isIndividual ? "Seller Details" : "Showroom Details"}</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>{isIndividual ? "Seller Name" : "Showroom Name"}</span><span style={ms.fValue}>{rec.sellerName || "—"}</span></div>
                  {isIndividual && <div style={ms.fieldItem}><span style={ms.fLabel}>Father Name</span><span style={ms.fValue}>{rec.fatherName || "—"}</span></div>}
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Phone</span><span style={ms.fValue}>{rec.phoneNumber || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Date</span><span style={ms.fValue}>{rec.date ? rec.date.split("-").reverse().join("-") : "—"}</span></div>
                  {isIndividual && <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{rec.cnic || "—"}</span></div>}
                  <div style={ms.fieldItemWide}><span style={ms.fLabel}>Address</span><span style={ms.fValue}>{rec.address || "—"}</span></div>
                </div>
              </div>

              {/* Vehicle */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Vehicle Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Brand</span><span style={ms.fValue}>{rec.brand || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Model Year</span><span style={ms.fValue}>{rec.modelYear || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Engine CC</span><span style={ms.fValue}>{rec.engineCC || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Color</span><span style={ms.fValue}>{rec.color || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Chassis No.</span><span style={ms.fValue}>{rec.chassisNo || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Engine No.</span><span style={ms.fValue}>{rec.engineNo || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Reg. No.</span><span style={ms.fValue}>{rec.regNo || "—"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Status</span><span style={ms.fValue}>{rec.status || "—"}</span></div>
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

              {/* Docs & Biometric */}
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
                    { label: "First Witness", name: rec.witness1Name, phone: rec.witness1Phone, cnic: rec.witness1Cnic },
                    { label: "Second Witness", name: rec.witness2Name, phone: rec.witness2Phone, cnic: rec.witness2Cnic },
                  ].map(w => (
                    <div key={w.label} style={{ padding: "12px 16px", background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                      <div style={{ fontSize: ".68rem", fontWeight: 700, color: TEAL, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 10 }}>{w.label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={ms.fieldItem}><span style={ms.fLabel}>Name</span><span style={ms.fValue}>{w.name || "—"}</span></div>
                        <div style={ms.fieldItem}><span style={ms.fLabel}>Phone</span><span style={ms.fValue}>{w.phone || "—"}</span></div>
                        <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{w.cnic || "—"}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* ── EDIT MODE ── */
            <div>

              {/* Seller / Showroom */}
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>{isIndividual ? "Seller Details" : "Showroom Details"}</div>
                {isIndividual ? (
                  <>
                    <div style={ms.editGrid4}>
                      <div style={ms.editField}><label style={ms.editLabel}>Seller Name</label><input style={ms.editInput} value={edit.sellerName} onChange={e => setF("sellerName", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Father Name</label><input style={ms.editInput} value={edit.fatherName} onChange={e => setF("fatherName", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Phone</label><input style={ms.editInput} value={edit.phoneNumber} maxLength={11} onChange={e => setF("phoneNumber", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Date</label><input style={ms.editInput} type="date" value={edit.date} onChange={e => setF("date", e.target.value)} /></div>
                    </div>
                    <div style={{ ...ms.editGrid4, marginTop: 14 }}>
                      <div style={ms.editField}><label style={ms.editLabel}>CNIC</label><input style={ms.editInput} value={edit.cnic} maxLength={15} onChange={e => setF("cnic", e.target.value)} /></div>
                      <div style={{ ...ms.editField, gridColumn: "span 3" }}><label style={ms.editLabel}>Address</label><input style={ms.editInput} value={edit.address} onChange={e => setF("address", e.target.value)} /></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={ms.editGrid3}>
                      <div style={ms.editField}><label style={ms.editLabel}>Showroom Name</label><input style={ms.editInput} value={edit.sellerName} onChange={e => setF("sellerName", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Phone</label><input style={ms.editInput} value={edit.phoneNumber} maxLength={11} onChange={e => setF("phoneNumber", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Date</label><input style={ms.editInput} type="date" value={edit.date} onChange={e => setF("date", e.target.value)} /></div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <div style={ms.editField}><label style={ms.editLabel}>Address</label><input style={ms.editInput} value={edit.address} onChange={e => setF("address", e.target.value)} /></div>
                    </div>
                  </>
                )}
              </div>

              {/* Vehicle */}
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Vehicle Details</div>
                <div style={ms.editGrid4}>
                  <div style={ms.editField}><label style={ms.editLabel}>Brand</label><select style={ms.editSelect} value={edit.brand} onChange={e => setF("brand", e.target.value)}><option value="">Select</option>{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Model Year</label><select style={ms.editSelect} value={edit.modelYear} onChange={e => setF("modelYear", e.target.value)}><option value="">Select</option>{YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}</select></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Engine CC</label><select style={ms.editSelect} value={edit.engineCC} onChange={e => setF("engineCC", e.target.value)}><option value="">Select</option>{ENGINE_CC.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Color</label><select style={ms.editSelect} value={edit.color} onChange={e => setF("color", e.target.value)}><option value="">Select</option>{COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div style={{ ...ms.editGrid4, marginTop: 14 }}>
                  <div style={ms.editField}><label style={ms.editLabel}>Chassis No.</label><input style={ms.editInput} value={edit.chassisNo} onChange={e => setF("chassisNo", e.target.value)} /></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Engine No.</label><input style={ms.editInput} value={edit.engineNo} onChange={e => setF("engineNo", e.target.value)} /></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Reg. No.</label><input style={ms.editInput} value={edit.regNo} onChange={e => setF("regNo", e.target.value)} /></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Status</label><select style={ms.editSelect} value={edit.status} onChange={e => setF("status", e.target.value)}><option value="">Select</option>{STATUSES.map(s2 => <option key={s2} value={s2}>{s2}</option>)}</select></div>
                </div>
              </div>

              {/* Pricing */}
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Pricing Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto 1fr", gap: "14px", alignItems: "end", marginBottom: 14 }}>
                  <div style={ms.editField}><label style={ms.editLabel}>Purchase Price</label><input style={ms.editInput} type="number" value={edit.purchasePrice} onChange={e => setF("purchasePrice", e.target.value)} /></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Paid Amount</label><input style={ms.editInput} type="number" value={edit.paidAmount} onChange={e => setF("paidAmount", e.target.value)} /></div>
                  <button onClick={calcBalance} style={{ background: TEAL, color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", cursor: "pointer", fontSize: ".9rem", height: 38, alignSelf: "end" }}>→</button>
                  <div style={ms.editField}><label style={ms.editLabel}>Balance Amount</label><input style={{ ...ms.editInput, background: "#f0f2f5", color: MUTED }} value={edit.balanceAmount} readOnly /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: 14 }}>
                  <div style={ms.editField}><label style={ms.editLabel}>Expenses</label><input style={ms.editInput} type="number" value={edit.expenses} onChange={e => setF("expenses", e.target.value)} /></div>
                  <div style={ms.editField}><label style={ms.editLabel}>Sale Price</label><input style={ms.editInput} type="number" value={edit.salePrice} onChange={e => setF("salePrice", e.target.value)} /></div>
                </div>
                <div style={ms.editField}><label style={ms.editLabel}>Remarks</label><input style={{ ...ms.editInput, marginTop: 5 }} value={edit.remarks} onChange={e => setF("remarks", e.target.value)} placeholder="Enter remarks" /></div>
              </div>

              {/* Documents & Biometric */}
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Documents & Biometric</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "10px 32px", marginBottom: 14 }}>
                  {(["CNIC", "File", "Smart Card", "Number Plates"] as const).map((doc, idx) => {
                    const keys: (keyof PurchaseRecord)[] = ["docCnic", "docFile", "docSmartCard", "docNumberPlates"];
                    const k = keys[idx];
                    return (
                      <label key={doc} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: LABEL, cursor: "pointer" }}>
                        <input type="checkbox" checked={!!edit[k]} onChange={e => setF(k, e.target.checked ? 1 : 0)}
                          style={{ width: 15, height: 15, accentColor: TEAL, cursor: "pointer" }} />
                        {doc}
                      </label>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "10px 32px" }}>
                  {BOTTOM_DOCS.map(doc => (
                    <label key={doc} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: LABEL, cursor: "pointer" }}>
                      <input type="radio" name="edit-purchase-biometric" checked={edit.biometric === doc} onChange={() => setF("biometric", doc)}
                        style={{ width: 15, height: 15, accentColor: TEAL, cursor: "pointer" }} />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>

              {/* Witnesses */}
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Witnesses</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
                  <div>
                    <div style={{ fontSize: ".7rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 10 }}>First Witness</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={ms.editField}><label style={ms.editLabel}>Name</label><input style={ms.editInput} value={edit.witness1Name || ""} onChange={e => setF("witness1Name", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Phone</label><input style={ms.editInput} value={edit.witness1Phone || ""} maxLength={11} onChange={e => setF("witness1Phone", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>CNIC</label><input style={ms.editInput} value={edit.witness1Cnic || ""} maxLength={15} onChange={e => setF("witness1Cnic", e.target.value)} /></div>
                    </div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 28 }}>
                    <div style={{ fontSize: ".7rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px", marginBottom: 10 }}>Second Witness</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={ms.editField}><label style={ms.editLabel}>Name</label><input style={ms.editInput} value={edit.witness2Name || ""} onChange={e => setF("witness2Name", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>Phone</label><input style={ms.editInput} value={edit.witness2Phone || ""} maxLength={11} onChange={e => setF("witness2Phone", e.target.value)} /></div>
                      <div style={ms.editField}><label style={ms.editLabel}>CNIC</label><input style={ms.editInput} value={edit.witness2Cnic || ""} maxLength={15} onChange={e => setF("witness2Cnic", e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div style={ms.footer}>
          {mode === "view" ? (
            <>
              <button style={ms.btnCancel} onClick={onClose}>Close</button>
              <button style={ms.btnSave} onClick={() => setMode("edit")}>Edit Record</button>
            </>
          ) : (
            <>
              <button style={ms.btnCancel} onClick={() => { setEdit({ ...rec }); setMode("view"); }}>Cancel</button>
              <button style={saving ? ms.btnSaving : ms.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  name,
  srNo,
  onConfirm,
  onCancel,
}: {
  name: string;
  srNo: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "min(420px, 90vw)", boxShadow: "0 24px 80px rgba(0,0,0,.3)", overflow: "hidden" }}>
        <div style={{ padding: "32px 28px 20px", textAlign: "center" as const }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff0ee", border: "2px solid #fcd5cf", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2a2d35", marginBottom: 10 }}>Delete Record?</div>
          <div style={{ fontSize: ".85rem", color: "#8a909e", lineHeight: 1.6 }}>
            You are about to permanently delete the record for<br />
            <strong style={{ color: "#2a2d35" }}>{name}</strong>{" "}
            <span style={{ color: "#8a909e" }}>(SR-{String(srNo).padStart(4, "0")})</span>.<br />
            This action cannot be undone.
          </div>
        </div>
        <div style={{ padding: "8px 28px 28px", display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", background: "#fff", border: "1px solid #d8dde6", borderRadius: 8, fontSize: ".85rem", fontWeight: 600, color: "#444b5a", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", background: "#e74c3c", border: "none", borderRadius: 8, fontSize: ".85rem", fontWeight: 700, color: "#fff", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PurchaseHistory() {
  const router = useRouter();

  const NAV_ROUTES: Record<string, string> = {
    Inventory: "/dashboard/inventory",
    Sales: "/dashboard/sales/newSale",
    Purchase: "/dashboard/purchase",
    Registration: "/dashboard/registration",
    Export: "/dashboard/export",
    Settings: "/dashboard/settings",
  };
  const pathname = usePathname();
  const activeNav = NAV_ITEMS.find(item => pathname.startsWith(NAV_ROUTES[item])) ?? "";
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("Individual Purchase");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmRec, setConfirmRec] = useState<PurchaseRecord | null>(null);
  const [viewRec, setViewRec] = useState<PurchaseRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRecords = useCallback(async (type: PurchaseType, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, search });
      const res = await fetch(`/api/purchase/history?${params}`);
      if (!res.ok) { showToast(`Failed to load records (${res.status}).`, "error"); return; }
      const json = await res.json();
      if (json.success) {
        const sorted = [...json.data].sort((a: PurchaseRecord, b: PurchaseRecord) => a.srNo - b.srNo);
        setRecords(sorted);
      } else {
        showToast(json.message || "Failed to load records.", "error");
      }
    } catch {
      showToast("Network error. Could not load records.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(purchaseType, "");
    setSearchQuery("");
  }, [purchaseType, fetchRecords]);

  const handleSearch = () => fetchRecords(purchaseType, searchQuery);
  const handleReset = () => { setSearchQuery(""); fetchRecords(purchaseType, ""); };

  const executeDelete = async (rec: PurchaseRecord) => {
    const recordId = rec.id ?? rec.srNo;
    setConfirmRec(null);
    if (!recordId) { showToast("Cannot delete: record ID is missing.", "error"); return; }

    const endpoint = purchaseType === "Individual Purchase"
      ? `/api/purchase/individual/${recordId}`
      : `/api/purchase/showroom/${recordId}`;

    setDeleting(recordId);
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "same-origin",
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const errJson = await res.json();
          showToast(errJson.message || `Delete failed (${res.status}).`, "error");
        } else {
          showToast(`Delete failed with status ${res.status}.`, "error");
        }
        return;
      }
      if (contentType.includes("application/json")) {
        const json = await res.json();
        if (json.success) {
          showToast("Record deleted successfully.", "success");
          fetchRecords(purchaseType, searchQuery);
        } else {
          showToast(json.message || "Delete failed.", "error");
        }
      } else {
        showToast("Record deleted successfully.", "success");
        fetchRecords(purchaseType, searchQuery);
      }
    } catch {
      showToast("Network error during delete. Please try again.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdated = (updated: PurchaseRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    setViewRec(updated);
  };

  const handleTabClick = (tab: string) => {
    if (tab === "Individual Purchase") router.push("/dashboard/purchase");
    else if (tab === "Showroom Purchase") router.push("/dashboard/purchase/showroomPurchase");
    else if (tab === "Purchase History") router.push("/dashboard/purchase/purchaseHistory");
  };

  const handleLogout = () => router.push("/auth/login");
  const isIndividual = purchaseType === "Individual Purchase";

  return (
    <div style={s.page}>

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          {toast.msg}
        </div>
      )}

      {confirmRec && (
        <ConfirmDeleteModal
          name={confirmRec.sellerName}
          srNo={confirmRec.srNo}
          onConfirm={() => executeDelete(confirmRec)}
          onCancel={() => setConfirmRec(null)}
        />
      )}

      {viewRec && (
        <ViewEditModal
          rec={viewRec}
          type={purchaseType}
          onClose={() => setViewRec(null)}
          onUpdated={handleUpdated}
          showToast={showToast}
        />
      )}

      <nav style={s.nav}>
        <span style={s.brand}>Bilal Motors</span>
        <div style={s.navLinks}>
          {NAV_ITEMS.map((item) => (
            <button key={item} onClick={() => router.push(NAV_ROUTES[item])}
              style={{ ...s.navLink, ...(activeNav === item ? s.navLinkActive : {}) }}>
              {item}
              {activeNav === item && <span style={s.navUnderline} />}
            </button>
          ))}
        </div>
        <div style={s.navActions}>
          <button style={s.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={s.pageHeader}>Purchase Management</div>

      <div style={s.tabsBar}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => handleTabClick(tab)}
            style={{ ...s.tab, ...(tab === "Purchase History" ? s.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardTopRow}>
          <div>
            <p style={s.cardTitle}>Purchase History</p>
            <p style={s.cardSubtitle}>Detailed Purchase Records For Administrative Reference</p>
          </div>
          <select value={purchaseType}
            onChange={(e) => setPurchaseType(e.target.value as PurchaseType)}
            style={s.typeSelect}>
            {PURCHASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={s.searchRow}>
          <input type="text"
            placeholder="Search through CNIC, Phone No, Chassis No, Engine No, Registration No etc"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={s.searchInput} />
          <button onClick={handleSearch} style={s.btnSearch}>Search</button>
          <button onClick={handleReset} style={s.btnReset}>Reset</button>
        </div>

        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                <th style={s.th}>Sr No.</th>
                <th style={s.th}>{isIndividual ? "Seller Name" : "Showroom Name"}</th>
                {isIndividual && <th style={s.th}>Father Name</th>}
                <th style={s.th}>Phone Number</th>
                <th style={s.th}>Date</th>
                {isIndividual && <th style={s.th}>CNIC</th>}
                <th style={s.th}>Address</th>
                <th style={s.thAction}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isIndividual ? 8 : 6} style={s.emptyRow}>Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={isIndividual ? 8 : 6} style={s.emptyRow}>No records found.</td></tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={s.td}>{rec.srNo}</td>
                    <td style={s.td}>{rec.sellerName}</td>
                    {isIndividual && <td style={s.td}>{rec.fatherName}</td>}
                    <td style={s.td}>{rec.phoneNumber}</td>
                    <td style={s.td}>{rec.date ? rec.date.split("-").reverse().join("-") : "—"}</td>
                    {isIndividual && <td style={s.td}>{rec.cnic || "—"}</td>}
                    <td style={s.td}>{rec.address}</td>
                    <td style={s.tdAction}>
                      <div style={s.actionBtns}>
                        <button style={s.btnPrint} onClick={() => printReceipt(rec, purchaseType)} title="Print Receipt">
                          <IconPrint />
                        </button>
                        <button style={s.btnView} onClick={() => setViewRec(rec)} title="View / Edit">
                          <IconEye />
                        </button>
                        <button
                          style={{
                            ...s.btnDelete,
                            opacity: deleting === (rec.id ?? rec.srNo) ? 0.5 : 1,
                            cursor: deleting === (rec.id ?? rec.srNo) ? "not-allowed" : "pointer",
                          }}
                          onClick={() => deleting === null && setConfirmRec(rec)}
                          title="Delete"
                          disabled={deleting !== null}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={s.tableFooter}>{records.length} Record{records.length !== 1 ? "s" : ""} In Total</p>
      </div>
    </div>
  );
}