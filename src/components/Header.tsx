import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: Props) {
  const { logout, user } = useAuth(); 
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(true);
    }
  }, []);

  function toggleDarkMode() {
    const isDark = !dark;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  return (
    <header className="bg-white dark:bg-[#1B0A1E] shadow-sm dark:shadow-md border-b border-gray-200 dark:border-[#4B1F59] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center sm:items-stretch py-3 sm:py-0 gap-2 sm:gap-0">

        {/* Menu + Logo */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          {/* Toggle sidebar mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-700 dark:text-gray-300 text-2xl hover:text-[#812C65] transition-colors"
            aria-label="Abrir menu lateral"
          >
            ☰
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-[#E8B7D4] tracking-wide">
            Sistema de Estoque
          </h1>
        </div>

        {/* Ações do usuário */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="bg-gray-100 dark:bg-[#4B1F59] hover:bg-gray-200 dark:hover:bg-[#812C65] text-gray-800 dark:text-white p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            aria-label="Alternar tema"
          >
            {dark ? "🌙" : "☀️"}
          </button>

          {/* Nome do usuário */}
          <div className="bg-gray-100 dark:bg-[#4B1F59] px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center sm:text-left w-full sm:w-auto">
            <span className="text-gray-800 dark:text-white font-medium text-sm sm:text-base truncate block">
              Olá, {user?.nome || "Usuário"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="bg-[#E8B7D4] hover:bg-[#D39AC1] text-[#4B1F59] font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}