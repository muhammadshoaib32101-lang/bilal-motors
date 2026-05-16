"use client";

import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type RegType = "New Registration" | "Transfer";

interface RegRecord {
  id: number;
  srNo: number;
  name: string;
  fatherName: string;
  cnic?: string;
  phone?: string;
  maker: string;
  modelYear: string;
  regNoNew: string;
  regNoOld?: string;
  chassisNo: string;
  engineNo: string;
  docRegCard: number;
  docNoPlates: number;
  docFile: number;
  amount?: string | number;
  remarks?: string;
  date: string;
  savedTime?: string;
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV_ITEMS = ["Inventory", "Sales", "Purchase", "Registration", "Settings"];
const TABS = ["New Registration", "Transfer", "History"];
const REG_TYPES: RegType[] = ["New Registration", "Transfer"];

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);
const FIXED_CONTACTS = "0300-5257278, 0333-5766432, 0313-5479941";

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ SVG Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Print Receipt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PRINT_CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;font-size:11.5px;line-height:1.4}
  .page{padding:22px 30px 18px;max-width:780px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:10px;border-bottom:2.5px solid #1a1a1a;margin-bottom:14px}
  .header-left h1{font-size:20px;font-weight:800;letter-spacing:0.3px;margin-bottom:2px}
  .header-left .shop-addr{font-size:10.5px;color:#444;margin-bottom:3px}
  .header-left .tagline{font-size:10px;color:#666;font-style:italic}
  .header-right .sheet-title{font-size:13px;font-weight:700;margin-bottom:6px}
  .header-right table{margin-left:auto;border-collapse:collapse}
  .header-right td{font-size:10.5px;padding:1px 0;color:#333}
  .header-right td:first-child{padding-right:6px;color:#666}
  .header-right td:last-child{font-weight:700}
  .section{margin-bottom:16px}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;padding-bottom:5px;border-bottom:1.5px solid #1a1a1a;margin-bottom:11px}
  .row{display:flex;gap:0;margin-bottom:7px}
  .row:last-child{margin-bottom:0}
  .f{display:flex;flex-direction:column;flex:1;padding-right:14px}
  .f:last-child{padding-right:0}
  .f-label{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#777;margin-bottom:2px}
  .f-value{font-size:12px;font-weight:500;border-bottom:1px dashed #bbb;padding-bottom:4px;min-height:22px}
  .docs-header{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:7px}
  .docs-chips{display:flex;flex-wrap:wrap;gap:5px}
  .doc-chip{border:1px solid #888;border-radius:3px;padding:2px 9px;font-size:10.5px;font-weight:600}
  .none-text{font-size:11px;color:#888}
  .sec-divider{border:none;border-top:1px solid #ddd;margin:13px 0 15px}
  .doc-footer{border-top:1.5px solid #1a1a1a;margin-top:18px;padding-top:9px;text-align:center;font-size:10.5px;font-weight:500}
  .doc-footer .contact-label{font-weight:700;margin-right:4px}
  @media print{body{font-size:11px}.page{padding:14px 18px}@page{margin:8mm 10mm;size:A4}}
`;

function printRecord(rec: RegRecord, type: RegType) {
  const isTransfer = type === "Transfer";
  const v = (x?: string | number | null) => (x !== undefined && x !== null && String(x).trim() !== "") ? String(x) : "â€”";
  const checkedDocs = [rec.docRegCard && "Registration Card", rec.docNoPlates && "Number Plates", rec.docFile && "File"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const regNoRow = isTransfer
    ? `<div class="row"><div class="f"><div class="f-label">Registration No. (Old)</div><div class="f-value">${v(rec.regNoOld)}</div></div><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${v(rec.regNoNew)}</div></div></div>`
    : `<div class="row"><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${v(rec.regNoNew)}</div></div></div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Registration Sheet â€“ New Bilal Motors</title><style>${PRINT_CSS}</style></head><body><div class="page">
<div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Registration Sheet (${isTransfer ? "Transfer" : "New"})</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;">Serial No.:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">SR-${String(rec.srNo).padStart(4, "0")}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${v(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${v(rec.savedTime)}</td></tr></table></div></div>
<div class="section"><div class="section-title">Owner Details</div><div class="row"><div class="f"><div class="f-label">Name</div><div class="f-value">${v(rec.name)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${v(rec.fatherName)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${v(rec.cnic)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phone)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Maker</div><div class="f-value">${v(rec.maker)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div></div>${regNoRow}<div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Payment Details</div><div class="row"><div class="f"><div class="f-label">Amount</div><div class="f-value price-box">${v(rec.amount)}</div></div><div class="f" style="flex:2"><div class="f-label">Remarks</div><div class="f-value">${v(rec.remarks)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="docs-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div>
<div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div>
</div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=900");
  if (win) { win.document.write(html); win.document.close(); }
}

// â”€â”€â”€ Modal Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ms: Record<string, CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,20,30,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" },
  drawer: { background: "#fff", width: "min(760px, 96vw)", maxHeight: "92vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  drawerHead: { background: TEAL, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  drawerTitle: { color: "#fff", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 10 },
  drawerBadge: { background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: ".75rem", fontWeight: 600 },
  headActions: { display: "flex", gap: 8, alignItems: "center" },
  btnHeadEdit: { background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.35)", borderRadius: 7, padding: "6px 16px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnHeadClose: { background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 7, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  body: { overflowY: "auto", flex: 1 },
  viewBody: { padding: "24px 28px" },
  sectionBlock: { marginBottom: 22 },
  sectionLabel: { fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".8px", color: MUTED, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 20px" },
  fieldItem: { display: "flex", flexDirection: "column" as const, gap: 3 },
  fLabel: { fontSize: ".68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase" as const, letterSpacing: ".5px" },
  fValue: { fontSize: ".85rem", fontWeight: 500, color: "#2a2d35" },
  docChip: { display: "inline-flex", alignItems: "center", gap: 5, background: "#f0f6f0", border: "1px solid #c3dfc3", borderRadius: 5, padding: "3px 10px", fontSize: ".75rem", fontWeight: 600, color: "#1a5c2a", marginRight: 6, marginBottom: 4 },
  editSection: { padding: "20px 28px", borderBottom: `1px solid ${BORDER}` },
  editSectionLabel: { fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".8px", color: MUTED, marginBottom: 14 },
  editGrid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px 20px" },
  editGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" },
  editField: { display: "flex", flexDirection: "column" as const, gap: 5 },
  editLabel: { fontSize: ".72rem", fontWeight: 600, color: LABEL },
  editInput: { background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const },
  editSelect: { background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: ".83rem", color: "#2a2d35", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const, cursor: "pointer" },
  editCheck: { display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: LABEL, cursor: "pointer", userSelect: "none" },
  footer: { padding: "16px 28px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "#fafbfc" },
  btnCancel: { background: "#fff", color: LABEL, border: `1px solid ${BORDER}`, padding: "8px 24px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer" },
  btnSave: { background: TEAL, color: "#fff", border: "none", padding: "8px 28px", borderRadius: 7, fontSize: ".84rem", fontWeight: 600, cursor: "pointer" },
};

// â”€â”€â”€ ViewEditModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ViewEditModal({
  rec, type, onClose, onUpdated, showToast,
}: {
  rec: RegRecord; type: RegType;
  onClose: () => void;
  onUpdated: (updated: RegRecord) => void;
  showToast: (msg: string, t: "success" | "error") => void;
}) {
  const isTransfer = type === "Transfer";
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<RegRecord>({ ...rec });

  const setF = (key: keyof RegRecord, val: string | number) =>
    setEdit(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const endpoint = isTransfer
      ? `/api/registration/transfer/${rec.id}`
      : `/api/registration/new/${rec.id}`;
    try {
      const payload = {
        name: edit.name,
        father_name: edit.fatherName,
        cnic: edit.cnic || null,
        phone: edit.phone || null,
        maker: edit.maker,
        model_year: edit.modelYear,
        reg_no_new: edit.regNoNew || null,
        ...(isTransfer ? { reg_no_old: edit.regNoOld || null } : {}),
        chassis_no: edit.chassisNo,
        engine_no: edit.engineNo,
        doc_reg_card: edit.docRegCard,
        doc_no_plates: edit.docNoPlates,
        doc_file: edit.docFile,
        amount: edit.amount || null,
        remarks: edit.remarks || null,
        date: edit.date,
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
    rec.docRegCard && "Registration Card",
    rec.docNoPlates && "Number Plates",
    rec.docFile && "File",
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
            Registration Record
            <span style={ms.drawerBadge}>#{rec.srNo}</span>
            <span style={{ ...ms.drawerBadge, background: "rgba(255,255,255,.12)", fontSize: ".72rem" }}>
              {isTransfer ? "Transfer" : "New"}
            </span>
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
              <button style={{ ...ms.btnHeadEdit, background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.2)" }}
                onClick={() => { setEdit({ ...rec }); setMode("view"); }}>
                â† Back to View
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
              {/* Owner */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Owner Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Name</span><span style={ms.fValue}>{rec.name || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Father Name</span><span style={ms.fValue}>{rec.fatherName || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{rec.cnic || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Phone No.</span><span style={ms.fValue}>{rec.phone || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Date</span><span style={ms.fValue}>{rec.date ? rec.date.split("-").reverse().join("-") : "â€”"}</span></div>
                  {rec.savedTime && <div style={ms.fieldItem}><span style={ms.fLabel}>Saved Time</span><span style={ms.fValue}>{rec.savedTime}</span></div>}
                </div>
              </div>
              {/* Vehicle */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Vehicle Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Maker</span><span style={ms.fValue}>{rec.maker || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Model Year</span><span style={ms.fValue}>{rec.modelYear || "â€”"}</span></div>
                  {isTransfer && <div style={ms.fieldItem}><span style={ms.fLabel}>Registration No. (Old)</span><span style={ms.fValue}>{rec.regNoOld || "â€”"}</span></div>}
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Registration No. (New)</span><span style={ms.fValue}>{rec.regNoNew || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Chassis No.</span><span style={ms.fValue}>{rec.chassisNo || "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Engine No.</span><span style={ms.fValue}>{rec.engineNo || "â€”"}</span></div>
                </div>
              </div>
              {/* Payment */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Payment Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Amount</span><span style={ms.fValue}>{rec.amount ? `Rs. ${Number(rec.amount).toLocaleString()}` : "â€”"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Remarks</span><span style={ms.fValue}>{rec.remarks || "â€”"}</span></div>
                </div>
              </div>
              {/* Documents */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Documents</div>
                <div>
                  {checkedDocs.length > 0
                    ? checkedDocs.map(d => <span key={d} style={ms.docChip}>âœ“ {d}</span>)
                    : <span style={{ fontSize: ".82rem", color: MUTED }}>No documents received</span>}
                </div>
              </div>
            </div>
          ) : (
            /* Edit mode */
            <>
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Owner Details</div>
                <div style={ms.editGrid4}>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Name</label>
                    <input style={ms.editInput} value={edit.name} onChange={e => setF("name", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Father Name</label>
                    <input style={ms.editInput} value={edit.fatherName} onChange={e => setF("fatherName", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>CNIC</label>
                    <input style={ms.editInput} value={edit.cnic || ""} onChange={e => setF("cnic", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Phone No.</label>
                    <input style={ms.editInput} value={edit.phone || ""} onChange={e => setF("phone", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Date</label>
                    <input type="date" style={ms.editInput} value={edit.date?.includes("-") && !edit.date?.includes("/") ? edit.date : ""} onChange={e => setF("date", e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Vehicle Details</div>
                <div style={ms.editGrid4}>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Maker</label>
                    <select style={ms.editSelect} value={edit.maker} onChange={e => setF("maker", e.target.value)}>
                      <option value="">Select maker</option>
                      {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Model Year</label>
                    <select style={ms.editSelect} value={edit.modelYear} onChange={e => setF("modelYear", e.target.value)}>
                      <option value="">Select year</option>
                      {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </div>
                  {isTransfer && (
                    <div style={ms.editField}>
                      <label style={ms.editLabel}>Registration No. (Old)</label>
                      <input style={ms.editInput} value={edit.regNoOld || ""} onChange={e => setF("regNoOld", e.target.value)} />
                    </div>
                  )}
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Registration No. (New)</label>
                    <input style={ms.editInput} value={edit.regNoNew || ""} onChange={e => setF("regNoNew", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Chassis No.</label>
                    <input style={ms.editInput} value={edit.chassisNo} onChange={e => setF("chassisNo", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Engine No.</label>
                    <input style={ms.editInput} value={edit.engineNo} onChange={e => setF("engineNo", e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={ms.editSection}>
                <div style={ms.editSectionLabel}>Payment Details</div>
                <div style={ms.editGrid2}>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Amount</label>
                    <input type="number" style={ms.editInput} value={edit.amount !== undefined ? String(edit.amount) : ""} onChange={e => setF("amount", e.target.value)} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Remarks</label>
                    <input style={ms.editInput} value={edit.remarks || ""} onChange={e => setF("remarks", e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ ...ms.editSection, borderBottom: "none" }}>
                <div style={ms.editSectionLabel}>Documents</div>
                <div style={{ display: "flex", gap: "10px 36px", flexWrap: "wrap" }}>
                  {(["Registration Card", "Number Plates", "File"] as const).map(doc => {
                    const key = doc === "Registration Card" ? "docRegCard" : doc === "Number Plates" ? "docNoPlates" : "docFile";
                    return (
                      <label key={doc} style={ms.editCheck}>
                        <input type="checkbox" checked={!!edit[key as keyof RegRecord]}
                          onChange={e => setF(key as keyof RegRecord, e.target.checked ? 1 : 0)}
                          style={{ width: 15, height: 15, accentColor: TEAL, cursor: "pointer" }} />
                        {doc}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
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
              <button style={saving ? { ...ms.btnSave, background: "#5a8a8a", cursor: "not-allowed" } : ms.btnSave}
                onClick={handleSave} disabled={saving}>
                {saving ? "Savingâ€¦" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Delete Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ConfirmDeleteModal({
  rec, type, onClose, onDeleted, showToast,
}: {
  rec: RegRecord; type: RegType;
  onClose: () => void;
  onDeleted: (id: number) => void;
  showToast: (msg: string, t: "success" | "error") => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const endpoint = type === "Transfer"
      ? `/api/registration/transfer/${rec.id}`
      : `/api/registration/new/${rec.id}`;
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Record deleted successfully.", "success");
        onDeleted(rec.id);
        onClose();
      } else {
        showToast(json.message || "Delete failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: "min(420px, 90vw)", boxShadow: "0 24px 80px rgba(0,0,0,.3)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
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
            <strong style={{ color: "#2a2d35" }}>{rec.name}</strong>{" "}
            <span style={{ color: "#8a909e" }}>(#{rec.srNo})</span>.<br />
            This action cannot be undone.
          </div>
        </div>
        <div style={{ padding: "8px 28px 28px", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", background: "#fff", border: "1px solid #d8dde6", borderRadius: 8, fontSize: ".85rem", fontWeight: 600, color: "#444b5a", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "10px 0", background: "#e74c3c", border: "none", borderRadius: 8, fontSize: ".85rem", fontWeight: 700, color: "#fff", cursor: deleting ? "not-allowed" : "pointer" }}>
            {deleting ? "Deletingâ€¦" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function RegistrationHistory() {
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ROUTES: Record<string, string> = {
    Inventory: "/dashboard/inventory",
    Sales: "/dashboard/sales/newSale",
    Purchase: "/dashboard/purchase",
    Registration: "/dashboard/registration",
    Export: "/dashboard/export",
    Settings: "/dashboard/settings",
  };
  const activeNav = NAV_ITEMS.find(item => pathname.startsWith(NAV_ROUTES[item])) ?? "";

  const [regType, setRegType] = useState<RegType>("New Registration");
  const [records, setRecords] = useState<RegRecord[]>([]);
  const [search, setSearch] = useState("");
  const [inputSearch, setInputSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewRec, setViewRec] = useState<RegRecord | null>(null);
  const [deleteRec, setDeleteRec] = useState<RegRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRecords = useCallback(async (type: RegType, searchVal: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, search: searchVal });
      const res = await fetch(`/api/registration/history?${params}`);
      const json = await res.json();
      if (json.success) setRecords(json.data);
    } catch {
      showToast("Failed to load records.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(regType, search); }, [regType, search, fetchRecords]);

  const handleTypeChange = (type: RegType) => {
    setRegType(type);
    setSearch("");
    setInputSearch("");
  };

  const handleSearch = () => setSearch(inputSearch);
  const handleReset = () => { setSearch(""); setInputSearch(""); };

  const handleTabClick = (tab: string) => {
    if (tab === "New Registration") router.push("/dashboard/registration");
    else if (tab === "Transfer") router.push("/dashboard/registration/transfer");
  };

  const isTransfer = regType === "Transfer";

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <span style={s.brand}>New Bilal Motors</span>
        <div style={s.navLinks}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item;
            return (
              <button key={item} onClick={() => router.push(NAV_ROUTES[item])}
                style={{ ...s.navLink, ...(isActive ? s.navLinkActive : {}) }}>
                {item}
                {isActive && <span style={s.navUnderline} />}
              </button>
            );
          })}
        </div>
        <div style={s.navActions}>
          <button style={s.btnLogout} onClick={() => router.push("/auth/login")}>Logout</button>
        </div>
      </nav>

      {/* Page header */}
      <div style={s.pageHeader}>Registration Management</div>

      {/* Tabs */}
      <div style={s.tabsBar}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => tab !== "History" && handleTabClick(tab)}
            style={{ ...s.tab, ...(tab === "History" ? s.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={s.card}>
        <div style={s.cardTopRow}>
          <div>
            <div style={s.cardTitle}>Registration History</div>
            <div style={s.cardSubtitle}>{records.length} record{records.length !== 1 ? "s" : ""} found</div>
          </div>
          <select style={s.typeSelect} value={regType} onChange={e => handleTypeChange(e.target.value as RegType)}>
            {REG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={s.searchRow}>
          <input
            style={s.searchInput}
            placeholder="Search by name, maker, chassis no., engine no., reg. noâ€¦"
            value={inputSearch}
            onChange={e => setInputSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button style={s.btnSearch} onClick={handleSearch}>Search</button>
          <button style={s.btnReset} onClick={handleReset}>Reset</button>
        </div>

        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                <th style={s.th}>Sr No.</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Father Name</th>
                <th style={s.th}>Maker</th>
                <th style={s.th}>Year</th>
                {isTransfer && <th style={s.th}>Reg No. (Old)</th>}
                <th style={s.th}>Registration No. (New)</th>
                <th style={s.th}>Chassis No.</th>
                <th style={s.th}>Engine No.</th>
                <th style={s.th}>Documents</th>
                <th style={s.th}>Date</th>
                <th style={s.thAction}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isTransfer ? 12 : 11} style={s.emptyRow}>Loadingâ€¦</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={isTransfer ? 12 : 11} style={s.emptyRow}>No records found.</td></tr>
              ) : records.map((rec, idx) => {
                const docList = [rec.docRegCard && "Registration Card", rec.docNoPlates && "Number Plates", rec.docFile && "File"].filter(Boolean).join(", ");
                return (
                  <tr key={rec.id} style={idx % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={s.td}>{rec.srNo}</td>
                    <td style={s.td}>{rec.name}</td>
                    <td style={s.td}>{rec.fatherName}</td>
                    <td style={s.td}>{rec.maker}</td>
                    <td style={s.td}>{rec.modelYear}</td>
                    {isTransfer && <td style={s.td}>{rec.regNoOld || "â€”"}</td>}
                    <td style={s.td}>{rec.regNoNew || "â€”"}</td>
                    <td style={s.td}>{rec.chassisNo}</td>
                    <td style={s.td}>{rec.engineNo}</td>
                    <td style={s.td}>{docList || "â€”"}</td>
                    <td style={s.td}>{rec.date ? rec.date.split("-").reverse().join("-") : "â€”"}</td>
                    <td style={s.tdAction}>
                      <div style={s.actionBtns}>
                        <button style={s.btnPrint} title="Print" onClick={() => printRecord(rec, regType)}><IconPrint /></button>
                        <button style={s.btnView} title="View / Edit" onClick={() => setViewRec(rec)}><IconEye /></button>
                        <button style={s.btnDelete} title="Delete" onClick={() => setDeleteRec(rec)}><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={s.tableFooter}>Showing {records.length} record{records.length !== 1 ? "s" : ""}</div>
      </div>

      {/* View/Edit Modal */}
      {viewRec && (
        <ViewEditModal
          rec={viewRec}
          type={regType}
          onClose={() => setViewRec(null)}
          onUpdated={updated => {
            setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
            setViewRec(null);
          }}
          showToast={showToast}
        />
      )}

      {/* Delete Modal */}
      {deleteRec && (
        <ConfirmDeleteModal
          rec={deleteRec}
          type={regType}
          onClose={() => setDeleteRec(null)}
          onDeleted={id => setRecords(prev => prev.filter(r => r.id !== id))}
          showToast={showToast}
        />
      )}

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

