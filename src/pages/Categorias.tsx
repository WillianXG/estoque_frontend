import { useEffect, useState } from "react";
import api from "../api/api";

interface Categoria {
  id: string;
  nome: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function buscarCategorias() {
    try {
      setLoading(true);
      const response = await api.get("/categorias");
      setCategorias(response.data);
    } catch (error) {
      setMensagem("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;

    try {
      setLoading(true);

      const response = await api.post("/categorias", {
        nome: novaCategoria,
      });

      // Atualiza sem precisar buscar tudo de novo
      setCategorias((prev) => [...prev, response.data]);
      setNovaCategoria("");
      setMensagem("Categoria criada com sucesso!");
    } catch (error) {
      setMensagem("Erro ao criar categoria.");
    } finally {
      setLoading(false);

      // limpa mensagem depois de 3s
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerCategoria(id: string) {
    const confirmar = window.confirm("Tem certeza que deseja excluir?");
    if (!confirmar) return;

    try {
      setLoading(true);
      await api.delete(`/categorias/${id}`);

      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setMensagem("Categoria removida com sucesso!");
    } catch (error) {
      setMensagem("Erro ao remover categoria.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  useEffect(() => {
    buscarCategorias();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      {/* Mensagem */}
      {mensagem && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {mensagem}
        </div>
      )}

      {/* Formulário */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <button
          onClick={adicionarCategoria}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="mb-4 text-gray-500">Carregando...</p>
      )}

      {/* Tabela */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-right p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-3">{cat.nome}</td>
              <td className="p-3 text-right">
                <button
                  onClick={() => removerCategoria(cat.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}

          {categorias.length === 0 && !loading && (
            <tr>
              <td colSpan={2} className="p-4 text-center text-gray-500">
                Nenhuma categoria cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}