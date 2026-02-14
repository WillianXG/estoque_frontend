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
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow px-6 py-4 flex justify-between items-center transition">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 dark:text-white"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Sistema de Estoque
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg transition"
        >
          {dark ? "🌙" : "☀️"}
        </button>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
