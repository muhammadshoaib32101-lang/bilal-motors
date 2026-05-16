"use client";

import { useState, useEffect, useRef, CSSProperties, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // Witness fields
  witness1Name: string; witness1Phone: string; witness1Cnic: string;
  witness2Name: string; witness2Phone: string; witness2Cnic: string;
}

interface FieldProps { label: string; required?: boolean; hint?: string; children: ReactNode; style?: CSSProperties; }
interface TextInputProps { value: string; onChange: (v: string) => void; placeholder: string; type?: string; readOnly?: boolean; }
interface SelectInputProps { value: string; onChange: (v: string) => void; options: (string | number)[]; placeholder: string; }
interface SectionHeadProps { title: string; sub: string; }

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
const NAV_ITEMS = ["Inventory", "Sales", "Purchase", "Registration", "Settings"];
const TABS = ["Individual Purchase", "Showroom Purchase", "Purchase History"];
const TOP_DOCS: TopDocKey[] = ["CNIC", "File", "Smart card", "Number plates"];
const BOTTOM_DOCS = ["Advance bio-metric", "After sale bio-metric", "Pending bio-metric"];

// Fixed buyer details
const FIXED_BUYER_NAME = "New Bilal Motors";
const FIXED_BUYER_CNIC = "37406-1234567-0";

