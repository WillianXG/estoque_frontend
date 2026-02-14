import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 transition">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          md:ml-64
        `}
      >
        {/* Header já controla o toggle da sidebar */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}