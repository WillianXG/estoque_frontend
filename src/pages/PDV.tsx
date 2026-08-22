/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCarrinho } from "../context/CarrinhoContext";
import { FiShoppingCart } from "react-icons/fi";

// --- INTERFACES ---
interface Categoria { id: number; nome: string; }
interface Subcategoria { id: number; categoria_id: number; nome: string; }
interface Variante {
  id: number;
  variacao: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
  imagem_url?: string;
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

  // Estados para seleção no Card
  const [variacoesSelecionadas, setVariacoesSelecionadas] = useState<{ [produtoId: number]: string }>({});
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<{ [produtoId: number]: string }>({});

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

  const handleSelecionarCor = (produtoId: number, cor: string) => {
    setVariacoesSelecionadas(prev => ({ ...prev, [produtoId]: cor }));
    setTamanhosSelecionados(prev => ({ ...prev, [produtoId]: "" }));
  };

  const handleSelecionarTamanho = (produtoId: number, tamanho: string) => {
    setTamanhosSelecionados(prev => ({ ...prev, [produtoId]: tamanho }));
  };

  const handleAdicionarAoCarrinho = (produto: Produto, corAtiva: string, tamanhoAtivo: string) => {
    if (!corAtiva || !tamanhoAtivo) return;

    const varianteEncontrada = produto.variantes.find(
      v => v.variacao === corAtiva && v.tamanho === tamanhoAtivo
    );

    if (!varianteEncontrada) return;

    const origem = varianteEncontrada.quantidade_arara > 0 ? 'arara' : 'deposito';
    const estoqueDisponivel = origem === 'arara' 
      ? varianteEncontrada.quantidade_arara 
      : varianteEncontrada.quantidade_deposito;

    if (estoqueDisponivel <= 0) return;

    const imagemFinal = varianteEncontrada.imagem_url || produto.imagem_url;

    adicionar({
      id_carrinho: `${produto.id}-${varianteEncontrada.id}-${origem}`,
      id: produto.id,
      id_variante: varianteEncontrada.id,
      nome: produto.nome,
      tamanho: varianteEncontrada.tamanho,
      variacao: varianteEncontrada.variacao,
      preco: produto.preco,
      imagem_url: imagemFinal,
      quantidade: 1,
      origem: origem,
      estoque: estoqueDisponivel
    } as any);
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
    <main className="min-h-screen p-4 sm:p-8 bg-gray-100 dark:bg-[#120514] transition-colors duration-300">

      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] tracking-tight">Caixa Loja</h1>
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
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-32">
          {produtosFiltrados.map((produto) => {
            const coresDisponiveis = Array.from(new Set(produto.variantes.map(v => v.variacao)));
            
            // Auto-seleciona a primeira cor se não houver seleção
            const corSelecionada = variacoesSelecionadas[produto.id] ?? coresDisponiveis[0] ?? "";

            const tamanhosDisponiveis = produto.variantes
              .filter(v => v.variacao === corSelecionada)
              .map(v => v.tamanho);

            // Auto-seleciona o primeiro tamanho disponível para a cor
            const tamanhoSelecionado = tamanhosSelecionados[produto.id] || tamanhosDisponiveis[0] || "";

            const varianteAtual = produto.variantes.find(
              v => v.variacao === corSelecionada && v.tamanho === tamanhoSelecionado
            );

            const varianteComImagem = produto.variantes.find(
              v => v.variacao === corSelecionada && v.imagem_url
            );

            const imagemExibida = varianteComImagem?.imagem_url || produto.imagem_url;

            const temEstoque = varianteAtual 
              ? (varianteAtual.quantidade_arara > 0 || varianteAtual.quantidade_deposito > 0)
              : false;

            const podeAdicionar = corSelecionada && tamanhoSelecionado && temEstoque;

            return (
              <div
                key={produto.id}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
              >
                {/* Imagem Dinâmica */}
                <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={imagemExibida}
                    alt={produto.nome}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Info do Produto */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg line-clamp-1 mb-2">
                      {produto.nome}
                    </h3>

                    {/* Seleção de Cor */}
                    <div className="mb-3">
                      <span className="text-[11px] font-extrabold text-gray-400 dark:text-gray-400 block mb-1 uppercase tracking-wider">
                        Cor:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {coresDisponiveis.map((cor) => {
                          const ativa = corSelecionada === cor;
                          return (
                            <button
                              key={cor}
                              onClick={() => handleSelecionarCor(produto.id, cor)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                ativa
                                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              {cor}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seleção de Tamanho */}
                    <div className="mb-4">
                      <span className="text-[11px] font-extrabold text-gray-400 dark:text-gray-400 block mb-1 uppercase tracking-wider">
                        Tamanho:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tamanhosDisponiveis.map((tamanho) => {
                          const ativo = tamanhoSelecionado === tamanho;
                          const varItem = produto.variantes.find(
                            v => v.variacao === corSelecionada && v.tamanho === tamanho
                          );
                          const semEstoqueItem = !varItem || (varItem.quantidade_arara <= 0 && varItem.quantidade_deposito <= 0);

                          return (
                            <button
                              key={tamanho}
                              disabled={semEstoqueItem}
                              onClick={() => handleSelecionarTamanho(produto.id, tamanho)}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                semEstoqueItem
                                  ? "bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed line-through"
                                  : ativo
                                  ? "bg-[#00D66C] text-white shadow-sm cursor-pointer"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
                              }`}
                            >
                              {tamanho}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Preço e Botão de Adicionar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xl font-extrabold text-[#00D66C]">
                      R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>

                    <button
                      disabled={!podeAdicionar}
                      onClick={() => handleAdicionarAoCarrinho(produto, corSelecionada, tamanhoSelecionado)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        podeAdicionar
                          ? "bg-[#00D66C] hover:bg-[#00b85c] text-white active:scale-95 cursor-pointer"
                          : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      <FiShoppingCart size={14} />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* BARRA DE CARRINHO FIXA */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[90]">
          <button
            onClick={() => navigate("/pdv/carrinho")}
            className="flex items-center gap-4 bg-[#812C65] text-white px-6 py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 w-full max-w-xs sm:max-w-sm cursor-pointer"
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