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
const [rfpResponse, proposalResponse] =
await Promise.all([
getAllRFPs(),
getAllProposals(),
]);


    const rfpsData =
      rfpResponse?.data || [];

    const proposalsData =
      proposalResponse?.data || [];

    const pendingApprovals =
      proposalsData.filter(
        (proposal) =>
          proposal.status !==
          "approved"
      ).length;

    setRfps(rfpsData);
    setProposals(proposalsData);

    setStats({
      totalRFPs: rfpsData.length,
      totalProposals:
        proposalsData.length,
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
return ( <div className="flex items-center justify-center h-96"> <h2 className="text-xl font-semibold">
Loading Dashboard... </h2> </div>
);
}

return ( <div className="space-y-8">

  {/* Header */}

  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

    <h1 className="text-3xl font-bold text-gray-900">
      Welcome, {user?.name}
    </h1>

    <p className="text-gray-500 mt-2">
      AI Proposal Management Dashboard
    </p>

    <div className="mt-4">
      <RoleBadge
        role={user?.role}
      />
    </div>

  </div>

  {/* Stats */}

  <DashboardStats
    stats={stats}
  />

  {/* Analytics */}

  <DashboardChart
    stats={stats}
  />

  {/* AI Agents */}

  <AIAgentStatus />

  {/* Quick Actions */}

  <QuickActions />

  {/* Recent Data */}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

    <RecentRFPTable
      rfps={rfps}
    />

    <RecentProposalTable
      proposals={proposals}
    />

  </div>

</div>


);
};

export default Dashboard;
