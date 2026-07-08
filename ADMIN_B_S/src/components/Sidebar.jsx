import {
  LayoutDashboard,
  Users,
  UserRound,
  List,
  CheckCircle2,
  Settings,
  ShoppingBag,
  Contact,
  Landmark,
  LogOut,
  Folder,
  FileText,
  BarChart3,
  X
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { api } from "../utils/api";

const Sidebar = ({ isExpanded, setIsExpanded, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Customers",
      icon: Contact,
      path: "/customers",
    },
    {
      title: "Categories",
      icon: Folder,
      path: "/categories",
    },
    {
      title: "Forms",
      icon: FileText,
      path: "/forms",
    },
    {
      title: "Approvals",
      icon: CheckCircle2,
      path: "/approvals",
    },
    {
      title: "All Listings",
      icon: List,
      path: "/all-listings",
    },
    {
      title: "Schemes",
      icon: Landmark,
      path: "/schemes",
    },
    {
      title: "Product Insights",
      icon: BarChart3,
      path: "/orders",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed
          left-0
          top-0
          h-screen
          bg-gradient-to-b
          from-[#081028]
          to-[#0b1739]
          text-white
          flex
          flex-col
          justify-between
          border-r
          border-[#1f2b4d]
          transition-all
          duration-300
          z-50
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${(isExpanded || isMobileMenuOpen) ? "w-[260px]" : "w-[86px]"}
        `}
      >
        {/* Top */}
        <div>
          {/* Logo */}
          <div
            className={`
              h-[74px]
              flex
              items-center
              border-b
              border-[#1f2b4d]
              transition-all
              duration-300
              ${(isExpanded || isMobileMenuOpen) ? "px-6 justify-between" : "justify-center"}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
                <ShoppingBag size={24} className="text-blue-500" />
              </div>
              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-300
                  ${(isExpanded || isMobileMenuOpen) ? "w-[130px] opacity-100" : "w-0 opacity-0"}
                `}
              >
                <h1 className="text-[15px] font-semibold leading-5 whitespace-nowrap">
                  Buyer & Seller
                </h1>
                <p className="text-[15px] font-semibold whitespace-nowrap">
                  Platform
                </p>
              </div>
            </div>
            {(isMobileMenuOpen || isExpanded) && (
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>


          {/* Menu */}
          <div className="px-3 py-2 space-y-2">
            {menuItems.map((item, index) => {
              // Hide these items on mobile because they are in BottomNav
              const isBottomNavItem = ["/", "/customers", "/categories"].includes(item.path);
              
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    ${isBottomNavItem ? 'hidden md:flex' : 'flex'} items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-gray-400 hover:bg-[#1a264a] hover:text-gray-100"
                    }
                  `}
                >

                  <item.icon
                    size={20}
                    className={`
                      shrink-0
                      transition-colors
                      ${
                        location.pathname === item.path
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-100"
                      }
                    `}
                  />
                  <span
                    className={`
                      font-medium
                      text-sm
                      whitespace-nowrap
                      transition-all
                      duration-300
                      ${(isExpanded || isMobileMenuOpen) ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}
                    `}
                  >
                    {item.title}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-[#1f2b4d]">
          <button
            onClick={() => {
              api.logout();
            }}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5
              text-red-400 hover:bg-red-500/10 hover:text-red-300
              rounded-lg transition-colors group
              ${(isExpanded || isMobileMenuOpen) ? "justify-start" : "justify-center"}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`
                font-medium text-sm whitespace-nowrap
                transition-all duration-300
                ${(isExpanded || isMobileMenuOpen) ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}
              `}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
