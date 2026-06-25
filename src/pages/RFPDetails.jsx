import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getRFPById } from "../services/rfpService";
import {
  createProposal,
  getProposalByRfpId,
  downloadProposalPdf,
} from "../services/proposalService";
import useAuth from "../hooks/useAuth";

// ─────────────────────────────────────────────
// Toast System
// ─────────────────────────────────────────────
const TOAST_ICONS = {
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

// const TOAST_STYLES = {
//   success: {
//     container: "bg-white border-emerald-500",
//     icon: "bg-emerald-100 text-emerald-600",
//     title: "text-emerald-700",
//     bar: "bg-emerald-500",
//   },
//   error: {
//     container: "bg-white border-red-500",
//     icon: "bg-red-100 text-red-600",
//     title: "text-red-700",
//     bar: "bg-red-500",
//   },
//   warning: {
//     container: "bg-white border-amber-500",
//     icon: "bg-amber-100 text-amber-600",
//     title: "text-amber-700",
//     bar: "bg-amber-500",
//   },
// };

const POPUP_BG = {
  success: "from-emerald-50 to-white",
  error:   "from-red-50 to-white",
  warning: "from-amber-50 to-white",
};
const POPUP_RING = {
  success: "ring-emerald-200",
  error:   "ring-red-200",
  warning: "ring-amber-200",
};
const POPUP_ICON_BG = {
  success: "bg-emerald-100",
  error:   "bg-red-100",
  warning: "bg-amber-100",
};
const POPUP_ICON_COLOR = {
  success: "text-emerald-600",
  error:   "text-red-500",
  warning: "text-amber-500",
};
const POPUP_TITLE_COLOR = {
  success: "text-emerald-700",
  error:   "text-red-700",
  warning: "text-amber-700",
};
const POPUP_BTN = {
  success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400",
  error:   "bg-red-600   hover:bg-red-700   focus:ring-red-400",
  warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
};

const DURATION = 4000;

const Toast = ({ id, message, title, type = "success", onClose }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

    const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    // countdown bar
    const start = Date.now();
    const raf = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);

    const timer = setTimeout(() => handleClose(), DURATION);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, []);



  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(3px)",
        transition: "opacity 0.3s ease",
        opacity: visible && !leaving ? 1 : 0,
        pointerEvents: visible && !leaving ? "auto" : "none",
      }}
      onClick={handleClose}
    >
      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl ring-1 bg-gradient-to-b p-6 text-center
          ${POPUP_BG[type] || POPUP_BG.success}
          ${POPUP_RING[type] || POPUP_RING.success}`}
        style={{
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1)",
          opacity: visible && !leaving ? 1 : 0,
          transform: visible && !leaving ? "scale(1) translateY(0)" : "scale(0.88) translateY(16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown ring around icon */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f59e0b"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center w-16 h-16 rounded-full
              ${POPUP_ICON_BG[type] || POPUP_ICON_BG.success}`}
              style={{ margin: "4px" }}
            >
              <span className={`${POPUP_ICON_COLOR[type] || POPUP_ICON_COLOR.success}`}>
                {TOAST_ICONS[type]}
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        {title && (
          <p className={`text-base font-bold mb-1 ${POPUP_TITLE_COLOR[type] || POPUP_TITLE_COLOR.success}`}>
            {title}
          </p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

        {/* OK button */}
        <button
          onClick={handleClose}
          className={`mt-5 w-full py-2 rounded-xl text-white text-sm font-semibold
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${POPUP_BTN[type] || POPUP_BTN.success}`}
        >
          OK
        </button>

        {/* Close × */}
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

/* Only render the most-recent popup at a time so they don't stack */
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;
  const latest = toasts[toasts.length - 1];
  return <Toast key={latest.id} {...latest} onClose={onClose} />;
};

// ─────────────────────────────────────────────
// Confirmation Modal
// ─────────────────────────────────────────────
const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  icon,
}) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onCancel();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const btnStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[modalIn_0.2s_ease]"
        style={{ animation: "modalIn 0.2s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
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
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${btnStyles[variant] || btnStyles.primary}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.9) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Generating Proposal Overlay
// ─────────────────────────────────────────────
const GENERATION_STEPS = [
  { label: "Analysing RFP requirements", icon: "📋" },
  { label: "Mapping business objectives", icon: "🎯" },
  { label: "Crafting technical approach", icon: "⚙️" },
  { label: "Estimating timelines & costs", icon: "📊" },
  { label: "Writing executive summary", icon: "✍️" },
  { label: "Finalising proposal document", icon: "📄" },
];

const GeneratingOverlay = ({ open }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!open) return;
    // Reset is deferred to a callback so setState is never called
    // synchronously inside the effect body (React linter requirement).
    const resetId = setTimeout(() => {
      setActiveStep(0);
      setDotCount(1);
    }, 0);
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => {
      clearTimeout(resetId);
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 text-center">
        {/* Animated rings */}
        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute w-24 h-24 rounded-full bg-blue-100 animate-ping opacity-30" />
          <span className="absolute w-20 h-20 rounded-full bg-blue-200 animate-ping opacity-20" style={{ animationDelay: "0.3s" }} />
          <div className="relative w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900">Generating Proposal</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          This may take a moment{"." .repeat(dotCount)}
        </p>

        {/* Steps */}
        <div className="text-left space-y-2.5">
          {GENERATION_STEPS.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                  active ? "bg-blue-50 scale-[1.02]" : done ? "opacity-60" : "opacity-30"
                }`}
              >
                <span className="text-lg">{step.icon}</span>
                <span className={`text-sm font-medium flex-1 ${active ? "text-blue-700" : "text-gray-700"}`}>
                  {step.label}
                </span>
                {done && (
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {active && (
                  <span className="flex gap-0.5 flex-shrink-0">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        style={{ animation: `bounce 1s ${d * 0.15}s infinite` }}
                      />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string" || typeof value === "number") return String(value);
  try {
    return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(", ");
  } catch {
    return String(value);
  }
};

const toStringList = (items) => {
  if (!items) return [];
  return items.map((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (item.description) return item.description;
    if (item.risk) return item.risk;
    if (item.name) return item.name;
    if (item.detail) return item.detail;
    try { return JSON.stringify(item); } catch { return "N/A"; }
  });
};

// ─────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className={`transform transition-transform text-gray-400 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>
      {isOpen && <div className="px-6 pb-6 pt-0 space-y-4">{children}</div>}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800">{safeRenderValue(value)}</p>
  </div>
);

const SubSectionList = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <ul className="list-disc ml-6 text-gray-600 space-y-0.5">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
};

