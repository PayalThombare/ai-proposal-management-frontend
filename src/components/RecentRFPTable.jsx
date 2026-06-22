import { Link } from "react-router-dom";

const statusConfig = {
  draft: { bg: "bg-gray-100 text-gray-700", label: "Draft" },
  in_progress: { bg: "bg-yellow-100 text-yellow-800", label: "In Progress" },
  completed: { bg: "bg-green-100 text-green-800", label: "Completed" },
  uploaded: { bg: "bg-blue-100 text-blue-800", label: "Uploaded" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.uploaded;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${config.bg}`}>
      {config.label}
    </span>
  );
};

const RecentRFPTable = ({ rfps }) => {
  if (!rfps) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (rfps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Recent RFPs</h2>
        <p className="text-gray-500">No RFPs uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent RFPs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 font-medium text-gray-500">Title</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rfps.slice(0, 5).map((rfp) => (
              <tr key={rfp._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 text-gray-800 font-medium truncate max-w-[200px]">
                  {rfp.projectName || rfp.title || "Untitled"}
                </td>
                <td className="py-3">
                  <StatusBadge status={rfp.status || "uploaded"} />
                </td>
                <td className="py-3 text-right">
                  <Link
                    to={`/rfp/${rfp._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    View <span aria-hidden="true">→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rfps.length > 5 && (
        <div className="mt-4 text-right">
          <Link to="/rfps" className="text-sm text-blue-600 hover:underline">
            View all RFPs →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentRFPTable;