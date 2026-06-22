import { useEffect, useState } from "react";
import { FaFileAlt, FaClipboardCheck, FaClock } from "react-icons/fa";

const CountUp = ({ end }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}</span>;
};

const DashboardStats = ({ stats }) => {
  const cards = [
    {
      title: "Total RFPs",
      value: stats?.totalRFPs ?? 0,
      icon: <FaFileAlt size={32} />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Proposals",
      value: stats?.totalProposals ?? 0,
      icon: <FaClipboardCheck size={32} />,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals ?? 0,
      icon: <FaClock size={32} />,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  if (!stats) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-10 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-r ${card.gradient} text-white p-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
              <p className="text-4xl font-bold mt-2 tracking-tight">
                <CountUp end={card.value} />
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;