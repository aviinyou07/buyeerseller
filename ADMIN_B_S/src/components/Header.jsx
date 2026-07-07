import React from "react";
import { useLocation, Link } from "react-router-dom";
import { UserCircle2, ChevronRight, Menu } from "lucide-react";
import { api } from "../utils/api";

const Header = ({ setIsMobileMenuOpen }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const profile = api.getProfile();

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
      <div className="flex items-center gap-4">
        {/* User Block info */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group">
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
      </div>
    </header>
  );
};

export default Header;