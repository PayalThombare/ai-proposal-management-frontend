import { FaRobot } from "react-icons/fa";

const agents = [
  { name: "Requirement Agent", key: "requirement" },
  { name: "Business Agent", key: "business" },
  { name: "Risk Agent", key: "risk" },
  { name: "Cost Agent", key: "cost" },
  { name: "Proposal Agent", key: "proposal" },
];

const ActiveIndicator = () => (
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
  </span>
);

const AIAgentStatus = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FaRobot className="text-purple-600 text-xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">AI Agents Status</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.key}
            className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
          >
            <ActiveIndicator />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {agent.name}
              </p>
              <p className="text-xs text-green-600 font-semibold">Active</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAgentStatus;