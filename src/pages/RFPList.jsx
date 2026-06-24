import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllRFPs } from "../services/rfpService";

/* ============================
   STATUS META
============================ */
const STATUS_META = {
  draft: { label: "Draft", dot: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-100", accent: "bg-slate-300" },
  "in-progress": { label: "In Progress", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", accent: "bg-blue-400" },
  review: { label: "Review", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", accent: "bg-blue-400" },
  completed: { label: "Completed", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", accent: "bg-emerald-400" },
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", accent: "bg-amber-400" },
};

/* ============================
   ICONS
============================ */
const Icon = {
  search: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <circle cx="9" cy="9" r="6.5" />
      <path strokeLinecap="round" d="M18 18l-3.8-3.8" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l4 4 8-9" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path strokeLinecap="round" d="M10 6.5v4.5M10 14h.01" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13l2.5-7h11L20 13M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6M4 13h5l1.5 2.5h3L15 13h5" />
    </svg>
  ),
  emptySearch: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path strokeLinecap="round" d="M20 20l-4.3-4.3" />
    </svg>
  ),
};

/* ============================
   CENTERED CONFIRMATION NOTIFICATION
============================ */
const TOAST_STYLE = {
  success: {
    ring: "ring-emerald-100",
    iconWrap: "bg-emerald-50 text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    icon: Icon.check,
  },
  error: {
    ring: "ring-rose-100",
    iconWrap: "bg-rose-50 text-rose-600",
    btn: "bg-rose-600 hover:bg-rose-700",
    icon: Icon.alert,
  },
  warning: {
    ring: "ring-amber-100",
    iconWrap: "bg-amber-50 text-amber-600",
    btn: "bg-amber-500 hover:bg-amber-600",
    icon: Icon.alert,
  },
};

const Toast = ({ message, title, type = "success", onClose }) => {
  const s = TOAST_STYLE[type] || TOAST_STYLE.success;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-2xl shadow-slate-900/10 ring-4 ${s.ring} animate-in zoom-in-95 fade-in duration-200`}
      >
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {Icon.x}
        </button>

        <span className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${s.iconWrap}`}>
          {s.icon}
        </span>

        {title && <p className="text-base font-semibold text-slate-900">{title}</p>}
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{message}</p>

        <button
          onClick={onClose}
          className={`mt-5 w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${s.btn}`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

/* ============================
   STATUS BADGE
============================ */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

/* ============================
   SKELETON CARD
============================ */
const SkeletonCard = () => (
  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 pt-6">
    <span className="absolute inset-x-0 top-0 h-1 bg-slate-100" />
    <div className="flex animate-pulse items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="h-6 w-20 flex-shrink-0 rounded-full bg-slate-100" />
    </div>
    <div className="mt-4 grid animate-pulse grid-cols-2 gap-4 border-t border-slate-100 pt-4">
      <div className="space-y-2">
        <div className="h-2.5 w-10 rounded bg-slate-100" />
        <div className="h-4 w-14 rounded bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-10 rounded bg-slate-100" />
        <div className="h-4 w-16 rounded bg-slate-200" />
      </div>
    </div>
    <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
    <div className="mt-4 flex animate-pulse items-center justify-between border-t border-slate-100 pt-3.5">
      <div className="h-3 w-16 rounded bg-slate-100" />
      <div className="h-4 w-20 rounded bg-slate-100" />
    </div>
  </div>
);

/* ============================
   SELECT FIELD
============================ */
// const SelectField = ({ value, onChange, options, ariaLabel }) => (
//   <div className="relative flex-1">
//     <select
//       value={value}
//       onChange={onChange}
//       aria-label={ariaLabel}
//       className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
//     >
//       {options.map((opt) => (
//         <option key={opt.value} value={opt.value}>
//           {opt.label}
//         </option>
//       ))}
//     </select>
//     <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//       {Icon.chevron}
//     </span>
//   </div>
// );

/* ============================
   TOOLBAR
============================ */
const Toolbar = ({
  searchTerm,
  onSearchChange,
  onClearFilters,
  resultsCount,
  totalCount,
}) => {
  const hasActiveFilters = searchTerm;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {Icon.search}
        </span>
        <input
          type="text"
          placeholder="Search by project, client, or status…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search RFPs"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        {/* <SelectField
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "draft", label: "Draft" },
            { value: "in-progress", label: "In progress" },
            { value: "completed", label: "Completed" },
            { value: "review", label: "Review" },
            { value: "pending", label: "Pending" },
          ]}
        /> */}
        {/* <SelectField
          ariaLabel="Sort RFPs"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "project", label: "Project name" },
            { value: "client", label: "Client name" },
          ]}
        /> */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            aria-label="Clear all filters"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:flex-shrink-0"
          >
            {Icon.x}
            Clear
          </button>
        )}
      </div>

      {resultsCount < totalCount && (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-700">{resultsCount}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalCount}</span> RFPs
        </p>
      )}
    </div>
  );
};

/* ============================
   RFP CARD
============================ */
const RFPCard = ({ rfp }) => {
  const meta = STATUS_META[rfp.status] || STATUS_META.draft;
  const created = rfp.createdAt ? new Date(rfp.createdAt) : null;

  return (
    <Link
      to={`/rfp/${rfp._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${meta.accent}`} />

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-slate-900">
            {rfp.projectName || <span className="font-normal italic text-slate-400">Untitled project</span>}
          </h2>
          <StatusBadge status={rfp.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-700">{rfp.clientName || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Created</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {created
                ? created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                : "—"}
            </p>
          </div>
        </div>

        <p className="mt-3 truncate font-mono text-xs text-slate-400">
          ID {rfp._id?.substring(0, 12)}…
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
          <span className="text-xs text-slate-400">Tap to open</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-transform duration-200 group-hover:translate-x-0.5">
            View details
            {Icon.arrowRight}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ============================
   EMPTY STATE
============================ */
const EmptyState = ({ icon, title, description, action }) => (
  <div className="col-span-full flex flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ============================
   MAIN RFP LIST
============================ */
const RFPList = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success", title: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const showToast = useCallback((message, type = "error", title = "") => {
    setToast({ show: true, message, type, title });
  }, []);

  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  useEffect(() => {
    let cancelled = false;

    const fetchRFPs = async () => {
      try {
        setLoading(true);
        const response = await getAllRFPs();
        if (!cancelled) setRfps(response.data || []);
      } catch (error) {
        if (!cancelled) {
          const isServer = !error?.response || error?.response?.status >= 500;
          showToast(
            isServer
              ? "The server is currently unavailable. Please try again later."
              : error?.response?.data?.message || "Failed to load RFPs. Please try again.",
            "error",
            isServer ? "Server error" : "Failed to load"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRFPs();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const filteredRFPs = useMemo(() => {
    let result = [...rfps];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (rfp) =>
          rfp.projectName?.toLowerCase().includes(term) ||
          rfp.clientName?.toLowerCase().includes(term) ||
          rfp.status?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") result = result.filter((rfp) => rfp.status === statusFilter);

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "project":
        result.sort((a, b) => (a.projectName || "").localeCompare(b.projectName || ""));
        break;
      case "client":
        result.sort((a, b) => (a.clientName || "").localeCompare(b.clientName || ""));
        break;
      default:
        break;
    }

    return result;
  }, [rfps, searchTerm, statusFilter, sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="flex gap-3">
            <div className="h-10 flex-1 animate-pulse rounded bg-slate-100" />
            <div className="h-10 flex-1 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (rfps.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <EmptyState
          icon={Icon.inbox}
          title="No RFPs yet"
          description="There are no Requests for Proposals yet. They'll appear here once uploaded or created."
        />
        {toast.show && (
          <Toast message={toast.message} title={toast.title} type={toast.type} onClose={closeToast} />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">RFPs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track all Requests for Proposals.
        </p>
      </div>

      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        resultsCount={filteredRFPs.length}
        totalCount={rfps.length}
      />

      {filteredRFPs.length > 0 ? (
        <div className="grid gap-5 animate-in fade-in duration-300 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRFPs.map((rfp) => (
            <RFPCard key={rfp._id} rfp={rfp} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState
            icon={Icon.emptySearch}
            title="No matching RFPs"
            description="Try adjusting your search or filters."
            action={
              <button
                onClick={handleClearFilters}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Clear all filters
              </button>
            }
          />
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} title={toast.title} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default RFPList;