import {
  FaRobot,
  FaClipboardList,
  FaBriefcase,
  FaExclamationTriangle,
  FaCoins,
  FaFileSignature,
} from "react-icons/fa";

const agents = [
  { name: "Requirement Agent", key: "requirement", icon: FaClipboardList },
  { name: "Business Agent", key: "business", icon: FaBriefcase },
  { name: "Risk Agent", key: "risk", icon: FaExclamationTriangle },
  { name: "Cost Agent", key: "cost", icon: FaCoins },
  { name: "Proposal Agent", key: "proposal", icon: FaFileSignature },
];

const ActiveIndicator = () => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
  </span>
);

const AIAgentStatus = () => {
  return (
    <div className="bg-white p-6 rounded-2xl ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-12px_rgba(15,23,42,0.1)] transition-shadow duration-300">
      <style>{`
        @keyframes agentFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-indigo-50 ring-1 ring-indigo-100 rounded-xl">
          <FaRobot className="text-indigo-600 text-base" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Automation</p>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">AI Agents</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.key}
              className="flex items-center gap-3 p-3 rounded-xl bg-white ring-1 ring-slate-100 hover:ring-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 transition-all duration-200"
              style={{ animation: "agentFadeIn 0.4s ease-out both", animationDelay: `${index * 70}ms` }}
            >
              <Icon className="text-slate-400 text-sm shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{agent.name}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-0.5">
                  <ActiveIndicator /> Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAgentStatus;