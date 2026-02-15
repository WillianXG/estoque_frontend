import { useEffect, useState } from "react";
import api from "../api/api";

interface Produto {
  id: number;
  nome: string;
  preco_venda: string | number | null;
}

interface Estoque {
  id: number;
  produto_id: number;
  quantidade_arara: number;
  quantidade_deposito: number;
}

interface ModalProduto extends Produto {
  quantidade_arara: string;
  quantidade_deposito: string;
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [modalProduto, setModalProduto] = useState<ModalProduto | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mostrarEstoqueBaixo, setMostrarEstoqueBaixo] = useState(false);

  useEffect(() => {
    fetchProdutos();
    fetchEstoques();
  }, []);

  async function fetchProdutos() {
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  }

  async function fetchEstoques() {
    try {
      const res = await api.get("/estoque");
      setEstoques(
        res.data.map((e: Estoque) => ({
          ...e,
          quantidade_arara: e.quantidade_arara ?? 0,
          quantidade_deposito: e.quantidade_deposito ?? 0,
        }))
      );
    } catch (err) {
      console.error("Erro ao buscar estoque", err);
    }
  }

  function abrirModal(prod: Produto) {
    const est = estoques.find((e) => e.produto_id === prod.id);
    setModalProduto({
      ...prod,
      quantidade_arara: String(est?.quantidade_arara ?? 0),
      quantidade_deposito: String(est?.quantidade_deposito ?? 0),
    });
  }

  async function salvarAlteracoes() {
    if (!modalProduto) return;
    setLoading(true);

    const araraNum = Number(modalProduto.quantidade_arara);
    const depositoNum = Number(modalProduto.quantidade_deposito);

    if (isNaN(araraNum) || isNaN(depositoNum)) {
      setMensagem("Quantidades inválidas.");
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    try {
      const estAtual = estoques.find((e) => e.produto_id === modalProduto.id);
      const difArara = araraNum - (estAtual?.quantidade_arara ?? 0);
      const difDeposito = depositoNum - (estAtual?.quantidade_deposito ?? 0);

      // Ajusta arara
      if (difArara !== 0) {
        await api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalProduto.id,
          tipo: difArara > 0 ? "entrada" : "saida",
          local: "arara",
          quantidade: Math.abs(difArara),
          motivo: "Ajuste manual",
        });
      }

      // Ajusta deposito
      if (difDeposito !== 0) {
        await api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalProduto.id,
          tipo: difDeposito > 0 ? "entrada" : "saida",
          local: "deposito",
          quantidade: Math.abs(difDeposito),
          motivo: "Ajuste manual",
        });
      }

      setMensagem("Estoque atualizado!");
      fetchEstoques();
      setModalProduto(null);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar estoque.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  const produtosFiltrados = produtos
    .filter((p) => p.nome.toLowerCase().includes(filtro.toLowerCase()))
    .filter((p) => {
      if (!mostrarEstoqueBaixo) return true;
      const e = estoques.find((x) => x.produto_id === p.id);
      return (e?.quantidade_arara ?? 0) < 5 || (e?.quantidade_deposito ?? 0) < 5;
    });

  const produtosEstoqueBaixo = produtos.filter((p) => {
    const e = estoques.find((x) => x.produto_id === p.id);
    return (e?.quantidade_arara ?? 0) < 5 || (e?.quantidade_deposito ?? 0) < 5;
  });

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#2A102D] flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-pink-300">
        Estoque
      </h1>

      {mensagem && (
        <div className="p-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-pink-300 text-sm sm:text-base shadow">
          {mensagem}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:max-w-md p-2 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
        />

        {produtosEstoqueBaixo.length > 0 && (
          <button
            onClick={() => setMostrarEstoqueBaixo(!mostrarEstoqueBaixo)}
            className="underline text-purple-600 dark:text-pink-400 text-sm sm:text-base"
          >
            {mostrarEstoqueBaixo ? "Mostrar todos" : `Filtrar estoque baixo (${produtosEstoqueBaixo.length})`}
          </button>
        )}
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full border-collapse text-left min-w-[500px] sm:min-w-full text-sm sm:text-base">
          <thead className="bg-purple-200 dark:bg-gray-800">
            <tr>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Produto</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Preço</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Arara</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Depósito</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Total</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-900 dark:text-white">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((p) => {
                const e = estoques.find((x) => x.produto_id === p.id);
                const arara = e?.quantidade_arara ?? 0;
                const deposito = e?.quantidade_deposito ?? 0;
                const total = arara + deposito;
                const precoFormatado = Number(p.preco_venda).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                });

                const estoqueBaixo = arara < 5 || deposito < 5;

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors ${
                      estoqueBaixo ? "bg-red-50 dark:bg-red-900/30" : ""
                    }`}
                  >
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{p.nome}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{precoFormatado}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{arara}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{deposito}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{total}</td>
                    <td className="p-2 sm:p-3">
                      <button
                        onClick={() => abrirModal(p)}
                        className="bg-purple-500 dark:bg-gray-700 hover:bg-purple-600 dark:hover:bg-gray-600 py-1 px-2 sm:px-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition text-xs sm:text-sm text-white"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalProduto && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-2">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl border border-gray-300 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-pink-300">
              {modalProduto.nome}
            </h2>

            <div className="flex flex-col gap-3 sm:gap-4">
              <label className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-900 dark:text-pink-300">Arara:</span>
                <input
                  type="number"
                  min={0}
                  value={modalProduto.quantidade_arara}
                  onChange={(e) =>
                    setModalProduto({ ...modalProduto, quantidade_arara: e.target.value })
                  }
                  className="p-1 w-16 sm:w-20 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                />
              </label>

              <label className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-semibold text-gray-900 dark:text-pink-300">Depósito:</span>
                <input
                  type="number"
                  min={0}
                  value={modalProduto.quantidade_deposito}
                  onChange={(e) =>
                    setModalProduto({ ...modalProduto, quantidade_deposito: e.target.value })
                  }
                  className="p-1 w-16 sm:w-20 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 mt-4">
              <button
                onClick={() => setModalProduto(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-lg text-sm sm:text-base"
              >
                Fechar
              </button>
              <button
                onClick={salvarAlteracoes}
                className="px-4 py-2 bg-purple-500 dark:bg-gray-700 hover:bg-purple-600 dark:hover:bg-gray-600 rounded-lg font-semibold text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}