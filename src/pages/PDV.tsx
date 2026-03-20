/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCarrinho } from "../context/CarrinhoContext";
import Card from "../components/Card";
import { FiX, FiShoppingCart, FiFilter, FiPackage } from "react-icons/fi";

// --- INTERFACES ---
interface Categoria {
  id: number;
  nome: string;
}

interface Subcategoria {
  id: number;
  categoria_id: number;
  nome: string;
}

interface Variante {
  id: number;
  variacao: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
}

interface ProdutoRespostaAPI {
  id: number;
  nome: string;
  preco_venda: string;
  imagem_url: string | null;
  subcategoria_id: number;
  variantes: Variante[];
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
        api.get<ProdutoRespostaAPI[]>("/produtos", { headers: { Authorization: `Bearer ${token}` } }),
        api.get<Categoria[]>("/categorias", { headers: { Authorization: `Bearer ${token}` } }),
        api.get<Subcategoria[]>("/subcategorias", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const formatados: Produto[] = prodRes.data.map((p) => ({
        id: p.id,
        nome: p.nome,
        preco: parseFloat(p.preco_venda) || 0,
        imagem_url: p.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
        subcategoria_id: p.subcategoria_id,
        variantes: p.variantes || []
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

  // Linha 83 do seu código - O ajuste ideal:
  const handleAdicionarVariante = (variante: Variante, origem: 'arara' | 'deposito') => {
    if (!produtoSelecionado) return;
    const estoqueDisponivel = origem === 'arara' ? variante.quantidade_arara : variante.quantidade_deposito;

    if (estoqueDisponivel <= 0) return;

    adicionar({
      // ESSENCIAL: O contexto deve usar esse ID para diferenciar os itens
      id_carrinho: `${produtoSelecionado.id}-${variante.id}-${origem}`,
      id: produtoSelecionado.id,
      id_variante: variante.id,
      nome: produtoSelecionado.nome,
      tamanho: variante.tamanho,      // Agora o carrinho sabe o tamanho
      variacao: variante.variacao,    // Agora o carrinho sabe a cor/modelo
      preco: produtoSelecionado.preco,
      imagem_url: produtoSelecionado.imagem_url,
      quantidade: 1,
      origem: origem,                 // Agora o carrinho sabe se é Arara ou Depósito
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
          <h1 className="text-4xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] tracking-tight">
            PDV
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Fluxo de Venda Rápida</p>
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#812C65]" />
            <select
              value={categoriaSelecionada ?? ""}
              onChange={(e) => {
                setCategoriaSelecionada(e.target.value ? Number(e.target.value) : null);
                setSubcategoriaSelecionada(null);
              }}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 ring-[#812C65] dark:text-gray-200 text-sm transition-all appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">Todas Categorias</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <select
            disabled={!categoriaSelecionada}
            value={subcategoriaSelecionada ?? ""}
            onChange={(e) => setSubcategoriaSelecionada(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 ring-[#812C65] dark:text-gray-200 text-sm transition-all appearance-none cursor-pointer min-w-[180px] disabled:opacity-50"
          >
            <option value="">Todas Subcategorias</option>
            {subcategoriasFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
      </header>

      {/* ÁREA DE PRODUTOS */}
      {carregando ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-t-[#812C65] border-pink-200 dark:border-pink-900/30 rounded-full animate-spin"></div>
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-32">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="transform transition-all active:scale-95 hover:translate-y-[-4px] cursor-pointer"
              onClick={() => { setProdutoSelecionado(produto); }}
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

      {/* MODAL DE VARIANTES */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProdutoSelecionado(null)}></div>

          <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-white/10">
            {/* Header Modal */}
            <div className="p-6 bg-[#812C65] text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FiPackage className="text-pink-300" size={24} />
                  <h2 className="text-xl font-bold tracking-tight">Estoque da Peça</h2>
                </div>
                <button onClick={() => setProdutoSelecionado(null)} className="p-2 hover:bg-black/10 rounded-full">
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-pink-100 text-sm mt-2 opacity-80">{produtoSelecionado.nome}</p>
            </div>

            {/* Listagem Variantes */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {produtoSelecionado.variantes.map(v => (
                <div key={v.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-black text-gray-800 dark:text-gray-100">
                      Tam: <span className="text-[#812C65] dark:text-[#E8B7D4] uppercase">{v.tamanho}</span>
                    </span>
                    <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-400 shadow-sm uppercase">{v.variacao}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAdicionarVariante(v, 'arara')}
                      disabled={v.quantidade_arara <= 0}
                      className="flex flex-col items-center p-3 rounded-2xl border-2 border-pink-100 dark:border-pink-900/20 hover:border-[#812C65] dark:hover:border-[#E8B7D4] disabled:opacity-30 transition-all active:scale-95"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Arara</span>
                      <span className="text-xl font-black text-gray-700 dark:text-gray-200">{v.quantidade_arara}</span>
                    </button>

                    <button
                      onClick={() => handleAdicionarVariante(v, 'deposito')}
                      disabled={v.quantidade_deposito <= 0}
                      className="flex flex-col items-center p-3 rounded-2xl border-2 border-purple-100 dark:border-purple-900/20 hover:border-[#812C65] dark:hover:border-[#E8B7D4] disabled:opacity-30 transition-all active:scale-95"
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Depósito</span>
                      <span className="text-xl font-black text-gray-700 dark:text-gray-200">{v.quantidade_deposito}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE CARRINHO FIXA */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center z-[90]">
          <button
            onClick={() => navigate("/pdv/carrinho")}
            className="flex items-center gap-6 bg-[#812C65] dark:bg-[#590C42] text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 border border-white/10"
          >
            <div className="relative bg-white/10 p-2 rounded-full">
              <FiShoppingCart size={22} />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItens}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Ver Carrinho</p>
              <p className="text-lg font-bold leading-tight">
                R$ {valorTotalCarrinho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </button>
        </div>
      )}
    </main>
  );
}