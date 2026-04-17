/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCarrinho } from "../context/CarrinhoContext";
import Card from "../components/Card";
import { FiX, FiShoppingCart, FiAlertCircle } from "react-icons/fi";

// --- INTERFACES ---
interface Categoria { id: number; nome: string; }
interface Subcategoria { id: number; categoria_id: number; nome: string; }
interface Variante {
  id: number;
  variacao: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
}
interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem_url: string;
  subcategoria_id: number;
  variantes: Variante[];
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const { adicionar, carrinho } = useCarrinho();
  const navigate = useNavigate();

  const buscarDados = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      const [prodRes, catRes, subRes] = await Promise.all([
        api.get("/produtos", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/categorias", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/subcategorias", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const formatados: Produto[] = prodRes.data.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        preco: parseFloat(p.preco_venda) || 0,
        imagem_url: p.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
        subcategoria_id: p.subcategoria_id,
        variantes: p.variantes || [] // Garante que nunca seja null
      }));

      setProdutos(formatados);
      setCategorias(catRes.data);
      setSubcategorias(subRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarDados(); }, []);

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const handleAdicionarVariante = (variante: Variante, origem: 'arara' | 'deposito') => {
    if (!produtoSelecionado) return;
    const estoqueDisponivel = origem === 'arara' ? variante.quantidade_arara : variante.quantidade_deposito;

    if (estoqueDisponivel <= 0) return;

    adicionar({
      id_carrinho: `${produtoSelecionado.id}-${variante.id}-${origem}`,
      id: produtoSelecionado.id,
      id_variante: variante.id,
      nome: produtoSelecionado.nome,
      tamanho: variante.tamanho,
      variacao: variante.variacao,
      preco: produtoSelecionado.preco,
      imagem_url: produtoSelecionado.imagem_url,
      quantidade: 1,
      origem: origem,
      estoque: estoqueDisponivel
    } as any);

    setProdutoSelecionado(null);
  };

  const produtosFiltrados = produtos.filter((p) => {
    const sub = subcategorias.find((s) => s.id === p.subcategoria_id);
    if (categoriaSelecionada && sub?.categoria_id !== categoriaSelecionada) return false;
    if (subcategoriaSelecionada && sub?.id !== subcategoriaSelecionada) return false;
    return true;
  });

  const subcategoriasFiltradas = categoriaSelecionada
    ? subcategorias.filter(s => s.categoria_id === categoriaSelecionada)
    : [];

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-[#120514] transition-colors duration-300">

      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] tracking-tight">PDV</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Fluxo de Venda Rápida</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={categoriaSelecionada ?? ""}
            onChange={(e) => {
              setCategoriaSelecionada(e.target.value ? Number(e.target.value) : null);
              setSubcategoriaSelecionada(null);
            }}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 ring-[#812C65] dark:text-gray-200 text-sm appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">Todas Categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          <select
            disabled={!categoriaSelecionada}
            value={subcategoriaSelecionada ?? ""}
            onChange={(e) => setSubcategoriaSelecionada(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 ring-[#812C65] dark:text-gray-200 text-sm appearance-none cursor-pointer min-w-[160px] disabled:opacity-50"
          >
            <option value="">Todas Subcategorias</option>
            {subcategoriasFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
      </header>

      {/* ÁREA DE PRODUTOS */}
      {carregando ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-t-[#812C65] border-pink-200 rounded-full animate-spin"></div>
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 pb-32">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="transform transition-all active:scale-95 cursor-pointer"
              onClick={() => setProdutoSelecionado(produto)}
            >
              <Card
                id={produto.id}
                nome={produto.nome}
                preco_venda={produto.preco}
                imagem_url={produto.imagem_url}
                quantidade_arara={produto.variantes.reduce((acc, v) => acc + v.quantidade_arara, 0)}
                quantidade_deposito={produto.variantes.reduce((acc, v) => acc + v.quantidade_deposito, 0)}
                quantidadeNoCarrinho={0}
                onAdicionar={() => { setProdutoSelecionado(produto); return true; }}
                onAumentar={() => true}
                onDiminuir={() => true}
              />
            </div>
          ))}
        </section>
      )}

      {/* MODAL DE VARIANTES - CORREÇÃO AQUI */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setProdutoSelecionado(null)}></div>

          <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 bg-[#812C65] text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{produtoSelecionado.nome}</h2>
                  <p className="text-pink-200 text-xs mt-1 uppercase tracking-widest font-bold">Selecione o Tamanho/Cor</p>
                </div>
                <button onClick={() => setProdutoSelecionado(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Listagem */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {produtoSelecionado.variantes.length > 0 ? (
                produtoSelecionado.variantes.map(v => (
                  <div key={v.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-gray-700 dark:text-gray-200 uppercase">
                        Tam: {v.tamanho}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm uppercase">
                        {v.variacao}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAdicionarVariante(v, 'arara')}
                        disabled={v.quantidade_arara <= 0}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-pink-100 dark:border-pink-900/20 hover:border-[#812C65] disabled:opacity-20 transition-all active:scale-95"
                      >
                        <span className="text-[9px] font-black text-gray-400 uppercase">Arara</span>
                        <span className="text-lg font-black text-[#812C65] dark:text-pink-400">{v.quantidade_arara}</span>
                      </button>

                      <button
                        onClick={() => handleAdicionarVariante(v, 'deposito')}
                        disabled={v.quantidade_deposito <= 0}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-purple-100 dark:border-purple-900/20 hover:border-[#812C65] disabled:opacity-20 transition-all active:scale-95"
                      >
                        <span className="text-[9px] font-black text-gray-400 uppercase">Depósito</span>
                        <span className="text-lg font-black text-purple-600 dark:text-purple-400">{v.quantidade_deposito}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FiAlertCircle size={48} className="text-amber-500 mb-2" />
                  <p className="text-gray-500 font-bold">Nenhum estoque disponível para este produto.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE CARRINHO FIXA */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[90]">
          <button
            onClick={() => navigate("/pdv/carrinho")}
            className="flex items-center gap-4 bg-[#812C65] text-white px-6 py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 w-full max-w-xs sm:max-w-sm"
          >
            <div className="relative bg-white/20 p-2 rounded-xl">
              <FiShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#812C65]">
                {totalItens}
              </span>
            </div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">Ver Sacola</p>
              <p className="text-lg font-black leading-none">
                R$ {valorTotalCarrinho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </button>
        </div>
      )}
    </main>
  );
}