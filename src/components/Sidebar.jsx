import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileUpload,
  FaFileAlt,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";

/* ─── Injected styles ─────────────────────────────────────────── */
const STYLES = `
  .ap-nav::-webkit-scrollbar { display: none; }
  .ap-nav { scrollbar-width: none; }

  @keyframes ap-badge-pop {
    0%   { transform: scale(0.5); opacity: 0; }
    72%  { transform: scale(1.18); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes ap-dot-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  .ap-badge-in   { animation: ap-badge-pop 0.3s cubic-bezier(.34,1.56,.64,1) forwards; }
  .ap-pulse-dot  { animation: ap-dot-pulse 2s ease-in-out infinite; }

  .ap-nav-link {
    transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.13s;
  }
  .ap-nav-link:not(.ap-active):hover {
    background: #F1F5F9;
    color: #1E293B;
    transform: translateX(2px);
  }
  .ap-nav-link.ap-active {
    background: #EFF6FF;
    color: #1D4ED8;
    box-shadow: inset 3px 0 0 #2563EB;
  }
  .ap-nav-link:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
  }

  .ap-cta-btn {
    transition: box-shadow 0.16s, transform 0.14s, filter 0.15s;
  }
  .ap-cta-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.07);
    box-shadow: 0 6px 18px rgba(37,99,235,0.28) !important;
  }
  .ap-cta-btn:active { transform: scale(0.97); }

  .ap-logout-btn {
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .ap-logout-btn:hover {
    background: #FEE2E2 !important;
    color: #B91C1C !important;
    border-color: #FECACA !important;
  }

  .ap-collapse-btn {
    transition: transform 0.18s, box-shadow 0.15s;
  }
  .ap-collapse-btn:hover {
    transform: scale(1.14);
    box-shadow: 0 3px 14px rgba(37,99,235,0.3) !important;
  }

  .ap-icon-active { color: #2563EB; }
  .ap-icon-idle   { color: #94A3B8; }
`;

