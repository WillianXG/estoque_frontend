import { useEffect, useState } from "react";
import api from "../api/api";

interface Vendedora {
  id: string;
  nome: string;
  telefone: string;
  codigo: string;
  role: "vendedora" | "admin";
}

export default function Vendedoras() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [modalVendedora, setModalVendedora] = useState<Vendedora | null>(null);

  async function buscarVendedoras() {
    try {
      setLoading(true);
      const res = await api.get("/vendedoras");
      setVendedoras(res.data);
    } catch {
      setMensagem("Erro ao carregar vendedoras");
    } finally {
      setLoading(false);
    }
  }

  async function salvarVendedora(v: Vendedora) {
    try {
      setLoading(true);
      if (v.id) {
        const res = await api.put(`/vendedoras/${v.id}`, v);
        setVendedoras((prev) => prev.map((x) => (x.id === v.id ? res.data : x)));
        setMensagem("Vendedora atualizada!");
      } else {
        const res = await api.post("/vendedoras", v);
        setVendedoras((prev) => [...prev, res.data]);
        setMensagem("Vendedora criada!");
      }
      setModalVendedora(null);
    } catch {
      setMensagem("Erro ao salvar vendedora");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerVendedora(id: string) {
    const confirmar = window.confirm("Deseja realmente remover?");
    if (!confirmar) return;

    try {
      setLoading(true);
      await api.delete(`/vendedoras/${id}`);
      setVendedoras((prev) => prev.filter((v) => v.id !== id));
      setMensagem("Vendedora removida!");
    } catch {
      setMensagem("Erro ao remover vendedora");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  useEffect(() => {
    buscarVendedoras();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#2A102D] flex flex-col gap-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-pink-300">
        Vendedoras
      </h1>

      {mensagem && (
        <div className="mb-2 p-2 bg-blue-100 text-blue-700 rounded">{mensagem}</div>
      )}

      <button
        onClick={() =>
          setModalVendedora({ id: "", nome: "", telefone: "", codigo: "", role: "vendedora" })
        }
        className="mb-2 bg-[#954a79] text-white px-4 py-2 rounded hover:bg-[#812c65]"
      >
        + Nova Vendedora
      </button>

      {loading && <p className="text-gray-900 dark:text-white">Carregando...</p>}

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2">
        {vendedoras.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center"
          >
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">{v.nome}</span>
              <span className="text-gray-600 dark:text-gray-300">{v.telefone}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setModalVendedora(v)}
                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => removerVendedora(v.id)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse text-left text-sm sm:text-base">
          <thead className="bg-purple-200 dark:bg-gray-800">
            <tr>
              <th className="p-2 text-gray-900 dark:text-pink-300">Nome</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Telefone</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Código</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Role</th>
              <th className="p-2 text-gray-900 dark:text-pink-300 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendedoras.map((v) => (
              <tr
                key={v.id}
                className="border-b border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700"
              >
                <td className="p-2 text-gray-900 dark:text-white">{v.nome}</td>
                <td className="p-2 text-gray-900 dark:text-white">{v.telefone}</td>
                <td className="p-2 text-gray-900 dark:text-white">{v.codigo}</td>
                <td className="p-2 text-gray-900 dark:text-white capitalize">{v.role}</td>
                <td className="p-2 text-right flex gap-2 justify-end">
                  <button
                    onClick={() => setModalVendedora(v)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removerVendedora(v.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}

            {vendedoras.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhuma vendedora cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {modalVendedora && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-2">
              {modalVendedora.id ? "Editar Vendedora" : "Nova Vendedora"}
            </h2>

            <input
              type="text"
              placeholder="Nome"
              value={modalVendedora.nome}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, nome: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />

            <input
              type="text"
              placeholder="Telefone"
              value={modalVendedora.telefone}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, telefone: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />

            <input
              type="text"
              placeholder="Código"
              value={modalVendedora.codigo}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, codigo: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />

            <select
              value={modalVendedora.role}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, role: e.target.value as "vendedora" | "admin" })
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value="vendedora">Vendedora</option>
              <option value="admin">Admin</option>
            </select>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalVendedora(null)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => modalVendedora && salvarVendedora(modalVendedora)}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}