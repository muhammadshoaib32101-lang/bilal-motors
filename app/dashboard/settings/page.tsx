"use client";

import { useState, useEffect, CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = ["Inventory", "Sales", "Purchase", "Registration", "Export", "Settings"];

const TEAL = "#1a4a4a", ACCENT = "#e05a2b", BORDER = "#d8dde6", LABEL = "#444b5a", MUTED = "#8a909e";

const s: Record<string, CSSProperties> = {
  page:         { fontFamily: "'DM Sans', sans-serif", background: "#f5f6f8", minHeight: "100vh", color: "#2a2d35" },
  nav:          { background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 40px", display: "flex", alignItems: "center", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 6px rgba(0,0,0,.06)" },
  brand:        { fontSize: "1.2rem", fontWeight: 700, marginRight: 40, whiteSpace: "nowrap" },
  navLinks:     { display: "flex", alignItems: "stretch", height: "100%", flex: 1, gap: 4 },
  navLink:      { display: "flex", alignItems: "center", padding: "0 18px", fontSize: ".875rem", fontWeight: 500, color: LABEL, background: "none", border: "none", cursor: "pointer", position: "relative", transition: "color .18s", flexDirection: "column", justifyContent: "center" },
  navLinkActive:{ color: TEAL, fontWeight: 600 },
  navUnderline: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: TEAL, borderRadius: "2px 2px 0 0" },
  navActions:   { display: "flex", gap: 10, marginLeft: "auto" },
  btnLogout:    { background: ACCENT, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: ".85rem", fontWeight: 600, cursor: "pointer" },
  pageHeader:   { background: TEAL, color: "#fff", padding: "14px 40px", fontSize: "1rem", fontWeight: 600 },

  content:      { maxWidth: 700, margin: "40px auto", padding: "0 24px 80px" },
  pageSub:      { fontSize: ".82rem", color: MUTED, marginBottom: 32, lineHeight: 1.75 },

  formRow:      { display: "flex", alignItems: "stretch", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", marginBottom: 12, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.04)" },
  formLbl:      { width: 148, minWidth: 148, padding: "14px 16px", fontSize: ".83rem", color: LABEL, fontWeight: 500, borderRight: `1px solid ${BORDER}`, background: "#fafbfc", display: "flex", alignItems: "center" },
  formInput:    { flex: 1, padding: "13px 16px", border: "none", outline: "none", fontSize: ".875rem", fontWeight: 500, color: "#1a1a1a", background: "transparent", fontFamily: "inherit" },
  formRoVal:    { flex: 1, padding: "13px 16px", fontSize: ".875rem", fontWeight: 500, color: "#666", background: "#f5f6f8", display: "flex", alignItems: "center" },
  noteText:     { fontSize: ".75rem", color: MUTED, textAlign: "right" as const, marginBottom: 14, marginTop: -8 },
  addBtn:       { background: TEAL, color: "#fff", border: "none", padding: "0 22px", cursor: "pointer", fontSize: ".83rem", fontWeight: 600, whiteSpace: "nowrap" as const },
  phoneList:    { fontSize: ".8rem", color: MUTED, textAlign: "center" as const, marginBottom: 14, marginTop: -8, letterSpacing: ".3px" },
  saveRow:      { display: "flex", justifyContent: "flex-end", marginTop: 28 },
  saveBtn:      { background: TEAL, color: "#fff", border: "none", padding: "12px 38px", borderRadius: 7, fontSize: ".9rem", fontWeight: 600, cursor: "pointer" },
  toast:        { position: "fixed" as const, bottom: 32, right: 32, padding: "12px 22px", borderRadius: 8, color: "#fff", fontSize: ".85rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.18)" },
  toastOk:      { background: "#1a7a4a" },
  toastErr:     { background: "#c0392b" },
};

// ── Field component at module level — prevents remount on every render ──────────
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={s.formRow}>
      <span style={s.formLbl}>{label}</span>
      <input
        className="sf"
        style={s.formInput}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

function parseMobiles(raw: unknown): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

