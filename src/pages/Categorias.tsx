import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, FolderTree, X, ChevronRight, Layers } from "lucide-react";
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
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [modalSub, setModalSub] = useState<{ open: boolean; categoria: Categoria | null }>({
    open: false,
    categoria: null,
  });

  // Helper para feedback
  const showToast = (texto: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  };

  const buscarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [resCat, resSub] = await Promise.all([
        api.get("/categorias"),
        api.get("/subcategorias")
      ]);
      setCategorias(resCat.data);
      setSubcategorias(resSub.data);
    } catch {
      showToast("Erro ao carregar dados.", 'erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;
    try {
      const res = await api.post("/categorias", { nome: novaCategoria });
      setCategorias(prev => [...prev, res.data]);
      setNovaCategoria("");
      showToast("Categoria criada com sucesso!");
    } catch {
      showToast("Erro ao criar categoria.", 'erro');
    }
  }

  async function removerCategoria(id: string) {
    if (!window.confirm("Isso excluirá a categoria e suas subcategorias. Continuar?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      setCategorias(prev => prev.filter(c => c.id !== id));
      setSubcategorias(prev => prev.filter(s => s.categoria_id !== id));
      showToast("Categoria removida.");
    } catch {
      showToast("Erro ao remover categoria.", 'erro');
    }
  }

  async function adicionarSubcategoria(categoriaId: string) {
    if (!novaSubcategoria.trim()) return;
    try {
      const res = await api.post("/subcategorias", { nome: novaSubcategoria, categoria_id: categoriaId });
      setSubcategorias(prev => [...prev, res.data]);
      setNovaSubcategoria("");
      showToast("Subcategoria adicionada!");
    } catch {
      showToast("Erro ao criar subcategoria.", 'erro');
    }
  }

  async function removerSubcategoria(id: string) {
    try {
      await api.delete(`/subcategorias/${id}`);
      setSubcategorias(prev => prev.filter(s => s.id !== id));
      showToast("Subcategoria removida.");
    } catch {
      showToast("Erro ao remover subcategoria.", 'erro');
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#1a0a1d] transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] flex items-center gap-2">
              <FolderTree className="w-8 h-8" />
              Categorias
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Organize sua estrutura de produtos</p>
          </div>

          <div className="flex gap-2 bg-white dark:bg-[#2A102D] p-2 rounded-xl shadow-sm border border-gray-100 dark:border-[#3d1a40]">
            <input
              type="text"
              placeholder="Nova categoria..."
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="bg-transparent border-none focus:ring-0 px-3 py-1 dark:text-white w-full md:w-64"
            />
            <button
              onClick={adicionarCategoria}
              className="bg-[#812C65] hover:bg-[#590C42] text-white p-2 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Toast Mensagem */}
        {mensagem && (
          <div className={`fixed bottom-5 right-5 z-[100] p-4 rounded-xl shadow-2xl animate-bounce border ${mensagem.tipo === 'sucesso' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Grid */}
        {loading && categorias.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((cat) => {
              const subsDaCat = subcategorias.filter(s => s.categoria_id === cat.id);
              return (
                <div key={cat.id} className="group bg-white dark:bg-[#2A102D] border border-gray-100 dark:border-[#3d1a40] rounded-2xl p-5 hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => removerCategoria(cat.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold dark:text-white mb-1">{cat.nome}</h2>
                  <p className="text-sm text-gray-500 mb-6">{subsDaCat.length} subcategorias</p>

                  <button
                    onClick={() => setModalSub({ open: true, categoria: cat })}
                    className="w-full flex items-center justify-between text-sm font-semibold 
             bg-gray-100 dark:bg-white/10 
             hover:bg-purple-50 dark:hover:bg-purple-900/40 
             p-3 rounded-xl transition-all 
             text-gray-700 dark:text-purple-100
             hover:text-[#812C65] dark:hover:text-white"
                  >
                    Gerenciar Subcategorias
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Subcategorias */}
        {modalSub.open && modalSub.categoria && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2A102D] rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Subcategorias</h2>
                  <p className="text-sm text-gray-500">{modalSub.categoria.nome}</p>
                </div>
                <button
                  onClick={() => setModalSub({ open: false, categoria: null })}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {subcategorias.filter(s => s.categoria_id === modalSub.categoria?.id).map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-[#1a0a1d] border border-transparent dark:border-gray-800">
                    <span className="font-medium dark:text-gray-200">{sub.nome}</span>
                    <button
                      onClick={() => removerSubcategoria(sub.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {subcategorias.filter(s => s.categoria_id === modalSub.categoria?.id).length === 0 && (
                  <p className="text-center text-gray-400 py-4 italic">Nenhuma subcategoria ainda.</p>
                )}
              </div>

              <div className="p-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-black/10 rounded-b-3xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova subcategoria..."
                    value={novaSubcategoria}
                    onChange={(e) => setNovaSubcategoria(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#1a0a1d] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-[#812C65]"
                  />
                  <button
                    onClick={() => modalSub.categoria && adicionarSubcategoria(modalSub.categoria.id)}
                    className="bg-[#812C65] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#590C42] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}