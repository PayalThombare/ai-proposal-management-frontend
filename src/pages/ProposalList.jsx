import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllProposals } from "../services/proposalService";

// ==============================
// Toast (copied from your other components)
// ==============================
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-500 text-green-800"
      : "bg-red-50 border-red-500 text-red-800";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border-l-4 transition-all ${bgColor}`}
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

// ==============================
// Status badge helper
// ==============================
const statusConfig = {
  draft: { bg: "bg-gray-100 text-gray-700", label: "Draft" },
  pending: { bg: "bg-yellow-100 text-yellow-800", label: "Pending" },
  in_review: { bg: "bg-blue-100 text-blue-800", label: "In Review" },
  approved: { bg: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { bg: "bg-red-100 text-red-800", label: "Rejected" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { bg: "bg-gray-100 text-gray-700", label: status };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${config.bg}`}
    >
      {config.label}
    </span>
  );
};

// ==============================
// Skeleton Card (loading)
// ==============================
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
    </div>
    <div className="mt-4 flex justify-end gap-2">
      <div className="h-8 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

// ==============================
// Main ProposalList Component
// ==============================
const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | name | status

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };
  const closeToast = () => setToast((prev) => ({ ...prev, show: false }));

  // Fetch data
  useEffect(() => {
    let cancelled = false;

    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await getAllProposals();
        if (!cancelled) setProposals(response.data);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch proposals:", error);
          showToast("Failed to load proposals. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProposals();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data: filter + sort
  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    // Search
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
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      case "name":
        result.sort((a, b) =>
          (a.rfpId?.projectName || "").localeCompare(b.rfpId?.projectName || "")
        );
        break;
      case "status":
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }

    return result;
  }, [proposals, searchQuery, statusFilter, sortBy]);

  // Render loading skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no proposals at all, before filtering)
  if (proposals.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-800">No proposals yet</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Once proposals are generated, they’ll appear here. You can create one from an RFP.
        </p>
        <Link
          to="/rfps"
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          View RFPs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all generated proposals.
          </p>
        </div>
      </div>

      {/* Toolbar: search, filter, sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
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
            placeholder="Search by project name, status, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Project name</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Results count */}
      {filteredProposals.length < proposals.length && (
        <p className="text-sm text-gray-500">
          Showing {filteredProposals.length} of {proposals.length} proposals
        </p>
      )}

      {/* Card grid */}
      {filteredProposals.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal._id}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6 flex flex-col"
            >
              {/* Top: title + status */}
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-lg font-semibold text-gray-900 leading-snug flex-1 min-w-0">
                  {proposal.rfpId?.projectName || (
                    <span className="text-gray-400 italic">Untitled Project</span>
                  )}
                </h2>
                <StatusBadge status={proposal.status} />
              </div>

              {/* Meta data */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Version</p>
                  <p className="font-medium text-gray-700">
                    {proposal.version || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-700">
                    {proposal.createdAt
                      ? new Date(proposal.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* ID snippet (optional) */}
              <p className="mt-3 text-xs text-gray-400 truncate">
                ID: {proposal._id}
              </p>

              {/* Actions */}
              <div className="mt-auto pt-4 flex justify-end gap-2">
                <Link
                  to={`/proposals/${proposal._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty search/filter state */
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700">No proposals match</h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSortBy("newest");
            }}
            className="mt-4 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default ProposalList;