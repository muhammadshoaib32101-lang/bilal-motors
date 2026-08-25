"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./_components/Sidebar";
import { dmSans } from "./_components/fonts";
import { UserIcon, ArrowRightIcon } from "./_components/icons";
import {
  CardInventoryIcon, CardSalesIcon, CardPurchaseIcon,
  CardRegistrationIcon, CardExportIcon, CardInsightsIcon, InfoIcon, VersionIcon,
} from "./_components/nav-icons";

type Feature = {
  title: string;
  description: string;
  href: string;
  icon: (p: { size?: number; className?: string }) => React.JSX.Element;
};

const FEATURES: Feature[] = [
  {
    title: "Inventory Management",
    description: "Track every bike in stock, from arrival to sale, with live status updates.",
    href: "/dashboard/inventory",
    icon: CardInventoryIcon,
  },
  {
    title: "Sales Management",
    description: "Record new sales, print receipts, and keep a complete sales history.",
    href: "/dashboard/sales/newSale",
    icon: CardSalesIcon,
  },
  {
    title: "Purchase Management",
    description: "Log individual and showroom purchases with full seller and payment details.",
    href: "/dashboard/purchase",
    icon: CardPurchaseIcon,
  },
  {
    title: "Process of Registration",
    description: "Handle new registrations and ownership transfers, all in one place.",
    href: "/dashboard/registration",
    icon: CardRegistrationIcon,
  },
  {
    title: "Export of Data",
    description: "Export your records for backups, audits, or reporting whenever needed.",
    href: "/dashboard/export",
    icon: CardExportIcon,
  },
  {
    title: "Management Insights",
    description: "Get a quick overview of showroom performance and key business numbers.",
    href: "/dashboard/overview",
    icon: CardInsightsIcon,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatShowroomId(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "sh_0001";
  return `sh_${digits.padStart(4, "0")}`;
}

export default function DashboardHome() {
  const router = useRouter();
  const [showroomName, setShowroomName] = useState("New Bilal Motors");
  const [showroomId, setShowroomId] = useState("sh_0001");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    setGreeting(getGreeting());
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.showroom_name) setShowroomName(data.settings.showroom_name);
          if (data.settings.showroom_id) setShowroomId(formatShowroomId(data.settings.showroom_id));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={dmSans.className + " home-shell"}>
      <style>{`
        .home-shell { display: flex; align-items: flex-start; min-height: 100vh; background: #fafafb; }
        .home-main { flex: 1; min-width: 0; }

        .home-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: #fff; border-bottom: 1px solid #e7e8ec;
        }
        .home-breadcrumb { font-size: .85rem; color: #6b6f78; font-weight: 500; }
        .home-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e3e5e9; background: #f7f7f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #4b4f57;
        }
        .home-avatar:hover { background: #eef0f2; }

        .home-content { max-width: 900px; margin: 0 auto; padding: 44px 24px 64px; }

        .home-greeting { text-align: center; }
        .home-greeting h1 {
          font-size: 1.5rem; font-weight: 700; color: #16171b;
          line-height: 1.45; letter-spacing: -.2px;
        }
        .home-badge-row { display: flex; justify-content: center; margin-top: 18px; }
        .home-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f2f3f5; border: 1px solid #e6e7eb; border-radius: 999px;
          padding: 7px 16px; font-size: .78rem; color: #4b4f57; font-weight: 500;
          box-shadow: 0 2px 8px rgba(20,20,25,.05);
        }
        .home-badge strong { color: #16171b; font-weight: 700; }

        .home-hero {
          margin-top: 32px; border-radius: 16px; overflow: hidden;
          height: 300px; position: relative; background: #111;
          box-shadow: 0 12px 32px rgba(20,20,25,.12);
        }
        .home-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .home-grid {
          margin-top: 36px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }
        .home-card {
          background: #fff; border: 1px solid #e7e8ec; border-radius: 12px;
          padding: 20px; cursor: pointer;
          box-shadow: 0 4px 14px rgba(20,20,25,.06);
        }
        .home-card-icon {
          width: 44px; height: 44px; border-radius: 10px;
          border: 1px solid #e3e5e9; background: #f9f9fa;
          display: flex; align-items: center; justify-content: center;
          color: #16171b;
        }
        .home-card-title { font-size: .9rem; font-weight: 700; color: #16171b; margin-top: 14px; }
        .home-card-desc { font-size: .78rem; color: #7c8087; margin-top: 6px; line-height: 1.6; }

        .home-help-bar {
          margin-top: 28px; display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px 16px;
          background: #f2f3f5; border: 1px solid #e6e7eb; border-radius: 10px;
          padding: 14px 20px;
          box-shadow: 0 4px 14px rgba(20,20,25,.05);
          transition: box-shadow .2s, transform .2s;
        }
        .home-help-bar:hover { box-shadow: 0 8px 22px rgba(20,20,25,.09); transform: translateY(-2px); }
        .home-help-left { display: flex; align-items: center; gap: 10px; color: #3b3e44; font-size: .85rem; font-weight: 500; }
        .home-help-link {
          display: flex; align-items: center; gap: 4px;
          font-size: .82rem; font-weight: 600; color: #16171b;
          background: none; border: none; cursor: pointer;
          text-decoration: none;
        }
        .home-help-link svg { transition: transform .2s; }
        .home-help-link:hover svg { transform: translateX(3px); }
        .home-help-link:hover { color: #000; }

        .home-version-bar {
          margin-top: 12px; display: flex; align-items: center; gap: 10px;
          background: #16171b; color: #fff; border-radius: 10px;
          padding: 13px 20px; font-size: .83rem; font-weight: 500;
          box-shadow: 0 6px 18px rgba(20,20,25,.14);
          transition: box-shadow .2s, transform .2s;
        }
        .home-version-bar:hover { box-shadow: 0 10px 26px rgba(20,20,25,.22); transform: translateY(-2px); }

        @media (max-width: 900px) {
          .home-shell { flex-direction: column; }
        }
        @media (max-width: 720px) {
          .home-grid { grid-template-columns: repeat(2, 1fr); }
          .home-hero { height: 220px; }
        }
        @media (max-width: 480px) {
          .home-grid { grid-template-columns: 1fr; }
          .home-content { padding: 32px 16px 48px; }
          .home-help-bar { flex-direction: column; align-items: flex-start; }
          .home-help-link { align-self: flex-end; }
          .home-version-bar { font-size: .78rem; padding: 12px 16px; }
        }
      `}</style>

      <Sidebar />

      <div className="home-main">
        <div className="home-topbar">
          <span className="home-breadcrumb">Home</span>
          <button className="home-avatar" onClick={() => router.push("/dashboard/settings")} aria-label="Account">
            <UserIcon size={18} />
          </button>
        </div>

        <div className="home-content">
          <motion.div
            className="home-greeting"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h1>
              {greeting},
              <br />
              Have A Nice Day, {showroomName}!
            </h1>
          </motion.div>

          <motion.div
            className="home-badge-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <span className="home-badge">
              Your Showroom&apos;s ID: <strong>{showroomId}</strong>
            </span>
          </motion.div>

          <motion.div
            className="home-hero"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <img src="/images/d3be24c91db9efcfffa42a2c1a011dbb4fc060ec.jpg" alt="Bilal Motors" />
          </motion.div>

          <div className="home-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="home-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                  whileHover={{ y: -4, boxShadow: "0 10px 26px rgba(20,20,25,.08)" }}
                  onClick={() => router.push(f.href)}
                >
                  <div className="home-card-icon">
                    <Icon size={20} />
                  </div>
                  <div className="home-card-title">{f.title}</div>
                  <div className="home-card-desc">{f.description}</div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="home-help-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.55, ease: "easeOut" }}
          >
            <span className="home-help-left">
              <InfoIcon size={18} />
              Facing Problem while using a system!
            </span>
            <button className="home-help-link" onClick={() => router.push("/dashboard/help")}>
              Contact Us <ArrowRightIcon size={15} />
            </button>
          </motion.div>

          <motion.div
            className="home-version-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.62, ease: "easeOut" }}
          >
            <VersionIcon size={16} />
            System Version: 1.0.1
          </motion.div>
        </div>
      </div>
    </div>
  );
}
