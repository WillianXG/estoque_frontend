import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");

    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const newDark = !dark;
    setDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("darkMode", String(newDark));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(codigo, senha);
      navigate("/");
    } catch {
      setError("Código ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#1a0a1d] transition-colors duration-300">

      {/* BOTÃO DARK MODE */}
      <button
        onClick={toggleDark}
        className="absolute top-6 right-6 px-3 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200"
      >
        {dark ? "☀️ Claro" : "🌙 Escuro"}
      </button>

      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold text-center text-[#590C42] dark:text-[#E8B7D4] mb-2">
          Acesso ao Sistema
        </h2>

        <p className="text-center text-gray-500 dark:text-gray-300 text-sm mb-6">
          Área exclusiva para equipe de vendas
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Código de acesso
            </label>

            <input
              type="text"
              placeholder="Digite seu código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={loading}
              className="w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-transparent focus:border-[#812C65] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>

            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              className="w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-transparent focus:border-[#812C65] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#812C65] hover:bg-[#954A79] text-white font-bold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}

            {loading ? "Entrando..." : "Entrar no Sistema"}
          </button>

        </form>

        <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-6">
          Utilize seu código e senha fornecidos pela gerência
        </p>

      </div>

    </main>
  );
}