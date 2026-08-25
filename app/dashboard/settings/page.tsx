"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../_components/Sidebar";
import { dmSans } from "../_components/fonts";
import { UserIcon } from "../_components/icons";

const TEAL = "#1a4a4a", BORDER = "#e7e8ec", LABEL = "#2a2d35", MUTED = "#8a909e";

function parseMobiles(raw: unknown): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}

function Field({ label, value, onChange, placeholder, type = "text", optional = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div className="st-field">
      <label className="st-label">
        {label}
        {optional && <span className="st-optional"> (Optional)</span>}
      </label>
      <input
        className="st-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [showroomId, setShowroomId] = useState("Sh001");
  const [showroomName, setShowroomName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [mobiles, setMobiles] = useState<string[]>([]);
  const [gmail, setGmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

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
          setShowroomId(d.showroom_id || "Sh001");
          setShowroomName(d.showroom_name || "");
          setOwnerName(d.owner_name || "");
          setAddress(d.address || "");
          setMobiles(parseMobiles(d.mobile_numbers));
          setGmail(d.gmail || "");
          setInstagram(d.instagram || "");
          setFacebook(d.facebook || "");
          setWebsite(d.website || "");
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

  return (
    <div className={dmSans.className + " st-shell"}>
      <style>{`
        .st-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .st-main { flex: 1; min-width: 0; }

        .st-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid ${BORDER};
        }
        .st-breadcrumb { font-size: .95rem; color: #16171b; font-weight: 700; }
        .st-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57; transition: background .15s;
        }
        .st-avatar:hover { background: #eef0f2; }

        .st-content { padding: 28px 32px 48px; }
        .st-card {
          box-sizing: border-box; background: #fff; border: 1px solid ${BORDER}; border-radius: 14px;
          padding: 28px 32px 34px; width: 100%;
          box-shadow: 0 4px 18px rgba(20,20,25,.05);
        }
        .st-card-title { font-size: 1.05rem; font-weight: 700; color: #16171b; margin-bottom: 8px; }
        .st-card-subtitle { font-size: .82rem; color: ${MUTED}; line-height: 1.65; margin-bottom: 26px; }

        .st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; }
        .st-span-2 { grid-column: 1 / -1; }
        .st-field { display: flex; flex-direction: column; gap: 6px; }
        .st-label { font-size: .8rem; font-weight: 600; color: ${LABEL}; }
        .st-optional { font-size: .74rem; font-weight: 400; color: ${MUTED}; }
        .st-input {
          box-sizing: border-box; width: 100%; background: #fafbfc; border: 1px solid ${BORDER};
          border-radius: 8px; padding: 10px 14px; font-size: .85rem; color: #16171b;
          outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s;
        }
        .st-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(26,74,74,.1); }
        .st-input::placeholder { color: #b8c0cc; }
        .st-input-ro {
          box-sizing: border-box; width: 100%; background: #f0f1f3; border: 1px solid ${BORDER};
          border-radius: 8px; padding: 10px 14px; font-size: .85rem; color: #6b7078;
          font-family: inherit;
        }
        .st-label-row { display: flex; align-items: baseline; justify-content: space-between; }
        .st-hint { font-size: .72rem; color: ${MUTED}; font-weight: 400; }

        .st-mobile-row { display: flex; gap: 10px; }
        .st-mobile-input { flex: 1; }
        .st-add-btn {
          flex-shrink: 0; background: ${TEAL}; color: #fff; border: none; border-radius: 8px;
          padding: 0 20px; font-size: .82rem; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: background .15s, transform .15s;
        }
        .st-add-btn:hover { background: #143a3a; transform: translateY(-1px); }
        .st-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .st-chip {
          display: inline-flex; align-items: center; gap: 6px; background: #f0f4f4;
          border: 1px solid #d3e2e2; border-radius: 20px; padding: 5px 8px 5px 12px;
          font-size: .78rem; color: ${LABEL};
        }
        .st-chip-remove {
          background: none; border: none; cursor: pointer; color: #c0392b; font-weight: 700;
          font-size: .9rem; line-height: 1; padding: 2px 4px; display: flex; align-items: center;
        }

        .st-save-row { margin-top: 26px; }
        .st-save-btn {
          background: ${TEAL}; color: #fff; border: none; border-radius: 8px;
          padding: 11px 30px; font-size: .85rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: background .15s, transform .15s, box-shadow .15s;
        }
        .st-save-btn:hover:not(:disabled) { background: #143a3a; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(26,74,74,.25); }
        .st-save-btn:disabled { opacity: .65; cursor: not-allowed; }

        .st-toast {
          position: fixed; bottom: 32px; right: 32px; padding: 12px 22px; border-radius: 8px;
          color: #fff; font-size: .85rem; font-weight: 600; z-index: 9999;
          box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .st-toast-success { background: #1a7a4a; }
        .st-toast-error { background: #c0392b; }

        @media (max-width: 900px) {
          .st-shell { flex-direction: column; }
          .st-content { padding: 20px; }
        }
        @media (max-width: 720px) {
          .st-grid { grid-template-columns: 1fr; }
          .st-span-2 { grid-column: auto; }
        }
        @media (max-width: 640px) {
          .st-card { padding: 20px 18px 24px; }
          .st-mobile-row { flex-direction: column; }
          .st-add-btn { padding: 10px 0; }
        }
      `}</style>

      <Sidebar />

      <div className="st-main">
        <div className="st-topbar">
          <span className="st-breadcrumb">General Settings</span>
          <button className="st-avatar" aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="st-content">
          <AnimatePresence>
            {toast && (
              <motion.div
                className={`st-toast ${toast.type === "success" ? "st-toast-success" : "st-toast-error"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="st-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="st-card-title">Settings</div>
            <p className="st-card-subtitle">
              Manage your showroom details. This information will appear on receipts,
              reports and your public profile.
            </p>

            <div className="st-grid">
              <div className="st-field">
                <div className="st-label-row">
                  <label className="st-label">Showroom ID</label>
                  <span className="st-hint">ID Will Be Auto Generated</span>
                </div>
                <div className="st-input-ro">{showroomId}</div>
              </div>

              <Field label="Showroom Name" value={showroomName} onChange={setShowroomName} placeholder="Your showroom name" />
              <Field label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Full name of owner" />

              <div className="st-field st-span-2">
                <label className="st-label">Address</label>
                <input className="st-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Area, City" autoComplete="off" />
              </div>

              <div className="st-field st-span-2">
                <label className="st-label">Mobile Number</label>
                <div className="st-mobile-row">
                  <input
                    className="st-input st-mobile-input"
                    type="tel"
                    value={mobileInput}
                    onChange={e => setMobileInput(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddMobile(); } }}
                    autoComplete="off"
                  />
                  <button className="st-add-btn" onClick={handleAddMobile}>Add More</button>
                </div>
                {mobiles.length > 0 && (
                  <div className="st-chips">
                    {mobiles.map(num => (
                      <span key={num} className="st-chip">
                        {num}
                        <button className="st-chip-remove" onClick={() => handleRemoveMobile(num)} title="Remove">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Field label="Gmail" value={gmail} onChange={setGmail} type="email" placeholder="yourshop@gmail.com" optional />
              <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="instagram.com/yourhandle" optional />
              <Field label="Facebook" value={facebook} onChange={setFacebook} placeholder="facebook.com/yourpage" optional />
              <Field label="Website" value={website} onChange={setWebsite} placeholder="www.yourwebsite.com" optional />
            </div>

            <div className="st-save-row">
              <button className="st-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
