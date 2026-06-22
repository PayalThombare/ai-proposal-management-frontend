import { FaShieldAlt, FaUserTie, FaUserCog } from "react-icons/fa";

const roleConfig = {
  admin: { bg: "bg-red-100 text-red-700", icon: <FaShieldAlt className="mr-1" /> },
  business_analyst: { bg: "bg-blue-100 text-blue-700", icon: <FaUserTie className="mr-1" /> },
  manager: { bg: "bg-green-100 text-green-700", icon: <FaUserCog className="mr-1" /> },
};

const RoleBadge = ({ role }) => {
  const config = roleConfig[role] || { bg: "bg-gray-100 text-gray-700", icon: null };
  const label = role?.replace(/_/g, " ") || role;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${config.bg}`}
    >
      {config.icon}
      {label}
    </span>
  );
};

export default RoleBadge;