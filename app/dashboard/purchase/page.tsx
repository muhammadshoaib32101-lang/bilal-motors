"use client";

import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "../_components/Sidebar";
import { dmSans } from "../_components/fonts";
import { UserIcon } from "../_components/icons";
import ConfirmDialog from "../_components/ConfirmDialog";

// Types

type TopDocKey = "CNIC" | "File" | "Smart card" | "Number plates";

interface FormState {
  sellerName: string; fatherName: string; phone: string;
  date: string; cnic: string; address: string;
  brand: string; modelYear: string; engineCC: string; color: string;
  chassis: string; engineNo: string; regNo: string; status: string;
  purchasePrice: string; paidAmount: string; balanceAmount: string;
  expenses: string; salePrice: string; remarks: string;
  topDocs: Record<TopDocKey, boolean>;
  biometric: string;
  witness1Name: string; witness1Phone: string; witness1Cnic: string;
  witness2Name: string; witness2Phone: string; witness2Cnic: string;
}

interface FieldProps { label: string; required?: boolean; hint?: string; children: ReactNode; style?: CSSProperties; }
interface TextInputProps { value: string; onChange: (v: string) => void; placeholder: string; type?: string; readOnly?: boolean; }
interface SelectInputProps { value: string; onChange: (v: string) => void; options: (string | number)[]; placeholder: string; }
interface SectionHeadProps { title: string; sub: string; }

// Constants

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);
const ENGINE_CC = ["70 cc", "100 cc", "125 cc", "150 cc", "200 cc", "250 cc", "660 cc", "800 cc", "1000 cc", "1200 cc", "1300 cc", "1500 cc", "1600 cc", "1800 cc", "2000 cc", "2400 cc", "2700 cc", "3000 cc"];
const COLORS = ["White", "Silver", "Black", "Grey", "Red", "Blue", "Beige", "Brown", "Green", "Golden", "Maroon", "Pearl White", "Champagne"];
const STATUSES = ["Brand New", "Used"];
const TABS = ["Individual Purchase", "Showroom Purchase", "Purchase History"];
const TOP_DOCS: TopDocKey[] = ["CNIC", "File", "Smart card", "Number plates"];
const BOTTOM_DOCS = ["Advance bio-metric", "After sale bio-metric", "Pending bio-metric"];

const FIXED_BUYER_NAME = "New Bilal Motors";
const FIXED_BUYER_CNIC = "37406-1234567-0";
const FIXED_CONTACTS = "0300-5257278, 0333-5766432, 0313-5479941";

const INIT_FORM: FormState = {
  sellerName: "", fatherName: "", phone: "", date: "", cnic: "", address: "",
  brand: "", modelYear: "", engineCC: "", color: "",
  chassis: "", engineNo: "", regNo: "", status: "",
  purchasePrice: "", paidAmount: "", balanceAmount: "", expenses: "",
  salePrice: "", remarks: "",
  topDocs: { CNIC: false, File: false, "Smart card": false, "Number plates": false },
  biometric: "",
  witness1Name: "", witness1Phone: "", witness1Cnic: "",
  witness2Name: "", witness2Phone: "", witness2Cnic: "",
};

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#e7e8ec", LABEL = "#444b5a", MUTED = "#8a909e";

