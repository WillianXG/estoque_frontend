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

  // Buscar vendedoras
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

  // Adicionar nova vendedora
  async function salvarVendedora(v: Vendedora) {
    try {
      setLoading(true);

      if (v.id) {
        // Atualizar
        const res = await api.put(`/vendedoras/${v.id}`, v);
        setVendedoras((prev) =>
          prev.map((x) => (x.id === v.id ? res.data : x))
        );
        setMensagem("Vendedora atualizada!");
      } else {
        // Criar
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

  // Remover vendedora
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendedoras</h1>

      {mensagem && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {mensagem}
        </div>
      )}

      <button
        onClick={() => setModalVendedora({ id: "", nome: "", telefone: "", codigo: "", role: "vendedora" })}
        className="mb-4 bg-[#954a79] text-white px-4 py-2 rounded hover:bg-[#812c65]"
      >
        + Nova Vendedora
      </button>

      {loading && <p className="text-gray-500 mb-4">Carregando...</p>}

      {/* Tabela de vendedoras */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Role</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendedoras.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{v.nome}</td>
                <td className="p-3">{v.telefone}</td>
                <td className="p-3">{v.codigo}</td>
                <td className="p-3 capitalize">{v.role}</td>
                <td className="p-3 text-right flex gap-2 justify-end">
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

      {/* Modal de criação/edição */}
      {modalVendedora && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 relative">
            <h2 className="text-xl font-bold mb-4">
              {modalVendedora.id ? "Editar Vendedora" : "Nova Vendedora"}
            </h2>

            <input
              type="text"
              placeholder="Nome"
              value={modalVendedora.nome}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, nome: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

            <input
              type="text"
              placeholder="Telefone"
              value={modalVendedora.telefone}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, telefone: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

            <select
              value={modalVendedora.role}
              onChange={(e) =>
                setModalVendedora({ ...modalVendedora, role: e.target.value as "vendedora" | "admin" })
              }
              className="border rounded px-3 py-2 w-full mb-2"
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
    </div>
  );
}