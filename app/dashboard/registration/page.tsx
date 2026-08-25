"use client";

import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "../_components/Sidebar";
import { dmSans } from "../_components/fonts";
import { UserIcon } from "../_components/icons";
import ConfirmDialog from "../_components/ConfirmDialog";

// Types

type DocKey = "Registration Card" | "Number Plates" | "File";

interface FormState {
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  maker: string;
  modelYear: string;
  color: string;
  engineCC: string;
  chassisNo: string;
  engineNo: string;
  regNoNew: string;
  amount: string;
  remarks: string;
  date: string;
  fingerprint: string;
  docs: Record<DocKey, boolean>;
}

interface FieldProps { label: string; required?: boolean; children: ReactNode; style?: CSSProperties; }
interface TextInputProps { value: string; onChange: (v: string) => void; placeholder: string; readOnly?: boolean; }
interface SelectInputProps { value: string; onChange: (v: string) => void; options: (string | number)[]; placeholder: string; }

// Constants

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);
const COLORS = ["Black", "White", "Red", "Blue", "Silver", "Grey", "Green", "Yellow", "Orange", "Brown", "Golden", "Purple", "Maroon"];
const ENGINE_CCS = ["70cc", "100cc", "110cc", "125cc", "150cc", "200cc", "250cc", "400cc", "660cc", "800cc", "1000cc", "1200cc", "1300cc", "1500cc", "1600cc", "1800cc", "2000cc"];
const TABS = ["New Registration", "Transfer", "History"];
const DOCS: DocKey[] = ["Registration Card", "Number Plates", "File"];
const FIXED_CONTACTS = "0300-5257278, 0333-5766432, 0313-5479941";

const INIT_FORM: FormState = {
  name: "", fatherName: "", cnic: "", phone: "",
  maker: "", modelYear: "", color: "", engineCC: "",
  chassisNo: "", engineNo: "", regNoNew: "",
  amount: "", remarks: "", date: "",
  fingerprint: "",
  docs: { "Registration Card": false, "Number Plates": false, "File": false },
};

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#e7e8ec", LABEL = "#444b5a", MUTED = "#8a909e";

// Calendar

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
    <div ref={ref} className="rg-datepicker">
      <div onClick={() => setOpen(o => !o)} className="rg-input rg-date-trigger">
        <span style={{ color: value ? "#2a2d35" : MUTED }}>{displayValue || "Select Date"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      {open && (
        <div className="rg-date-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button onClick={prevMonth} className="rg-date-nav-btn">&#8249;</button>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#2a2d35" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="rg-date-nav-btn">&#8250;</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {WEEK_DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: ".7rem", fontWeight: 700, color: MUTED, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1, isSel = day === selectedDay, isToday = day === todayDay, isHov = day === hovered && !isSel;
              return (
                <button key={day} onClick={() => selectDay(day)} onMouseEnter={() => setHovered(day)} onMouseLeave={() => setHovered(null)}
                  style={{ border: "none", borderRadius: 7, padding: "6px 0", cursor: "pointer", fontSize: ".82rem", fontWeight: isSel || isToday ? 700 : 400, background: isSel ? TEAL : isHov ? "#e8f0f0" : isToday ? "#f0f6f6" : "transparent", color: isSel ? "#fff" : isToday && !isHov ? TEAL : "#2a2d35", outline: isToday && !isSel ? `1.5px solid ${TEAL}` : "none", transition: "background .1s" }}>
                  {day}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => { const t = today; setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); selectDay(t.getDate()); }}
              className="rg-date-today-btn">Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="rg-section-title">{title}</p>
      <p className="rg-section-sub">{sub}</p>
    </div>
  );
}

function Field({ label, required = false, children, style }: FieldProps) {
  return (
    <div className="rg-field" style={style}>
      <label className="rg-field-label">{label}{required && <span className="rg-req">*</span>}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly = false }: TextInputProps) {
  return (
    <input type="text" placeholder={placeholder} readOnly={readOnly} value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      className={`rg-input ${readOnly ? "rg-input-readonly" : ""}`} />
  );
}

