import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getProposalById,
  approveProposal,
  rejectProposal,
} from "../services/proposalService";

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

const PopupNotification = ({ id, message, title, type = "success", onClose }) => {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = POPUP_CONFIG[type] || POPUP_CONFIG.success;

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
        {/* Countdown ring */}
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

/* Show only the latest popup at a time */
const NotificationContainer = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;
  const latest = notifications[notifications.length - 1];
  return <PopupNotification key={latest.id} {...latest} onClose={onClose} />;
};

let _notifId = 0;
const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const notify = useCallback((message, type = "success", title) => {
    const id = ++_notifId;
    setNotifications((prev) => [...prev, { id, message, type, title }]);
  }, []);
  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  return { notifications, notify, dismiss };
};

// ─────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────
const ConfirmModal = ({
  open, title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "primary", icon,
  onConfirm, onCancel,
}) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onCancel();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const btnMap = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    danger:  "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
    success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        style={{ animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 text-center">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">{description}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnMap[variant] || btnMap.primary}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.9) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Reject Modal (reason textarea)
// ─────────────────────────────────────────────
const RejectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Icon header */}
        <div className="flex justify-center pt-7 pb-2">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <div className="px-6 py-3 text-center">
          <h3 className="text-lg font-bold text-gray-900">Reject Proposal</h3>
          <p className="text-sm text-gray-500 mt-1">
            Provide feedback so the team knows what to improve.
          </p>
        </div>

        <div className="px-6 pb-3 space-y-1">
          <textarea
            className="w-full border border-gray-300 rounded-xl p-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all"
            rows={4}
            placeholder="Explain why this proposal doesn't meet requirements…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            autoFocus
          />
          <p className="text-xs text-gray-400 text-right">{reason.length}/500</p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Rejecting…
              </>
            ) : "Confirm Rejection"}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.9) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Markdown Parser
