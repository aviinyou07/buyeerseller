import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useState } from "react";

const AdminLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex bg-[#f5f7fb]">
      
      {/* Sidebar */}
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Area */}
      <div 
        className={`flex-1 min-w-0 transition-all duration-300 w-full ${
          isSidebarExpanded ? "md:ml-[260px]" : "md:ml-[86px]"
        }`}
      >
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="p-2 md:p-4 pb-[80px] md:pb-4">
          <Outlet />
        </main>
        
        <BottomNav />
      </div>

    </div>
  );
};

export default AdminLayout;