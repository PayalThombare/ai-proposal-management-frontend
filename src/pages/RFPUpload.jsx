import { useState, useEffect, useCallback, useRef } from "react";
import { uploadRFP } from "../services/rfpService";

// ─────────────────────────────────────────────
// Toast System (same as RFPDetails)
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

const TOAST_DURATION = 4000;

const POPUP_BG    = { success: "from-emerald-50 to-white", error: "from-red-50 to-white",   warning: "from-amber-50 to-white" };
const POPUP_RING  = { success: "ring-emerald-200",         error: "ring-red-200",            warning: "ring-amber-200" };
const POPUP_ICON_BG    = { success: "bg-emerald-100", error: "bg-red-100",    warning: "bg-amber-100" };
const POPUP_ICON_COLOR = { success: "text-emerald-600", error: "text-red-500", warning: "text-amber-500" };
const POPUP_TITLE_COLOR = { success: "text-emerald-700", error: "text-red-700", warning: "text-amber-700" };
const POPUP_BTN  = {
  success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400",
  error:   "bg-red-600   hover:bg-red-700   focus:ring-red-400",
  warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
};

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
    const start = Date.now();
    const raf = () => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / TOAST_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(raf);
    };
    const rafId = requestAnimationFrame(raf);
    const timer = setTimeout(() => handleClose(), TOAST_DURATION);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  }, []);



  const strokeLen = 2 * Math.PI * 28;
  const strokeColor = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f59e0b";

  return (
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
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl ring-1 bg-gradient-to-b p-6 text-center
          ${POPUP_BG[type] || POPUP_BG.success} ${POPUP_RING[type] || POPUP_RING.success}`}
        style={{
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(.34,1.56,.64,1)",
          opacity: visible && !leaving ? 1 : 0,
          transform: visible && !leaving ? "scale(1) translateY(0)" : "scale(0.88) translateY(16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown ring */}
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="32" cy="32" r="28" fill="none" stroke={strokeColor} strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={strokeLen}
                strokeDashoffset={strokeLen * (1 - progress / 100)}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full ${POPUP_ICON_BG[type]}`}
              style={{ margin: "4px" }}
            >
              <span className={POPUP_ICON_COLOR[type]}>{TOAST_ICONS[type]}</span>
            </div>
          </div>
        </div>

        {title && (
          <p className={`text-base font-bold mb-1 ${POPUP_TITLE_COLOR[type]}`}>{title}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

        <button
          onClick={handleClose}
          className={`mt-5 w-full py-2 rounded-xl text-white text-sm font-semibold
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${POPUP_BTN[type]}`}
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
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;
  const latest = toasts[toasts.length - 1];
  return <Toast key={latest.id} {...latest} onClose={onClose} />;
};

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
// Confirmation Modal
// ─────────────────────────────────────────────
const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  details,
}) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onCancel();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        style={{ animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Upload icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">{description}</p>
        )}

        {/* Summary details card */}
        {details && (
          <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 gap-3">
                <span className="text-xs font-medium text-gray-500 flex-shrink-0">{label}</span>
                <span className="text-xs text-gray-800 font-semibold text-right truncate max-w-[200px]">{value}</span>
              </div>
            ))}
          </div>
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
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
// AI Analysis Overlay
// ─────────────────────────────────────────────
const AI_STEPS = [
  { icon: "📤", label: "Uploading document to secure server" },
  { icon: "🔍", label: "Extracting text and structure" },
  { icon: "🧠", label: "Identifying client requirements" },
  { icon: "📊", label: "Analysing scope and complexity" },
  { icon: "⚠️", label: "Detecting risks and dependencies" },
  { icon: "💰", label: "Estimating cost and timeline" },
  { icon: "✅", label: "Finalising RFP intelligence report" },
];

