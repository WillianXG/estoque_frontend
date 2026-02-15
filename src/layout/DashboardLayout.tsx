import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#2A102D] transition-colors duration-300">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        
        {/* Header */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Conteúdo */}
        <main
          className="
            flex-1 
            p-6 
            overflow-y-auto
            bg-gray-50 
            dark:bg-[#2A102D]
            transition-colors duration-300
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
