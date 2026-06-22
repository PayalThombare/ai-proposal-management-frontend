import { useState, useEffect, useCallback, useRef } from "react";
import { uploadRFP } from "../services/rfpService";

// ==============================
// Toast Component
// ==============================
const Toast = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // wait for exit animation
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-500 text-green-800"
      : "bg-red-50 border-red-500 text-red-800";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${bgColor}`}
      role="alert"
    >
      <span className="text-xl">
        {type === "success" ? (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={handleClose} className="ml-2 text-gray-500 hover:text-gray-700">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ==============================
// Upload Overlay (covers the form while uploading / on success)
// ==============================
const UploadOverlay = ({ stage, percent }) => {
  // stage: "uploading" | "success"
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/85 backdrop-blur-md animate-overlay-in">
      {stage === "uploading" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="url(#rfpProgressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
              <defs>
                <linearGradient id="rfpProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-600">{Math.min(percent, 99)}%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">
            {percent < 90 ? "Uploading your RFP…" : "Finishing up…"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-success-pop">
            <svg className="w-10 h-10" viewBox="0 0 52 52">
              <circle
                className="rfp-checkmark-circle"
                cx="26"
                cy="26"
                r="23"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
              />
              <path
                className="rfp-checkmark-check"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 16-16"
              />
            </svg>
          </div>
          <p className="text-green-700 font-semibold">Upload complete!</p>
        </div>
      )}
    </div>
  );
};

// ==============================
// Main RFPUpload Component
// ==============================
const RFPUpload = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientCompany: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [overlayStage, setOverlayStage] = useState(null); // null | "uploading" | "success"
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Drag state
  const [dragActive, setDragActive] = useState(false);

  const progressTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);
  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  useEffect(() => {
    return () => clearInterval(progressTimerRef.current);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // File selection (from input or drop)
  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      showToast("Only PDF files are allowed", "error");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  // Drag & drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showToast("Please upload a PDF file", "error");
      return;
    }

    setLoading(true);
    setOverlayStage("uploading");
    setUploadProgress(0);

    // Smooth, organic progress motion while the real request is in flight
    progressTimerRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        const step = Math.max(1, Math.floor((90 - prev) / 6));
        return Math.min(prev + step, 90);
      });
    }, 250);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("projectName", formData.projectName);
      data.append("clientName", formData.clientName);
      data.append("clientEmail", formData.clientEmail);
      data.append("clientCompany", formData.clientCompany);

      await uploadRFP(data);

      clearInterval(progressTimerRef.current);
      setUploadProgress(100);
      setOverlayStage("success");
      showToast("RFP uploaded successfully!", "success");

      // Reset form
      setFormData({ projectName: "", clientName: "", clientEmail: "", clientCompany: "" });
      setFile(null);

      setTimeout(() => {
        setOverlayStage(null);
        setLoading(false);
        setUploadProgress(0);
      }, 1400);
    } catch (error) {
      clearInterval(progressTimerRef.current);
      const msg = error?.response?.data?.message || "Upload failed. Please try again.";
      showToast(msg, "error");
      setOverlayStage(null);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // File size formatting
  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with animated gradient text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Upload New RFP
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in the client details and attach the PDF document
          </p>
        </div>

        {/* Main form card */}
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Two-column grid for fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., Corporate Website Redesign"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email *
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="client@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Company *
                </label>
                <input
                  type="text"
                  name="clientCompany"
                  value={formData.clientCompany}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Dropzone file upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFP Document (PDF) *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : file
                    ? "border-green-400 bg-green-50"
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
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {dragActive
                        ? "Drop your PDF here"
                        : "Drag & drop your PDF, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-400">Only PDF files (max 25MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">{fileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload RFP
                </>
              )}
            </button>
          </form>

          {/* Animated overlay shown over the form while uploading and on success */}
          {overlayStage && <UploadOverlay stage={overlayStage} percent={uploadProgress} />}
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Custom CSS for extra animations */}
      <style>{`
        @keyframes overlay-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes success-pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes draw-circle {
          from { stroke-dashoffset: 145; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 36; }
          to { stroke-dashoffset: 0; }
        }

        .animate-overlay-in { animation: overlay-in 0.3s ease-out; }
        .animate-success-pop { animation: success-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .rfp-checkmark-circle {
          stroke-dasharray: 145;
          stroke-dashoffset: 145;
          animation: draw-circle 0.5s ease-out forwards;
        }
        .rfp-checkmark-check {
          stroke-dasharray: 36;
          stroke-dashoffset: 36;
          animation: draw-check 0.35s 0.45s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-overlay-in,
          .animate-success-pop,
          .rfp-checkmark-circle,
          .rfp-checkmark-check {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RFPUpload;