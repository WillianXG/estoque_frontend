import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: Props) {
  const { logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
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
    <header className="bg-[#590C42] dark:bg-[#4B1F59] border-b border-[#812C65]/40 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Navegação */}
        <nav className="flex items-center gap-4" aria-label="Menu principal">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white text-2xl hover:text-[#E8B7D4] transition-colors"
            aria-label="Abrir menu lateral"
          >
            ☰
          </button>

          <h1 className="text-xl font-bold tracking-wide text-white">
            Sistema de Estoque
          </h1>
        </nav>

        {/* Ações do usuário */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="bg-[#812C65] hover:bg-[#954A79] text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Alternar tema"
          >
            {dark ? "🌙" : "☀️"}
          </button>

          <button
            onClick={logout}
            className="bg-[#E8B7D4] hover:bg-[#D39AC1] text-[#4B1F59] font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
