import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useCarrinho } from "../context/CarrinhoContext";
import Card from "../components/Card";

interface Categoria {
  id: number;
  nome: string;
}

interface Subcategoria {
  id: number;
  categoria_id: number;
  nome: string;
}

interface ProdutoAPI {
  id: number;
  nome: string;
  preco_venda: string;
  imagem_url: string | null;
  quantidade_arara: number;
  subcategoria_id: number;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem_url: string;
  quantidade_arara: number;
  subcategoria_id: number;
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  const { adicionar, carrinho, aumentar, diminuir } = useCarrinho();
  const navigate = useNavigate();

  // 🔹 Buscar produtos, categorias e subcategorias
  const buscarDados = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");

      const [produtosRes, categoriasRes, subcategoriasRes] = await Promise.all([
        api.get<ProdutoAPI[]>("/produtos", { headers: { Authorization: `Bearer ${token}` } }),
        api.get<Categoria[]>("/categorias", { headers: { Authorization: `Bearer ${token}` } }),
        api.get<Subcategoria[]>("/subcategorias", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const produtosFormatados: Produto[] = produtosRes.data.map((p) => ({
        id: p.id,
        nome: p.nome,
        preco: parseFloat(p.preco_venda) || 0,
        imagem_url: p.imagem_url?.trim() || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
        quantidade_arara: p.quantidade_arara,
        subcategoria_id: p.subcategoria_id,
      }));

      setProdutos(produtosFormatados);
      setCategorias(categoriasRes.data);
      setSubcategorias(subcategoriasRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  // 🔹 Filtrar produtos
  const produtosFiltrados = produtos.filter((produto) => {
    const sub = subcategorias.find((s) => s.id === produto.subcategoria_id);
    if (!sub) return true;

    if (categoriaSelecionada && sub.categoria_id !== categoriaSelecionada) return false;
    if (subcategoriaSelecionada && sub.id !== subcategoriaSelecionada) return false;

    return true;
  });

  const subcategoriasFiltradas = categoriaSelecionada
    ? subcategorias.filter((s) => s.categoria_id === categoriaSelecionada)
    : [];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-[#1a0a1d] transition-colors duration-300">

      {/* Cabeçalho */}
      <header className="mb-6 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#590C42] dark:text-[#E8B7D4]">
          PDV
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
          Selecione os produtos para adicionar ao carrinho
        </p>
      </header>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Categoria */}
        <select
          value={categoriaSelecionada ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setCategoriaSelecionada(val ? Number(val) : null);
            setSubcategoriaSelecionada(null);
          }}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600"
        >
          <option value="">Todas Categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        {/* Subcategoria */}
        <select
          value={subcategoriaSelecionada ?? ""}
          onChange={(e) => setSubcategoriaSelecionada(e.target.value ? Number(e.target.value) : null)}
          className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 ${!categoriaSelecionada ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed" : ""}`}
          disabled={!categoriaSelecionada}
        >
          <option value="">Todas Subcategorias</option>
          {subcategoriasFiltradas.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
      </div>

      {/* Loader */}
      {carregando ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-t-[#812C65] border-gray-200 rounded-full animate-spin"></div>
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {produtosFiltrados.map((produto) => {
            const itemNoCarrinho = carrinho.find((item) => item.id === produto.id);
            return (
              <Card
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                preco_venda={produto.preco}
                imagem_url={produto.imagem_url}
                quantidade_arara={produto.quantidade_arara}
                quantidadeNoCarrinho={itemNoCarrinho?.quantidade || 0}
                onAdicionar={() =>
                  adicionar({ ...produto, quantidade: 1, estoque: produto.quantidade_arara, quantidade_deposito: 0 })
                }
                onAumentar={() => aumentar(produto.id)}
                onDiminuir={() => diminuir(produto.id)}
              />
            );
          })}
        </section>
      )}

      {/* Botão fixo do carrinho */}
      {carrinho.length > 0 && (
        <button
          onClick={() => navigate("/pdv/carrinho")}
          className="
            fixed bottom-4 left-1/2 transform -translate-x-1/2
            bg-[#812C65] dark:bg-[#590C42]
            hover:bg-[#954A79] dark:hover:bg-[#812C65]
            text-white font-bold
            py-3 px-6 sm:py-4 sm:px-8
            rounded-full shadow-2xl
            text-base sm:text-lg md:text-xl
            transition-all duration-300
            z-50
          "
        >
          🛒 {totalItens} {totalItens === 1 ? "item" : "itens"} no carrinho
        </button>
      )}
    </main>
  );
}