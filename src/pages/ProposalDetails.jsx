import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  getProposalById,
  approveProposal,
} from "../services/proposalService";

/* ============================
   TOAST
============================ */
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-green-50 border-green-500 text-green-800"
      : "bg-red-50 border-red-500 text-red-800";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border-l-4 transition-all ${bg}`}
      role="alert"
    >
      <span className="text-lg font-bold">{type === "success" ? "✓" : "✕"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

/* ============================
   COLLAPSIBLE SECTION
============================ */
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className="px-6 pb-6 pt-0">{children}</div>}
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Reject Proposal
        </h3>
        <p className="text-gray-500 mb-4 text-sm">
          Please provide a reason for rejection. This will be visible to the team.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
          rows={4}
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================
   HELPER: PARSE MARKDOWN-LIKE TEXT
============================ */
/* ============================
   HELPER: PARSE MARKDOWN-LIKE TEXT (FIXED)
============================ */
const parseMarkdownToElements = (text) => {
  if (!text) return [];
  const lines = text.split("\n");
  const elements = [];

  const headingRegex = /^(#{1,6})\s+(.+)/;
  const listRegex = /^(\s*[-*•]\s+)(.+)/;
  const numberedListRegex = /^(\s*\d+[.)]\s+)(.+)/;
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;

  const applyInline = (str) => {
    return str
      .split(/(\*\*.*?\*\*|\*.*?\*|`[^`]+`|\[.*?\]\(.*?\))/)
      .map((part, i) => {
        if (boldRegex.test(part)) {
          const content = part.replace(/\*\*/g, "");
          return <strong key={i}>{content}</strong>;
        }
        if (italicRegex.test(part)) {
          const content = part.replace(/\*/g, "");
          return <em key={i}>{content}</em>;
        }
        if (inlineCodeRegex.test(part)) {
          const content = part.replace(/`/g, "");
          return (
            <code key={i} className="bg-gray-100 text-red-600 px-1 rounded text-sm">
              {content}
            </code>
          );
        }
        if (linkRegex.test(part)) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            return (
              <a
                key={i}
                href={match[2]}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {match[1]}
              </a>
            );
          }
        }
        return part;
      });
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading – explicit tag by level (avoids JSX.IntrinsicElements)
    const headingMatch = line.match(headingRegex);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const className =
        level === 1
          ? "text-2xl font-bold"
          : "text-xl font-semibold";
      // Map to real elements
      switch (level) {
        case 1:
          elements.push(
            <h1 key={i} className={`${className} text-gray-900 mt-6 mb-2`}>
              {content}
            </h1>
          );
          break;
        case 2:
          elements.push(
            <h2 key={i} className={`${className} text-gray-900 mt-5 mb-2`}>
              {content}
            </h2>
          );
          break;
        case 3:
          elements.push(
            <h3 key={i} className={`${className} text-gray-900 mt-4 mb-2`}>
              {content}
            </h3>
          );
          break;
        default: // 4-6 treated as h4
          elements.push(
            <h4 key={i} className="text-lg font-semibold text-gray-900 mt-3 mb-2">
              {content}
            </h4>
          );
      }
      i++;
      continue;
    }

    // Bullet list
    if (listRegex.test(line)) {
      const items = [];
      while (i < lines.length && listRegex.test(lines[i])) {
        const m = lines[i].match(listRegex);
        if (m) items.push(m[2]);
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 ml-4 my-3 text-gray-700">
          {items.map((item, idx) => (
            <li key={idx}>{applyInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (numberedListRegex.test(line)) {
      const items = [];
      while (i < lines.length && numberedListRegex.test(lines[i])) {
        const m = lines[i].match(numberedListRegex);
        if (m) items.push(m[2]);
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1 ml-4 my-3 text-gray-700">
          {items.map((item, idx) => (
            <li key={idx}>{applyInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    let paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !headingRegex.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    const para = paraLines.join(" ");
    elements.push(
      <p key={i} className="text-gray-800 leading-relaxed mb-4 text-justify">
        {applyInline(para)}
      </p>
    );
  }

  return elements;
};

/* ============================
   PROFESSIONAL DOCUMENT VIEW
============================ */
const ProposalDocument = ({ proposalContent }) => {
  const elements = parseMarkdownToElements(proposalContent);

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden print:shadow-none print:border-0">
      {/* Document letterhead */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 print:bg-white print:border-b print:border-gray-300">
        <h2 className="text-2xl font-bold text-white print:text-black">
          Proposal Document
        </h2>
        <p className="text-blue-100 text-sm print:text-gray-600">Confidential</p>
      </div>

      {/* Content area */}
      <div className="px-8 py-8 font-serif text-gray-800 leading-7 print:px-0 print:py-6">
        {elements.length > 0 ? (
          elements
        ) : (
          <p className="text-gray-500 italic">No content to display.</p>
        )}
      </div>
    </div>
  );
};

/* ============================
   ACTIVITY TIMELINE
============================ */
const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="space-y-4">
      {activities.map((act, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                act.type === "approved"
                  ? "bg-green-500"
                  : act.type === "rejected"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            />
            {idx < activities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm text-gray-800 font-medium">
              {act.description}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(act.timestamp).toLocaleString()} — by {act.user}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================
   MAIN PROPOSAL DETAILS
============================ */
const ProposalDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);
  const closeToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getProposalById(id);
        if (!cancelled) setProposal(response.data);
      } catch (err) {
        console.error("Failed to load proposal:", err);
        if (!cancelled) showToast("Failed to load proposal", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, showToast]);

  // Approve
  const handleApprove = async () => {
    try {
      setApproving(true);
      await approveProposal(id);
      showToast("Proposal approved successfully!");
      const res = await getProposalById(id);
      setProposal(res.data);
    } catch (err) {
      showToast(err?.response?.data?.message || "Approval failed", "error");
    } finally {
      setApproving(false);
    }
  };

  // Reject
  const handleReject = async (reason) => {
    try {
      setRejecting(true);
      await rejectProposal(id, { reason });
      showToast("Proposal rejected.");
      const res = await getProposalById(id);
      setProposal(res.data);
    } catch (err) {
      showToast(err?.response?.data?.message || "Rejection failed", "error");
    } finally {
      setRejecting(false);
      setRejectModalOpen(false);
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard");
  };

  // Print
  const handlePrint = () => window.print();

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">Proposal Not Found</h2>
        <p className="text-gray-500 mt-2">The requested proposal could not be loaded.</p>
      </div>
    );
  }

  // Status colour mapping
  const statusColor = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-800",
    in_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const isManager = user?.role === "manager";
  const canApprove = isManager && proposal.status !== "approved" && proposal.status !== "rejected";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposal Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, manage and track this proposal.
          </p>
        </div>
        <span
          className={`self-start px-4 py-2 rounded-full text-sm font-semibold tracking-wide capitalize ${
            statusColor[proposal.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {proposal.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          </svg>
          Copy link
        </button>
        {proposal.pdfUrl && (
          <a
            href={proposal.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            PDF
          </a>
        )}
      </div>

      {/* Meta info */}
      <CollapsibleSection title="Proposal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="Status" value={proposal.status} />
          <InfoItem label="Version" value={proposal.version} />
          <InfoItem
            label="Created At"
            value={new Date(proposal.createdAt).toLocaleString()}
          />
          {proposal.updatedAt && (
            <InfoItem
              label="Last Updated"
              value={new Date(proposal.updatedAt).toLocaleString()}
            />
          )}
        </div>
      </CollapsibleSection>

      {/* Professional Document */}
      <CollapsibleSection title="Generated Proposal" defaultOpen={true}>
        {proposal.proposalContent ? (
          <ProposalDocument proposalContent={proposal.proposalContent} />
        ) : (
          <div className="text-center py-10 text-gray-500 italic">
            No proposal text generated.
          </div>
        )}
      </CollapsibleSection>

      {/* Activity Timeline (if data available) */}
      {proposal.activities && proposal.activities.length > 0 && (
        <CollapsibleSection title="Activity Log">
          <ActivityTimeline activities={proposal.activities} />
        </CollapsibleSection>
      )}

      {/* Manager decision buttons */}
      {canApprove && (
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setRejectModalOpen(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={approving}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Approve
              </>
            )}
          </button>
        </div>
      )}

      {/* Reject modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleReject}
        loading={rejecting}
      />

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 mt-0.5 capitalize">{value || "—"}</p>
  </div>
);

export default ProposalDetails;