function SelectInput({ value, onChange, options, placeholder }: SelectInputProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rg-input rg-select">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
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
        className="rg-input rg-select"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
        <option value="__other__">Other</option>
      </select>
      {showCustom && (
        <input type="text" placeholder="Type custom value..." value={value} onChange={(e) => onChange(e.target.value)} className="rg-input" autoFocus />
      )}
    </div>
  );
}

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
  .price-box{border:1px solid #ccc;border-radius:5px;padding:10px 14px;background:#fafafa;display:flex;gap:0}
  .price-box .f-value{font-size:13px;font-weight:700}
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

function printReceipt(form: FormState, serialNumber: string, savedTime: string) {
  const formatDate = (d: string) => {
    if (!d) return '-';
    const dt = new Date(d + "T00:00:00");
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };
  const val = (v: string) => v || '-';
  const checkedDocs = (Object.entries(form.docs) as [DocKey, boolean][]).filter(([, v]) => v).map(([k]) => k);
  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Registration Sheet – New Bilal Motors</title><style>${PRINT_CSS}</style></head><body><div class="page">
<div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Registration Sheet (New)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;">Serial No.:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">SR-${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${formatDate(form.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${savedTime}</td></tr></table></div></div>
<div class="section"><div class="section-title">Owner Details</div><div class="row"><div class="f"><div class="f-label">Name</div><div class="f-value">${val(form.name)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${val(form.fatherName)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${val(form.cnic)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${val(form.phone)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand/Maker</div><div class="f-value">${val(form.maker)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${val(form.modelYear)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${val(form.color)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${val(form.engineCC)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${val(form.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${val(form.engineNo)}</div></div><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${val(form.regNoNew)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Payment Details</div><div class="price-box"><div class="f" style="flex:1"><div class="f-label">Amount</div><div class="f-value">RS. ${val(form.amount)}</div></div><div class="f" style="flex:2.5"><div class="f-label">Remarks</div><div class="f-value">${val(form.remarks)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="docs-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div>
<div class="fp-section">${form.fingerprint ? `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><div style="border:2px solid #1a4a4a;border-radius:8px;padding:4px;background:#f0f6f6;display:inline-block"><svg width="80" height="80" viewBox="0 0 100 100" style="display:block"><defs><clipPath id="fpc"><ellipse cx="50" cy="50" rx="37" ry="47"/></clipPath></defs><image href="${form.fingerprint}" x="0" y="0" width="100" height="100" clip-path="url(#fpc)" preserveAspectRatio="xMidYMid slice"/></svg></div><div class="fp-status attested">Biometrically Attested</div></div>` : `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><div style="border:2px solid #d8dde6;border-radius:8px;padding:4px;background:#fafbfc;display:inline-block"><svg width="80" height="80" viewBox="0 0 100 100" style="display:block"><ellipse cx="50" cy="50" rx="37" ry="47" fill="none" stroke="#d8dde6" stroke-width="2" stroke-dasharray="5 3"/></svg></div><div class="fp-status not-attested">Not Attested</div></div>`}<div class="sig-line">Owner Signature</div></div>
<div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div>
</div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

// Fingerprint Capture (ZKTeco ZKFinger WebAPI) — logic unchanged

function FingerprintCapture({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const connectScanner = async () => {
    setConnecting(true);
    setErrMsg("");

    const tryOnce = async (): Promise<boolean> => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      try {
        const res = await fetch("http://localhost:9999/ZKService", { signal: ctrl.signal });
        clearTimeout(timer);
        const data = await res.json();
        return data.ret === 0;
      } catch {
        clearTimeout(timer);
        return false;
      }
    };

    if (await tryOnce()) {
      setConnected(true);
      setConnecting(false);
      return;
    }

    try {
      await fetch("/api/fingerprint/launch", { method: "POST" });
    } catch {
      setErrMsg("Scanner service start nahi hui. fingerprint-bridge/start.bat manually chalao.");
      setConnecting(false);
      return;
    }

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      if (await tryOnce()) {
        setConnected(true);
        setConnecting(false);
        return;
      }
    }

    setErrMsg("Scanner service start nahi hui. fingerprint-bridge/start.bat manually chalao.");
    setConnecting(false);
  };

  const captureFingerprint = async () => {
    setCapturing(true);
    setErrMsg("");
    try {
      const res = await fetch("http://localhost:9999/ZKService/GetFingers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeout: 15000 }),
      });
      const data = await res.json();
      if (data.ret === 0 && data.img) {
        onChange("data:image/bmp;base64," + data.img);
      } else {
        setErrMsg(`Capture failed (code: ${data.ret}). ${data.msg || "Dobara try karo."}`);
      }
    } catch {
      setErrMsg("Scanner error. Connection check karo aur retry karo.");
    } finally {
      setCapturing(false);
    }
  };

  const busy = connecting || capturing;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 210 }}>
        <button type="button" onClick={connectScanner} disabled={busy} className="rg-fp-btn"
          style={{
            background: connected ? "#f0faf5" : TEAL,
            color: connected ? "#1a7a4a" : "#fff",
            border: connected ? "1.5px solid #4caf7d" : "none",
            opacity: connecting ? 0.65 : 1,
            cursor: busy ? "not-allowed" : "pointer",
          }}>
          {connecting ? "Connecting..." : connected ? "Scanner Connected" : "Connect Scanner"}
        </button>

        <button type="button" onClick={captureFingerprint} disabled={!connected || busy} className="rg-fp-btn"
          style={{
            background: (!connected || busy) ? "#f0f2f5" : TEAL,
            color: (!connected || busy) ? MUTED : "#fff",
            border: "none",
            opacity: capturing ? 0.65 : 1,
            cursor: (!connected || busy) ? "not-allowed" : "pointer",
          }}>
          {capturing ? "Place finger on scanner..." : "Capture Fingerprint"}
        </button>

        {value && (
          <button type="button" onClick={() => onChange("")} className="rg-fp-clear-btn">
            Clear
          </button>
        )}

        {capturing && <span style={{ fontSize: ".75rem", color: MUTED }}>Ungali scanner pe rakho...</span>}
        {errMsg && <span style={{ fontSize: ".75rem", color: "#c0392b", fontWeight: 600, maxWidth: 230, lineHeight: 1.4 }}>{errMsg}</span>}
      </div>

      {value ? (
        <div style={{ border: `2px solid ${TEAL}`, borderRadius: 8, padding: 4, background: "#f0f6f6" }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: "block" }}>
            <defs>
              <clipPath id="fp-thumb-clip">
                <ellipse cx="50" cy="50" rx="37" ry="47" />
              </clipPath>
            </defs>
            <image href={value} x="0" y="0" width="100" height="100" clipPath="url(#fp-thumb-clip)" preserveAspectRatio="xMidYMid slice" />
          </svg>
        </div>
      ) : (
        <div style={{ width: 100, height: 100, border: `2px dashed ${BORDER}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "#fafbfc" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.4">
            <path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2"/><path d="M6 11c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
            <path d="M3 11c0-5 4-9 9-9s9 4 9 9"/><path d="M10 17c0 1.1.9 2 2 2"/>
            <path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4v-3"/>
          </svg>
          <span style={{ fontSize: ".68rem", color: MUTED }}>No scan</span>
        </div>
      )}
    </div>
  );
}

// Main Page

export default function NewRegistration() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INIT_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savedRecord, setSavedRecord] = useState<FormState | null>(null);
  const [savedSerial, setSavedSerial] = useState<string>('');
  const [savedTime, setSavedTime] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }));
  const phoneError = touched.phone && form.phone && !validatePhone(form.phone);
  const cnicError  = touched.cnic  && form.cnic  && !validateCnic(form.cnic);

  const set = (key: keyof Omit<FormState, "docs">, val: string) =>
    setForm(p => ({ ...p, [key]: val }));

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabClick = (tab: string) => {
    if (tab === "New Registration") router.push("/dashboard/registration");
    else if (tab === "Transfer") router.push("/dashboard/registration/transfer");
    else router.push("/dashboard/registration/history");
  };

  const [confirmReset, setConfirmReset] = useState(false);
  const hasFormData = JSON.stringify(form) !== JSON.stringify(INIT_FORM);

  const resetForm = () => {
    setForm(INIT_FORM);
    setTouched({});
    setSavedRecord(null);
    setSavedSerial('');
    setSavedTime('');
  };

  const requestReset = () => {
    if (hasFormData) setConfirmReset(true);
    else resetForm();
  };

  const saveRegistration = async () => {
    if (!form.name.trim()) { showToast("Name is required.", "error"); return; }
    if (!form.fatherName.trim()) { showToast("Father name is required.", "error"); return; }
    if (!form.maker) { showToast("Maker is required.", "error"); return; }
    if (!form.modelYear) { showToast("Model year is required.", "error"); return; }
    if (!form.chassisNo.trim()) { showToast("Chassis number is required.", "error"); return; }
    if (!form.engineNo.trim()) { showToast("Engine number is required.", "error"); return; }
    if (!form.date) { showToast("Date is required.", "error"); return; }

    setTouched(p => ({ ...p, phone: true, cnic: true }));
    if (form.phone && !validatePhone(form.phone)) { showToast("Phone number must be exactly 11 digits.", "error"); return; }
    if (form.cnic && !validateCnic(form.cnic)) { showToast("CNIC must be exactly 13 digits.", "error"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/registration/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, fatherName: form.fatherName,
          cnic: form.cnic, phone: form.phone,
          maker: form.maker, modelYear: form.modelYear,
          color: form.color, engineCC: form.engineCC, chassisNo: form.chassisNo,
          engineNo: form.engineNo, regNoNew: form.regNoNew, date: form.date,
          amount: form.amount, remarks: form.remarks,
          fingerprint: form.fingerprint,
          docs: form.docs,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        setSavedSerial(String(json.serialNumber).padStart(4, "0"));
        setSavedTime(time);
        setSavedRecord({ ...form });
        showToast("Registration saved successfully.", "success");
      } else {
        showToast(json.message || "Failed to save.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dmSans.className + " rg-shell"}>
      <style>{`
        .rg-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .rg-main { flex: 1; min-width: 0; }

        .rg-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid ${BORDER};
        }
        .rg-breadcrumb { font-size: .95rem; color: #16171b; font-weight: 700; }
        .rg-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57; transition: background .15s;
        }
        .rg-avatar:hover { background: #eef0f2; }

        .rg-tabs { display: flex; gap: 4px; padding: 0 32px; background: #fff; border-bottom: 1px solid ${BORDER}; flex-wrap: wrap; }
        .rg-tab {
          padding: 13px 6px; margin-right: 26px; font-size: .85rem; font-weight: 500; color: ${MUTED};
          background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer;
          font-family: inherit; transition: color .15s, border-color .15s;
        }
        .rg-tab:hover { color: #2a2d35; }
        .rg-tab-active { color: #16171b; font-weight: 700; border-bottom: 2px solid ${TEAL}; }

        .rg-content { padding: 28px 32px 48px; }
        .rg-card {
          background: #fff; border: 1px solid ${BORDER}; border-radius: 14px;
          padding: 30px 34px 34px; box-shadow: 0 4px 18px rgba(20,20,25,.05);
        }

        .rg-section-title { font-size: .95rem; font-weight: 700; color: #16171b; margin-bottom: 3px; }
        .rg-section-sub { font-size: .78rem; color: ${MUTED}; }

        .rg-divider { border: none; border-top: 1px solid ${BORDER}; margin: 28px 0; }

        .rg-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 20px; row-gap: 18px; }
        .rg-pay-row { display: grid; grid-template-columns: 1fr 3.12fr; column-gap: 20px; row-gap: 18px; }

        .rg-field { display: flex; flex-direction: column; gap: 6px; }
        .rg-field-label { font-size: .78rem; font-weight: 600; color: ${LABEL}; display: flex; align-items: center; gap: 4px; }
        .rg-req { color: ${ACCENT}; }
        .rg-hint { font-weight: 400; color: ${MUTED}; font-size: .72rem; margin-left: auto; }

        .rg-input {
          box-sizing: border-box;
          background: #fafbfc; border: 1px solid ${BORDER}; border-radius: 8px;
          padding: 10px 13px; font-size: .83rem; color: #2a2d35;
          width: 100%; outline: none; font-family: inherit;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .rg-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); background: #fff; }
        .rg-input-error { background: #fff8f7; border-color: #e74c3c; }
        .rg-input-readonly { background: #f0f2f5; color: ${MUTED}; cursor: not-allowed; }
        .rg-error-msg { font-size: .72rem; color: #e74c3c; font-weight: 600; margin-top: 1px; }

        .rg-select {
          appearance: none; -webkit-appearance: none; -moz-appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238a909e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 15px;
          padding-right: 34px;
        }

        .rg-datepicker { position: relative; }
        .rg-date-trigger { display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
        .rg-date-panel {
          position: absolute; top: calc(100% + 6px); left: 0; background: #fff; border: 1px solid ${BORDER};
          border-radius: 12px; padding: 16px; z-index: 500; box-shadow: 0 8px 32px rgba(0,0,0,.15); min-width: 290px;
          box-sizing: border-box;
        }
        .rg-date-nav-btn {
          box-sizing: border-box; background: none; border: 1px solid ${BORDER}; border-radius: 6px;
          width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: ${LABEL}; font-size: 1rem; font-weight: 700;
        }
        .rg-date-today-btn {
          background: none; border: 1px solid ${BORDER}; border-radius: 6px; padding: 5px 14px;
          font-size: .75rem; font-weight: 600; color: ${TEAL}; cursor: pointer; font-family: inherit;
        }

        .rg-docs-row { display: flex; flex-wrap: wrap; gap: 10px 36px; }
        .rg-check-label { display: flex; align-items: center; gap: 9px; font-size: .82rem; color: ${LABEL}; cursor: pointer; user-select: none; }
        .rg-checkbox {
          appearance: none; -webkit-appearance: none; box-sizing: border-box;
          width: 17px; height: 17px; border: 1.5px solid #c7cbd1; border-radius: 5px;
          cursor: pointer; position: relative; flex-shrink: 0; transition: background .15s, border-color .15s;
        }
        .rg-checkbox:checked { background: ${TEAL}; border-color: ${TEAL}; }
        .rg-checkbox:checked::after {
          content: ""; position: absolute; left: 5px; top: 1px; width: 5px; height: 9px;
          border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }

        .rg-fp-btn {
          padding: 9px 18px; border-radius: 8px; font-size: .83rem; font-weight: 600;
          font-family: inherit; transition: background .15s, opacity .15s;
        }
        .rg-fp-clear-btn {
          background: none; border: 1px solid ${BORDER}; border-radius: 8px; padding: 6px 14px;
          font-size: .78rem; color: #c0392b; cursor: pointer; font-weight: 600; font-family: inherit;
        }

        .rg-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
        .rg-btn {
          border: none; border-radius: 8px; padding: 10px 28px; font-size: .85rem;
          font-weight: 600; cursor: pointer; font-family: inherit; transition: transform .15s, box-shadow .15s, background .15s, opacity .15s;
        }
        .rg-btn:hover { transform: translateY(-1px); }
        .rg-btn-save { background: ${TEAL}; color: #fff; }
        .rg-btn-save:hover { background: #143a3a; box-shadow: 0 6px 16px rgba(26,74,74,.25); }
        .rg-btn-save:disabled { opacity: .7; cursor: not-allowed; transform: none; }
        .rg-btn-reset { background: #fff; color: ${LABEL}; border: 1px solid ${BORDER}; }
        .rg-btn-reset:hover { background: #f4f5f7; }
        .rg-btn-print {
          background: #fff; color: ${TEAL}; border: 1.5px solid ${TEAL};
          padding: 9px 26px; border-radius: 8px; font-size: .85rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit;
          transition: background .15s;
        }
        .rg-btn-print:hover { background: #f0f6f6; }
        .rg-btn-new { background: ${TEAL}; color: #fff; border: none; padding: 9px 26px; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; }
        .rg-btn-new:hover { background: #143a3a; }

        .rg-saved-banner {
          background: #f0faf5; border: 1.5px solid #4caf7d; border-radius: 10px;
          padding: 14px 20px; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        }
        .rg-saved-banner-text { font-size: .87rem; color: #1a7a4a; font-weight: 600; }

        .rg-toast {
          position: fixed; bottom: 32px; right: 32px; padding: 12px 22px; border-radius: 8px;
          color: #fff; font-size: .85rem; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .rg-toast-success { background: #1a7a4a; }
        .rg-toast-error { background: #c0392b; }

        @media (max-width: 1100px) {
          .rg-grid4 { grid-template-columns: repeat(2, 1fr); }
          .rg-pay-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .rg-shell { flex-direction: column; }
        }
        @media (max-width: 640px) {
          .rg-content { padding: 20px 16px 32px; }
          .rg-card { padding: 22px 18px 26px; }
          .rg-grid4 { grid-template-columns: 1fr; }
          .rg-footer { flex-direction: column-reverse; }
          .rg-btn { width: 100%; }
        }
      `}</style>

      <Sidebar />

      <div className="rg-main">
        <div className="rg-topbar">
          <span className="rg-breadcrumb">Registration Management</span>
          <button className="rg-avatar" aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="rg-tabs">
          {TABS.map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)}
              className={`rg-tab ${tab === "New Registration" ? "rg-tab-active" : ""}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="rg-content">
          {toast && (
            <div className={`rg-toast ${toast.type === "success" ? "rg-toast-success" : "rg-toast-error"}`}>
              {toast.msg}
            </div>
          )}

          <motion.div
            className="rg-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >

            {savedRecord && (
              <div className="rg-saved-banner">
                <div>
                  <div className="rg-saved-banner-text">&#10003; Registration saved &mdash; SR-{savedSerial}</div>
                  <div style={{ fontSize: ".78rem", color: "#2a7a4a", marginTop: 2 }}>Saved at {savedTime}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="rg-btn-print" onClick={() => printReceipt(savedRecord, savedSerial, savedTime)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print
                  </button>
                  <button className="rg-btn-new" onClick={resetForm}>+ New Entry</button>
                </div>
              </div>
            )}

            <SectionHead title="Owner Details" sub="Enter the Bike Owner's Personal Information" />
            <div className="rg-grid4">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={v => set("name", v)} placeholder="Full name" />
              </Field>
              <Field label="Father Name" required>
                <TextInput value={form.fatherName} onChange={v => set("fatherName", v)} placeholder="Father's name" />
              </Field>
              <div className="rg-field">
                <label className="rg-field-label">CNIC<span className="rg-hint">(xxxxx-xxxxxxx-x)</span></label>
                <input type="text" placeholder="Enter Cnic" value={form.cnic} maxLength={15}
                  onChange={e => set("cnic", formatCnic(e.target.value))} onBlur={() => touch("cnic")}
                  className={`rg-input ${cnicError ? "rg-input-error" : ""}`} />
                {cnicError && <span className="rg-error-msg">Incorrect CNIC</span>}
              </div>
              <div className="rg-field">
                <label className="rg-field-label">Phone No.<span className="rg-hint">(03xx-xxxxxxx)</span></label>
                <input type="text" placeholder="Enter Phone Number" value={form.phone} maxLength={12}
                  onChange={e => set("phone", formatPhone(e.target.value))} onBlur={() => touch("phone")}
                  className={`rg-input ${phoneError ? "rg-input-error" : ""}`} />
                {phoneError && <span className="rg-error-msg">Incorrect Number</span>}
              </div>
            </div>

            <hr className="rg-divider" />

            <SectionHead title="Vehicle Details" sub="Registration and Identification Numbers" />
            <div className="rg-grid4">
              <Field label="Brand/Maker" required>
                <SelectWithOther value={form.maker} onChange={v => set("maker", v)} options={BRANDS} placeholder="Select maker" />
              </Field>
              <Field label="Model Year" required>
                <SelectInput value={form.modelYear} onChange={v => set("modelYear", v)} options={YEARS} placeholder="Select year" />
              </Field>
              <Field label="Color">
                <SelectWithOther value={form.color} onChange={v => set("color", v)} options={COLORS} placeholder="Select color" />
              </Field>
              <Field label="Engine CC">
                <SelectWithOther value={form.engineCC} onChange={v => set("engineCC", v)} options={ENGINE_CCS} placeholder="Select CC" />
              </Field>
              <Field label="Chassis No." required>
                <TextInput value={form.chassisNo} onChange={v => set("chassisNo", v)} placeholder="Chassis number" />
              </Field>
              <Field label="Engine No." required>
                <TextInput value={form.engineNo} onChange={v => set("engineNo", v)} placeholder="Engine number" />
              </Field>
              <Field label="Registration No. (New)">
                <TextInput value={form.regNoNew} onChange={v => set("regNoNew", v)} placeholder="New registration no." />
              </Field>
              <Field label="Date" required>
                <DatePicker value={form.date} onChange={v => set("date", v)} />
              </Field>
            </div>

            <hr className="rg-divider" />

            <SectionHead title="Payment Details" sub="Fee Charged and Any Additional Notes" />
            <div className="rg-pay-row">
              <Field label="Amount">
                <input type="text" placeholder="Enter amount (PKR)" value={form.amount}
                  onChange={e => set("amount", e.target.value)}
                  className="rg-input" />
              </Field>
              <Field label="Remarks">
                <TextInput value={form.remarks} onChange={v => set("remarks", v)} placeholder="Any remarks or notes" />
              </Field>
            </div>

            <hr className="rg-divider" />

            <SectionHead title="Documents" sub="Check All Documents Received" />
            <div className="rg-docs-row">
              {DOCS.map(doc => (
                <label key={doc} className="rg-check-label">
                  <input type="checkbox" className="rg-checkbox"
                    checked={form.docs[doc]}
                    onChange={e => setForm(p => ({ ...p, docs: { ...p.docs, [doc]: e.target.checked } }))} />
                  {doc}
                </label>
              ))}
            </div>

            <hr className="rg-divider" />

            <SectionHead title="Fingerprint" sub="Optional -- scan Owner's Fingerprint Using ZKTeco Scanner. Form Saves Without It." />
            <FingerprintCapture value={form.fingerprint} onChange={v => set("fingerprint", v)} />

            <div className="rg-footer">
              {savedRecord ? (
                <>
                  <button className="rg-btn-print" onClick={() => printReceipt(savedRecord, savedSerial, savedTime)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print
                  </button>
                  <button className="rg-btn-new" onClick={resetForm}>+ New Entry</button>
                </>
              ) : (
                <>
                  <button className="rg-btn rg-btn-reset" onClick={requestReset}>Reset</button>
                  <button className="rg-btn rg-btn-save" onClick={saveRegistration} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Registration'}
                  </button>
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
