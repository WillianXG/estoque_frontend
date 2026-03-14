/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";

interface ItemVenda {
  produtoId: number;
  produtoNome?: string;
  quantidade: number;
  precoUnitario: number;
}

interface Venda {
  id: number;
  data: string;
  canal: string;
  valorTotal: number;
  formaPagamento: string;
  observacoes?: string;
  itens: ItemVenda[];
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [selected, setSelected] = useState<Venda | null>(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function buscarVendas() {
      try {
        setLoading(true);
        const res = await api.get("/vendas");

        const vendasFormatadas: Venda[] = res.data.map((v: any) => ({
          id: v.id,
          data: v.data,
          canal: v.canal,
          valorTotal: Number(v.valor_total),
          formaPagamento: v.forma_pagamento,
          observacoes: v.observacoes,
          itens: (v.itens || []).map((i: any) => ({
            produtoId: i.produto_id,
            produtoNome: i.produto_nome,
            quantidade: Number(i.quantidade),
            precoUnitario: Number(i.preco_unitario),
          })),
        }));

        setVendas(vendasFormatadas);
      } catch (err) {
        setMensagem("Erro ao carregar vendas" + (err instanceof Error ? `: ${err.message}` : ""));
      } finally {
        setLoading(false);
      }
    }

    buscarVendas();
  }, []);

  const vendasFiltradas = filtro
    ? vendas.filter((v) =>
        v.itens.some((i) => i.produtoId.toString().includes(filtro))
      )
    : vendas;

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#2A102D] flex flex-col gap-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-pink-300">
        Vendas
      </h1>

      <input
        type="text"
        placeholder="Pesquisar por produto ID..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full sm:max-w-md p-2 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
      />

      {mensagem && (
        <div className="mb-2 p-2 bg-blue-100 text-blue-700 rounded">{mensagem}</div>
      )}

      {loading && <p className="text-gray-900 dark:text-white">Carregando...</p>}

      {!loading && vendasFiltradas.length === 0 && (
        <p className="text-gray-900 dark:text-white">Nenhuma venda encontrada.</p>
      )}

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2">
        {vendasFiltradas.map((v) => {
          const dataFormatada = new Date(v.data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center"
            >
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Venda #{v.id}
                </span>
                <span className="text-gray-600 dark:text-gray-300">R$ {v.valorTotal.toFixed(2)}</span>
                <span className="text-gray-500 dark:text-gray-400">{dataFormatada}</span>
              </div>

              <button
                onClick={() => setSelected(v)}
                className="text-xs text-purple-600 dark:text-pink-400"
              >
                detalhes
              </button>
            </div>
          );
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse text-left text-sm sm:text-base">
          <thead className="bg-purple-200 dark:bg-gray-800">
            <tr>
              <th className="p-2 text-gray-900 dark:text-pink-300">ID</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Data</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Total</th>
              <th className="p-2 text-gray-900 dark:text-pink-300">Ações</th>
            </tr>
          </thead>

          <tbody>
            {vendasFiltradas.map((v) => {
              const dataFormatada = new Date(v.data).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={v.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700"
                >
                  <td className="p-2 text-gray-900 dark:text-white">#{v.id}</td>
                  <td className="p-2 text-gray-900 dark:text-white">{dataFormatada}</td>
                  <td className="p-2 text-gray-900 dark:text-white font-semibold">
                    R$ {v.valorTotal.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => setSelected(v)}
                      className="text-xs text-purple-600 dark:text-pink-400"
                    >
                      detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALHES */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Venda #{selected.id} • R$ {selected.valorTotal.toFixed(2)}
            </h2>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Canal:</strong> {selected.canal}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Pagamento:</strong> {selected.formaPagamento}
            </p>
            {selected.observacoes && (
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Observações:</strong> {selected.observacoes}
              </p>
            )}
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Data:</strong> {new Date(selected.data).toLocaleString("pt-BR")}
            </p>

            <div className="flex flex-col gap-1 mt-2">
              <strong className="text-gray-900 dark:text-white">Itens:</strong>
              {selected.itens.map((i, idx) => (
                <span key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                  Produto {i.produtoId} {i.produtoNome && `- ${i.produtoNome}`} • {i.quantidade}x • R$ {i.precoUnitario.toFixed(2)}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-purple-600 text-white p-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}