export default function SettingsPage() {
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

  const [showroomId,   setShowroomId]   = useState("Sh001");
  const [showroomName, setShowroomName] = useState("");
  const [ownerName,    setOwnerName]    = useState("");
  const [address,      setAddress]      = useState("");
  const [mobileInput,  setMobileInput]  = useState("");
  const [mobiles,      setMobiles]      = useState<string[]>([]);
  const [gmail,        setGmail]        = useState("");
  const [instagram,    setInstagram]    = useState("");
  const [facebook,     setFacebook]     = useState("");
  const [website,      setWebsite]      = useState("");
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          const d = data.settings;
          setShowroomId(d.showroom_id     || "Sh001");
          setShowroomName(d.showroom_name || "");
          setOwnerName(d.owner_name       || "");
          setAddress(d.address            || "");
          setMobiles(parseMobiles(d.mobile_numbers));
          setGmail(d.gmail                || "");
          setInstagram(d.instagram        || "");
          setFacebook(d.facebook          || "");
          setWebsite(d.website            || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleAddMobile = () => {
    const val = mobileInput.trim();
    if (val && !mobiles.includes(val)) {
      setMobiles(m => [...m, val]);
      setMobileInput("");
    }
  };

  const handleRemoveMobile = (num: string) =>
    setMobiles(m => m.filter(x => x !== num));

  const handleSave = async () => {
    const allMobiles = mobileInput.trim()
      ? [...mobiles, mobileInput.trim()]
      : mobiles;
    if (mobileInput.trim()) { setMobiles(allMobiles); setMobileInput(""); }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showroomName, ownerName, address,
          mobileNumbers: allMobiles,
          gmail, instagram, facebook, website,
        }),
      });
      const data = await res.json();
      if (data.success) showToast("Settings saved successfully!", "success");
      else showToast(data.message || "Failed to save settings", "error");
    } catch {
      showToast("Network error. Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => router.push("/auth/login");

  return (
    <div style={s.page}>

      {/* Light placeholder styling — cannot be done with inline styles */}
      <style>{`
        .sf::placeholder { font-weight: 400; color: #b8c4cc; }
        .sf-mob::placeholder { font-weight: 400; color: #b8c4cc; }
      `}</style>

      {/* ── Navbar ── */}
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

      {/* ── Page Header Strip ── */}
      <div style={s.pageHeader}>General Settings</div>

      {/* ── Content ── */}
      <div style={s.content}>
        <p style={s.pageSub}>
          Manage your showroom details. This information will appear on receipts,
          reports, and your public profile.
        </p>

        {/* Showroom ID — read-only */}
        <div style={s.formRow}>
          <span style={s.formLbl}>Showroom ID</span>
          <span style={s.formRoVal}>{showroomId}</span>
        </div>
        <p style={s.noteText}>Auto-generated — cannot be changed.</p>

        <Field
          label="Showroom Name"
          value={showroomName}
          onChange={setShowroomName}
          placeholder="Your showroom name"
        />
        <Field
          label="Owner Name"
          value={ownerName}
          onChange={setOwnerName}
          placeholder="Full name of owner"
        />
        <Field
          label="Address"
          value={address}
          onChange={setAddress}
          placeholder="Street, Area, City"
        />

        {/* Mobile Number */}
        <div style={s.formRow}>
          <span style={s.formLbl}>Mobile Number</span>
          <input
            className="sf-mob"
            style={s.formInput}
            type="tel"
            value={mobileInput}
            onChange={e => setMobileInput(e.target.value)}
            placeholder="03XX-XXXXXXX"
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddMobile(); } }}
            autoComplete="off"
          />
          <button style={s.addBtn} onClick={handleAddMobile}>Add More</button>
        </div>
        {mobiles.length > 0 && (
          <p style={s.phoneList}>
            {mobiles.map((num, i) => (
              <span key={num}>
                {num}
                <span
                  onClick={() => handleRemoveMobile(num)}
                  style={{ marginLeft: 4, cursor: "pointer", color: "#c0392b", fontWeight: 700 }}
                  title="Remove"
                >×</span>
                {i < mobiles.length - 1 ? ",  " : ""}
              </span>
            ))}
          </p>
        )}

        <Field
          label="Gmail"
          value={gmail}
          onChange={setGmail}
          type="email"
          placeholder="yourshop@gmail.com"
        />
        <Field
          label="Instagram"
          value={instagram}
          onChange={setInstagram}
          placeholder="instagram.com/yourhandle"
        />
        <Field
          label="Facebook"
          value={facebook}
          onChange={setFacebook}
          placeholder="facebook.com/yourpage"
        />
        <Field
          label="Website"
          value={website}
          onChange={setWebsite}
          placeholder="www.yourwebsite.com"
        />

        {/* Save */}
        <div style={s.saveRow}>
          <button
            style={{ ...s.saveBtn, opacity: saving ? 0.65 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastOk : s.toastErr) }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
