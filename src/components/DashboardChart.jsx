import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-lg border px-4 py-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].fill }}
          />
          <span className="text-gray-900 font-bold text-lg">
            {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ stats }) => {
  const data = stats
    ? [
        { name: "RFPs", value: stats.totalRFPs || 0 },
        { name: "Proposals", value: stats.totalProposals || 0 },
        { name: "Pending", value: stats.pendingApprovals || 0 },
      ]
    : [];

  const hasData = stats && data.some((item) => item.value > 0);

  // Loading state (no stats object)
  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-[300px] bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analytics Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Snapshot of your key metrics</p>
        </div>
      </div>

      {/* Empty state (all zero) */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-500 font-medium">No data to display</p>
          <p className="text-gray-400 text-sm mt-1">
            Upload your first RFP or generate a proposal to see analytics.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            {/* Gradient definitions */}
            <defs>
              {COLORS.map((color, i) => (
                <linearGradient
                  key={i}
                  id={`barGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>

            {/* Grid lines for readability */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              barSize={60}
              isAnimationActive={true}          // ← animation always active, no state needed
              animationDuration={1200}
              animationEasing="ease-in-out"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={`url(#barGrad${index})`} />
              ))}
              {/* Show values on top of bars */}
              <LabelList
                dataKey="value"
                position="top"
                style={{
                  fill: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Mini footer with total count */}
      {hasData && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
          <span>
            Total RFPs & Proposals:{" "}
            <strong className="text-gray-700">
              {(stats.totalRFPs || 0) + (stats.totalProposals || 0)}
            </strong>
          </span>
          <span>
            Pending approvals:{" "}
            <strong className="text-amber-600">
              {stats.pendingApprovals || 0}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardChart;