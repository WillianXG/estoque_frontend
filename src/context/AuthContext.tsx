/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode, useContext } from "react";
import api from "../api/api";

interface User {
  id: number;
  nome: string;
  codigo: string;
  role: "admin" | "vendedora";
}

interface AuthContextType {
  user: User | null;
  login: (codigo: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(codigo: string, senha: string) {

    const { data } = await api.post("/auth/login", {
      codigo,
      senha,
    });

    localStorage.setItem("token", data.token);

    const me = await api.get("/auth/me");

    setUser(me.data);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  async function loadUser() {

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {

      const { data } = await api.get("/auth/me");

      setUser(data);

    } catch {

      logout();

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a0a1d]">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-t-[#812C65] border-gray-300 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-300 text-lg font-medium">Carregando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}