// ─────────────────────────────────────────────
const parseMarkdownToElements = (text) => {
  if (!text || typeof text !== "string") return [];
  const lines = text.split("\n");
  const elements = [];
  const headingRegex  = /^(#{1,6})\s+(.+)$/;
  const bulletRegex   = /^(\s*)[-*]\s+(.+)$/;
  const numberedRegex = /^(\s*)\d+[.)]\s+(.+)$/;

  const applyInline = (str) => {
    if (!str) return str;
    const parts = [];
    let lastIndex = 0;
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex)
        parts.push(<span key={`t${lastIndex}`}>{str.substring(lastIndex, match.index)}</span>);
      if      (match[1]) parts.push(<strong key={`b${match.index}`}>{match[1]}</strong>);
      else if (match[2]) parts.push(<em key={`i${match.index}`}>{match[2]}</em>);
      else if (match[3]) parts.push(<code key={`c${match.index}`} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono text-xs">{match[3]}</code>);
      else if (match[4] && match[5]) parts.push(<a key={`l${match.index}`} href={match[5]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline transition-colors">{match[4]}</a>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < str.length) parts.push(<span key="tend">{str.substring(lastIndex)}</span>);
    return parts.length > 0 ? parts : str;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const hm = line.match(headingRegex);
    if (hm) {
      const level = hm[1].length;
      const cls = level === 1 ? "text-3xl font-bold" : level === 2 ? "text-2xl font-bold" : level === 3 ? "text-xl font-semibold" : "text-lg font-semibold";
      elements.push(<div key={`h${i}`} className={`${cls} text-gray-900 mt-8 mb-4`}>{applyInline(hm[2])}</div>);
      i++; continue;
    }
    if (bulletRegex.test(line)) {
      const items = [];
      while (i < lines.length && bulletRegex.test(lines[i])) { const m = lines[i].match(bulletRegex); if (m) items.push(m[2]); i++; }
      elements.push(<ul key={`ul${i}`} className="space-y-2 my-4 ml-4 text-gray-700 list-disc list-outside">{items.map((item, idx) => <li key={idx} className="leading-relaxed">{applyInline(item)}</li>)}</ul>);
      continue;
    }
    if (numberedRegex.test(line)) {
      const items = [];
      while (i < lines.length && numberedRegex.test(lines[i])) { const m = lines[i].match(numberedRegex); if (m) items.push(m[2]); i++; }
      elements.push(<ol key={`ol${i}`} className="space-y-2 my-4 ml-4 text-gray-700 list-decimal list-outside">{items.map((item, idx) => <li key={idx} className="leading-relaxed">{applyInline(item)}</li>)}</ol>);
      continue;
    }
    let paraText = line.trim();
    while (i + 1 < lines.length && lines[i + 1].trim() && !headingRegex.test(lines[i + 1]) && !bulletRegex.test(lines[i + 1]) && !numberedRegex.test(lines[i + 1])) {
      i++; paraText += " " + lines[i].trim();
    }
    elements.push(<p key={`p${i}`} className="text-gray-700 leading-relaxed mb-5">{applyInline(paraText)}</p>);
    i++;
  }
  return elements;
};

// ─────────────────────────────────────────────
// Proposal Document
// ─────────────────────────────────────────────
const ProposalDocument = ({ proposalContent }) => {
  const elements = parseMarkdownToElements(proposalContent);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 print:bg-white print:border-b print:border-gray-300">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">Proposal Document</h2>
        <p className="text-slate-300 text-xs tracking-wide mt-1 print:text-gray-500">CONFIDENTIAL & PROPRIETARY</p>
      </div>
      <div className="px-8 py-8 prose prose-sm max-w-none space-y-6">
        {elements.length > 0 ? elements : <p className="text-gray-400 italic text-center py-12">No proposal content to display.</p>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Activity Timeline
// ─────────────────────────────────────────────
const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0)
    return <p className="text-gray-500 text-sm italic">No activity recorded yet.</p>;

  const iconMap  = { approved: "✓", rejected: "✕", created: "◦" };
  const colorMap = { approved: "bg-emerald-100 text-emerald-700", rejected: "bg-rose-100 text-rose-700", created: "bg-slate-100 text-slate-700" };

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${colorMap[activity.type] || "bg-blue-100 text-blue-700"}`}>
              {iconMap[activity.type] || "•"}
            </div>
            {idx < activities.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
          </div>
          <div className="pb-2 flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()} • {activity.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────
const CollapsibleSection = ({ title, children, defaultOpen = true, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg text-gray-600">{icon}</span>}
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        <span className={`transform transition-transform duration-300 text-gray-400 group-hover:text-gray-600 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>
      {isOpen && <div className="px-6 pb-6 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Info Item
// ─────────────────────────────────────────────
const InfoItem = ({ label, value, icon }) => (
  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-lg">{icon}</span>}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-gray-900 font-medium capitalize">
      {value ? (typeof value === "string" ? value.replace(/_/g, " ") : value) : <span className="text-gray-400">—</span>}
    </p>
  </div>
);

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    draft:     { bg: "bg-gray-100",    text: "text-gray-700",    icon: "◦",  label: "Draft" },
    pending:   { bg: "bg-amber-100",   text: "text-amber-800",   icon: "⏳", label: "Pending Review" },
    in_review: { bg: "bg-blue-100",    text: "text-blue-800",    icon: "👁", label: "In Review" },
    approved:  { bg: "bg-emerald-100", text: "text-emerald-800", icon: "✓",  label: "Approved" },
    rejected:  { bg: "bg-rose-100",    text: "text-rose-800",    icon: "✕",  label: "Rejected" },
  }[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: "◦", label: "Draft" };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm ${config.bg} ${config.text}`}>
      <span className="text-base">{config.icon}</span>
      {config.label}
    </div>
  );
};

// ─────────────────────────────────────────────
// Action Button
// ─────────────────────────────────────────────
const ActionButton = ({ icon, label, onClick, variant = "primary" }) => {
  const styles = {
    primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${styles[variant]}`}>
      <span>{icon}</span>{label}
    </button>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ProposalDetails = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const { notifications, notify, dismiss } = useNotification();

  const [proposal,      setProposal]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [approving,     setApproving]     = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectOpen,    setRejectOpen]    = useState(false);
  const [confirmModal,  setConfirmModal]  = useState({ open: false, type: null });

  // ── Fetch proposal
  useEffect(() => {
    let isMounted = true;
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const response = await getProposalById(id);
        if (isMounted) setProposal(response.data);
      } catch (error) {
        if (isMounted) {
          const isServer = !error?.response || error?.response?.status >= 500;
          notify(
            isServer
              ? "The server is currently unavailable. Please try again later."
              : error?.response?.data?.message || "Failed to load proposal.",
            "error",
            isServer ? "Server error" : "Failed to load"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProposal();
    return () => { isMounted = false; };
  }, [id]);

  // ── Approve (after confirm)
  const doApprove = async () => {
    setConfirmModal({ open: false });
    try {
      setApproving(true);
      await approveProposal(id);
      notify("The proposal has been approved and the client will be notified.", "success", "Proposal approved");
      const response = await getProposalById(id);
      setProposal(response.data);
    } catch (error) {
      const isServer = !error?.response || error?.response?.status >= 500;
      notify(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : error?.response?.data?.message || "Failed to approve proposal.",
        "error",
        isServer ? "Server error" : "Approval failed"
      );
    } finally {
      setApproving(false);
    }
  };

  // ── Reject
  const handleReject = async (reason) => {
    try {
      setRejectLoading(true);
      await rejectProposal(id, { reason });
      setRejectOpen(false);
      notify("The proposal has been rejected and feedback has been sent.", "warning", "Proposal rejected");
      const response = await getProposalById(id);
      setProposal(response.data);
    } catch (error) {
      const isServer = !error?.response || error?.response?.status >= 500;
      notify(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : error?.response?.data?.message || "Failed to reject proposal.",
        "error",
        isServer ? "Server error" : "Rejection failed"
      );
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Link copied to clipboard.", "success", "Copied!");
    } catch {
      notify("Could not copy the link. Please try manually.", "error", "Copy failed");
    }
  };

  const handlePrint = () => window.print();

  // ── Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-9 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-200 rounded w-96" />
          </div>
          <div className="h-10 bg-gray-200 rounded-full w-32" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded-lg w-32" />)}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Proposal Not Found</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          The proposal you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  const isManager  = user?.role === "manager";
  const isAdmin    = user?.role === "admin";
  const canApprove = (isManager || isAdmin) && proposal.status !== "approved" && proposal.status !== "rejected";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Proposal Details</h1>
            <p className="text-gray-600 mt-2">Review and manage this proposal submission.</p>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton icon="🖨"  label="Print"     onClick={handlePrint}    variant="secondary" />
          <ActionButton icon="🔗" label="Copy Link" onClick={handleCopyLink} variant="secondary" />
          {proposal.pdfUrl && (
            <a href={proposal.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <span>📥</span> Download PDF
            </a>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <CollapsibleSection title="Proposal Information" icon="ℹ" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem icon="📊" label="Status"  value={proposal.status} />
            <InfoItem icon="📌" label="Version" value={`v${proposal.version || "1.0"}`} />
            <InfoItem icon="📅" label="Created" value={new Date(proposal.createdAt).toLocaleDateString()} />
            {proposal.updatedAt  && <InfoItem icon="🔄" label="Last Updated" value={new Date(proposal.updatedAt).toLocaleDateString()} />}
            {proposal.author     && <InfoItem icon="👤" label="Author"       value={proposal.author} />}
            {proposal.department && <InfoItem icon="🏢" label="Department"   value={proposal.department} />}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Generated Proposal" icon="📄" defaultOpen>
          {proposal.proposalContent ? (
            <ProposalDocument proposalContent={proposal.proposalContent} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-sm">No proposal content available.</p>
            </div>
          )}
        </CollapsibleSection>

        {proposal.activities?.length > 0 && (
          <CollapsibleSection title="Activity Log" icon="📊" defaultOpen={false}>
            <ActivityTimeline activities={proposal.activities} />
          </CollapsibleSection>
        )}

        {/* Manager action buttons */}
        {canApprove && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <span>✕</span> Reject Proposal
            </button>
            <button
              onClick={() => setConfirmModal({ open: true, type: "approve" })}
              disabled={approving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Approving…
                </>
              ) : <><span>✓</span> Approve Proposal</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Confirm: Approve */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === "approve"}
        title="Approve this proposal?"
        description="Once approved, the client will be notified and the proposal will be marked as finalised. This action cannot be undone."
        confirmLabel="Yes, approve"
        cancelLabel="Cancel"
        variant="success"
        icon={
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
        onConfirm={doApprove}
        onCancel={() => setConfirmModal({ open: false })}
      />

      {/* ── Reject modal */}
      <RejectModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
        loading={rejectLoading}
      />

      {/* ── Centered popup notifications */}
      <NotificationContainer notifications={notifications} onClose={dismiss} />
    </div>
  );
};

export default ProposalDetails;