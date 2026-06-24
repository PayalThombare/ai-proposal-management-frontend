import { useEffect, useState, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { getAllRFPs } from "../services/rfpService";
import { getAllProposals } from "../services/proposalService";
import RoleBadge from "../components/RoleBadge";
import DashboardStats from "../components/DashboardStats";
import DashboardChart from "../components/DashboardChart";
import AIAgentStatus from "../components/AIAgentStatus";
import QuickActions from "../components/QuickActions";
import RecentRFPTable from "../components/RecentRFPTable";
import RecentProposalTable from "../components/RecentProposalTable";

// ─────────────────────────────────────────────
// Centered Popup Notification System
// ─────────────────────────────────────────────
const POPUP_ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
};

const POPUP_CONFIG = {
  success: {
    gradient:   "from-emerald-50 to-white",
    ring:       "ring-emerald-200",
    iconBg:     "bg-emerald-100",
    iconColor:  "text-emerald-600",
    titleColor: "text-emerald-700",
    stroke:     "#10b981",
    btn:        "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400",
  },
  error: {
    gradient:   "from-red-50 to-white",
    ring:       "ring-red-200",
    iconBg:     "bg-red-100",
    iconColor:  "text-red-500",
    titleColor: "text-red-700",
    stroke:     "#ef4444",
    btn:        "bg-red-600 hover:bg-red-700 focus:ring-red-400",
  },
  warning: {
    gradient:   "from-amber-50 to-white",
    ring:       "ring-amber-200",
    iconBg:     "bg-amber-100",
    iconColor:  "text-amber-500",
    titleColor: "text-amber-700",
    stroke:     "#f59e0b",
    btn:        "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
  },
};

const NOTIF_DURATION = 4000;

const PopupNotification = ({ id, message, title, type = "error", onClose }) => {
  const [visible,  setVisible]  = useState(false);
  const [leaving,  setLeaving]  = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = POPUP_CONFIG[type] || POPUP_CONFIG.error;

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const start = Date.now();
    const tick = () => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / NOTIF_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(tick);
    };
    const rafId = requestAnimationFrame(tick);
    const timer = setTimeout(handleClose, NOTIF_DURATION);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  }, [handleClose]);

  const strokeLen = 2 * Math.PI * 28;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{
        background:     "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        transition:     "opacity 0.3s ease",
        opacity:        visible && !leaving ? 1 : 0,
        pointerEvents:  visible && !leaving ? "auto" : "none",
      }}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl ring-1 bg-gradient-to-b p-6 text-center
          ${cfg.gradient} ${cfg.ring}`}
        style={{
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1)",
          opacity:    visible && !leaving ? 1 : 0,
          transform:  visible && !leaving ? "scale(1) translateY(0)" : "scale(0.88) translateY(16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={cfg.stroke} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={strokeLen}
                strokeDashoffset={strokeLen * (1 - progress / 100)}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full ${cfg.iconBg}`}
              style={{ margin: "4px" }}
            >
              <span className={cfg.iconColor}>{POPUP_ICONS[type]}</span>
            </div>
          </div>
        </div>

        {title && <p className={`text-base font-bold mb-1 ${cfg.titleColor}`}>{title}</p>}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

        <button
          onClick={handleClose}
          className={`mt-5 w-full py-2.5 rounded-xl text-white text-sm font-semibold
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${cfg.btn}`}
        >
          OK
        </button>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

let _notifId = 0;
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const notify = useCallback((message, type = "error", title) => {
    const id = ++_notifId;
    setNotifications((prev) => [...prev, { id, message, type, title }]);
  }, []);
  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  return { notifications, notify, dismiss };
};

const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;
  const latest = notifications[notifications.length - 1];
  return <PopupNotification key={latest.id} {...latest} onClose={onClose} />;
};

// ─────────────────────────────────────────────
// Skeleton Primitives
// ─────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const HeaderSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-9 w-64 mb-3" />
    <Skeleton className="h-4 w-48 mb-4" />
    <Skeleton className="h-6 w-24 rounded-full" />
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-10 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-56 w-full rounded-xl" />
  </div>
);

const AIAgentSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-36 mb-5" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const QuickActionsSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-32 mb-5" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-36 mb-5" />
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-gray-100">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-3 flex-1" />)}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 py-1 items-center">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <HeaderSkeleton />
    <StatsSkeleton />
    <ChartSkeleton />
    <AIAgentSkeleton />
    <QuickActionsSkeleton />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <TableSkeleton />
      <TableSkeleton />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const { notifications, notify, dismiss } = useNotification();

  const [stats, setStats] = useState({
    totalRFPs: 0,
    totalProposals: 0,
    pendingApprovals: 0,
  });
  const [rfps,      setRfps]      = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [rfpResponse, proposalResponse] = await Promise.all([
          getAllRFPs(),
          getAllProposals(),
        ]);
        const rfpsData      = rfpResponse?.data      || [];
        const proposalsData = proposalResponse?.data || [];
        const pendingApprovals = proposalsData.filter((p) => p.status !== "approved").length;

        setRfps(rfpsData);
        setProposals(proposalsData);
        setStats({ totalRFPs: rfpsData.length, totalProposals: proposalsData.length, pendingApprovals });
      } catch (error) {
        console.error(error);
        const isServer = !error?.response || error?.response?.status >= 500;
        notify(
          isServer
            ? "The server is currently unavailable. Please try again later."
            : error?.response?.data?.message || "Failed to load dashboard data.",
          "error",
          isServer ? "Server error" : "Failed to load"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-500 mt-2">AI Proposal Management Dashboard</p>
        <div className="mt-4">
          <RoleBadge role={user?.role} />
        </div>
      </div>

      <DashboardStats  stats={stats} />
      <DashboardChart  stats={stats} />
      <AIAgentStatus />
      <QuickActions />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentRFPTable      rfps={rfps} />
        <RecentProposalTable proposals={proposals} />
      </div>

      {/* Centered popup notifications */}
      <NotificationContainer notifications={notifications} onClose={dismiss} />
    </div>
  );
};

export default Dashboard;