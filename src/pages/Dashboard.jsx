import { useEffect, useState } from "react";

import useAuth from "../hooks/useAuth";
import { getAllRFPs } from "../services/rfpService";
import { getAllProposals } from "../services/proposalService";

import RoleBadge from "../components/RoleBadge";
import DashboardStats from "../components/DashboardStats";
import DashboardChart from "../components/DashboardChart";
import AIAgentStatus from "../components/AIAgentStatus";
import QuickActions from "../components/QuickActions";
import RecentRFPTable from "../components/RecentRFPTable";
import RecentProposalTable from "../components/RecentProposalTable";

// ─── Skeleton primitive ───────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
  />
);

// ─── Skeleton for the header card ─────────────────────────────────────────────
const HeaderSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-9 w-64 mb-3" />
    <Skeleton className="h-4 w-48 mb-4" />
    <Skeleton className="h-6 w-24 rounded-full" />
  </div>
);

// ─── Skeleton for DashboardStats (3 stat cards) ───────────────────────────────
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-10 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    ))}
  </div>
);

// ─── Skeleton for DashboardChart ──────────────────────────────────────────────
const ChartSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-56 w-full rounded-xl" />
  </div>
);

// ─── Skeleton for AIAgentStatus ───────────────────────────────────────────────
const AIAgentSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-36 mb-5" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Skeleton for QuickActions ────────────────────────────────────────────────
const QuickActionsSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-32 mb-5" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Skeleton for a data table ────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <Skeleton className="h-5 w-36 mb-5" />
    <div className="space-y-3">
      {/* Table header row */}
      <div className="flex gap-4 pb-2 border-b border-gray-100">
        {[40, 30, 20].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-${w === 40 ? "2/5" : w === 30 ? "3/10" : "1/5"}`} />
        ))}
      </div>
      {/* Table data rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 py-1 items-center">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Full Dashboard Skeleton ──────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-8">
    <HeaderSkeleton />
    <StatsSkeleton />
    <ChartSkeleton />
    <AIAgentSkeleton />
    <QuickActionsSkeleton />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <TableSkeleton />
      <TableSkeleton />
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalRFPs: 0,
    totalProposals: 0,
    pendingApprovals: 0,
  });

  const [rfps, setRfps] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [rfpResponse, proposalResponse] = await Promise.all([
          getAllRFPs(),
          getAllProposals(),
        ]);

        const rfpsData = rfpResponse?.data || [];
        const proposalsData = proposalResponse?.data || [];

        const pendingApprovals = proposalsData.filter(
          (proposal) => proposal.status !== "approved"
        ).length;

        setRfps(rfpsData);
        setProposals(proposalsData);
        setStats({
          totalRFPs: rfpsData.length,
          totalProposals: proposalsData.length,
          pendingApprovals,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500 mt-2">AI Proposal Management Dashboard</p>
        <div className="mt-4">
          <RoleBadge role={user?.role} />
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Analytics */}
      <DashboardChart stats={stats} />

      {/* AI Agents */}
      <AIAgentStatus />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentRFPTable rfps={rfps} />
        <RecentProposalTable proposals={proposals} />
      </div>
    </div>
  );
};

export default Dashboard;