import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaBars, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    else navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-4 md:px-6 md:ml-64 flex items-center justify-between">
      {/* Left: Brand + hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Open sidebar"
        >
          <FaBars size={20} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2">
          {/* Logo icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          {/* Brand name */}
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
            AI Proposal Management
          </h1>
        </Link>
      </div>

      {/* Right: User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          {/* Name + role (hidden on very small screens) */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-700 leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace(/_/g, " ") || "Member"}
            </p>
          </div>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <>
            {/* Invisible backdrop for closing */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaUserCircle size={14} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt size={14} /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;