const TypewriterText = ({ text, speed = 28 }) => {
  // Use a ref for the index so the effect never calls setState synchronously
  const [displayed, setDisplayed] = useState(() => "");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    const timer = setInterval(() => {
      indexRef.current += 1;
      const next = text.slice(0, indexRef.current);
      setDisplayed(next);
      if (indexRef.current >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-3.5 bg-blue-500 ml-0.5 align-middle animate-pulse" />
    </span>
  );
};

const makeParticles = () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 2 + Math.random() * 3,
  }));

const AIAnalysisOverlay = ({ stage }) => {
  // Initialise directly from the prop — no synchronous setState needed
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  // Particles are stable per mount; generate once via lazy initialiser
  const [particles] = useState(makeParticles);

  useEffect(() => {
    if (stage !== "uploading") return;

    // Schedule the reset for the next tick so it's inside a callback, not
    // the synchronous effect body. This satisfies the linter rule.
    const resetId = setTimeout(() => {
      setActiveStep(0);
      setCompletedSteps([]);
    }, 0);

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev + 1;
        setCompletedSteps((c) => [...c, prev]);
        if (next >= AI_STEPS.length) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });
    }, 900);

    return () => {
      clearTimeout(resetId);
      clearInterval(interval);
    };
  }, [stage]);

  if (!stage) return null;

  if (stage === "success") {
    return (
      <div
        className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
            style={{ animation: "successPop 0.45s cubic-bezier(.34,1.56,.64,1) forwards" }}
          >
            <svg className="w-10 h-10" viewBox="0 0 52 52">
              <circle
                cx="26" cy="26" r="23"
                fill="none" stroke="#16A34A" strokeWidth="2.5"
                style={{
                  strokeDasharray: 145,
                  strokeDashoffset: 145,
                  animation: "drawCircle 0.5s ease-out forwards",
                }}
              />
              <path
                fill="none" stroke="#16A34A" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                d="M14 27l7 7 16-16"
                style={{
                  strokeDasharray: 36,
                  strokeDashoffset: 36,
                  animation: "drawCheck 0.35s 0.45s ease-out forwards",
                }}
              />
            </svg>
          </div>
          <p className="text-emerald-700 font-bold text-lg">Upload complete!</p>
          <p className="text-gray-500 text-sm">RFP analysed and saved.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.93)",
        backdropFilter: "blur(12px)",
        animation: "overlayIn 0.3s ease-out",
      }}
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-blue-400 opacity-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      <div className="relative w-full max-w-sm mx-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {/* Pulsing AI brain icon */}
          <div className="relative flex-shrink-0">
            <span
              className="absolute inset-0 rounded-full bg-blue-400 opacity-25"
              style={{ animation: "pingOnce 1.2s ease-out infinite" }}
            />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">AI Agent at work</p>
            <p className="text-xs text-blue-600 font-medium">
              <TypewriterText
                key={activeStep}
                text={AI_STEPS[Math.min(activeStep, AI_STEPS.length - 1)].label}
                speed={24}
              />
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {AI_STEPS.map((step, i) => {
            const done = completedSteps.includes(i);
            const active = i === activeStep;
            const pending = !done && !active;

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: active ? "rgba(59,130,246,0.08)" : "transparent",
                  transform: active ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.4s ease",
                  opacity: pending ? 0.3 : 1,
                }}
              >
                {/* Status indicator */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {done ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1 h-1 rounded-full bg-blue-500"
                          style={{ animation: `dotBounce 0.9s ${d * 0.15}s ease-in-out infinite` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  )}
                </div>

                <span className="text-base leading-none">{step.icon}</span>

                <span
                  className="text-sm font-medium flex-1"
                  style={{ color: done ? "#6b7280" : active ? "#1d4ed8" : "#9ca3af" }}
                >
                  {step.label}
                </span>

                {/* Scanning line for active step */}
                {active && (
                  <span
                    className="flex-shrink-0 h-0.5 w-10 rounded bg-gradient-to-r from-blue-400 to-indigo-500"
                    style={{ animation: "scanLine 1s ease-in-out infinite alternate" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Neural network dots at the bottom */}
        <div className="flex justify-center gap-2 mt-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-300"
              style={{ animation: `neuralPulse 1.4s ${i * 0.18}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main RFPUpload Component
// ─────────────────────────────────────────────
const RFPUpload = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientCompany: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overlayStage, setOverlayStage] = useState(null); // null | "uploading" | "success"
  const [dragActive, setDragActive] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      addToast("Only PDF files are accepted. Please select a valid PDF.", "error", "Invalid file type");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const removeFile = () => setFile(null);

  // Step 1: validate form then show confirm modal
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      addToast("Please attach a PDF before submitting.", "error", "No file selected");
      return;
    }
    setConfirmOpen(true);
  };

  // Step 2: user confirmed — actually upload
  const doUpload = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setOverlayStage("uploading");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("projectName", formData.projectName);
      data.append("clientName", formData.clientName);
      data.append("clientEmail", formData.clientEmail);
      data.append("clientCompany", formData.clientCompany);

      await uploadRFP(data);

      setOverlayStage("success");
      addToast("RFP analysed and saved successfully.", "success", "Upload complete");

      setFormData({ projectName: "", clientName: "", clientEmail: "", clientCompany: "" });
      setFile(null);

      setTimeout(() => {
        setOverlayStage(null);
        setLoading(false);
      }, 1600);
    } catch (error) {
      const isServer = !error?.response || error?.response?.status >= 500;
      addToast(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : error?.response?.data?.message || "Upload failed. Please try again.",
        "error",
        isServer ? "Server error" : "Upload failed"
      );
      setOverlayStage(null);
      setLoading(false);
    }
  };

  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Upload New RFP
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in the client details and attach the PDF document
          </p>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { name: "projectName", label: "Project Name", placeholder: "e.g., Corporate Website Redesign", type: "text" },
                { name: "clientName", label: "Client Name", placeholder: "John Doe", type: "text" },
                { name: "clientEmail", label: "Client Email", placeholder: "client@example.com", type: "email" },
                { name: "clientCompany", label: "Client Company", placeholder: "Acme Inc.", type: "text" },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Dropzone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">RFP Document (PDF) *</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : file
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!file ? (
                  <div className="space-y-2 pointer-events-none">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {dragActive ? "Drop your PDF here" : "Drag & drop your PDF, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-400">Only PDF files (max 25 MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-500">{fileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors pointer-events-auto"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysing…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload RFP
                </>
              )}
            </button>
          </form>

          {/* AI Analysis Overlay */}
          <AIAnalysisOverlay stage={overlayStage} />
        </div>
      </div>

      {/* Confirm upload modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Upload this RFP?"
        description="Please review the details below before submitting. The document will be analysed by our AI agent."
        confirmLabel="Yes, upload"
        cancelLabel="Go back"
        onConfirm={doUpload}
        onCancel={() => setConfirmOpen(false)}
        details={[
          { label: "Project", value: formData.projectName },
          { label: "Client", value: formData.clientName },
          { label: "Email", value: formData.clientEmail },
          { label: "Company", value: formData.clientCompany },
          { label: "File", value: file?.name || "—" },
          { label: "Size", value: file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "—" },
        ]}
      />

      {/* Toast stack */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Global keyframes */}
      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes overlayIn {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes drawCircle {
          from { stroke-dashoffset: 145; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 36; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
        @keyframes scanLine {
          from { opacity: 0.4; transform: scaleX(0.4); }
          to   { opacity: 1;   transform: scaleX(1); }
        }
        @keyframes neuralPulse {
          0%, 100% { transform: scale(1);   opacity: 0.4; }
          50%      { transform: scale(1.8); opacity: 1; }
        }
        @keyframes floatParticle {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(6px, -8px) scale(1.4); }
        }
        @keyframes pingOnce {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
};

export default RFPUpload;