// ─────────────────────────────────────────────
// useToast hook
// ─────────────────────────────────────────────
let _toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success", title) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
};

// ─────────────────────────────────────────────
// Main RFPDetails Component
// ─────────────────────────────────────────────
const RFPDetails = () => {
  const { id } = useParams();
  const { toasts, addToast, removeToast } = useToast();

  const [rfp, setRfp] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [proposalContent, setProposalContent] = useState(null);

  // Modal state
  const [modal, setModal] = useState({ open: false, type: null });

  // Fetch RFP + existing proposal
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const response = await getRFPById(id);
        if (!cancelled) setRfp(response.data);
        try {
          const existingProposal = await getProposalByRfpId(id);
          if (!cancelled && existingProposal?.data?.proposalContent) {
            setProposalContent(existingProposal.data.proposalContent);
            setProposal(existingProposal.data);
          }
        } catch {
          // No proposal yet — that's fine
        }
      } catch (error) {
        console.error(error);
        if (!cancelled)
          addToast(
            "Could not load RFP details. The server may be down — please try again later.",
            "error",
            "Failed to load"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [id]);


  const { user } = useAuth();

const canGenerate =
  user?.role === "admin" || user?.role === "business_analyst";

  // Confirm → generate
  const handleGenerateProposal = async () => {
    setModal({ open: false });
    setGenerating(true);
    try {
      const response = await createProposal({ rfpId: rfp._id });
      setProposal(response.data);
      setProposalContent(response.data.proposalContent);
      addToast("Your proposal is ready to review and download.", "success", "Proposal generated");
    } catch (error) {
      console.error(error);
      const isServer = !error?.response || error?.response?.status >= 500;
      addToast(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : error?.response?.data?.message || "Something went wrong while generating the proposal.",
        "error",
        isServer ? "Server error" : "Generation failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  // Confirm → download
  const handleDownload = async () => {
    setModal({ open: false });
    try {
      const response = await downloadProposalPdf(proposal._id);
      const pdfUrl = response?.data?.pdfUrl || response?.pdfUrl;
      if (!pdfUrl) {
        addToast("The PDF could not be prepared. Please try again.", "error", "Download failed");
        return;
      }
      window.open(pdfUrl, "_blank");
      addToast("PDF opened in a new tab.", "success", "Download started");
    } catch (error) {
      console.error(error);
      const isServer = !error?.response || error?.response?.status >= 500;
      addToast(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : "Could not download the PDF. Please try again.",
        "error",
        isServer ? "Server error" : "Download failed"
      );
    }
  };

  // ── Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-3 text-gray-600 text-lg">Loading RFP details…</span>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">RFP Not Found</h2>
        <p className="text-gray-500 mt-2">The requested RFP could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{rfp.projectName}</h1>
        <span className="self-start px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {rfp.status}
        </span>
      </div>

      <CollapsibleSection title="Client Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Name" value={rfp.clientName} />
          <InfoItem label="Email" value={rfp.clientEmail} />
          <InfoItem label="Company" value={rfp.clientCompany} />
          <InfoItem label="Status" value={rfp.status} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Requirements Analysis">
        <SubSectionList title="Functional Requirements" items={rfp.requirements?.functionalRequirements} />
        <SubSectionList title="Non‑Functional Requirements" items={rfp.requirements?.nonFunctionalRequirements} />
        <SubSectionList title="Technologies" items={rfp.requirements?.technologies} />
        <div>
          <h3 className="font-semibold text-gray-700">Scope</h3>
          <p className="text-gray-600 mt-1">{safeRenderValue(rfp.requirements?.scope)}</p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Business Analysis">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Project Type" value={rfp.businessAnalysis?.projectType} />
          <InfoItem label="Complexity" value={rfp.costEstimation?.complexity} />
        </div>
        <SubSectionList title="Major Modules" items={toStringList(rfp.businessAnalysis?.majorModules)} />
        <SubSectionList title="Key Features" items={toStringList(rfp.businessAnalysis?.keyFeatures)} />
        <SubSectionList title="Dependencies" items={toStringList(rfp.businessAnalysis?.dependencies)} />
        <SubSectionList title="Assumptions" items={toStringList(rfp.businessAnalysis?.assumptions)} />
      </CollapsibleSection>

      <CollapsibleSection title="Risk Analysis">
        <SubSectionList title="Technical Risks" items={toStringList(rfp.riskAnalysis?.technicalRisks)} />
        <SubSectionList title="Resource Risks" items={toStringList(rfp.riskAnalysis?.resourceRisks)} />
        <SubSectionList title="Timeline Risks" items={toStringList(rfp.riskAnalysis?.timelineRisks)} />
        <SubSectionList title="Security Risks" items={toStringList(rfp.riskAnalysis?.securityRisks)} />
        <SubSectionList title="Mitigation Strategies" items={toStringList(rfp.riskAnalysis?.mitigationStrategies)} />
      </CollapsibleSection>

      <CollapsibleSection title="Cost Estimation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Complexity" value={rfp.costEstimation?.complexity} />
          <InfoItem label="Team Size" value={rfp.costEstimation?.estimatedTeamSize} />
          <InfoItem label="Duration" value={rfp.costEstimation?.estimatedDuration} />
          <InfoItem label="Estimated Cost" value={rfp.costEstimation?.estimatedCost} />
          <InfoItem label="Development Effort" value={rfp.costEstimation?.developmentEffort} />
        </div>
        <SubSectionList title="Recommendations" items={toStringList(rfp.costEstimation?.recommendations)} />
      </CollapsibleSection>

      {/* Proposal Card */}
        {canGenerate && (
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Proposal Document</h2>
          <p className="text-gray-500 text-sm">Generate a comprehensive proposal from the analysis above.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
        
          <button
            onClick={() => setModal({ open: true, type: "generate" })}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {proposalContent ? "Regenerate" : "Generate Proposal"}
          </button>
      

          {proposalContent && (
            <button
              onClick={() => setModal({ open: true, type: "download" })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          )}
        </div>
      </div>
        )}

      {/* ── Confirm: Generate */}
      <ConfirmModal
        open={modal.open && modal.type === "generate"}
        title={proposalContent ? "Regenerate proposal?" : "Generate proposal?"}
        description={
          proposalContent
            ? "This will replace the existing proposal with a freshly generated version. The current document will be overwritten."
            : `A proposal will be drafted for "${rfp.projectName}" using the RFP analysis above. This may take up to a minute.`
        }
        confirmLabel={proposalContent ? "Yes, regenerate" : "Generate"}
        cancelLabel="Cancel"
        variant="primary"
        icon={
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        onConfirm={handleGenerateProposal}
        onCancel={() => setModal({ open: false })}
      />

      {/* ── Confirm: Download */}
      <ConfirmModal
        open={modal.open && modal.type === "download"}
        title="Download proposal PDF?"
        description="The proposal will open as a PDF in a new tab. Make sure your browser allows pop-ups for this site."
        confirmLabel="Download PDF"
        cancelLabel="Cancel"
        variant="success"
        icon={
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        onConfirm={handleDownload}
        onCancel={() => setModal({ open: false })}
      />

      {/* ── Generating overlay */}
      <GeneratingOverlay open={generating} />

      {/* ── Toast stack */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default RFPDetails;