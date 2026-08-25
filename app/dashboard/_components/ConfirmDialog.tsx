"use client";

import { motion, AnimatePresence } from "framer-motion";

export type ConfirmTone = "danger" | "neutral";

const ICONS: Record<string, (color: string) => React.JSX.Element> = {
  trash: (color) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  logout: (color) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  refresh: (color) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  warning: (color) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  icon?: keyof typeof ICONS;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  icon = "warning",
  tone = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = tone === "danger";
  const accent = isDanger ? "#e74c3c" : "#1a4a4a";
  const iconBg = isDanger ? "#fff0ee" : "#eef5f5";
  const iconBorder = isDanger ? "#fcd5cf" : "#c9dede";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: "fixed", inset: 0, background: "rgba(10,20,30,.6)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)",
          }}
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{ background: "#fff", borderRadius: 14, width: "min(420px, 90vw)", boxShadow: "0 24px 80px rgba(0,0,0,.3)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div style={{ padding: "32px 28px 20px", textAlign: "center" as const }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: iconBg,
                border: `2px solid ${iconBorder}`, display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 18px",
              }}>
                {ICONS[icon](accent)}
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2a2d35", marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: ".85rem", color: "#8a909e", lineHeight: 1.6 }}>{message}</div>
            </div>
            <div style={{ padding: "8px 28px 28px", display: "flex", gap: 10 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1, padding: "10px 0", background: "#fff", border: "1px solid #d8dde6",
                  borderRadius: 8, fontSize: ".85rem", fontWeight: 600, color: "#444b5a", cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1, padding: "10px 0", background: accent, border: "none", borderRadius: 8,
                  fontSize: ".85rem", fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Please wait..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
