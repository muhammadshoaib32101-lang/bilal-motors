"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { dmSans } from "./fonts";
import { MenuIcon, CloseIcon } from "./icons";
import {
  SidebarHomeIcon, SidebarInventoryIcon, SidebarSalesIcon,
  SidebarPurchaseIcon, SidebarRegistrationIcon, SidebarExportIcon,
  SidebarHelpIcon, SidebarSettingsIcon, SidebarLogoutIcon,
} from "./nav-icons";
import ConfirmDialog from "./ConfirmDialog";

type NavItem = { label: string; href: string; icon: (p: { size?: number; className?: string }) => React.JSX.Element };

const MAIN_MENU: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: SidebarHomeIcon },
  { label: "Inventory", href: "/dashboard/inventory", icon: SidebarInventoryIcon },
  { label: "Sales", href: "/dashboard/sales/newSale", icon: SidebarSalesIcon },
  { label: "Purchase", href: "/dashboard/purchase", icon: SidebarPurchaseIcon },
  { label: "Registration", href: "/dashboard/registration", icon: SidebarRegistrationIcon },
  { label: "Export", href: "/dashboard/export", icon: SidebarExportIcon },
];

const HELP_MENU: NavItem[] = [
  { label: "Help & Center", href: "/dashboard/help", icon: SidebarHelpIcon },
  { label: "Settings", href: "/dashboard/settings", icon: SidebarSettingsIcon },
];

export function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavLink({ item, active, onNavigate, index }: { item: NavItem; active: boolean; onNavigate: (href: string) => void; index: number }) {
  const Icon = item.icon;
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.25, ease: "easeOut" }}
      onClick={() => onNavigate(item.href)}
      className="sb-nav-link"
      data-active={active}
    >
      <Icon size={17} />
      <span>{item.label}</span>
    </motion.button>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleNavigate = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/auth/login?loggedout=1");
  };

  const SidebarContent = (
    <>
      <div className="sb-brand">
        <div className="sb-brand-title">Showroom Management</div>
        <div className="sb-brand-sub">Powered By ImTechNow</div>
      </div>

      <div className="sb-section">
        <div className="sb-section-label">Main Menu</div>
        <nav className="sb-nav">
          {MAIN_MENU.map((item, i) => (
            <NavLink key={item.href} item={item} index={i} active={isActiveRoute(pathname, item.href)} onNavigate={handleNavigate} />
          ))}
        </nav>
      </div>

      <div className="sb-section">
        <div className="sb-section-label">Help &amp; Setting</div>
        <nav className="sb-nav">
          {HELP_MENU.map((item, i) => (
            <NavLink key={item.href} item={item} index={i} active={isActiveRoute(pathname, item.href)} onNavigate={handleNavigate} />
          ))}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * (HELP_MENU.length), duration: 0.25, ease: "easeOut" }}
            onClick={() => setConfirmLogout(true)}
            className="sb-nav-link"
          >
            <SidebarLogoutIcon size={17} />
            <span>Logout</span>
          </motion.button>
        </nav>
      </div>
    </>
  );

  return (
    <div className={dmSans.className}>
      <style>{`
        .sb-shell {
          box-sizing: border-box;
          width: 220px;
          min-width: 220px;
          background: #fff;
          border-right: 1px solid #e7e8ec;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          padding: 22px 16px 20px;
        }
        .sb-brand-title { font-size: .95rem; font-weight: 700; color: #17181c; letter-spacing: -.1px; }
        .sb-brand-sub { font-size: .72rem; color: #9a9ea6; margin-top: 3px; font-weight: 400; }
        .sb-section { margin-top: 26px; }
        .sb-section-label { font-size: .7rem; color: #adb1b8; font-weight: 600; margin: 0 8px 8px; }
        .sb-nav { display: flex; flex-direction: column; gap: 2px; }
        .sb-nav-link {
          box-sizing: border-box;
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          font-size: .84rem; font-weight: 500; color: #4b4f57;
          background: none; border: none; cursor: pointer;
          text-align: left; width: 100%; font-family: inherit;
          transition: background .15s, color .15s;
        }
        .sb-nav-link:hover { background: #f4f5f7; color: #17181c; }
        .sb-nav-link[data-active="true"] { background: #eef0f2; color: #111214; font-weight: 600; }

        .sb-mobile-bar {
          display: none;
        }

        @media (max-width: 900px) {
          .sb-shell { display: none; }
          .sb-mobile-bar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 18px; background: #fff; border-bottom: 1px solid #e7e8ec;
          }
          .sb-mobile-brand { font-size: .92rem; font-weight: 700; color: #17181c; }
          .sb-mobile-btn {
            box-sizing: border-box;
            background: none; border: 1px solid #e3e5e9; border-radius: 8px;
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #17181c;
          }
          .sb-drawer {
            position: fixed; inset: 0; z-index: 1000;
          }
          .sb-drawer-overlay { position: absolute; inset: 0; background: rgba(15,17,20,.45); }
          .sb-drawer-panel {
            box-sizing: border-box;
            position: absolute; top: 0; left: 0; bottom: 0; width: 260px;
            background: #fff; padding: 20px 16px; display: flex; flex-direction: column;
            box-shadow: 8px 0 30px rgba(0,0,0,.18);
          }
          .sb-drawer-close {
            box-sizing: border-box;
            position: absolute; top: 16px; right: -44px;
            width: 34px; height: 34px; border-radius: 50%;
            background: #fff; border: none; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #17181c;
          }
        }
      `}</style>

      <div className="sb-mobile-bar">
        <span className="sb-mobile-brand">Showroom Management</span>
        <button className="sb-mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <MenuIcon size={18} />
        </button>
      </div>

      <aside className="sb-shell">{SidebarContent}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="sb-drawer">
            <motion.div
              className="sb-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="sb-drawer-panel"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <button className="sb-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <CloseIcon size={16} />
              </button>
              {SidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmLogout}
        icon="logout"
        tone="danger"
        title="Log out?"
        message="You will need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
