import { Link } from "react-router-dom";
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaFileAlt } from "react-icons/fa";

const STATUS_CONFIG = {
  draft: { label: "Draft", classes: "bg-slate-100 text-slate-600 ring-slate-200", icon: FaFileAlt },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 ring-amber-200", icon: FaClock },
  in_review: { label: "In Review", classes: "bg-blue-50 text-blue-700 ring-blue-200", icon: FaEye },
  approved: { label: "Approved", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: FaCheckCircle },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 ring-red-200", icon: FaTimesCircle },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ring-1 ring-inset ${config.classes}`}
    >
      <Icon className="text-[11px]" aria-hidden="true" />
      {config.label}
    </span>
  );
};

const RecentProposalTable = ({ proposals }) => {
  // Loading state
  if (!proposals) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-900/5 p-6 animate-pulse">
        <div className="h-5 bg-slate-100 rounded w-40 mb-5" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-5 bg-slate-100 rounded-full w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (proposals.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-900/5 p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center text-emerald-600 text-xl mb-4">
          <FaClipboardList />
        </div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Recent Proposals</h2>
        <p className="text-slate-500 text-sm">No proposals yet. Generate one from an RFP to see it here.</p>
      </div>
    );
  }

  const visible = proposals.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-12px_rgba(15,23,42,0.1)] transition-shadow duration-300 p-6">
      <style>{`
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl text-emerald-600">
          <FaClipboardList className="text-base" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Proposals</h2>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="pb-3 font-medium text-slate-400">Title</th>
              <th className="pb-3 font-medium text-slate-400">Status</th>
              <th className="pb-3 font-medium text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((proposal, index) => (
              <tr
                key={proposal._id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
                style={{ animation: "rowFadeIn 0.35s ease-out both", animationDelay: `${index * 60}ms` }}
              >
                <td className="py-3 pr-4 text-slate-800 font-medium truncate max-w-[220px]">
                  {proposal.title || proposal.rfpId?.projectName || "Untitled"}
                </td>
                <td className="py-3">
                  <StatusBadge status={proposal.status} />
                </td>
                <td className="py-3 text-right">
                  <Link
                    to={`/proposals/${proposal._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    View <span aria-hidden="true">→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {visible.map((proposal, index) => (
          <Link
            key={proposal._id}
            to={`/proposals/${proposal._id}`}
            className="block p-3.5 rounded-xl ring-1 ring-slate-100 hover:ring-blue-200 hover:bg-blue-50/40 transition-colors"
            style={{ animation: "rowFadeIn 0.35s ease-out both", animationDelay: `${index * 60}ms` }}
          >
            <p className="text-slate-800 font-medium truncate mb-2">
              {proposal.title || proposal.rfpId?.projectName || "Untitled"}
            </p>
            <div className="flex items-center justify-between">
              <StatusBadge status={proposal.status} />
              <span className="text-blue-600 text-sm font-medium">View →</span>
            </div>
          </Link>
        ))}
      </div>

      {proposals.length > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-50 text-right">
          <Link to="/proposals" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
            View all proposals →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentProposalTable;