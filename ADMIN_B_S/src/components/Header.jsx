import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { UserCircle2, ChevronRight, Menu, LogOut, User } from "lucide-react";
import { api } from "../utils/api";

const Header = ({ setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const profile = api.getProfile();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  // Helper formatting utility to capitalize links cleanly (e.g. all-listings -> All Listings)
  const formatBreadcrumb = (string) => {
    return string
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header
      className="
        h-[56px] 
        bg-white 
        border-b 
        border-gray-200 
        px-6 
        flex 
        items-center 
        justify-between
        sticky
        top-0
        z-40
      "
    >
      {/* Left: Dynamic Breadcrumbs Path tracking */}
      <div className="flex items-center text-sm font-medium">
        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="mr-3 md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Base Parent Root */}
        <Link 
          to="/" 
          className="text-gray-900 font-bold text-lg hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>

        {/* Dynamic Nested Child Route Appendage */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <div key={to} className="flex items-center">
              <ChevronRight size={20} className="text-gray-400 mx-1 flex-shrink-0" />
              {isLast ? (
                <span className="text-blue-600 font-medium text-lg">
                  {formatBreadcrumb(value)}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {formatBreadcrumb(value)}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Profile Actions Panel */}
      <div className="flex items-center gap-4 relative" ref={profileRef}>
        {/* User Block info */}
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group select-none"
        >
          <UserCircle2 size={26} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-semibold text-xs text-gray-800 leading-tight">
              {profile?.full_name || "Admin User"}
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase">
              {profile?.role || "Super Admin"}
            </span>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-50 sm:hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || "Admin User"}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.email || "admin@example.com"}</p>
            </div>
            
            <button
              onClick={() => {
                setIsProfileOpen(false);
                navigate('/settings');
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <User size={16} className="text-gray-400" />
              Profile
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
            >
              <LogOut size={16} className="text-red-400" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;