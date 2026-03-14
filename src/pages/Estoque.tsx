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

  const [estoqueOriginal, setEstoqueOriginal] = useState({
    arara: 0,
    deposito: 0,
  });

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

    const arara = est?.quantidade_arara ?? 0;
    const deposito = est?.quantidade_deposito ?? 0;

    setEstoqueOriginal({
      arara,
      deposito,
    });

    setModalProduto({
      ...prod,
      quantidade_arara: String(arara),
      quantidade_deposito: String(deposito),
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
      const difArara = araraNum - estoqueOriginal.arara;
      const difDeposito = depositoNum - estoqueOriginal.deposito;

      if (difArara !== 0) {
        await api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalProduto.id,
          tipo: difArara > 0 ? "entrada" : "saida",
          local: "arara",
          quantidade: Math.abs(difArara),
          motivo: "Ajuste manual",
        });
      }

      if (difDeposito !== 0) {
        await api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalProduto.id,
          tipo: difDeposito > 0 ? "entrada" : "saida",
          local: "deposito",
          quantidade: Math.abs(difDeposito),
          motivo: "Ajuste manual",
        });
      }

      if (difArara === 0 && difDeposito === 0) {
        setMensagem("Nenhuma alteração feita.");
        setLoading(false);
        setTimeout(() => setMensagem(""), 3000);
        return;
      }

      setMensagem("Estoque atualizado!");

      await fetchEstoques();

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

      return (
        (e?.quantidade_arara ?? 0) < 5 ||
        (e?.quantidade_deposito ?? 0) < 5
      );
    });

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#2A102D] flex flex-col gap-4">

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-pink-300">
        Estoque
      </h1>

      {mensagem && (
        <div className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow">
          {mensagem}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">

        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:max-w-md p-2 border rounded-lg 
          bg-white text-gray-900 
          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        />

        <button
          onClick={() => setMostrarEstoqueBaixo(!mostrarEstoqueBaixo)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          {mostrarEstoqueBaixo ? "Mostrar todos" : "Estoque baixo"}
        </button>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full border-collapse text-left text-gray-900 dark:text-gray-100">

          <thead className="bg-purple-200 dark:bg-gray-800 hidden sm:table-header-group">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Arara</th>
              <th className="p-3">Depósito</th>
              <th className="p-3">Total</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>

            {produtosFiltrados.map((p) => {

              const e = estoques.find((x) => x.produto_id === p.id);

              const arara = e?.quantidade_arara ?? 0;
              const deposito = e?.quantidade_deposito ?? 0;
              const total = arara + deposito;

              const preco = Number(p.preco_venda).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });

              const estoqueBaixo = arara < 5 || deposito < 5;

              return (

                <tr
                  key={p.id}
                  className="border-b border-gray-200 dark:border-gray-700
                  flex flex-col sm:table-row
                  bg-white dark:bg-gray-900
                  rounded-lg sm:rounded-none
                  shadow-sm sm:shadow-none
                  p-3 sm:p-0 mb-3 sm:mb-0"
                >

                  <td className="p-1 sm:p-3 flex justify-between sm:table-cell">

                    <span className="font-semibold sm:hidden">Produto</span>

                    <div className="flex gap-2 items-center">

                      {p.nome}

                      {estoqueBaixo && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          baixo
                        </span>
                      )}

                    </div>

                  </td>

                  <td className="p-1 sm:p-3 flex justify-between sm:table-cell">
                    <span className="font-semibold sm:hidden">Preço</span>
                    {preco}
                  </td>

                  <td className="p-1 sm:p-3 flex justify-between sm:table-cell">
                    <span className="font-semibold sm:hidden">Arara</span>
                    {arara}
                  </td>

                  <td className="p-1 sm:p-3 flex justify-between sm:table-cell">
                    <span className="font-semibold sm:hidden">Depósito</span>
                    {deposito}
                  </td>

                  <td className="p-1 sm:p-3 flex justify-between sm:table-cell font-semibold">
                    <span className="font-semibold sm:hidden">Total</span>
                    {total}
                  </td>

                  <td className="p-1 sm:p-3 flex justify-end sm:table-cell mt-2 sm:mt-0">
                    <button
                      onClick={() => abrirModal(p)}
                      className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg"
                    >
                      Gerenciar
                    </button>
                  </td>

                </tr>

              );
            })}

          </tbody>

        </table>

      </div>

      {modalProduto && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">

          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded-xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              {modalProduto.nome}
            </h2>

            <div className="flex flex-col gap-4">

              <label className="flex justify-between items-center">
                Arara
                <input
                  type="number"
                  value={modalProduto.quantidade_arara}
                  onChange={(e) =>
                    setModalProduto({
                      ...modalProduto,
                      quantidade_arara: e.target.value,
                    })
                  }
                  className="w-24 border rounded px-2 py-1 
                  bg-white text-gray-900 
                  dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </label>

              <label className="flex justify-between items-center">
                Depósito
                <input
                  type="number"
                  value={modalProduto.quantidade_deposito}
                  onChange={(e) =>
                    setModalProduto({
                      ...modalProduto,
                      quantidade_deposito: e.target.value,
                    })
                  }
                  className="w-24 border rounded px-2 py-1 
                  bg-white text-gray-900 
                  dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </label>

            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

              <button
                onClick={() => setModalProduto(null)}
                className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={salvarAlteracoes}
                disabled={loading}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
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