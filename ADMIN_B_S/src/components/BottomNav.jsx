import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserRound, Contact, Folder } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Buyers", icon: Users, path: "/buyers" },
    { title: "Sellers", icon: UserRound, path: "/sellers" },
    { title: "Customers", icon: Contact, path: "/customers" },
    { title: "Categories", icon: Folder, path: "/categories" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden flex justify-around items-center h-[60px] px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <item.icon size={20} className={isActive ? "text-blue-600" : "text-gray-400"} />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNav;