/* ─── Nav data ─────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        to: "/rfp/upload",
        label: "Upload RFP",
        icon: FaFileUpload,
        roles: ["admin"],
      },
      {
        to: "/rfps",
        label: "RFPs",
        icon: FaFileAlt,
        countKey: "rfpCount",
        badgeBg: "#DBEAFE",
        badgeColor: "#1D4ED8",
        badgeBorder: "#BFDBFE",
      },
      {
        to: "/proposals",
        label: "Proposals",
        icon: FaClipboardList,
        countKey: "proposalCount",
        badgeBg: "#D1FAE5",
        badgeColor: "#065F46",
        badgeBorder: "#A7F3D0",
      },
    ],
  },
];

/* ─── Component ────────────────────────────────────────────────── */
const Sidebar = ({ rfpCount = 0, proposalCount = 0 }) => {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  const counts      = { rfpCount, proposalCount };
  const closeMobile = () => setMobileOpen(false);
  const handleLogout = () => { if (logout) logout(); else navigate("/login"); };
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-md ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Open sidebar"
      >
        <FaBars size={18} />
      </button>

      {/* ── Backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col z-40
          md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{
          width: collapsed ? "72px" : "252px",
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          boxShadow: "2px 0 16px rgba(15,23,42,0.06)",
          transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* ── Mobile close ── */}
        <div className="md:hidden flex justify-end p-3">
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* ── Brand ── */}
        <div
          className={`flex items-center gap-3 px-4 py-4 ${collapsed ? "justify-center" : ""}`}
          style={{ borderBottom: "1px solid #F1F5F9" }}
        >
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
              boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
              fontSize: "11px",
              letterSpacing: "0.04em",
            }}
          >
            AP
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h1 style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", letterSpacing: "0.01em", lineHeight: 1.2 }}>
                  AI Power
                </h1>
                <p style={{ fontSize: "10.5px", color: "#94A3B8", fontWeight: 500, marginTop: "1px" }}>
                  Proposal Management
                </p>
              </div>

              {/* Notification bell */}
              <button
                className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <FaBell size={13} />
                <span
                  className="ap-pulse-dot absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500"
                />
              </button>
            </>
          )}
        </div>

        {/* ── Collapse toggle (desktop only) ── */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ap-collapse-btn hidden md:flex absolute -right-3.5 top-[4.25rem] w-7 h-7 items-center justify-center rounded-full z-50 bg-white ring-1 ring-slate-200 text-slate-500 hover:text-blue-600"
          style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.1)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaChevronRight size={9} /> : <FaChevronLeft size={9} />}
        </button>

        {/* ── CTA Button ── */}
        {/* {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <Link
              to="/rfp/upload"
              className="ap-cta-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold"
              style={{
                fontSize: "13px",
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                boxShadow: "0 3px 12px rgba(37,99,235,0.22)",
                letterSpacing: "0.01em",
              }}
            >
              <FaPlus size={10} />
              New RFP
            </Link>
          </div>
        )} */}

        {/* {collapsed && (
          <div className="flex justify-center pt-4 pb-1">
            <Link
              to="/rfp/upload"
              className="ap-cta-btn w-10 h-10 flex items-center justify-center rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                boxShadow: "0 3px 12px rgba(37,99,235,0.22)",
              }}
              title="New RFP"
            >
              <FaPlus size={12} />
            </Link>
          </div>
        )} */}

        {/* ── Navigation ── */}
        <nav
          className="ap-nav flex-1 px-3 py-3 flex flex-col gap-0 overflow-y-auto"
        >
          {NAV_SECTIONS.map((section) => {
            const visible = section.items.filter(
              (item) => !item.roles || item.roles.includes(user?.role)
            );
            if (!visible.length) return null;

            return (
              <div key={section.label} className="mb-3">
                {/* Section label */}
                {!collapsed && (
                  <p style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#CBD5E1",
                    paddingLeft: "10px",
                    paddingBottom: "6px",
                  }}>
                    {section.label}
                  </p>
                )}
                {collapsed && <div style={{ height: "6px" }} />}

                <div className="flex flex-col gap-0.5">
                  {visible.map((item) => {
                    const active = location.pathname === item.to;
                    const count  = item.countKey ? counts[item.countKey] : 0;
                    const Icon   = item.icon;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMobile}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`ap-nav-link relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                          ${collapsed ? "justify-center" : ""}
                          ${active ? "ap-active" : ""}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Icon
                          size={14}
                          className={`shrink-0 ${active ? "ap-icon-active" : "ap-icon-idle"}`}
                          style={{ minWidth: "14px" }}
                        />

                        {!collapsed && (
                          <>
                            <span style={{
                              flex: 1,
                              fontSize: "13px",
                              fontWeight: active ? 600 : 500,
                              color: active ? "#1D4ED8" : "#475569",
                            }}>
                              {item.label}
                            </span>

                            {count > 0 && (
                              <span
                                className="ap-badge-in"
                                style={{
                                  padding: "1px 7px",
                                  borderRadius: "20px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: item.badgeBg    || "#DBEAFE",
                                  color:      item.badgeColor || "#1D4ED8",
                                  border:     `1px solid ${item.badgeBorder || "#BFDBFE"}`,
                                }}
                              >
                                {count}
                              </span>
                            )}
                          </>
                        )}

                        {/* Collapsed count dot */}
                        {collapsed && count > 0 && (
                          <span
                            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                            style={{ background: item.badgeColor || "#2563EB" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div style={{ margin: "0 16px", height: "1px", background: "#F1F5F9", flexShrink: 0 }} />

        {/* ── User footer ── */}
        <div className="p-3" style={{ flexShrink: 0 }}>
          {/* Profile card */}
          <div
            className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${collapsed ? "justify-center" : ""}`}
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #7C3AED)",
                  fontSize: "12px",
                }}
              >
                {initial}
              </div>
              {/* Online dot */}
              <span
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                style={{ background: "#10B981", border: "2px solid #F8FAFC" }}
              />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F172A", lineHeight: 1.2 }} className="truncate">
                  {user?.name || "User"}
                </p>
                <p style={{ fontSize: "10.5px", color: "#94A3B8", marginTop: "2px" }} className="truncate capitalize">
                  {user?.role?.replace(/_/g, " ") || "Member"}
                </p>
              </div>
            )}

            {/* Admin badge */}
            {!collapsed && user?.role === "admin" && (
              <span style={{
                flexShrink: 0,
                padding: "2px 6px",
                borderRadius: "5px",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "#EFF6FF",
                color: "#1D4ED8",
                border: "1px solid #BFDBFE",
              }}>
                Admin
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`ap-logout-btn w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold
              ${collapsed ? "justify-center" : "justify-center"}`}
            style={{
              fontSize: "13px",
              background: "#FFF1F2",
              color: "#E11D48",
              border: "1px solid #FECDD3",
            }}
          >
            <FaSignOutAlt size={12} />
            {!collapsed && "Sign Out"}
          </button>

          {/* Version */}
          {!collapsed && (
            <p style={{ fontSize: "9.5px", color: "#CBD5E1", textAlign: "center", marginTop: "10px", letterSpacing: "0.07em" }}>
              AI POWER v2.0 · BETA
            </p>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;