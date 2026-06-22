import { Link } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaFileSignature,
  FaChartBar,
} from "react-icons/fa";

import useAuth from "../hooks/useAuth";

const QuickActions = () => {
  const { user } = useAuth();

  const actions = [
    {
      to: "/rfp/upload",
      label: "Upload RFP",
      icon: <FaCloudUploadAlt />,
      color:
        "bg-blue-600 hover:bg-blue-700",
      roles: ["admin"],
    },
    {
      to: "/proposals",
      label: "Generate Proposal",
      icon: <FaFileSignature />,
      color:
        "bg-green-600 hover:bg-green-700",
      roles: ["admin", "manager"],
    },
    {
      to: "/rfps",
      label: "View Reports",
      icon: <FaChartBar />,
      color:
        "bg-purple-600 hover:bg-purple-700",
      roles: ["admin", "manager", "user"],
    },
  ];

  const filteredActions =
    actions.filter((action) =>
      action.roles.includes(user?.role)
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

      <h2 className="text-xl font-bold text-gray-800 mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {filteredActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`
              ${action.color}
              text-white
              px-5
              py-4
              rounded-xl
              flex
              items-center
              gap-3
              transition-all
              shadow
              hover:shadow-md
              hover:-translate-y-1
            `}
          >
            <span className="text-xl">
              {action.icon}
            </span>

            <span className="font-medium">
              {action.label}
            </span>
          </Link>
        ))}

      </div>

    </div>
  );
};

export default QuickActions;