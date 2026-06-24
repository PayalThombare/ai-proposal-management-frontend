import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllProposals } from "../services/proposalService";

/* ============================
   STATUS META
============================ */
const STATUS_META = {
  draft: { label: "Draft", dot: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-100", accent: "bg-slate-300" },
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", accent: "bg-amber-400" },
  in_review: { label: "In Review", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", accent: "bg-blue-400" },
  approved: { label: "Approved", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", accent: "bg-emerald-400" },
  rejected: { label: "Rejected", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", accent: "bg-rose-400" },
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
const SelectField = ({ value, onChange, options, ariaLabel }) => (
  <div className="relative flex-1">
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      {Icon.chevron}
    </span>
  </div>
);

/* ============================
   TOOLBAR
============================ */
const Toolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearFilters,
  resultsCount,
  totalCount,
}) => {
  const hasActiveFilters = searchQuery || statusFilter !== "all" || sortBy !== "newest";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {Icon.search}
        </span>
        <input
          type="text"
          placeholder="Search by project name, ID, or status…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search proposals"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <SelectField
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "draft", label: "Draft" },
            { value: "pending", label: "Pending review" },
            { value: "in_review", label: "In review" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <SelectField
          ariaLabel="Sort proposals"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "name", label: "Project name (A–Z)" },
            { value: "status", label: "Status" },
          ]}
        />
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
          <span className="font-semibold text-slate-700">{totalCount}</span> proposals
        </p>
      )}
    </div>
  );
};

/* ============================
   PROPOSAL CARD
============================ */
const ProposalCard = ({ proposal }) => {
  const meta = STATUS_META[proposal.status] || STATUS_META.draft;
  const created = proposal.createdAt ? new Date(proposal.createdAt) : null;

  return (
    <Link
      to={`/proposals/${proposal._id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${meta.accent}`} />

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-slate-900">
            {proposal.rfpId?.projectName || (
              <span className="font-normal italic text-slate-400">Untitled project</span>
            )}
          </h2>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Version</p>
            <p className="mt-1 text-sm font-medium text-slate-700">v{proposal.version || "1.0"}</p>
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
          ID {proposal._id?.substring(0, 12)}…
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
   MAIN PROPOSAL LIST
============================ */
const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success", title: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const showToast = useCallback((message, type = "error", title = "") => {
    setToast({ show: true, message, type, title });
  }, []);

  const closeToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  useEffect(() => {
    let isMounted = true;

    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await getAllProposals();
        if (isMounted) setProposals(response.data || []);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch proposals:", error);
          showToast(
            error?.response?.data?.message || "Failed to load proposals. Please try again.",
            "error",
            "Failed to load"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProposals();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p._id?.toLowerCase().includes(query) ||
          p.rfpId?.projectName?.toLowerCase().includes(query) ||
          p.status?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "name":
        result.sort((a, b) => (a.rfpId?.projectName || "").localeCompare(b.rfpId?.projectName || ""));
        break;
      case "status":
        result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      default:
        break;
    }

    return result;
  }, [proposals, searchQuery, statusFilter, sortBy]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
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

  if (proposals.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <EmptyState
          icon={Icon.inbox}
          title="No proposals yet"
          description="Once proposals are generated from RFPs, they'll appear here. Start by creating a proposal from an RFP."
          action={
            <Link
              to="/rfps"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              View RFPs
              {Icon.arrowRight}
            </Link>
          }
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Proposals</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track every proposal generated from your RFPs.
        </p>
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        resultsCount={filteredProposals.length}
        totalCount={proposals.length}
      />

      {filteredProposals.length > 0 ? (
        <div className="grid gap-5 animate-in fade-in duration-300 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal._id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState
            icon={Icon.emptySearch}
            title="No proposals match"
            description="Adjust your search terms or filters to find what you're looking for."
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

export default ProposalList;