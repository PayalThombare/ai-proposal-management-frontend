import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileUpload,
  FaFileAlt,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

import useAuth from "../hooks/useAuth";

// Optional counts (passed from parent or fetched)
const Sidebar = ({ rfpCount = 0, proposalCount = 0 }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-100 text-blue-700 font-medium"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    if (logout) logout();
    else navigate("/login");
  };

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg text-gray-700 hover:bg-gray-50 transition"
        aria-label="Open sidebar"
      >
        <FaBars size={20} />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-white shadow-xl border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ease-in-out
          md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile close */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={closeMobile}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
            aria-label="Close sidebar"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Power
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Proposal Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={closeMobile}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive("/dashboard")}`}
          >
            <FaTachometerAlt className="text-lg" />
            <span className="flex-1">Dashboard</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/rfp/upload"
              onClick={closeMobile}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive("/rfp/upload")}`}
            >
              <FaFileUpload className="text-lg" />
              <span className="flex-1">Upload RFP</span>
            </Link>
          )}

          <Link
            to="/rfps"
            onClick={closeMobile}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive("/rfps")}`}
          >
            <FaFileAlt className="text-lg" />
            <span className="flex-1">RFPs</span>
            {rfpCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {rfpCount}
              </span>
            )}
          </Link>

          <Link
            to="/proposals"
            onClick={closeMobile}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive("/proposals")}`}
          >
            <FaClipboardList className="text-lg" />
            <span className="flex-1">Proposals</span>
            {proposalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {proposalCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role?.replace(/_/g, " ") || "Member"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <FaSignOutAlt size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;