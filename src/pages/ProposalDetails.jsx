import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getProposalById,
  approveProposal,
  rejectProposal,
} from "../services/proposalService";

/* ============================
   TOAST NOTIFICATION
============================ */
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      text: "text-emerald-900",
      symbol: "✓",
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: "text-rose-600",
      text: "text-rose-900",
      symbol: "✕",
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border ${style.bg} ${style.border} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      role="alert"
    >
      <span className={`text-lg font-bold mt-0.5 flex-shrink-0 ${style.icon}`}>
        {style.symbol}
      </span>
      <p className={`text-sm font-medium ${style.text} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0`}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

/* ============================
   COLLAPSIBLE SECTION
============================ */
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
        <span
          className={`transform transition-transform duration-300 text-gray-400 group-hover:text-gray-600 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

/* ============================
   REJECTION MODAL
============================ */
const RejectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in-95">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reject Proposal</h3>
          <p className="text-sm text-gray-500 mt-1">
            Provide feedback for the team.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all"
            rows={4}
            placeholder="Explain why this proposal doesn't meet requirements..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right">
            {reason.length}/500
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Rejecting…
              </>
            ) : (
              "Confirm Rejection"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================
   MARKDOWN PARSER (FIXED)
============================ */
const parseMarkdownToElements = (text) => {
  if (!text || typeof text !== "string") return [];

  const lines = text.split("\n");
  const elements = [];

  const headingRegex = /^(#{1,6})\s+(.+)$/;
  const bulletRegex = /^(\s*)[-*]\s+(.+)$/;
  const numberedRegex = /^(\s*)\d+[.)]\s+(.+)$/;

  const applyInlineFormatting = (str) => {
    if (!str) return str;

    const parts = [];
    let lastIndex = 0;

    // Process bold, italic, code, and links
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {str.substring(lastIndex, match.index)}
          </span>
        );
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong key={`bold-${match.index}`}>{match[1]}</strong>
        );
      } else if (match[2]) {
        // Italic
        parts.push(
          <em key={`italic-${match.index}`}>{match[2]}</em>
        );
      } else if (match[3]) {
        // Inline code
        parts.push(
          <code
            key={`code-${match.index}`}
            className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-xs"
          >
            {match[3]}
          </code>
        );
      } else if (match[4] && match[5]) {
        // Link
        parts.push(
          <a
            key={`link-${match.index}`}
            href={match[5]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline transition-colors"
          >
            {match[4]}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < str.length) {
      parts.push(
        <span key={`text-end`}>
          {str.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : str;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(headingRegex);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const className =
        level === 1
          ? "text-3xl font-bold"
          : level === 2
          ? "text-2xl font-bold"
          : level === 3
          ? "text-xl font-semibold"
          : "text-lg font-semibold";

      elements.push(
        <div key={`heading-${i}`} className={`${className} text-gray-900 mt-8 mb-4`}>
          {applyInlineFormatting(content)}
        </div>
      );
      i++;
      continue;
    }

    // Bullet list
    if (bulletRegex.test(line)) {
      const items = [];
      while (i < lines.length && bulletRegex.test(lines[i])) {
        const match = lines[i].match(bulletRegex);
        if (match) items.push(match[2]);
        i++;
      }
      elements.push(
        <ul
          key={`list-${i}`}
          className="space-y-2 my-4 ml-4 text-gray-700 list-disc list-outside"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {applyInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (numberedRegex.test(line)) {
      const items = [];
      while (i < lines.length && numberedRegex.test(lines[i])) {
        const match = lines[i].match(numberedRegex);
        if (match) items.push(match[2]);
        i++;
      }
      elements.push(
        <ol
          key={`ordered-${i}`}
          className="space-y-2 my-4 ml-4 text-gray-700 list-decimal list-outside"
        >
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {applyInlineFormatting(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    let paraText = line.trim();
    while (i + 1 < lines.length && lines[i + 1].trim() && !headingRegex.test(lines[i + 1]) && !bulletRegex.test(lines[i + 1]) && !numberedRegex.test(lines[i + 1])) {
      i++;
      paraText += " " + lines[i].trim();
    }

    elements.push(
      <p key={`para-${i}`} className="text-gray-700 leading-relaxed mb-5">
        {applyInlineFormatting(paraText)}
      </p>
    );
    i++;
  }

  return elements;
};

/* ============================
   PROFESSIONAL DOCUMENT VIEW
============================ */
const ProposalDocument = ({ proposalContent }) => {
  const elements = parseMarkdownToElements(proposalContent);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 print:bg-white print:border-b print:border-gray-300">
        <h2 className="text-2xl font-bold text-white print:text-gray-900">
          Proposal Document
        </h2>
        <p className="text-slate-300 text-xs tracking-wide mt-1 print:text-gray-500">
          CONFIDENTIAL & PROPRIETARY
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-8 prose prose-sm max-w-none print:px-6 print:py-6 space-y-6">
        {elements.length > 0 ? (
          elements
        ) : (
          <p className="text-gray-400 italic text-center py-12">
            No proposal content to display.
          </p>
        )}
      </div>
    </div>
  );
};

/* ============================
   ACTIVITY TIMELINE
============================ */
const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No activity recorded yet.</p>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "approved":
        return "✓";
      case "rejected":
        return "✕";
      case "created":
        return "◦";
      default:
        return "•";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "created":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getActivityColor(
                activity.type
              )}`}
            >
              {getActivityIcon(activity.type)}
            </div>
            {idx < activities.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-200 mt-2" />
            )}
          </div>
          <div className="pb-2 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {activity.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(activity.timestamp).toLocaleString()} • {activity.user}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================
   INFO ITEM COMPONENT