// Fixed footer contacts
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
  card: { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, margin: "28px 40px", padding: "32px 36px 36px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" },
  divider: { border: "none", borderTop: `1px solid ${BORDER}`, margin: "28px 0" },

  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 20, rowGap: 18 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: 20, rowGap: 18 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 20, rowGap: 18 },
  balanceRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 20, rowGap: 18, alignItems: "end" },
  saleRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 20, rowGap: 18 },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: ".78rem", fontWeight: 600, color: LABEL, display: "flex", alignItems: "center", gap: 4 },
  req: { color: ACCENT },
  hint: { fontWeight: 400, color: MUTED, fontSize: ".72rem", marginLeft: "auto" },
  forInventory: { fontWeight: 400, color: MUTED, fontSize: ".72rem", marginLeft: 6 },

  input: {
    background: "#fafbfc", border: `1px solid ${BORDER}`, borderRadius: 7,
    padding: "9px 13px", fontSize: ".83rem", color: "#2a2d35",
    width: "100%", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const, transition: "border-color .15s",
  },
  inputError: { background: "#fff8f7", border: `1px solid #e74c3c` },
  errorMsg: { fontSize: ".72rem", color: "#e74c3c", fontWeight: 600, marginTop: 1 },
  readOnly: { background: "#f0f2f5", color: MUTED, cursor: "not-allowed" },

  calcWrap: { display: "flex", flexDirection: "column", gap: 6 },
  calcBtn: { background: TEAL, color: "#fff", border: "none", borderRadius: 7, padding: "9px 16px", fontSize: ".9rem", cursor: "pointer", height: 39, display: "flex", alignItems: "center", justifyContent: "center" },

  docsTop: { display: "flex", flexWrap: "wrap", gap: "10px 36px", marginBottom: 12 },
  docsBottom: { display: "flex", flexWrap: "wrap", gap: "10px 36px" },
  checkLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: LABEL, cursor: "pointer", userSelect: "none" },
  checkbox: { width: 15, height: 15, accentColor: TEAL, cursor: "pointer" },

  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 30 },
  btnSave: { background: TEAL, color: "#fff", border: "none", padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnReset: { background: "#fff", color: LABEL, border: `1px solid ${BORDER}`, padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  btnPrint: {
    background: "#fff", color: TEAL, border: `2px solid ${TEAL}`,
    padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
  },
  btnNewEntry: {
    background: TEAL, color: "#fff", border: "none",
    padding: "9px 28px", borderRadius: 7, fontSize: ".85rem", fontWeight: 600,
    cursor: "pointer",
  },

  toast: { position: "fixed", bottom: 32, right: 32, padding: "12px 22px", borderRadius: 8, color: "#fff", fontSize: ".85rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.18)" },
  toastSuccess: { background: "#1a7a4a" },
  toastError: { background: "#c0392b" },

  savedBanner: {
    background: "#f0faf5", border: `1.5px solid #4caf7d`, borderRadius: 8,
    padding: "14px 20px", marginBottom: 24,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12,
  },
  savedBannerText: { fontSize: ".87rem", color: "#1a7a4a", fontWeight: 600 },
};

// â”€â”€â”€ Calendar Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const navBtnStyle: CSSProperties = {
    background: "none", border: `1px solid ${BORDER}`, borderRadius: 6,
    width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", color: LABEL, fontSize: "1rem", fontWeight: 700,
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ ...s.input, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <span style={{ color: value ? "#2a2d35" : MUTED, fontSize: ".83rem" }}>{displayValue || "Select Date"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, zIndex: 500, boxShadow: "0 8px 32px rgba(0,0,0,.15)", minWidth: 290 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button onClick={prevMonth} style={navBtnStyle}>â€¹</button>
            <span style={{ fontWeight: 700, fontSize: ".88rem", color: "#2a2d35" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={navBtnStyle}>â€º</button>
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
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 14px", fontSize: ".75rem", fontWeight: 600, color: TEAL, cursor: "pointer" }}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionHead({ title, sub }: SectionHeadProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: ".95rem", fontWeight: 700, color: "#2a2d35", marginBottom: 3 }}>{title}</p>
      <p style={{ fontSize: ".78rem", color: MUTED }}>{sub}</p>
    </div>
  );
}

function Field({ label, required = false, hint, children, style }: FieldProps) {
  return (
    <div style={{ ...s.field, ...style }}>
      <label style={s.fieldLabel}>
        {label}{required && <span style={s.req}>*</span>}
        {hint && <span style={s.hint}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", readOnly = false }: TextInputProps) {
  return (
    <input type={type} placeholder={placeholder} readOnly={readOnly} value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      style={{ ...s.input, ...(readOnly ? s.readOnly : {}) }} />
  );
}

function SelectInput({ value, onChange, options, placeholder }: SelectInputProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={s.input}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
    </select>
  );
}

// â”€â”€â”€ Validation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function digitsOnly(v: string) { return v.replace(/\D/g, ""); }
function validatePhone(v: string) { return digitsOnly(v).length === 11; }
function validateCnic(v: string) { return digitsOnly(v).length === 13; }

// â”€â”€â”€ Print Receipt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function printReceipt(form: FormState, serialNumber: string, savedTime: string) {
  const formatDate = (d: string) => {
    if (!d) return "â€”";
    const dt = new Date(d + "T00:00:00");
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  };

  const val = (v: string) => v || "â€”";

  // Build checked docs list
  const checkedDocs = (Object.entries(form.topDocs) as [TopDocKey, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => k);

  const docsHtml = checkedDocs.length > 0
    ? checkedDocs.map(d => `<span class="doc-chip">&#10003; ${d}</span>`).join("")
    : `<span class="none-text">No documents received</span>`;

  const bioHtml = form.biometric
    ? `<span class="bio-chip">&#9679; ${form.biometric}</span>`
    : `<span class="none-text">â€”</span>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Purchase Sheet â€“ New Bilal Motors</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1a1a1a;
      background: #fff;
      font-size: 11.5px;
      line-height: 1.4;
    }

    .page {
      padding: 22px 30px 18px;
      max-width: 780px;
      margin: 0 auto;
    }

    /* â”€â”€ Header â”€â”€ */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #1a1a1a;
      margin-bottom: 14px;
    }
    .header-left h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .header-left .shop-addr {
      font-size: 10.5px;
      color: #444;
      margin-bottom: 3px;
    }
    .header-left .tagline {
      font-size: 10px;
      color: #666;
      font-style: italic;
    }
    .header-right {
      text-align: right;
    }
    .header-right .sheet-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 6px;
    }
    .header-right table {
      margin-left: auto;
      border-collapse: collapse;
    }
    .header-right td {
      font-size: 10.5px;
      padding: 1px 0;
      color: #333;
    }
    .header-right td:first-child {
      padding-right: 6px;
      color: #666;
    }
    .header-right td:last-child {
      font-weight: 700;
      text-align: left;
    }

    /* â”€â”€ Sections â”€â”€ */
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #1a1a1a;
      padding-bottom: 5px;
      border-bottom: 1.5px solid #1a1a1a;
      margin-bottom: 11px;
    }

    /* â”€â”€ Field grid â”€â”€ */
    .row { display: flex; gap: 0; margin-bottom: 7px; }
    .row:last-child { margin-bottom: 0; }

    .f {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding-right: 14px;
    }
    .f:last-child { padding-right: 0; }

    .f-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
      margin-bottom: 2px;
    }
    .f-value {
      font-size: 12px;
      font-weight: 500;
      color: #1a1a1a;
      border-bottom: 1px dashed #bbb;
      padding-bottom: 4px;
      min-height: 22px;
    }

    /* Full-width field */
    .f-full { flex: 0 0 100%; padding-right: 0; }

    /* â”€â”€ Pricing box â”€â”€ */
    .price-box {
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 12px 14px;
      background: #fafafa;
    }
    .price-row { display: flex; gap: 0; margin-bottom: 10px; }
    .price-row:last-child { margin-bottom: 0; }
    .pf {
      flex: 1;
      padding-right: 14px;
    }
    .pf:last-child { padding-right: 0; }
    .pf-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
      margin-bottom: 2px;
    }
    .pf-value {
      font-size: 14px;
      font-weight: 800;
      color: #1a1a1a;
      border-bottom: 1px dashed #bbb;
      padding-bottom: 3px;
    }
    .remarks-row {
      border-top: 1px dashed #ccc;
      padding-top: 8px;
      margin-top: 8px;
    }
    .remarks-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
      margin-bottom: 3px;
    }
    .remarks-value {
      font-size: 11.5px;
      font-weight: 400;
      color: #333;
      min-height: 16px;
    }

    /* â”€â”€ Docs & Bio row â”€â”€ */
    .docs-bio-wrapper {
      display: flex;
      gap: 0;
      align-items: flex-start;
    }
    .docs-col { flex: 1.4; padding-right: 20px; }
    .bio-col  { flex: 1; border-left: 1px solid #ddd; padding-left: 16px; }

    .docs-bio-header {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #1a1a1a;
      margin-bottom: 7px;
    }
    .docs-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .doc-chip {
      border: 1px solid #888;
      border-radius: 3px;
      padding: 2px 9px;
      font-size: 10.5px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .bio-chip {
      display: inline-block;
      border: 1px solid #888;
      border-radius: 3px;
      padding: 2px 9px;
      font-size: 10.5px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .none-text { font-size: 11px; color: #888; }

    /* â”€â”€ Witnesses â”€â”€ */
    .witness-grid {
      display: flex;
      gap: 20px;
    }
    .witness-col {
      flex: 1;
    }
    .witness-col:first-child {
      padding-right: 20px;
      border-right: 1px solid #ddd;
    }
    .witness-col:last-child {
      padding-left: 0;
    }
    .w-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
      margin-bottom: 2px;
    }
    .w-value {
      font-size: 12px;
      font-weight: 500;
      color: #1a1a1a;
      border-bottom: 1px dashed #bbb;
      padding-bottom: 4px;
      min-height: 22px;
      margin-bottom: 9px;
    }
    .w-cnic-sig {
      display: flex;
      gap: 14px;
      margin-top: 4px;
    }
    .w-cnic-block { flex: 1; }
    .w-sig-block  { flex: 1.2; }
    .sig-line {
      width: 100%;
      border-bottom: 1px solid #888;
      height: 30px;
      display: block;
    }
    .sig-label-text {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
      margin-top: 3px;
    }

    /* â”€â”€ Footer â”€â”€ */
    .doc-footer {
      border-top: 1.5px solid #1a1a1a;
      margin-top: 18px;
      padding-top: 9px;
      text-align: center;
      font-size: 10.5px;
      color: #333;
      font-weight: 500;
    }
    .doc-footer .contact-label {
      font-weight: 700;
      margin-right: 4px;
    }

    /* â”€â”€ Divider between sections â”€â”€ */
    .sec-divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 13px 0 15px;
    }

    @media print {
      body { font-size: 11px; }
      .page { padding: 14px 18px; }
      @page { margin: 8mm 10mm; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- â•â•â• HEADER â•â•â• -->
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
  <td style="font-size:10.5px; padding:1px 8px; color:#666; white-space:nowrap; text-align:right;">Serial Number:</td>
  <td style="font-size:10.5px; font-weight:700; text-align:left; white-space:nowrap;">${serialNumber}</td>
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

  <!-- â•â•â• SELLER DETAILS â•â•â• -->
  <div class="section">
    <div class="section-title">Seller Details</div>
    <div class="row">
      <div class="f">
        <div class="f-label">Seller Name</div>
        <div class="f-value">${val(form.sellerName)}</div>
      </div>
      <div class="f">
        <div class="f-label">Father Name</div>
        <div class="f-value">${val(form.fatherName)}</div>
      </div>
      <div class="f">
        <div class="f-label">Phone No.</div>
        <div class="f-value">${val(form.phone)}</div>
      </div>
      <div class="f">
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

  <!-- â•â•â• VEHICLE DETAILS â•â•â• -->
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

  <!-- â•â•â• BUYER DETAILS â•â•â• -->
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

  <!-- â•â•â• PRICING DETAILS â•â•â• -->
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

  <!-- â•â•â• RECEIVED DOCUMENTS + BIO-METRIC â•â•â• -->
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

  <!-- â•â•â• WITNESSES DETAILS â•â•â• -->
  <div class="section">
    <div class="section-title">Witnesses Details</div>
    <div class="witness-grid">

      <!-- Witness 1 -->
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

      <!-- Witness 2 -->
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

  <!-- â•â•â• FOOTER â•â•â• -->
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PurchaseManagement() {
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

  const [form, setForm] = useState<FormState>(INIT_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [savedRecord, setSavedRecord] = useState<FormState | null>(null);
  const [savedSerial, setSavedSerial] = useState<string>("â€”");
  const [savedTime, setSavedTime] = useState<string>("â€”");

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

  const handleLogout = () => router.push("/auth/login");
  const resetForm = () => { setForm(INIT_FORM); setTouched({}); setSavedRecord(null); setSavedSerial("â€”"); setSavedTime("â€”"); };

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

    // Capture time at moment of saving
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
        // Use serial number from API response if available, fallback to id or sequential number
        const serial = json.serialNumber
          ? String(json.serialNumber).padStart(4, "0")
          : json.id
            ? String(json.id).padStart(4, "0")
            : "â€”";
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
    <div style={s.page}>

      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          {toast.msg}
        </div>
      )}

      {/* NAVBAR */}
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

      {/* TABS */}
      <div style={s.tabsBar}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => handleTabClick(tab)}
            style={{ ...s.tab, ...(tab === "Individual Purchase" ? s.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CARD */}
      <div style={s.card}>

        {/* â”€â”€ Saved success banner â”€â”€ */}
        {savedRecord && (
          <div style={s.savedBanner}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span style={s.savedBannerText}>Record saved successfully!</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => printReceipt(savedRecord, savedSerial, savedTime)} style={s.btnPrint}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Receipt
              </button>
              <button onClick={resetForm} style={s.btnNewEntry}>+ New Entry</button>
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* SELLER DETAILS                                     */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <SectionHead title="Seller Details" sub="Essential Seller Information For Vehicle Processing" />

        <div style={{ ...s.grid4, marginBottom: 18 }}>
          <Field label="Seller Name" required>
            <TextInput value={form.sellerName} onChange={(v) => set("sellerName", v)} placeholder="Enter Seller Name" />
          </Field>
          <Field label="Father Name" required>
            <TextInput value={form.fatherName} onChange={(v) => set("fatherName", v)} placeholder="Enter Father Name" />
          </Field>

          {/* Phone */}
          <div style={s.field}>
            <label style={s.fieldLabel}>
              Phone Number<span style={s.req}>*</span>
              <span style={s.hint}>(03xx-xxxxxxx)</span>
            </label>
            <input type="text" placeholder="Enter Phone Number" value={form.phone} maxLength={11}
              onChange={(e) => set("phone", e.target.value)} onBlur={() => touch("phone")}
              style={{ ...s.input, ...(phoneError ? s.inputError : {}) }} />
            {phoneError && <span style={s.errorMsg}>Incorrect Number</span>}
          </div>

          {/* Date */}
          <Field label="Date" required hint="(dd-mm-yyyy)">
            <DatePicker value={form.date} onChange={(v) => set("date", v)} />
          </Field>
        </div>

        <div style={{ ...s.grid4, marginBottom: 18 }}>
          {/* CNIC */}
          <div style={s.field}>
            <label style={s.fieldLabel}>
              CNIC<span style={s.hint}>(xxxxx-xxxxxxx-x)</span>
            </label>
            <input type="text" placeholder="Enter CNIC No." value={form.cnic} maxLength={15}
              onChange={(e) => set("cnic", e.target.value)} onBlur={() => touch("cnic")}
              style={{ ...s.input, ...(cnicError ? s.inputError : {}) }} />
            {cnicError && <span style={s.errorMsg}>Incorrect CNIC</span>}
          </div>

          <div style={{ ...s.field, gridColumn: "span 3" }}>
            <label style={s.fieldLabel}>Seller Address <span style={s.req}>*</span></label>
            <TextInput value={form.address} onChange={(v) => set("address", v)} placeholder="Enter Seller Address" />
          </div>
        </div>

        <hr style={s.divider} />

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* VEHICLE DETAILS                                    */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <SectionHead title="Vehicle Details" sub="Essential Vehicle Information For Smooth Record Processing" />

        <div style={{ ...s.grid4, marginBottom: 18 }}>
          <Field label="Brand / Maker" required>
            <SelectInput value={form.brand} onChange={(v) => set("brand", v)} options={BRANDS} placeholder="Select Brand / Maker" />
          </Field>
          <Field label="Model Year" required>
            <SelectInput value={form.modelYear} onChange={(v) => set("modelYear", v)} options={YEARS} placeholder="Select Model Year" />
          </Field>
          <Field label="Engine CC" required>
            <SelectInput value={form.engineCC} onChange={(v) => set("engineCC", v)} options={ENGINE_CC} placeholder="Select Engine CC" />
          </Field>
          <Field label="Color" required>
            <SelectInput value={form.color} onChange={(v) => set("color", v)} options={COLORS} placeholder="Select Color" />
          </Field>
        </div>

        <div style={{ ...s.grid4, marginBottom: 18 }}>
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

        {/* Price row */}
        <div style={{ ...s.balanceRow, marginBottom: 18 }}>
          <Field label="Purchase Price" required>
            <TextInput type="number" placeholder="Enter Purchase Price" value={form.purchasePrice}
              onChange={(v) => { set("purchasePrice", v); set("balanceAmount", ""); }} />
          </Field>
          <Field label="Paid Amount" required>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="number" placeholder="Enter Paid Amount" value={form.paidAmount}
                onChange={(e) => { set("paidAmount", e.target.value); set("balanceAmount", ""); }}
                style={{ ...s.input, flex: 1 }} />
              <button onClick={calcBalance} style={s.calcBtn}>â†’</button>
            </div>
          </Field>
          <Field label="Balance Amount" required>
            <TextInput type="number" placeholder="Balance Amount" value={form.balanceAmount} onChange={() => { }} readOnly />
          </Field>
          <Field label="Expenses" required>
            <TextInput type="number" placeholder="Enter Your Expenses" value={form.expenses} onChange={(v) => set("expenses", v)} />
          </Field>
        </div>

        <div style={{ ...s.saleRow, marginBottom: 18 }}>
          <div style={s.field}>
            <label style={s.fieldLabel}>
              Sale Price <span style={s.req}>*</span>
              <span style={s.forInventory}>For Inventory</span>
            </label>
            <TextInput type="number" placeholder="Enter Sale Price" value={form.salePrice} onChange={(v) => set("salePrice", v)} />
          </div>
          <Field label="Remarks" style={{ gridColumn: "span 3" }}>
            <TextInput placeholder="Enter Your Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
          </Field>
        </div>

        <hr style={s.divider} />

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* DOCUMENTS                                          */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <SectionHead title="List Of Received Documents" sub="Organised Document List For Administrative Reference" />
        <div style={s.docsTop}>
          {TOP_DOCS.map((doc) => (
            <label key={doc} style={s.checkLabel}>
              <input type="checkbox" checked={form.topDocs[doc]}
                onChange={(e) => setForm((p) => ({ ...p, topDocs: { ...p.topDocs, [doc]: e.target.checked } }))}
                style={s.checkbox} />
              {doc}
            </label>
          ))}
        </div>
        <div style={s.docsBottom}>
          {BOTTOM_DOCS.map((doc) => (
            <label key={doc} style={s.checkLabel}>
              <input type="radio" name="biometric" checked={form.biometric === doc}
                onChange={() => set("biometric", doc)} style={s.checkbox} />
              {doc}
            </label>
          ))}
        </div>

        <hr style={s.divider} />

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* WITNESS DETAILS                                    */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <SectionHead title="Witnesses Details" sub="Witness Information For Record Authentication" />

        {/* Witness 1 */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: ".78rem", fontWeight: 700, color: MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>
            First Witness
          </p>
          <div style={{ ...s.grid3, marginBottom: 0 }}>
            <Field label="Witness Name" required>
              <TextInput value={form.witness1Name} onChange={(v) => set("witness1Name", v)} placeholder="Enter Witness Name" />
            </Field>

            {/* W1 Phone */}
            <div style={s.field}>
              <label style={s.fieldLabel}>
                Phone Number<span style={s.req}>*</span>
                <span style={s.hint}>(03xx-xxxxxxx)</span>
              </label>
              <input type="text" placeholder="Enter Phone Number" value={form.witness1Phone} maxLength={11}
                onChange={(e) => set("witness1Phone", e.target.value)} onBlur={() => touch("w1Phone")}
                style={{ ...s.input, ...(w1PhoneError ? s.inputError : {}) }} />
              {w1PhoneError && <span style={s.errorMsg}>Incorrect Number</span>}
            </div>

            {/* W1 CNIC */}
            <div style={s.field}>
              <label style={s.fieldLabel}>
                CNIC<span style={s.hint}>(xxxxx-xxxxxxx-x)</span>
              </label>
              <input type="text" placeholder="Enter CNIC No." value={form.witness1Cnic} maxLength={15}
                onChange={(e) => set("witness1Cnic", e.target.value)} onBlur={() => touch("w1Cnic")}
                style={{ ...s.input, ...(w1CnicError ? s.inputError : {}) }} />
              {w1CnicError && <span style={s.errorMsg}>Incorrect CNIC</span>}
            </div>
          </div>
        </div>

        {/* Witness 2 */}
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: ".78rem", fontWeight: 700, color: MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>
            Second Witness
          </p>
          <div style={{ ...s.grid3, marginBottom: 0 }}>
            <Field label="Witness Name" required>
              <TextInput value={form.witness2Name} onChange={(v) => set("witness2Name", v)} placeholder="Enter Witness Name" />
            </Field>

            {/* W2 Phone */}
            <div style={s.field}>
              <label style={s.fieldLabel}>
                Phone Number<span style={s.req}>*</span>
                <span style={s.hint}>(03xx-xxxxxxx)</span>
              </label>
              <input type="text" placeholder="Enter Phone Number" value={form.witness2Phone} maxLength={11}
                onChange={(e) => set("witness2Phone", e.target.value)} onBlur={() => touch("w2Phone")}
                style={{ ...s.input, ...(w2PhoneError ? s.inputError : {}) }} />
              {w2PhoneError && <span style={s.errorMsg}>Incorrect Number</span>}
            </div>

            {/* W2 CNIC */}
            <div style={s.field}>
              <label style={s.fieldLabel}>
                CNIC<span style={s.hint}>(xxxxx-xxxxxxx-x)</span>
              </label>
              <input type="text" placeholder="Enter CNIC No." value={form.witness2Cnic} maxLength={15}
                onChange={(e) => set("witness2Cnic", e.target.value)} onBlur={() => touch("w2Cnic")}
                style={{ ...s.input, ...(w2CnicError ? s.inputError : {}) }} />
              {w2CnicError && <span style={s.errorMsg}>Incorrect CNIC</span>}
            </div>
          </div>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* FOOTER ACTIONS                                     */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div style={s.footer}>
          {savedRecord ? (
            <>
              <button onClick={() => printReceipt(savedRecord, savedSerial, savedTime)} style={s.btnPrint}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Receipt
              </button>
              <button onClick={resetForm} style={s.btnNewEntry}>+ New Entry</button>
            </>
          ) : (
            <>
              <button onClick={savePurchase} disabled={loading}
                style={{ ...s.btnSave, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Savingâ€¦" : "Save"}
              </button>
              <button onClick={resetForm} style={s.btnReset}>Reset</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
