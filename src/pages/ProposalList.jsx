import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllProposals } from "../services/proposalService";

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
        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

/* ============================
   STATUS BADGE WITH ICON
============================ */
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
    label: "Pending",
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

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

/* ============================
   SKELETON CARD (LOADING)
============================ */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 animate-pulse overflow-hidden">
    <div className="flex justify-between items-start gap-3 mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-6 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-3/5" />
      </div>
      <div className="h-8 bg-gray-200 rounded-full w-24 flex-shrink-0" />
    </div>
    <div className="space-y-3 mb-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="pt-4 border-t border-gray-100 flex justify-end">
      <div className="h-9 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

/* ============================
   FILTER & SEARCH TOOLBAR
============================ */
const FilterToolbar = ({
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by project name, ID, or status..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search proposals"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending Review</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort proposals"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Project name (A-Z)</option>
          <option value="status">Status</option>
        </select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results info */}
      {resultsCount < totalCount && (
        <p className="text-xs text-gray-500 font-medium">
          📊 Showing <span className="font-semibold text-gray-700">{resultsCount}</span> of{" "}
          <span className="font-semibold text-gray-700">{totalCount}</span> proposals
        </p>
      )}
    </div>
  );
};

/* ============================
   PROPOSAL CARD
============================ */
const ProposalCard = ({ proposal }) => {
  const createdDate = proposal.createdAt
    ? new Date(proposal.createdAt)
    : null;

  // const statusLabel = statusConfig[proposal.status]?.label || proposal.status;

  return (
    <Link
      to={`/proposals/${proposal._id}`}
      className="group relative bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Background accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-blue-50/50 transition-all duration-200 pointer-events-none" />

      {/* Content */}
      <div className="relative p-6 flex flex-col h-full">
        {/* Top section: Title + Status */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 leading-snug flex-1 min-w-0 group-hover:text-blue-900 transition-colors">
            {proposal.rfpId?.projectName || (
              <span className="text-gray-400 italic font-normal">Untitled Project</span>
            )}
          </h2>
          <div className="flex-shrink-0">
            <StatusBadge status={proposal.status} />
          </div>
        </div>

        {/* Meta information grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Version
            </p>
            <p className="text-base font-semibold text-gray-900">
              v{proposal.version || "1.0"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Created
            </p>
            <p className="text-base font-semibold text-gray-900">
              {createdDate ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "—"}
            </p>
          </div>
        </div>

        {/* ID (truncated) */}
        <p className="text-xs text-gray-500 truncate mb-auto font-mono">
          ID: {proposal._id?.substring(0, 12)}...
        </p>

        {/* Action button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => e.preventDefault()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md group-hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            View Proposal
          </button>
        </div>
      </div>
    </Link>
  );
};

/* ============================
   EMPTY STATE
============================ */
const EmptyState = ({ icon, title, description, action }) => (
  <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center">
    <div className="text-5xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ============================
   MAIN PROPOSAL LIST COMPONENT
============================ */
const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const showToast = useCallback((message, type = "error") => {
    setToast({ show: true, message, type });
  }, []);

  const closeToast = useCallback(
    () => setToast((prev) => ({ ...prev, show: false })),
    []
  );

  // Fetch proposals
  useEffect(() => {
    let isMounted = true;

    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await getAllProposals();
        if (isMounted) {
          setProposals(response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch proposals:", error);
          showToast(
            error?.response?.data?.message || "Failed to load proposals. Please try again."
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

  // Filter and sort
  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p._id?.toLowerCase().includes(query) ||
          p.rfpId?.projectName?.toLowerCase().includes(query) ||
          p.status?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
        break;
      case "name":
        result.sort((a, b) =>
          (a.rfpId?.projectName || "").localeCompare(
            b.rfpId?.projectName || ""
          )
        );
        break;
      case "status":
        result.sort((a, b) =>
          (a.status || "").localeCompare(b.status || "")
        );
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="h-5 bg-gray-200 rounded w-96" />
        </div>

        {/* Filter toolbar skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-200 rounded" />
            <div className="flex-1 h-10 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state: no proposals at all
  if (proposals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState
            icon="📋"
            title="No Proposals Yet"
            description="Once proposals are generated from RFPs, they'll appear here. Start by creating a proposal from an RFP."
            action={
              <Link
                to="/rfps"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <span>📋</span>
                View RFPs
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all generated proposals across your organization.
        </p>
      </div>

      {/* Filter toolbar */}
      <FilterToolbar
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

      {/* Proposals grid or empty search state */}
      {filteredProposals.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal._id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EmptyState
            icon="🔍"
            title="No Proposals Match"
            description="Adjust your search terms or filters to find what you're looking for."
            action={
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200"
              >
                Clear All Filters
              </button>
            }
          />
        </div>
      )}

      {/* Toast notification */}
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

export default ProposalList;