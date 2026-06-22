import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllRFPs } from "../services/rfpService";

// ==============================
// Toast Component
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
// Status Badge
// ==============================
const statusConfig = {
  draft: { bg: "bg-gray-100 text-gray-700", label: "Draft" },
  "in-progress": { bg: "bg-yellow-100 text-yellow-800", label: "In Progress" },
  completed: { bg: "bg-green-100 text-green-800", label: "Completed" },
  review: { bg: "bg-blue-100 text-blue-800", label: "Review" },
  pending: { bg: "bg-orange-100 text-orange-800", label: "Pending" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    bg: "bg-gray-100 text-gray-700",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${config.bg}`}
    >
      {config.label}
    </span>
  );
};

// ==============================
// Skeleton Card
// ==============================
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
    <div className="mt-4 flex justify-end">
      <div className="h-8 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

// ==============================
// Main RFPList Component
// ==============================
const RFPList = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };
  const closeToast = () => setToast((prev) => ({ ...prev, show: false }));

  // Fetch RFPs
  useEffect(() => {
    let cancelled = false;

    const fetchRFPs = async () => {
      try {
        setLoading(true);
        const response = await getAllRFPs();
        if (!cancelled) setRfps(response.data);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch RFPs:", error);
          showToast("Failed to load RFPs. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRFPs();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data: filter + search + sort
  const filteredRFPs = useMemo(() => {
    let result = [...rfps];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (rfp) =>
          rfp.projectName?.toLowerCase().includes(term) ||
          rfp.clientName?.toLowerCase().includes(term) ||
          rfp.status?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((rfp) => rfp.status === statusFilter);
    }

    // Sort
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
      case "project":
        result.sort((a, b) =>
          (a.projectName || "").localeCompare(b.projectName || "")
        );
        break;
      case "client":
        result.sort((a, b) =>
          (a.clientName || "").localeCompare(b.clientName || "")
        );
        break;
      default:
        break;
    }

    return result;
  }, [rfps, searchTerm, statusFilter, sortBy]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No RFPs at all
  if (rfps.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">📑</div>
        <h2 className="text-2xl font-bold text-gray-800">No RFPs found</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          There are no Request for Proposals yet. They’ll appear here once
          uploaded or created.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFPs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all Requests for Proposals.
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
            placeholder="Search by project, client, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="review">Review</option>
          <option value="pending">Pending</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="project">Project name</option>
          <option value="client">Client name</option>
        </select>
      </div>

      {/* Results count */}
      {filteredRFPs.length < rfps.length && (
        <p className="text-sm text-gray-500">
          Showing {filteredRFPs.length} of {rfps.length} RFPs
        </p>
      )}

      {/* Card grid */}
      {filteredRFPs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRFPs.map((rfp) => (
            <div
              key={rfp._id}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6 flex flex-col"
            >
              {/* Top: project name + status */}
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-lg font-semibold text-gray-900 leading-snug flex-1 min-w-0">
                  {rfp.projectName || (
                    <span className="text-gray-400 italic">Untitled Project</span>
                  )}
                </h2>
                <StatusBadge status={rfp.status} />
              </div>

              {/* Meta */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-medium text-gray-700">
                    {rfp.clientName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-700">
                    {rfp.createdAt
                      ? new Date(rfp.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* ID snippet */}
              <p className="mt-3 text-xs text-gray-400 truncate">
                ID: {rfp._id}
              </p>

              {/* Action */}
              <div className="mt-auto pt-4 flex justify-end">
                <Link
                  to={`/rfp/${rfp._id}`}
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
        /* Empty search/filter result */
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700">No matching RFPs</h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
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

export default RFPList;