"use client";

import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../_components/Sidebar";
import { dmSans } from "../../_components/fonts";
import { UserIcon } from "../../_components/icons";

// Types

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
  fingerprint?: string;
}

// Constants

const TABS = ["New Registration", "Transfer", "History"];
const REG_TYPES: RegType[] = ["New Registration", "Transfer"];

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);
const FIXED_CONTACTS = "0300-5257278, 0333-5766432, 0313-5479941";

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#e7e8ec", LABEL = "#444b5a", MUTED = "#8a909e";

// SVG Icons

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

// Print Receipt (unchanged)

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
  .fp-section{display:flex;align-items:flex-end;justify-content:space-between;margin-top:14px;padding-top:10px;border-top:1px solid #ddd}
  .fp-label{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#777;margin-bottom:4px}
  .fp-box{display:flex;flex-direction:column;align-items:center}
  .fp-status{font-size:9px;text-align:center;margin-top:5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase}
  .fp-status.attested{color:#1a7a4a}
  .fp-status.not-attested{color:#aaa;font-style:italic;font-weight:400;text-transform:none;letter-spacing:0}
  .sig-line{width:160px;border-top:1px solid #aaa;margin-top:40px;text-align:center;font-size:9px;color:#777;padding-top:3px}
  .doc-footer{border-top:1.5px solid #1a1a1a;margin-top:18px;padding-top:9px;text-align:center;font-size:10.5px;font-weight:500}
  .doc-footer .contact-label{font-weight:700;margin-right:4px}
  @media print{body{font-size:11px}.page{padding:14px 18px}@page{margin:8mm 10mm;size:A4}}
`;

function printRecord(rec: RegRecord, type: RegType) {
  const isTransfer = type === "Transfer";
  const v = (x?: string | number | null) => (x !== undefined && x !== null && String(x).trim() !== "") ? String(x) : "-";
  const checkedDocs = [rec.docRegCard && "Registration Card", rec.docNoPlates && "Number Plates", rec.docFile && "File"].filter(Boolean) as string[];
  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const regNoRow = isTransfer
    ? `<div class="row"><div class="f"><div class="f-label">Registration No. (Old)</div><div class="f-value">${v(rec.regNoOld)}</div></div><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${v(rec.regNoNew)}</div></div></div>`
    : `<div class="row"><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${v(rec.regNoNew)}</div></div></div>`;

  const fpHtml = rec.fingerprint
    ? `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><svg width="72" height="90" viewBox="0 0 72 90" style="display:block"><defs><clipPath id="fpc"><ellipse cx="36" cy="45" rx="27" ry="34"/></clipPath></defs><image href="${rec.fingerprint}" x="0" y="0" width="72" height="90" clip-path="url(#fpc)" preserveAspectRatio="xMidYMid slice"/></svg><div class="fp-status attested">Biometrically Attested</div></div>`
    : `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><div style="width:72px;height:90px;border:1px dashed #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:#ccc">no scan</span></div><div class="fp-status not-attested">Not Attested</div></div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Registration Sheet - New Bilal Motors</title><style>${PRINT_CSS}</style></head><body><div class="page">
<div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Registration Sheet (${isTransfer ? "Transfer" : "New"})</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;">Serial No.:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">SR-${String(rec.srNo).padStart(4, "0")}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${v(rec.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${v(rec.savedTime)}</td></tr></table></div></div>
<div class="section"><div class="section-title">Owner Details</div><div class="row"><div class="f"><div class="f-label">Name</div><div class="f-value">${v(rec.name)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${v(rec.fatherName)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${v(rec.cnic)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${v(rec.phone)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Maker</div><div class="f-value">${v(rec.maker)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${v(rec.modelYear)}</div></div></div>${regNoRow}<div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${v(rec.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${v(rec.engineNo)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Payment Details</div><div class="row"><div class="f"><div class="f-label">Amount</div><div class="f-value price-box">${v(rec.amount)}</div></div><div class="f" style="flex:2"><div class="f-label">Remarks</div><div class="f-value">${v(rec.remarks)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="docs-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div>
<div class="fp-section">${fpHtml}<div class="sig-line">Owner Signature</div></div>
<div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div>
</div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=900");
  if (win) { win.document.write(html); win.document.close(); }
}

// Modal Styles

const ms: Record<string, CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,20,30,.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" },
  drawer: { background: "#fff", width: "min(760px, 96vw)", maxHeight: "92vh", borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden" },
  drawerHead: { background: "#16171b", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
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

function digitsOnly(v: string) { return v.replace(/\D/g, ""); }
function formatPhone(raw: string) {
  const d = digitsOnly(raw).slice(0, 11);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}
function formatCnic(raw: string) {
  const d = digitsOnly(raw).slice(0, 13);
  if (d.length > 12) return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

function SelectWithOtherEdit({ value: rawValue, onChange, options }: { value: string; onChange: (v: string) => void; options: (string | number)[] }) {
  const value = rawValue ?? "";
  const optStrs = options.map(String);
  const isCustom = value !== "" && !optStrs.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);
  useEffect(() => {
    if (value === "") setShowCustom(false);
    else if (!optStrs.includes(value)) setShowCustom(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <select
        value={showCustom ? "__other__" : value}
        onChange={(e) => {
          if (e.target.value === "__other__") { setShowCustom(true); onChange(""); }
          else { setShowCustom(false); onChange(e.target.value); }
        }}
        style={ms.editSelect}
      >
        <option value="">Select maker</option>
        {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
        <option value="__other__">Other</option>
      </select>
      {showCustom && (
        <input type="text" placeholder="Type custom value..." value={value} onChange={(e) => onChange(e.target.value)} style={ms.editInput} autoFocus />
      )}
    </div>
  );
}

// ViewEditModal

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
                Back to View
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
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Name</span><span style={ms.fValue}>{rec.name || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Father Name</span><span style={ms.fValue}>{rec.fatherName || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>CNIC</span><span style={ms.fValue}>{rec.cnic || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Phone No.</span><span style={ms.fValue}>{rec.phone || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Date</span><span style={ms.fValue}>{rec.date ? rec.date.split("-").reverse().join("-") : "-"}</span></div>
                  {rec.savedTime && <div style={ms.fieldItem}><span style={ms.fLabel}>Saved Time</span><span style={ms.fValue}>{rec.savedTime}</span></div>}
                </div>
              </div>
              {/* Vehicle */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Vehicle Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Maker</span><span style={ms.fValue}>{rec.maker || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Model Year</span><span style={ms.fValue}>{rec.modelYear || "-"}</span></div>
                  {isTransfer && <div style={ms.fieldItem}><span style={ms.fLabel}>Registration No. (Old)</span><span style={ms.fValue}>{rec.regNoOld || "-"}</span></div>}
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Registration No. (New)</span><span style={ms.fValue}>{rec.regNoNew || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Chassis No.</span><span style={ms.fValue}>{rec.chassisNo || "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Engine No.</span><span style={ms.fValue}>{rec.engineNo || "-"}</span></div>
                </div>
              </div>
              {/* Payment */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Payment Details</div>
                <div style={ms.fieldGrid}>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Amount</span><span style={ms.fValue}>{rec.amount ? `Rs. ${Number(rec.amount).toLocaleString()}` : "-"}</span></div>
                  <div style={ms.fieldItem}><span style={ms.fLabel}>Remarks</span><span style={ms.fValue}>{rec.remarks || "-"}</span></div>
                </div>
              </div>
              {/* Documents */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Documents</div>
                <div>
                  {checkedDocs.length > 0
                    ? checkedDocs.map(d => <span key={d} style={ms.docChip}>&#10003; {d}</span>)
                    : <span style={{ fontSize: ".82rem", color: MUTED }}>No documents received</span>}
                </div>
              </div>
              {/* Fingerprint */}
              <div style={ms.sectionBlock}>
                <div style={ms.sectionLabel}>Fingerprint</div>
                {rec.fingerprint ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ border: `2px solid ${TEAL}`, borderRadius: 8, padding: 4, background: "#f0f6f6" }}>
                      <svg width="90" height="90" viewBox="0 0 90 90" style={{ display: "block" }}>
                        <defs>
                          <clipPath id="fp-modal-clip">
                            <ellipse cx="45" cy="45" rx="33" ry="42" />
                          </clipPath>
                        </defs>
                        <image href={rec.fingerprint} x="0" y="0" width="90" height="90" clipPath="url(#fp-modal-clip)" preserveAspectRatio="xMidYMid slice" />
                      </svg>
                    </div>
                    <span style={{ fontSize: ".72rem", color: "#1a7a4a", fontWeight: 700 }}>&#10003; Biometrically Attested</span>
                  </div>
                ) : (
                  <span style={{ fontSize: ".82rem", color: MUTED, fontStyle: "italic" }}>Not attested  -  no fingerprint scanned</span>
                )}
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
                    <input style={ms.editInput} value={edit.cnic || ""} maxLength={15} onChange={e => setF("cnic", formatCnic(e.target.value))} />
                  </div>
                  <div style={ms.editField}>
                    <label style={ms.editLabel}>Phone No.</label>
                    <input style={ms.editInput} value={edit.phone || ""} maxLength={12} onChange={e => setF("phone", formatPhone(e.target.value))} />
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
                    <SelectWithOtherEdit value={edit.maker} onChange={v => setF("maker", v)} options={BRANDS} />
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Delete Confirm Modal

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
    <motion.div
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,30,.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{ background: "#fff", borderRadius: 14, width: "min(420px, 90vw)", boxShadow: "0 24px 80px rgba(0,0,0,.3)", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
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
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Page

export default function RegistrationHistory() {
  const router = useRouter();

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
  const canReset = !!inputSearch || !!search;

  return (
    <div className={dmSans.className + " rh-shell"}>
      <style>{`
        .rh-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .rh-main { flex: 1; min-width: 0; }

        .rh-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid ${BORDER};
        }
        .rh-breadcrumb { font-size: .95rem; color: #16171b; font-weight: 700; }
        .rh-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57; transition: background .15s;
        }
        .rh-avatar:hover { background: #eef0f2; }

        .rh-tabs { display: flex; gap: 4px; padding: 0 32px; background: #fff; border-bottom: 1px solid ${BORDER}; flex-wrap: wrap; }
        .rh-tab {
          padding: 13px 6px; margin-right: 26px; font-size: .85rem; font-weight: 500; color: ${MUTED};
          background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer;
          font-family: inherit; transition: color .15s, border-color .15s;
        }
        .rh-tab:hover { color: #2a2d35; }
        .rh-tab-active { color: #16171b; font-weight: 700; border-bottom: 2px solid ${TEAL}; }

        .rh-content { padding: 28px 32px 48px; }
        .rh-card {
          background: #fff; border: 1px solid ${BORDER}; border-radius: 14px;
          padding: 28px 30px 30px; box-shadow: 0 4px 18px rgba(20,20,25,.05);
        }
        .rh-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
        .rh-card-title { font-size: 1rem; font-weight: 700; color: #16171b; }
        .rh-card-subtitle { font-size: .8rem; color: ${MUTED}; margin-top: 3px; }

        .rh-type-select {
          appearance: none; -webkit-appearance: none; -moz-appearance: none; cursor: pointer;
          box-sizing: border-box; background: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238a909e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 15px;
          border: 1px solid ${BORDER}; border-radius: 8px; padding: 9px 34px 9px 14px;
          font-size: .83rem; color: #2a2d35; outline: none; font-family: inherit; min-width: 190px;
          transition: border-color .15s, box-shadow .15s;
        }
        .rh-type-select:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); }

        .rh-search-row { display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
        .rh-search-input {
          flex: 1; min-width: 220px; background: #fafbfc; border: 1px solid ${BORDER};
          border-radius: 8px; padding: 10px 16px; font-size: .85rem; color: #16171b;
          outline: none; font-family: inherit; box-sizing: border-box;
          transition: border-color .15s, box-shadow .15s;
        }
        .rh-search-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); }
        .rh-btn {
          border: none; border-radius: 8px; padding: 10px 24px; font-size: .84rem;
          font-weight: 600; cursor: pointer; font-family: inherit;
          transition: transform .15s, box-shadow .15s, background .15s;
        }
        .rh-btn:hover { transform: translateY(-1px); }
        .rh-btn-teal { background: ${TEAL}; color: #fff; }
        .rh-btn-teal:hover { background: #143a3a; box-shadow: 0 6px 16px rgba(26,74,74,.25); }
        .rh-btn-dark { background: #16171b; color: #fff; }
        .rh-btn-dark:hover { background: #000; box-shadow: 0 6px 16px rgba(0,0,0,.2); }
        .rh-btn:disabled { background: #e3e5e9; color: #a7abb3; cursor: not-allowed; box-shadow: none; transform: none; }

        .rh-table-wrapper { overflow-x: auto; border-radius: 10px; }
        .rh-table { width: 100%; min-width: 940px; table-layout: fixed; border-collapse: collapse; font-size: .78rem; }
        .rh-table th, .rh-table td { box-sizing: border-box; }
        .rh-thead { background: #16171b; color: #fff; }
        .rh-th { padding: 10px 10px; font-weight: 600; font-size: .72rem; text-align: left; white-space: nowrap; }
        .rh-th-action { padding: 10px 10px; font-weight: 600; font-size: .72rem; text-align: right; }
        .rh-col-srno { width: 46px; }
        .rh-col-name { width: 108px; }
        .rh-col-father { width: 100px; }
        .rh-col-maker { width: 84px; }
        .rh-col-year { width: 50px; }
        .rh-col-regno { width: 88px; }
        .rh-col-chassis { width: 92px; }
        .rh-col-engine { width: 92px; }
        .rh-col-docs { width: 96px; }
        .rh-col-date { width: 104px; white-space: nowrap; }
        .rh-col-action { width: 80px; }
        .rh-tr { transition: background .12s; }
        .rh-tr-even { background: #fff; }
        .rh-tr-odd { background: #fafbfc; }
        .rh-tr:hover { background: #f0f4f4; }
        .rh-td { padding: 9px 10px; color: #2a2d35; border-bottom: 1px solid ${BORDER}; overflow-wrap: break-word; overflow: hidden; text-overflow: ellipsis; }
        .rh-td-action { padding: 9px 10px; text-align: right; border-bottom: 1px solid ${BORDER}; }
        .rh-action-btns { display: flex; gap: 4px; justify-content: flex-end; align-items: center; }
        .rh-icon-btn {
          background: none; border: none; cursor: pointer; color: ${TEAL};
          padding: 6px; display: flex; align-items: center; border-radius: 6px;
          transition: background .15s, transform .15s;
        }
        .rh-icon-btn:hover { background: #edf7f7; transform: scale(1.08); }
        .rh-icon-btn-delete { color: #e74c3c; }
        .rh-icon-btn-delete:hover { background: #fdf1ef; }
        .rh-empty-row { text-align: center; padding: 48px 0; color: ${MUTED}; font-size: .85rem; }

        .rh-table-footer { margin-top: 16px; font-size: .8rem; color: ${MUTED}; }

        .rh-toast {
          position: fixed; bottom: 32px; right: 32px; padding: 12px 22px; border-radius: 8px;
          color: #fff; font-size: .85rem; font-weight: 600; z-index: 9999;
          box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .rh-toast-success { background: #1a7a4a; }
        .rh-toast-error { background: #c0392b; }

        @media (max-width: 900px) {
          .rh-shell { flex-direction: column; }
          .rh-content { padding: 20px; }
        }
        @media (max-width: 640px) {
          .rh-card { padding: 20px 16px 22px; }
          .rh-search-row { flex-direction: column; }
          .rh-btn { width: 100%; }
        }
      `}</style>

      <Sidebar />

      <div className="rh-main">
        <div className="rh-topbar">
          <span className="rh-breadcrumb">Registration Management</span>
          <button className="rh-avatar" aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="rh-tabs">
          {TABS.map(tab => (
            <button key={tab} onClick={() => tab !== "History" && handleTabClick(tab)}
              className={`rh-tab ${tab === "History" ? "rh-tab-active" : ""}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="rh-content">
          <AnimatePresence>
            {toast && (
              <motion.div
                className={`rh-toast ${toast.type === "success" ? "rh-toast-success" : "rh-toast-error"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
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
          </AnimatePresence>

          <AnimatePresence>
            {deleteRec && (
              <ConfirmDeleteModal
                rec={deleteRec}
                type={regType}
                onClose={() => setDeleteRec(null)}
                onDeleted={id => setRecords(prev => prev.filter(r => r.id !== id))}
                showToast={showToast}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="rh-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="rh-card-top">
              <div>
                <div className="rh-card-title">Registration History</div>
                <div className="rh-card-subtitle">{records.length} record{records.length !== 1 ? "s" : ""} found</div>
              </div>
              <select className="rh-type-select" value={regType} onChange={e => handleTypeChange(e.target.value as RegType)}>
                {REG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="rh-search-row">
              <input
                className="rh-search-input"
                placeholder="Search by name, maker, chassis no., engine no., reg. no..."
                value={inputSearch}
                onChange={e => setInputSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <button className="rh-btn rh-btn-teal" onClick={handleSearch}>Search</button>
              <button className="rh-btn rh-btn-dark" onClick={handleReset} disabled={!canReset}>Reset</button>
            </div>

            <div className="rh-table-wrapper">
              <table className="rh-table">
                <thead className="rh-thead">
                  <tr>
                    <th className="rh-th rh-col-srno">Sr No.</th>
                    <th className="rh-th rh-col-name">Name</th>
                    <th className="rh-th rh-col-father">Father Name</th>
                    <th className="rh-th rh-col-maker">Maker</th>
                    <th className="rh-th rh-col-year">Year</th>
                    {isTransfer && <th className="rh-th rh-col-regno">Reg No. (Old)</th>}
                    <th className="rh-th rh-col-regno">Reg. No. (New)</th>
                    <th className="rh-th rh-col-chassis">Chassis No.</th>
                    <th className="rh-th rh-col-engine">Engine No.</th>
                    <th className="rh-th rh-col-docs">Documents</th>
                    <th className="rh-th rh-col-date">Date</th>
                    <th className="rh-th-action rh-col-action">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={isTransfer ? 12 : 11} className="rh-empty-row">Loading...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={isTransfer ? 12 : 11} className="rh-empty-row">No records found.</td></tr>
                  ) : records.map((rec, idx) => {
                    const docList = [rec.docRegCard && "Registration Card", rec.docNoPlates && "Number Plates", rec.docFile && "File"].filter(Boolean).join(", ");
                    return (
                      <tr key={rec.id} className={`rh-tr ${idx % 2 === 0 ? "rh-tr-even" : "rh-tr-odd"}`}>
                        <td className="rh-td">{rec.srNo}</td>
                        <td className="rh-td">{rec.name}</td>
                        <td className="rh-td">{rec.fatherName}</td>
                        <td className="rh-td">{rec.maker}</td>
                        <td className="rh-td">{rec.modelYear}</td>
                        {isTransfer && <td className="rh-td">{rec.regNoOld || "-"}</td>}
                        <td className="rh-td">{rec.regNoNew || "-"}</td>
                        <td className="rh-td">{rec.chassisNo}</td>
                        <td className="rh-td">{rec.engineNo}</td>
                        <td className="rh-td">{docList || "-"}</td>
                        <td className="rh-td">{rec.date ? rec.date.split("-").reverse().join("-") : "-"}</td>
                        <td className="rh-td-action">
                          <div className="rh-action-btns">
                            <button className="rh-icon-btn" title="Print" onClick={() => printRecord(rec, regType)}><IconPrint /></button>
                            <button className="rh-icon-btn" title="View / Edit" onClick={() => setViewRec(rec)}><IconEye /></button>
                            <button className="rh-icon-btn rh-icon-btn-delete" title="Delete" onClick={() => setDeleteRec(rec)}><IconTrash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="rh-table-footer">Showing {records.length} record{records.length !== 1 ? "s" : ""}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
