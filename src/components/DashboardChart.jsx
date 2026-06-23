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
import { Link } from "react-router-dom";
import { FaChartBar, FaCloudUploadAlt } from "react-icons/fa";

import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];
const formatNumber = (value) => new Intl.NumberFormat().format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 px-4 py-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          <span className="text-gray-900 font-bold text-lg">{formatNumber(payload[0].value)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardChart = ({ stats }) => {
  const reducedMotion = usePrefersReducedMotion();

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-[300px] bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaChartBar className="text-blue-600 text-lg" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analytics Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Snapshot of your key metrics</p>
        </div>
      </div>

      {/* Empty state (all zero) */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FaChartBar className="text-gray-300 text-3xl" aria-hidden="true" />
          </div>
          <p className="text-gray-500 font-medium">No data to display</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Upload your first RFP or generate a proposal to see analytics.
          </p>
          <Link
            to="/rfp/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <FaCloudUploadAlt /> Upload RFP
          </Link>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            {/* Gradient definitions */}
            <defs>
              {COLORS.map((color, i) => (
                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>

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
              tickFormatter={formatNumber}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              barSize={60}
              isAnimationActive={!reducedMotion}
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
                formatter={formatNumber}
                style={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Mini footer with total count */}
      {hasData && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-between text-sm text-gray-500">
          <span>
            Total RFPs & Proposals:{" "}
            <strong className="text-gray-700">
              {formatNumber((stats.totalRFPs || 0) + (stats.totalProposals || 0))}
            </strong>
          </span>
          <span>
            Pending approvals:{" "}
            <strong className="text-amber-600">{formatNumber(stats.pendingApprovals || 0)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardChart;