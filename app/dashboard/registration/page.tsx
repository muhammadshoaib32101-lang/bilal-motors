"use client";

import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

// --- Types --------------------------------------------------------------------

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

// --- Constants ----------------------------------------------------------------

const BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "United", "Ravi", "Road Prince",
  "Hi Speed", "Super Star", "Unique", "Sohrab", "Power", "Crown", "Eagle",
  "Toyota", "Kia", "Hyundai", "Changan", "MG", "DFSK (Prince)", "Proton",
  "Regal", "FAW", "Daehan",
];
const YEARS = Array.from({ length: 36 }, (_, i) => 2025 - i);
const COLORS = ["Black", "White", "Red", "Blue", "Silver", "Grey", "Green", "Yellow", "Orange", "Brown", "Golden", "Purple", "Maroon"];
const ENGINE_CCS = ["70cc", "100cc", "110cc", "125cc", "150cc", "200cc", "250cc", "400cc", "660cc", "800cc", "1000cc", "1200cc", "1300cc", "1500cc", "1600cc", "1800cc", "2000cc"];
const NAV_ITEMS = ["Inventory", "Sales", "Purchase", "Registration", "Settings"];
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

// --- Styles -------------------------------------------------------------------

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
  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, margin: "28px 40px", padding: "32px 36px 36px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" },
  divider: { border: "none", borderTop: `1px solid ${BORDER}`, margin: "28px 0" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 20, rowGap: 18 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 20, rowGap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: ".78rem", fontWeight: 600, color: LABEL, display: "flex", alignItems: "center", gap: 4 },
  req: { color: ACCENT },
  hint: { fontWeight: 400, color: MUTED, fontSize: ".72rem", marginLeft: "auto" },
  input: {
    background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7,
    padding: "9px 13px", fontSize: ".83rem", color: "#2a2d35",
    width: "100%", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const, transition: "border-color .15s",
  },
  readOnly: { background: "#f0f2f5", color: MUTED, cursor: "not-allowed" },
  inputError: { background: "#fff8f7", border: `1px solid #e74c3c` },
  errorMsg: { fontSize: ".72rem", color: "#e74c3c", fontWeight: 600, marginTop: 1 },
  docsRow: { display: "flex", flexWrap: "wrap", gap: "10px 36px" },
  checkLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: LABEL, cursor: "pointer", userSelect: "none" },
  checkbox: { width: 15, height: 15, accentColor: TEAL, cursor: "pointer" },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 30 },
  btnSave: { background: TEAL, color: "#fff", border: "none", padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnReset: { background: "#fff", color: LABEL, border: `1px solid ${BORDER}`, padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnPrint: { background: "#fff", color: TEAL, border: `2px solid ${TEAL}`, padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  btnNewEntry: { background: TEAL, color: "#fff", border: "none", padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  toast: { position: "fixed", bottom: 32, right: 32, padding: "12px 22px", borderRadius: 8, color: "#fff", fontSize: ".85rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.18)" },
  toastSuccess: { background: "#1a7a4a" },
  toastError: { background: "#c0392b" },
  savedBanner: { background: "#f0faf5", border: "1.5px solid #4caf7d", borderRadius: 8, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  savedBannerText: { fontSize: ".87rem", color: "#1a7a4a", fontWeight: 600 },
};

// --- Calendar -----------------------------------------------------------------

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
  const navBtnStyle: CSSProperties = { background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: LABEL, fontSize: "1rem", fontWeight: 700 };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ ...s.input, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <span style={{ color: value ? "#2a2d35" : MUTED, fontSize: ".83rem" }}>{displayValue || "Select Date"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, zIndex: 500, boxShadow: "0 8px 32px rgba(0,0,0,.15)", minWidth: 290 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button onClick={prevMonth} style={navBtnStyle}>&lt;</button>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#2a2d35" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={navBtnStyle}>&gt;</button>
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
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 14px", fontSize: ".75px", fontWeight: 600, color: TEAL, cursor: "pointer" }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components -----------------------------------------------------------

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: ".95rem", fontWeight: 700, color: "#2a2d35", marginBottom: 3 }}>{title}</p>
      <p style={{ fontSize: ".78rem", color: MUTED }}>{sub}</p>
    </div>
  );
}

function Field({ label, required = false, children, style }: FieldProps) {
  return (
    <div style={{ ...s.field, ...style }}>
      <label style={s.fieldLabel}>{label}{required && <span style={s.req}>*</span>}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly = false }: TextInputProps) {
  return (
    <input type="text" placeholder={placeholder} readOnly={readOnly} value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      style={{ ...s.input, ...(readOnly ? s.readOnly : {}) }} />
  );
}

function SelectInput({ value, onChange, options, placeholder }: SelectInputProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={s.input}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
    </select>
  );
}