============================ */
const InfoItem = ({ label, value, icon }) => (
  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-lg">{icon}</span>}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
    </div>
    <p className="text-gray-900 font-medium capitalize">
      {value ? (
        typeof value === "string" ? value.replace(/_/g, " ") : value
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </p>
  </div>
);

/* ============================
   STATUS BADGE
============================ */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: "◦",
      label: "Draft",
    },
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: "⏳",
      label: "Pending Review",
    },
    in_review: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "👁",
      label: "In Review",
    },
    approved: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: "✓",
      label: "Approved",
    },
    rejected: {
      bg: "bg-rose-100",
      text: "text-rose-800",
      icon: "✕",
      label: "Rejected",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm ${config.bg} ${config.text}`}
    >
      <span className="text-base">{config.icon}</span>
      {config.label}
    </div>
  );
};

/* ============================
   MAIN COMPONENT
============================ */
const ProposalDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const closeToast = useCallback(
    () => setToast((prev) => ({ ...prev, show: false })),
    []
  );

  // Fetch proposal
  useEffect(() => {
    let isMounted = true;

    const fetchProposal = async () => {
      try {
        setLoading(true);
        const response = await getProposalById(id);
        if (isMounted) setProposal(response.data);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load proposal:", error);
          showToast(
            error?.response?.data?.message || "Failed to load proposal",
            "error"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProposal();
    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  // Handle approve
  const handleApprove = async () => {
    try {
      setApproving(true);
      await approveProposal(id);
      showToast("Proposal approved successfully!");
      const response = await getProposalById(id);
      setProposal(response.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to approve proposal",
        "error"
      );
    } finally {
      setApproving(false);
    }
  };

  // Handle reject
  const handleReject = async (reason) => {
    try {
      await rejectProposal(id, { reason });
      showToast("Proposal rejected.");
      const response = await getProposalById(id);
      setProposal(response.data);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Failed to reject proposal",
        "error"
      );
    } finally {
      setRejectModalOpen(false);
    }
  };

  // Copy share link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Loading skeleton
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-32" />
          ))}
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
        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          Proposal Not Found
        </h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          The proposal you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  const isManager = user?.role === "manager";
  const canApprove =
    isManager &&
    proposal.status !== "approved" &&
    proposal.status !== "rejected";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Proposal Details</h1>
            <p className="text-gray-600 mt-2">
              Review and manage this proposal submission.
            </p>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton
            icon="🖨"
            label="Print"
            onClick={handlePrint}
            variant="secondary"
          />
          <ActionButton
            icon="🔗"
            label="Copy Link"
            onClick={handleCopyLink}
            variant="secondary"
          />
          {proposal.pdfUrl && (
            <a
              href={proposal.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <span>📥</span>
              Download PDF
            </a>
          )}
        </div>
      </div>

      {/* Main content sections */}
      <div className="space-y-6">
        {/* Proposal information */}
        <CollapsibleSection title="Proposal Information" icon="ℹ" defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem
              icon="📊"
              label="Status"
              value={proposal.status}
            />
            <InfoItem
              icon="📌"
              label="Version"
              value={`v${proposal.version || "1.0"}`}
            />
            <InfoItem
              icon="📅"
              label="Created"
              value={new Date(proposal.createdAt).toLocaleDateString()}
            />
            {proposal.updatedAt && (
              <InfoItem
                icon="🔄"
                label="Last Updated"
                value={new Date(proposal.updatedAt).toLocaleDateString()}
              />
            )}
            {proposal.author && (
              <InfoItem
                icon="👤"
                label="Author"
                value={proposal.author}
              />
            )}
            {proposal.department && (
              <InfoItem
                icon="🏢"
                label="Department"
                value={proposal.department}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Proposal document */}
        <CollapsibleSection title="Generated Proposal" icon="📄" defaultOpen={true}>
          {proposal.proposalContent ? (
            <ProposalDocument proposalContent={proposal.proposalContent} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-sm">No proposal content available.</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Activity timeline */}
        {proposal.activities && proposal.activities.length > 0 && (
          <CollapsibleSection title="Activity Log" icon="📊" defaultOpen={false}>
            <ActivityTimeline activities={proposal.activities} />
          </CollapsibleSection>
        )}

        {/* Manager actions */}
        {canApprove && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setRejectModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:shadow-sm"
            >
              <span>✕</span>
              Reject Proposal
            </button>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:shadow-sm"
            >
              {approving ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Approving…
                </>
              ) : (
                <>
                  <span>✓</span>
                  Approve Proposal
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modals and notifications */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleReject}
        loading={false}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

/* ============================
   ACTION BUTTON HELPER
============================ */
const ActionButton = ({ icon, label, onClick, variant = "primary" }) => {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${styles[variant]}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
};

export default ProposalDetails;