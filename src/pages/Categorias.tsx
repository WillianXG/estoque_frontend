import { useEffect, useState } from "react";
import api from "../api/api";

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaSubcategoria, setNovaSubcategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [modalSub, setModalSub] = useState<{ open: boolean; categoria: Categoria | null }>({
    open: false,
    categoria: null,
  });

  /** Buscar categorias e subcategorias */
  async function buscarCategorias() {
    try {
      setLoading(true);
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch {
      setMensagem("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarSubcategorias(categoriaId?: string) {
    try {
      const res = await api.get("/subcategorias");
      const data = categoriaId ? res.data.filter((s: Subcategoria) => s.categoria_id === categoriaId) : res.data;
      setSubcategorias(data);
    } catch {
      setMensagem("Erro ao carregar subcategorias.");
    }
  }

  /** CRUD categorias */
  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/categorias", { nome: novaCategoria });
      setCategorias((prev) => [...prev, res.data]);
      setNovaCategoria("");
      setMensagem("Categoria criada!");
    } catch {
      setMensagem("Erro ao criar categoria.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerCategoria(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      setLoading(true);
      await api.delete(`/categorias/${id}`);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setMensagem("Categoria removida!");
    } catch {
      setMensagem("Erro ao remover categoria.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  /** CRUD subcategorias */
  async function adicionarSubcategoria(categoriaId: string) {
    if (!novaSubcategoria.trim()) return;
    try {
      setLoading(true);
      const res = await api.post("/subcategorias", { nome: novaSubcategoria, categoria_id: categoriaId });
      setSubcategorias((prev) => [...prev, res.data]);
      setNovaSubcategoria("");
      setMensagem("Subcategoria criada!");
    } catch {
      setMensagem("Erro ao criar subcategoria.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerSubcategoria(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta subcategoria?")) return;
    try {
      setLoading(true);
      await api.delete(`/subcategorias/${id}`);
      setSubcategorias((prev) => prev.filter((s) => s.id !== id));
      setMensagem("Subcategoria removida!");
    } catch {
      setMensagem("Erro ao remover subcategoria.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  useEffect(() => {
    buscarCategorias();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciar Categorias</h1>

      {mensagem && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{mensagem}</div>
      )}

      {/* Criar nova categoria */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Nova categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={adicionarCategoria}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Adicionar Categoria
        </button>
      </div>

      {/* Grid responsivo de categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categorias.map((cat) => (
          <div key={cat.id} className="bg-white shadow rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-800">{cat.nome}</h2>
              <button
                onClick={() => removerCategoria(cat.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Excluir
              </button>
            </div>

            <button
              onClick={() => {
                setModalSub({ open: true, categoria: cat });
                buscarSubcategorias(cat.id);
              }}
              className="bg-[#954a79] text-white px-3 py-1 rounded hover:bg-green-700 mt-2"
            >
              Gerenciar Subcategorias
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Subcategorias */}
      {modalSub.open && modalSub.categoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Subcategorias de {modalSub.categoria.nome}
            </h2>

            {/* Lista de subcategorias */}
            {subcategorias.map((sub) => (
              <div
                key={sub.id}
                className="flex justify-between items-center border-b py-1"
              >
                <span>{sub.nome}</span>
                <button
                  onClick={() => removerSubcategoria(sub.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Excluir
                </button>
              </div>
            ))}

            {/* Criar nova subcategoria */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Nova subcategoria"
                value={novaSubcategoria}
                onChange={(e) => setNovaSubcategoria(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={() => modalSub.categoria && adicionarSubcategoria(modalSub.categoria.id)}
                className="bg-[#954a79] text-white px-3 py-2 rounded hover:bg-green-700"
              >
                Adicionar
              </button>
            </div>

            <button
              onClick={() => setModalSub({ open: false, categoria: null })}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}