// --- Validation helpers -------------------------------------------------------

function digitsOnly(v: string) { return v.replace(/\D/g, ""); }
function validatePhone(v: string) { return digitsOnly(v).length === 11; }
function validateCnic(v: string) { return digitsOnly(v).length === 13; }

// --- Print Receipt ------------------------------------------------------------

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
  .fp-img{width:72px;height:72px;object-fit:contain;border:1px solid #ccc;border-radius:4px;display:block}
  .fp-box{display:flex;flex-direction:column;align-items:center}
  .sig-line{width:160px;border-top:1px solid #aaa;margin-top:40px;text-align:center;font-size:9px;color:#777;padding-top:3px}
  .doc-footer{border-top:1.5px solid #1a1a1a;margin-top:18px;padding-top:9px;text-align:center;font-size:10.5px;font-weight:500}
  .doc-footer .contact-label{font-weight:700;margin-right:4px}
  @media print{body{font-size:11px}.page{padding:14px 18px}@page{margin:8mm 10mm;size:A4}}
`;

function printReceipt(form: FormState, serialNumber: string, savedTime: string) {
  const formatDate = (d: string) => {
    if (!d) return "-";
    const dt = new Date(d + "T00:00:00");
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };
  const val = (v: string) => v || "-";
  const checkedDocs = (Object.entries(form.docs) as [DocKey, boolean][]).filter(([, v]) => v).map(([k]) => k);
  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Registration Sheet â€“ New Bilal Motors</title><style>${PRINT_CSS}</style></head><body><div class="page">
<div class="header"><div class="header-left"><h1>New Bilal Motors</h1><div class="shop-addr">Laiq Ali Chowk, Wah Cantt</div><div class="tagline">A trusted institution for buying and selling new and used motorcycles.</div></div><div class="header-right"><div class="sheet-title">Registration Sheet (New)</div><table><tr><td style="font-size:10.5px;padding:1px 8px;color:#666;white-space:nowrap;">Serial No.:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">SR-${serialNumber}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Date:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${formatDate(form.date)}</td></tr><tr><td style="font-size:10.5px;padding:1px 8px 1px 0;color:#666;white-space:nowrap;">Time:</td><td style="font-size:10.5px;font-weight:700;white-space:nowrap;">${savedTime}</td></tr></table></div></div>
<div class="section"><div class="section-title">Owner Details</div><div class="row"><div class="f"><div class="f-label">Name</div><div class="f-value">${val(form.name)}</div></div><div class="f"><div class="f-label">Father Name</div><div class="f-value">${val(form.fatherName)}</div></div><div class="f"><div class="f-label">CNIC</div><div class="f-value">${val(form.cnic)}</div></div><div class="f"><div class="f-label">Phone No.</div><div class="f-value">${val(form.phone)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Vehicle Details</div><div class="row"><div class="f"><div class="f-label">Brand/Maker</div><div class="f-value">${val(form.maker)}</div></div><div class="f"><div class="f-label">Model Year</div><div class="f-value">${val(form.modelYear)}</div></div><div class="f"><div class="f-label">Color</div><div class="f-value">${val(form.color)}</div></div><div class="f"><div class="f-label">Engine CC</div><div class="f-value">${val(form.engineCC)}</div></div></div><div class="row"><div class="f"><div class="f-label">Chassis No.</div><div class="f-value">${val(form.chassisNo)}</div></div><div class="f"><div class="f-label">Engine No.</div><div class="f-value">${val(form.engineNo)}</div></div><div class="f"><div class="f-label">Registration No. (New)</div><div class="f-value">${val(form.regNoNew)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="section-title">Payment Details</div><div class="price-box"><div class="f" style="flex:1"><div class="f-label">Amount</div><div class="f-value">RS. ${val(form.amount)}</div></div><div class="f" style="flex:2.5"><div class="f-label">Remarks</div><div class="f-value">${val(form.remarks)}</div></div></div></div>
<hr class="sec-divider"/>
<div class="section"><div class="docs-header">Received Documents</div><div class="docs-chips">${docsHtml}</div></div>
<div class="fp-section">${form.fingerprint ? `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><img class="fp-img" src="${form.fingerprint}" alt="Fingerprint"/></div>` : `<div class="fp-box"><div class="fp-label">Owner Fingerprint</div><div style="width:72px;height:72px;border:1px dashed #bbb;border-radius:4px;"></div></div>`}<div class="sig-line">Owner Signature</div></div>
<div class="doc-footer"><span class="contact-label">Contact No.</span>${FIXED_CONTACTS}</div>
</div><script>window.onload=function(){window.print();}<\/script></body></html>`;

  const win = window.open("", "_blank", "width=860,height=960");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Fingerprint Capture (ZKTeco ZKFinger WebAPI) ────────────────────────────

type FpStatus = "idle" | "connecting" | "ready" | "capturing" | "done" | "error";

function FingerprintCapture({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [status, setStatus] = useState<FpStatus>("idle");
  const [deviceSN, setDeviceSN] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const initScanner = async () => {
    setStatus("connecting");
    setErrMsg("");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    try {
      const res = await fetch("http://localhost:9999/ZKService", { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (data.ret === 0) {
        setDeviceSN(data.SN ?? data.devices?.[0]?.SN ?? "");
        setStatus("ready");
      } else {
        setErrMsg("Scanner device not found.");
        setStatus("error");
      }
    } catch {
      clearTimeout(timer);
      setErrMsg("ZKFinger service not running. Please start ZKFinger WebAPI on this PC.");
      setStatus("error");
    }
  };

  const capture = async () => {
    setStatus("capturing");
    setErrMsg("");
    try {
      const res = await fetch("http://localhost:9999/ZKService/GetFingers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ SN: deviceSN, timeout: 15000 }),
      });
      const data = await res.json();
      if (data.ret === 0 && data.img) {
        onChange("data:image/png;base64," + data.img);
        setStatus("done");
      } else {
        setErrMsg("Capture failed (code: " + data.ret + "). Please retry.");
        setStatus("ready");
      }
    } catch {
      setErrMsg("Scanner error. Check connection and retry.");
      setStatus("ready");
    }
  };

  const btnLabel: Record<FpStatus, string> = {
    idle: "Connect Scanner",
    connecting: "Connecting…",
    ready: "Capture Fingerprint",
    capturing: "Place finger on scanner…",
    done: "Re-capture",
    error: "Retry",
  };

  const isLoading = status === "connecting" || status === "capturing";
  const handleClick = status === "idle" || status === "error" ? initScanner : capture;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
        <button type="button" onClick={handleClick} disabled={isLoading}
          style={{
            background: status === "done" ? "#fff" : TEAL,
            color: status === "done" ? TEAL : "#fff",
            border: status === "done" ? `2px solid ${TEAL}` : "none",
            padding: "9px 18px", borderRadius: 7, fontSize: ".83rem",
            fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.65 : 1,
          }}>
          {btnLabel[status]}
        </button>
        {value && (
          <button type="button" onClick={() => { onChange(""); setStatus("ready"); }}
            style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "6px 14px", fontSize: ".78rem", color: "#c0392b", cursor: "pointer", fontWeight: 600 }}>
            Clear
          </button>
        )}
        {status === "capturing" && (
          <span style={{ fontSize: ".75rem", color: MUTED }}>Waiting for fingerprint…</span>
        )}
        {errMsg && (
          <span style={{ fontSize: ".75rem", color: "#c0392b", fontWeight: 600, maxWidth: 220, lineHeight: 1.4 }}>{errMsg}</span>
        )}
      </div>
      {value ? (
        <div style={{ border: `2px solid ${TEAL}`, borderRadius: 8, padding: 4, background: "#f0f6f6" }}>
          <img src={value} alt="Fingerprint" style={{ width: 100, height: 100, objectFit: "contain", display: "block" }} />
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

//--- Main Page ----------------------------------------------------------------

export default function NewRegistration() {
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

  const [form, setForm] = useState<FormState>(INIT_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savedRecord, setSavedRecord] = useState<FormState | null>(null);
  const [savedSerial, setSavedSerial] = useState<string>("-");
  const [savedTime, setSavedTime] = useState<string>("-");
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

  const handleLogout = () => router.push("/auth/login");

  const resetForm = () => {
    setForm(INIT_FORM);
    setTouched({});
    setSavedRecord(null);
    setSavedSerial("-");
    setSavedTime("-");
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
          <button style={s.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Page header */}
      <div style={s.pageHeader}>Registration Management</div>

      {/* Tabs */}
      <div style={s.tabsBar}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => handleTabClick(tab)}
            style={{ ...s.tab, ...(tab === "New Registration" ? s.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={s.card}>

        {/* Saved banner */}
        {savedRecord && (
          <div style={s.savedBanner}>
            <div>
              <div style={s.savedBannerText}>Registration saved - SR-{savedSerial}</div>
              <div style={{ fontSize: ".78rem", color: "#2a7a4a", marginTop: 2 }}>Saved at {savedTime}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.btnPrint} onClick={() => printReceipt(savedRecord, savedSerial, savedTime)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
              <button style={s.btnNewEntry} onClick={resetForm}>+ New Entry</button>
            </div>
          </div>
        )}

        {/* Owner Details */}
        <SectionHead title="Owner Details" sub="Enter the bike owner's personal information" />
        <div style={s.grid4}>
          <Field label="Name" required>
            <TextInput value={form.name} onChange={v => set("name", v)} placeholder="Full name" />
          </Field>
          <Field label="Father Name" required>
            <TextInput value={form.fatherName} onChange={v => set("fatherName", v)} placeholder="Father's name" />
          </Field>
          <div style={s.field}>
            <label style={s.fieldLabel}>CNIC<span style={s.hint}>(xxxxx-xxxxxxx-x)</span></label>
            <input type="text" placeholder="Enter Cnic" value={form.cnic} maxLength={15}
              onChange={e => set("cnic", e.target.value)} onBlur={() => touch("cnic")}
              style={{ ...s.input, ...(cnicError ? s.inputError : {}) }} />
            {cnicError && <span style={s.errorMsg}>Incorrect CNIC</span>}
          </div>
          <div style={s.field}>
            <label style={s.fieldLabel}>Phone No.<span style={s.hint}>(03xx-xxxxxxx)</span></label>
            <input type="text" placeholder="Enter Phone Number" value={form.phone} maxLength={11}
              onChange={e => set("phone", e.target.value)} onBlur={() => touch("phone")}
              style={{ ...s.input, ...(phoneError ? s.inputError : {}) }} />
            {phoneError && <span style={s.errorMsg}>Incorrect Number</span>}
          </div>
        </div>

        <hr style={s.divider} />

        {/* Vehicle Details */}
        <SectionHead title="Vehicle Details" sub="Registration and identification numbers" />
        <div style={s.grid4}>
          <Field label="Brand/Maker" required>
            <SelectInput value={form.maker} onChange={v => set("maker", v)} options={BRANDS} placeholder="Select maker" />
          </Field>
          <Field label="Model Year" required>
            <SelectInput value={form.modelYear} onChange={v => set("modelYear", v)} options={YEARS} placeholder="Select year" />
          </Field>
          <Field label="Color">
            <SelectInput value={form.color} onChange={v => set("color", v)} options={COLORS} placeholder="Select color" />
          </Field>
          <Field label="Engine CC">
            <SelectInput value={form.engineCC} onChange={v => set("engineCC", v)} options={ENGINE_CCS} placeholder="Select CC" />
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

        <hr style={s.divider} />

        {/* Payment Details */}
        <SectionHead title="Payment Details" sub="Fee charged and any additional notes" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3.12fr", columnGap: 20, rowGap: 18 }}>
          <Field label="Amount">
            <input type="text" placeholder="Enter amount (PKR)" value={form.amount}
              onChange={e => set("amount", e.target.value)}
              style={s.input} />
          </Field>
          <Field label="Remarks">
            <TextInput value={form.remarks} onChange={v => set("remarks", v)} placeholder="Any remarks or notes" />
          </Field>
        </div>

        <hr style={s.divider} />

        {/* Documents */}
        <SectionHead title="Documents" sub="Check all documents received" />
        <div style={s.docsRow}>
          {DOCS.map(doc => (
            <label key={doc} style={s.checkLabel}>
              <input type="checkbox" style={s.checkbox}
                checked={form.docs[doc]}
                onChange={e => setForm(p => ({ ...p, docs: { ...p.docs, [doc]: e.target.checked } }))} />
              {doc}
            </label>
          ))}
        </div>

        <hr style={s.divider} />

        {/* Fingerprint */}
        <SectionHead title="Fingerprint" sub="Scan owner's fingerprint using ZKTeco scanner" />
        <FingerprintCapture value={form.fingerprint} onChange={v => set("fingerprint", v)} />

        <div style={s.footer}>
          {savedRecord ? (
            <>
              <button style={s.btnPrint} onClick={() => printReceipt(savedRecord, savedSerial, savedTime)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
              <button style={s.btnNewEntry} onClick={resetForm}>+ New Entry</button>
            </>
          ) : (
            <>
              <button style={s.btnReset} onClick={resetForm}>Reset</button>
              <button style={s.btnSave} onClick={saveRegistration} disabled={loading}>
                {loading ? "Saving..." : "Save Registration"}
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