// Calendar Component

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = new Date();
  const parsed = value ? new Date(value + "T00:00:00") : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const selectedDay = parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth ? parsed.getDate() : null;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth ? today.getDate() : null;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const selectDay = (day: number) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    setOpen(false);
  };

  const displayValue = parsed ? parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

  return (
    <div ref={ref} className="pu-datepicker">
      <div onClick={() => setOpen(o => !o)} className="pu-input pu-date-trigger">
        <span style={{ color: value ? "#2a2d35" : MUTED }}>{displayValue || "Select Date"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      {open && (
        <div className="pu-date-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button onClick={prevMonth} className="pu-date-nav-btn">&#8249;</button>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#2a2d35" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="pu-date-nav-btn">&#8250;</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {WEEK_DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: ".7rem", fontWeight: 700, color: MUTED, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1, isSel = day === selectedDay, isToday = day === todayDay, isHov = day === hovered && !isSel;
              return (
                <button key={day} onClick={() => selectDay(day)}
                  onMouseEnter={() => setHovered(day)} onMouseLeave={() => setHovered(null)}
                  style={{
                    border: "none", borderRadius: 7, padding: "6px 0", cursor: "pointer", fontSize: ".82rem",
                    fontWeight: isSel || isToday ? 700 : 400,
                    background: isSel ? TEAL : isHov ? "#e8f0f0" : isToday ? "#f0f6f6" : "transparent",
                    color: isSel ? "#fff" : isToday && !isHov ? TEAL : "#2a2d35",
                    outline: isToday && !isSel ? `1.5px solid ${TEAL}` : "none", transition: "background .1s"
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { const t = today; setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); selectDay(t.getDate()); }}
              className="pu-date-today-btn">
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

function SectionHead({ title, sub }: SectionHeadProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="pu-section-title">{title}</p>
      <p className="pu-section-sub">{sub}</p>
    </div>
  );
}

function Field({ label, required = false, hint, children, style }: FieldProps) {
  return (
    <div className="pu-field" style={style}>
      <label className="pu-field-label">
        {label}{required && <span className="pu-req">*</span>}
        {hint && <span className="pu-hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", readOnly = false }: TextInputProps) {
  return (
    <input type={type} placeholder={placeholder} readOnly={readOnly} value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      className={`pu-input ${readOnly ? "pu-input-readonly" : ""}`} />
  );
}

function SelectInput({ value, onChange, options, placeholder }: SelectInputProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="pu-input pu-select">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
    </select>
  );
}

function SelectWithOther({ value: rawValue, onChange, options, placeholder }: SelectInputProps) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <select
        value={showCustom ? "__other__" : value}
        onChange={(e) => {
          if (e.target.value === "__other__") { setShowCustom(true); onChange(""); }
          else { setShowCustom(false); onChange(e.target.value); }
        }}
        className="pu-input pu-select"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
        <option value="__other__">Other</option>
      </select>
      {showCustom && (
        <input type="text" placeholder="Type custom value..." value={value} onChange={(e) => onChange(e.target.value)} className="pu-input" autoFocus />
      )}
    </div>
  );
}

// Validation helpers

function digitsOnly(v: string) { return v.replace(/\D/g, ""); }
function validatePhone(v: string) { return digitsOnly(v).length === 11; }
function validateCnic(v: string) { return digitsOnly(v).length === 13; }
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

// Print Receipt

function printReceipt(form: FormState, serialNumber: string, savedTime: string) {
  const formatDate = (d: string) => {
    if (!d) return "-";
    const dt = new Date(d + "T00:00:00");
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };

  const val = (v: string) => v || "-";

  const checkedDocs = (Object.entries(form.topDocs) as [TopDocKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => k);

  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const bioHtml = form.biometric
    ? `<span class="bio-chip">&#9679; ${form.biometric}</span>`
    : `<span class="none-text">—</span>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Purchase Sheet – New Bilal Motors</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; font-size: 11.5px; line-height: 1.4; }
    .page { padding: 18px 26px 14px; max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2.5px solid #1a1a1a; margin-bottom: 14px; }
    .header-left h1 { font-size: 20px; font-weight: 800; letter-spacing: 0.3px; color: #1a1a1a; margin-bottom: 2px; }
    .header-left .shop-addr { font-size: 10.5px; color: #444; margin-bottom: 3px; }
    .header-left .tagline { font-size: 10px; color: #666; font-style: italic; }
    .header-right { text-align: right; }
    .header-right .sheet-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
    .header-right table { margin-left: auto; border-collapse: collapse; }
    .header-right td { font-size: 10.5px; padding: 1px 0; color: #333; }
    .header-right td:first-child { padding-right: 6px; color: #666; }
    .header-right td:last-child { font-weight: 700; text-align: left; }
    .section { margin-bottom: 11px; }
    .section-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #1a1a1a; padding-bottom: 4px; border-bottom: 1.5px solid #1a1a1a; margin-bottom: 8px; }
    .row { display: flex; gap: 0; margin-bottom: 5px; }
    .row:last-child { margin-bottom: 0; }
    .f { display: flex; flex-direction: column; flex: 1; padding-right: 12px; min-width: 0; }
    .f:last-child { padding-right: 0; }
    .f-wide { flex: 1.6; }
    .f-narrow { flex: 0.85; }
    .f-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 2px; }
    .f-value { font-size: 11.5px; font-weight: 500; color: #1a1a1a; border-bottom: 1px dashed #bbb; padding-bottom: 3px; min-height: 19px; word-break: break-word; overflow-wrap: break-word; }
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
    .witness-col:last-child { padding-left: 0; }
    .w-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-bottom: 2px; }
    .w-value { font-size: 11.5px; font-weight: 500; color: #1a1a1a; border-bottom: 1px dashed #bbb; padding-bottom: 3px; min-height: 19px; margin-bottom: 6px; word-break: break-word; overflow-wrap: break-word; }
    .w-cnic-sig { display: flex; gap: 14px; margin-top: 4px; }
    .w-cnic-block { flex: 1; }
    .w-sig-block  { flex: 1.2; }
    .sig-line { width: 100%; border-bottom: 1px solid #888; height: 30px; display: block; }
    .sig-label-text { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #777; margin-top: 3px; }
    .doc-footer { border-top: 1.5px solid #1a1a1a; margin-top: 18px; padding-top: 9px; text-align: center; font-size: 10.5px; color: #333; font-weight: 500; }
    .doc-footer .contact-label { font-weight: 700; margin-right: 4px; }
    .sec-divider { border: none; border-top: 1px solid #ddd; margin: 8px 0 9px; }
    @media print { body { font-size: 10.5px; } .page { padding: 10px 14px; } @page { margin: 5mm 8mm; size: A4; } }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-left">
      <h1>New Bilal Motors</h1>
      <div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div>
      <div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div>
    </div>
    <div class="header-right">
      <div class="sheet-title">Purchase Sheet (Individual)</div>
      <table style="border-collapse:collapse;">
  <tr>
    <td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;text-align:right;">Serial Number:</td>
    <td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${serialNumber}</td>
  </tr>
  <tr>
    <td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td>
    <td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${formatDate(form.date)}</td>
  </tr>
  <tr>
    <td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td>
    <td style="font-size:10.5px;font-weight:700;text-align:left;white-space:nowrap;">${savedTime}</td>
  </tr>
</table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Seller Details</div>
    <div class="row">
      <div class="f f-wide">
        <div class="f-label">Seller Name</div>
        <div class="f-value">${val(form.sellerName)}</div>
      </div>
      <div class="f f-wide">
        <div class="f-label">Father Name</div>
        <div class="f-value">${val(form.fatherName)}</div>
      </div>
      <div class="f f-narrow">
        <div class="f-label">Phone No.</div>
        <div class="f-value">${val(form.phone)}</div>
      </div>
      <div class="f f-narrow">
        <div class="f-label">CNIC</div>
        <div class="f-value">${val(form.cnic)}</div>
      </div>
    </div>
    <div class="row">
      <div class="f f-full">
        <div class="f-label">Seller Address</div>
        <div class="f-value">${val(form.address)}</div>
      </div>
    </div>
  </div>

  <hr class="sec-divider" />

  <div class="section">
    <div class="section-title">Vehicle Details</div>
    <div class="row">
      <div class="f">
        <div class="f-label">Brand / Maker</div>
        <div class="f-value">${val(form.brand)}</div>
      </div>
      <div class="f">
        <div class="f-label">Model Year</div>
        <div class="f-value">${val(form.modelYear)}</div>
      </div>
      <div class="f">
        <div class="f-label">Engine CC</div>
        <div class="f-value">${val(form.engineCC)}</div>
      </div>
      <div class="f">
        <div class="f-label">Color</div>
        <div class="f-value">${val(form.color)}</div>
      </div>
    </div>
    <div class="row">
      <div class="f">
        <div class="f-label">Chassis No.</div>
        <div class="f-value">${val(form.chassis)}</div>
      </div>
      <div class="f">
        <div class="f-label">Engine No.</div>
        <div class="f-value">${val(form.engineNo)}</div>
      </div>
      <div class="f">
        <div class="f-label">Registration No.</div>
        <div class="f-value">${val(form.regNo)}</div>
      </div>
      <div class="f">
        <div class="f-label">Status</div>
        <div class="f-value">${val(form.status)}</div>
      </div>
    </div>
  </div>

  <hr class="sec-divider" />

  <div class="section">
    <div class="section-title">Buyer Details</div>
    <div class="row">
      <div class="f" style="flex:1.4">
        <div class="f-label">Buyer Name</div>
        <div class="f-value">${FIXED_BUYER_NAME}</div>
      </div>
      <div class="f" style="flex:1">
        <div class="f-label">CNIC</div>
        <div class="f-value">${FIXED_BUYER_CNIC}</div>
      </div>
    </div>
  </div>

  <hr class="sec-divider" />

  <div class="section">
    <div class="section-title">Pricing Details</div>
    <div class="price-box">
      <div class="price-row">
        <div class="pf">
          <div class="pf-label">Purchase Price</div>
          <div class="pf-value">RS. ${val(form.purchasePrice)}</div>
        </div>
        <div class="pf">
          <div class="pf-label">Paid Amount</div>
          <div class="pf-value">RS. ${val(form.paidAmount)}</div>
        </div>
        <div class="pf">
          <div class="pf-label">Balance Amount</div>
          <div class="pf-value">RS. ${val(form.balanceAmount)}</div>
        </div>
      </div>
      <div class="remarks-row">
        <div class="remarks-label">Remarks</div>
        <div class="remarks-value">${val(form.remarks)}</div>
      </div>
    </div>
  </div>

  <hr class="sec-divider" />

  <div class="section">
    <div class="docs-bio-wrapper">
      <div class="docs-col">
        <div class="docs-bio-header">Received Documents</div>
        <div class="docs-chips">${docsHtml}</div>
      </div>
      <div class="bio-col">
        <div class="docs-bio-header">Bio-Metric Status</div>
        <div>${bioHtml}</div>
      </div>
    </div>
  </div>

  <hr class="sec-divider" />

  <div class="section">
    <div class="section-title">Witnesses Details</div>
    <div class="witness-grid">

      <div class="witness-col">
        <div class="w-label">Name of First Witness</div>
        <div class="w-value">${val(form.witness1Name)}</div>

        <div class="w-label">Phone No.</div>
        <div class="w-value">${val(form.witness1Phone)}</div>

        <div class="w-cnic-sig">
          <div class="w-cnic-block">
            <div class="w-label">CNIC</div>
            <div class="w-value" style="margin-bottom:0">${val(form.witness1Cnic)}</div>
          </div>
          <div class="w-sig-block">
            <span class="sig-line"></span>
            <div class="sig-label-text">Signature</div>
          </div>
        </div>
      </div>

      <div class="witness-col">
        <div class="w-label">Name of Second Witness</div>
        <div class="w-value">${val(form.witness2Name)}</div>

        <div class="w-label">Phone No.</div>
        <div class="w-value">${val(form.witness2Phone)}</div>

        <div class="w-cnic-sig">
          <div class="w-cnic-block">
            <div class="w-label">CNIC</div>
            <div class="w-value" style="margin-bottom:0">${val(form.witness2Cnic)}</div>
          </div>
          <div class="w-sig-block">
            <span class="sig-line"></span>
            <div class="sig-label-text">Signature</div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="doc-footer">
    <span class="contact-label">Contact No.</span>${FIXED_CONTACTS}
  </div>

</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

// Main Page

export default function PurchaseManagement() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INIT_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [savedRecord, setSavedRecord] = useState<FormState | null>(null);
  const [savedSerial, setSavedSerial] = useState<string>("");
  const [savedTime, setSavedTime] = useState<string>("");

  const set = (key: keyof Omit<FormState, "topDocs">, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));
  const touch = (key: string) => setTouched(p => ({ ...p, [key]: true }));

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const calcBalance = () => {
    const pp = parseFloat(form.purchasePrice) || 0;
    const pa = parseFloat(form.paidAmount) || 0;
    set("balanceAmount", String(pp - pa));
  };

  const handleTabClick = (tab: string) => {
    if (tab === "Individual Purchase") router.push("/dashboard/purchase");
    else if (tab === "Showroom Purchase") router.push("/dashboard/purchase/showroomPurchase");
    else if (tab === "Purchase History") router.push("/dashboard/purchase/purchaseHistory");
  };

  const [confirmReset, setConfirmReset] = useState(false);
  const hasFormData = JSON.stringify(form) !== JSON.stringify(INIT_FORM);

  const resetForm = () => { setForm(INIT_FORM); setTouched({}); setSavedRecord(null); setSavedSerial(""); setSavedTime(""); };

  const requestReset = () => {
    if (hasFormData) setConfirmReset(true);
    else resetForm();
  };

  const phoneError = touched.phone && form.phone && !validatePhone(form.phone);
  const cnicError = touched.cnic && form.cnic && !validateCnic(form.cnic);
  const w1PhoneError = touched.w1Phone && form.witness1Phone && !validatePhone(form.witness1Phone);
  const w2PhoneError = touched.w2Phone && form.witness2Phone && !validatePhone(form.witness2Phone);
  const w1CnicError = touched.w1Cnic && form.witness1Cnic && !validateCnic(form.witness1Cnic);
  const w2CnicError = touched.w2Cnic && form.witness2Cnic && !validateCnic(form.witness2Cnic);

  const savePurchase = async () => {
    setTouched(p => ({ ...p, phone: true, cnic: true, w1Phone: true, w2Phone: true, w1Cnic: true, w2Cnic: true }));

    if (form.phone && !validatePhone(form.phone)) {
      showToast("Phone number must be exactly 11 digits.", "error"); return;
    }
    if (form.cnic && !validateCnic(form.cnic)) {
      showToast("CNIC must be exactly 13 digits.", "error"); return;
    }
    if (form.witness1Phone && !validatePhone(form.witness1Phone)) {
      showToast("Witness 1 phone must be exactly 11 digits.", "error"); return;
    }
    if (form.witness2Phone && !validatePhone(form.witness2Phone)) {
      showToast("Witness 2 phone must be exactly 11 digits.", "error"); return;
    }
    if (form.witness1Cnic && !validateCnic(form.witness1Cnic)) {
      showToast("Witness 1 CNIC must be exactly 13 digits.", "error"); return;
    }
    if (form.witness2Cnic && !validateCnic(form.witness2Cnic)) {
      showToast("Witness 2 CNIC must be exactly 13 digits.", "error"); return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    setLoading(true);
    try {
      const payload = {
        sellerName: form.sellerName, fatherName: form.fatherName, phone: form.phone,
        date: form.date, cnic: form.cnic, address: form.address,
        brand: form.brand, modelYear: form.modelYear, engineCC: form.engineCC, color: form.color,
        chassisNo: form.chassis, engineNo: form.engineNo, regNo: form.regNo, status: form.status,
        purchasePrice: form.purchasePrice, paidAmount: form.paidAmount,
        balanceAmount: form.balanceAmount, expenses: form.expenses || "0",
        salePrice: form.salePrice, remarks: form.remarks,
        topDocs: form.topDocs, biometric: form.biometric,
        witness1Name: form.witness1Name, witness1Phone: form.witness1Phone, witness1Cnic: form.witness1Cnic,
        witness2Name: form.witness2Name, witness2Phone: form.witness2Phone, witness2Cnic: form.witness2Cnic,
      };

      const res = await fetch("/api/purchase/individual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        const serial = json.serialNumber
          ? String(json.serialNumber).padStart(4, "0")
          : json.id
            ? String(json.id).padStart(4, "0")
            : "-";
        setSavedSerial(serial);
        setSavedTime(timeStr);
        setSavedRecord({ ...form });
        showToast("Purchase record saved successfully!", "success");
      } else {
        showToast(json.message || "Failed to save record.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dmSans.className + " pu-shell"}>
      <style>{`
        .pu-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .pu-main { flex: 1; min-width: 0; }

        .pu-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid ${BORDER};
        }
        .pu-breadcrumb { font-size: .95rem; color: #16171b; font-weight: 700; }
        .pu-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57; transition: background .15s;
        }
        .pu-avatar:hover { background: #eef0f2; }

        .pu-tabs { display: flex; gap: 4px; padding: 0 32px; background: #fff; border-bottom: 1px solid ${BORDER}; flex-wrap: wrap; }
        .pu-tab {
          padding: 13px 6px; margin-right: 26px; font-size: .85rem; font-weight: 500; color: ${MUTED};
          background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer;
          font-family: inherit; transition: color .15s, border-color .15s;
        }
        .pu-tab:hover { color: #2a2d35; }
        .pu-tab-active { color: #16171b; font-weight: 700; border-bottom: 2px solid ${TEAL}; }

        .pu-content { padding: 28px 32px 48px; }
        .pu-card {
          background: #fff; border: 1px solid ${BORDER}; border-radius: 14px;
          padding: 30px 34px 34px; box-shadow: 0 4px 18px rgba(20,20,25,.05);
        }

        .pu-section-title { font-size: .95rem; font-weight: 700; color: #16171b; margin-bottom: 3px; }
        .pu-section-sub { font-size: .78rem; color: ${MUTED}; }

        .pu-divider { border: none; border-top: 1px solid ${BORDER}; margin: 28px 0; }

        .pu-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 20px; row-gap: 18px; }
        .pu-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 20px; row-gap: 18px; }
        .pu-balance-row { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 20px; row-gap: 18px; align-items: end; }
        .pu-sale-row { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 20px; row-gap: 18px; }

        .pu-field { display: flex; flex-direction: column; gap: 6px; }
        .pu-field-label { font-size: .78rem; font-weight: 600; color: ${LABEL}; display: flex; align-items: center; gap: 4px; }
        .pu-req { color: ${ACCENT}; }
        .pu-hint { font-weight: 400; color: ${MUTED}; font-size: .72rem; margin-left: auto; }
        .pu-for-inventory { font-weight: 400; color: ${MUTED}; font-size: .72rem; margin-left: 6px; }

        .pu-input {
          box-sizing: border-box;
          background: #fafbfc; border: 1px solid ${BORDER}; border-radius: 8px;
          padding: 10px 13px; font-size: .83rem; color: #2a2d35;
          width: 100%; outline: none; font-family: inherit;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .pu-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); background: #fff; }
        .pu-input-error { background: #fff8f7; border-color: #e74c3c; }
        .pu-input-readonly { background: #f0f2f5; color: ${MUTED}; cursor: not-allowed; }
        .pu-error-msg { font-size: .72rem; color: #e74c3c; font-weight: 600; margin-top: 1px; }

        .pu-select {
          appearance: none; -webkit-appearance: none; -moz-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238a909e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 15px;
          padding-right: 34px;
        }

        .pu-datepicker { position: relative; }
        .pu-date-trigger { display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
        .pu-date-panel {
          position: absolute; top: calc(100% + 6px); left: 0; background: #fff; border: 1px solid ${BORDER};
          border-radius: 12px; padding: 16px; z-index: 500; box-shadow: 0 8px 32px rgba(0,0,0,.15); min-width: 290px;
          box-sizing: border-box;
        }
        .pu-date-nav-btn {
          box-sizing: border-box; background: none; border: 1px solid ${BORDER}; border-radius: 6px;
          width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: ${LABEL}; font-size: 1rem; font-weight: 700;
        }
        .pu-date-today-btn {
          background: none; border: 1px solid ${BORDER}; border-radius: 6px; padding: 5px 14px;
          font-size: .75rem; font-weight: 600; color: ${TEAL}; cursor: pointer; font-family: inherit;
        }

        .pu-calc-btn {
          background: ${TEAL}; color: #fff; border: none; border-radius: 8px; padding: 10px 12px;
          font-size: .74rem; font-weight: 600; cursor: pointer; height: 39px; display: flex;
          align-items: center; justify-content: center; white-space: nowrap; font-family: inherit;
          transition: background .15s;
        }
        .pu-calc-btn:hover { background: #143a3a; }

        .pu-docs-top { display: flex; flex-wrap: wrap; gap: 10px 36px; margin-bottom: 12px; }
        .pu-docs-bottom { display: flex; flex-wrap: wrap; gap: 10px 36px; }
        .pu-check-label { display: flex; align-items: center; gap: 9px; font-size: .82rem; color: ${LABEL}; cursor: pointer; user-select: none; }
        .pu-checkbox, .pu-radio {
          appearance: none; -webkit-appearance: none; box-sizing: border-box;
          width: 17px; height: 17px; border: 1.5px solid #c7cbd1; border-radius: 5px;
          cursor: pointer; position: relative; flex-shrink: 0; transition: background .15s, border-color .15s;
        }
        .pu-checkbox:checked, .pu-radio:checked { background: ${TEAL}; border-color: ${TEAL}; }
        .pu-checkbox:checked::after, .pu-radio:checked::after {
          content: ""; position: absolute; left: 5px; top: 1px; width: 5px; height: 9px;
          border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }

        .pu-witness-label { font-size: .78rem; font-weight: 700; color: ${MUTED}; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .5px; }

        .pu-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
        .pu-btn {
          border: none; border-radius: 8px; padding: 10px 28px; font-size: .85rem;
          font-weight: 600; cursor: pointer; font-family: inherit; transition: transform .15s, box-shadow .15s, background .15s, opacity .15s;
        }
        .pu-btn:hover { transform: translateY(-1px); }
        .pu-btn-save { background: ${TEAL}; color: #fff; }
        .pu-btn-save:hover { background: #143a3a; box-shadow: 0 6px 16px rgba(26,74,74,.25); }
        .pu-btn-save:disabled { opacity: .7; cursor: not-allowed; transform: none; }
        .pu-btn-reset { background: #fff; color: ${LABEL}; border: 1px solid ${BORDER}; }
        .pu-btn-reset:hover { background: #f4f5f7; }
        .pu-btn-print {
          background: #fff; color: ${TEAL}; border: 1.5px solid ${TEAL};
          padding: 9px 26px; border-radius: 8px; font-size: .85rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit;
          transition: background .15s;
        }
        .pu-btn-print:hover { background: #f0f6f6; }
        .pu-btn-new { background: ${TEAL}; color: #fff; border: none; padding: 9px 26px; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; }
        .pu-btn-new:hover { background: #143a3a; }

        .pu-saved-banner {
          background: #f0faf5; border: 1.5px solid #4caf7d; border-radius: 10px;
          padding: 14px 20px; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .pu-saved-banner-text { font-size: .87rem; color: #1a7a4a; font-weight: 600; }

        .pu-toast {
          position: fixed; bottom: 32px; right: 32px; padding: 12px 22px; border-radius: 8px;
          color: #fff; font-size: .85rem; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .pu-toast-success { background: #1a7a4a; }
        .pu-toast-error { background: #c0392b; }

        @media (max-width: 1100px) {
          .pu-grid4, .pu-balance-row, .pu-sale-row, .pu-grid3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .pu-shell { flex-direction: column; }
        }
        @media (max-width: 640px) {
          .pu-content { padding: 20px 16px 32px; }
          .pu-card { padding: 22px 18px 26px; }
          .pu-grid4, .pu-balance-row, .pu-sale-row, .pu-grid3 { grid-template-columns: 1fr; }
          .pu-footer { flex-direction: column-reverse; }
          .pu-btn { width: 100%; }
        }
      `}</style>

      <Sidebar />

      <div className="pu-main">
        <div className="pu-topbar">
          <span className="pu-breadcrumb">Purchase Management</span>
          <button className="pu-avatar" aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="pu-tabs">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => handleTabClick(tab)}
              className={`pu-tab ${tab === "Individual Purchase" ? "pu-tab-active" : ""}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="pu-content">
          {toast && (
            <div className={`pu-toast ${toast.type === "success" ? "pu-toast-success" : "pu-toast-error"}`}>
              {toast.msg}
            </div>
          )}

          <motion.div
            className="pu-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {savedRecord && (
              <div className="pu-saved-banner">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="pu-saved-banner-text">Record saved successfully!</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => printReceipt(savedRecord, savedSerial, savedTime)} className="pu-btn-print">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Receipt
                  </button>
                  <button onClick={resetForm} className="pu-btn-new">+ New Entry</button>
                </div>
              </div>
            )}

            <SectionHead title="Seller Details" sub="Essential Seller Information For Vehicle Processing" />

            <div className="pu-grid4" style={{ marginBottom: 18 }}>
              <Field label="Seller Name" required>
                <TextInput value={form.sellerName} onChange={(v) => set("sellerName", v)} placeholder="Enter Seller Name" />
              </Field>
              <Field label="Father Name" required>
                <TextInput value={form.fatherName} onChange={(v) => set("fatherName", v)} placeholder="Enter Father Name" />
              </Field>

              <div className="pu-field">
                <label className="pu-field-label">
                  Phone Number<span className="pu-req">*</span>
                  <span className="pu-hint">(03xx-xxxxxxx)</span>
                </label>
                <input type="text" placeholder="Enter Phone Number" value={form.phone} maxLength={12}
                  onChange={(e) => set("phone", formatPhone(e.target.value))} onBlur={() => touch("phone")}
                  className={`pu-input ${phoneError ? "pu-input-error" : ""}`} />
                {phoneError && <span className="pu-error-msg">Incorrect Number</span>}
              </div>

              <Field label="Date" required hint="(dd-mm-yyyy)">
                <DatePicker value={form.date} onChange={(v) => set("date", v)} />
              </Field>
            </div>

            <div className="pu-grid4" style={{ marginBottom: 18 }}>
              <div className="pu-field">
                <label className="pu-field-label">
                  CNIC<span className="pu-hint">(xxxxx-xxxxxxx-x)</span>
                </label>
                <input type="text" placeholder="Enter CNIC No." value={form.cnic} maxLength={15}
                  onChange={(e) => set("cnic", formatCnic(e.target.value))} onBlur={() => touch("cnic")}
                  className={`pu-input ${cnicError ? "pu-input-error" : ""}`} />
                {cnicError && <span className="pu-error-msg">Incorrect CNIC</span>}
              </div>

              <div className="pu-field" style={{ gridColumn: "span 3" }}>
                <label className="pu-field-label">Seller Address <span className="pu-req">*</span></label>
                <TextInput value={form.address} onChange={(v) => set("address", v)} placeholder="Enter Seller Address" />
              </div>
            </div>

            <hr className="pu-divider" />

            <SectionHead title="Vehicle Details" sub="Essential Vehicle Information For Smooth Record Processing" />

            <div className="pu-grid4" style={{ marginBottom: 18 }}>
              <Field label="Brand / Maker" required>
                <SelectWithOther value={form.brand} onChange={(v) => set("brand", v)} options={BRANDS} placeholder="Select Brand / Maker" />
              </Field>
              <Field label="Model Year" required>
                <SelectInput value={form.modelYear} onChange={(v) => set("modelYear", v)} options={YEARS} placeholder="Select Model Year" />
              </Field>
              <Field label="Engine CC" required>
                <SelectWithOther value={form.engineCC} onChange={(v) => set("engineCC", v)} options={ENGINE_CC} placeholder="Select Engine CC" />
              </Field>
              <Field label="Color" required>
                <SelectWithOther value={form.color} onChange={(v) => set("color", v)} options={COLORS} placeholder="Select Color" />
              </Field>
            </div>

            <div className="pu-grid4" style={{ marginBottom: 18 }}>
              <Field label="Chassis No." required>
                <TextInput value={form.chassis} onChange={(v) => set("chassis", v)} placeholder="Enter Chassis Number" />
              </Field>
              <Field label="Engine No." required>
                <TextInput value={form.engineNo} onChange={(v) => set("engineNo", v)} placeholder="Enter Engine Number" />
              </Field>
              <Field label="Registration No." required>
                <TextInput value={form.regNo} onChange={(v) => set("regNo", v)} placeholder="Enter Registration Number" />
              </Field>
              <Field label="Status" required>
                <SelectInput value={form.status} onChange={(v) => set("status", v)} options={STATUSES} placeholder="Select Status" />
              </Field>
            </div>

            <div className="pu-balance-row" style={{ marginBottom: 18 }}>
              <Field label="Purchase Price" required>
                <TextInput type="number" placeholder="Enter Purchase Price" value={form.purchasePrice}
                  onChange={(v) => { set("purchasePrice", v); set("balanceAmount", ""); }} />
              </Field>
              <Field label="Paid Amount" required>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" placeholder="Enter Paid Amount" value={form.paidAmount}
                    onChange={(e) => { set("paidAmount", e.target.value); set("balanceAmount", ""); }}
                    className="pu-input" style={{ flex: 1 }} />
                  <button onClick={calcBalance} className="pu-calc-btn">Calculate Balance</button>
                </div>
              </Field>
              <Field label="Balance Amount" required>
                <TextInput type="number" placeholder="Balance Amount" value={form.balanceAmount} onChange={() => { }} readOnly />
              </Field>
              <Field label="Expenses" required>
                <TextInput type="number" placeholder="Enter Your Expenses" value={form.expenses} onChange={(v) => set("expenses", v)} />
              </Field>
            </div>

            <div className="pu-sale-row" style={{ marginBottom: 18 }}>
              <div className="pu-field">
                <label className="pu-field-label">
                  Sale Price <span className="pu-req">*</span>
                  <span className="pu-for-inventory">For Inventory</span>
                </label>
                <TextInput type="number" placeholder="Enter Sale Price" value={form.salePrice} onChange={(v) => set("salePrice", v)} />
              </div>
              <Field label="Remarks" style={{ gridColumn: "span 3" }}>
                <TextInput placeholder="Enter Your Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
              </Field>
            </div>

            <hr className="pu-divider" />

            <SectionHead title="List Of Received Documents" sub="Organised Document List For Administrative Reference" />
            <div className="pu-docs-top">
              {TOP_DOCS.map((doc) => (
                <label key={doc} className="pu-check-label">
                  <input type="checkbox" checked={form.topDocs[doc]}
                    onChange={(e) => setForm((p) => ({ ...p, topDocs: { ...p.topDocs, [doc]: e.target.checked } }))}
                    className="pu-checkbox" />
                  {doc}
                </label>
              ))}
            </div>
            <div className="pu-docs-bottom">
              {BOTTOM_DOCS.map((doc) => (
                <label key={doc} className="pu-check-label">
                  <input type="radio" name="biometric" checked={form.biometric === doc}
                    onChange={() => set("biometric", doc)} className="pu-radio" />
                  {doc}
                </label>
              ))}
            </div>

            <hr className="pu-divider" />

            <SectionHead title="Witnesses Details" sub="Witness Information For Record Authentication" />

            <div style={{ marginBottom: 10 }}>
              <p className="pu-witness-label">First Witness</p>
              <div className="pu-grid3" style={{ marginBottom: 0 }}>
                <Field label="Witness Name" required>
                  <TextInput value={form.witness1Name} onChange={(v) => set("witness1Name", v)} placeholder="Enter Witness Name" />
                </Field>

                <div className="pu-field">
                  <label className="pu-field-label">
                    Phone Number<span className="pu-req">*</span>
                    <span className="pu-hint">(03xx-xxxxxxx)</span>
                  </label>
                  <input type="text" placeholder="Enter Phone Number" value={form.witness1Phone} maxLength={12}
                    onChange={(e) => set("witness1Phone", formatPhone(e.target.value))} onBlur={() => touch("w1Phone")}
                    className={`pu-input ${w1PhoneError ? "pu-input-error" : ""}`} />
                  {w1PhoneError && <span className="pu-error-msg">Incorrect Number</span>}
                </div>

                <div className="pu-field">
                  <label className="pu-field-label">
                    CNIC<span className="pu-hint">(xxxxx-xxxxxxx-x)</span>
                  </label>
                  <input type="text" placeholder="Enter CNIC No." value={form.witness1Cnic} maxLength={15}
                    onChange={(e) => set("witness1Cnic", formatCnic(e.target.value))} onBlur={() => touch("w1Cnic")}
                    className={`pu-input ${w1CnicError ? "pu-input-error" : ""}`} />
                  {w1CnicError && <span className="pu-error-msg">Incorrect CNIC</span>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <p className="pu-witness-label">Second Witness</p>
              <div className="pu-grid3" style={{ marginBottom: 0 }}>
                <Field label="Witness Name" required>
                  <TextInput value={form.witness2Name} onChange={(v) => set("witness2Name", v)} placeholder="Enter Witness Name" />
                </Field>

                <div className="pu-field">
                  <label className="pu-field-label">
                    Phone Number<span className="pu-req">*</span>
                    <span className="pu-hint">(03xx-xxxxxxx)</span>
                  </label>
                  <input type="text" placeholder="Enter Phone Number" value={form.witness2Phone} maxLength={12}
                    onChange={(e) => set("witness2Phone", formatPhone(e.target.value))} onBlur={() => touch("w2Phone")}
                    className={`pu-input ${w2PhoneError ? "pu-input-error" : ""}`} />
                  {w2PhoneError && <span className="pu-error-msg">Incorrect Number</span>}
                </div>

                <div className="pu-field">
                  <label className="pu-field-label">
                    CNIC<span className="pu-hint">(xxxxx-xxxxxxx-x)</span>
                  </label>
                  <input type="text" placeholder="Enter CNIC No." value={form.witness2Cnic} maxLength={15}
                    onChange={(e) => set("witness2Cnic", formatCnic(e.target.value))} onBlur={() => touch("w2Cnic")}
                    className={`pu-input ${w2CnicError ? "pu-input-error" : ""}`} />
                  {w2CnicError && <span className="pu-error-msg">Incorrect CNIC</span>}
                </div>
              </div>
            </div>

            <div className="pu-footer">
              {savedRecord ? (
                <>
                  <button onClick={() => printReceipt(savedRecord, savedSerial, savedTime)} className="pu-btn-print">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Receipt
                  </button>
                  <button onClick={resetForm} className="pu-btn-new">+ New Entry</button>
                </>
              ) : (
                <>
                  <button onClick={savePurchase} disabled={loading} className="pu-btn pu-btn-save">
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button onClick={requestReset} className="pu-btn pu-btn-reset">Reset</button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        icon="refresh"
        tone="danger"
        title="Reset form?"
        message="All entered details will be cleared and cannot be recovered."
        confirmLabel="Reset"
        cancelLabel="Keep Editing"
        onConfirm={() => { resetForm(); setConfirmReset(false); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
