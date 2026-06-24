import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import useAuth from "../hooks/useAuth";

// ─────────────────────────────────────────────
// Centered Popup Notification
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
          transform:  visible && !leaving
            ? "scale(1) translateY(0)"
            : "scale(0.88) translateY(16px)",
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

        {title && (
          <p className={`text-base font-bold mb-1 ${cfg.titleColor}`}>{title}</p>
        )}
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
// Login Component
// ─────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notifications, notify, dismiss } = useNotification();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await loginUser(formData);
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (error) {
      const isServer = !error?.response || error?.response?.status >= 500;
      notify(
        isServer
          ? "The server is currently unavailable. Please try again later."
          : error?.response?.data?.message || "Invalid email or password. Please try again.",
        "error",
        isServer ? "Server error" : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* ── Brand panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white p-10 lg:p-14">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3" aria-hidden="true" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-14 lg:mb-20">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">AI Proposal Management</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 max-w-md">
            Every RFP, organized from first draft to signed deal.
          </h2>
          <p className="text-blue-100 max-w-sm">
            Upload proposals, track client details, and keep your whole pipeline in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            "Centralized client & project records",
            "Track every proposal's status at a glance",
            "Built for fast-moving teams",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-blue-50">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 md:py-12">
        <div className="w-full max-w-md">

          {/* Mobile brand header */}
          <div className="md:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800">AI Proposal Management</span>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to manage your proposals</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="you@company.com" autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v3h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3.98 8.223A10.477 10.477 0 001.5 12c1.5 4 5 7 10.5 7 1.6 0 3.07-.31 4.36-.85M6.1 6.1A10.45 10.45 0 0112 5c5.5 0 9 3 10.5 7a10.6 10.6 0 01-2.16 3.36M6.1 6.1L3 3m3.1 3.1l3.53 3.53M17.9 17.9L21 21m-3.1-3.1l-3.53-3.53M9.53 9.53a3 3 0 104.24 4.24" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Need access? Contact your workspace administrator.
          </p>
        </div>
      </div>

      {/* ── Centered popup notifications */}
      <NotificationContainer notifications={notifications} onClose={dismiss} />
    </div>
  );
};

export default Login;