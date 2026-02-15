import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCarrinho } from "../context/CarrinhoContext";
import api from "../api/api";
import Card from "../components/Card";

interface ProdutoAPI {
  id: number;
  nome: string;
  preco_venda: string; // ← vem como string da API
  imagem_url: string;
  quantidade_arara: number;
}

interface Produto {
  id: number;
  nome: string;
  preco: number; // ← aplicação usa number
  imagem_url: string;
  quantidade_arara: number;
}

export default function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const { adicionar, carrinho, aumentar, diminuir } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get<ProdutoAPI[]>(
        api.defaults.baseURL + "/produtos",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 Converte preço para número de forma segura
      const produtosFormatados: Produto[] = res.data.map((produto) => ({
        ...produto,
        preco: parseFloat(produto.preco_venda) || 0,
      }));

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  const totalItens = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <main className="min-h-screen p-6 pb-28 bg-gray-100 dark:bg-[#2A102D] transition-colors duration-300">
      
      {/* Cabeçalho */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#590C42] dark:text-[#E8B7D4]">
          PDV
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Selecione os produtos para adicionar ao carrinho
        </p>
      </header>

      {/* Grid de produtos */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {produtos.map((produto) => {
          const itemNoCarrinho = carrinho.find(
            (item) => item.id === produto.id
          );

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
                adicionar({
                  ...produto,
                  quantidade: 1,
                  estoque: produto.quantidade_arara,
                })
              }
              onAumentar={() => aumentar(produto.id)}
              onDiminuir={() => diminuir(produto.id)}
            />
          );
        })}
      </section>

      {/* Botão fixo do carrinho */}
      {carrinho.length > 0 && (
        <button
          onClick={() => navigate("/pdv/carrinho")}
          className="
            fixed bottom-0 left-0 right-0
            bg-[#812C65] dark:bg-[#590C42]
            hover:bg-[#954A79]
            text-white
            py-4 text-center font-bold text-lg
            shadow-2xl
            transition-all duration-300
          "
        >
          🛒 {totalItens} {totalItens === 1 ? "item" : "itens"}
        </button>
      )}
    </main>
  );
}
