/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Eye, 
  Calendar, 
  CreditCard, 
  ShoppingCart, 
  Tag, 
  X,
  PackageCheck,
  ReceiptText
} from "lucide-react";
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

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [selected, setSelected] = useState<Venda | null>(null);
  const [filtro, setFiltro] = useState("");

  const buscarVendas = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    buscarVendas();
  }, [buscarVendas]);

  const vendasFiltradas = filtro
    ? vendas.filter((v) =>
        v.id.toString().includes(filtro) ||
        v.itens.some((i) => i.produtoNome?.toLowerCase().includes(filtro.toLowerCase()))
      )
    : vendas;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#1a0a1d] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] flex items-center gap-2">
              <ReceiptText className="w-8 h-8" />
              Histórico de Vendas
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie e visualize todas as transações realizadas.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID ou Produto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#3d1a40] bg-white dark:bg-[#2A102D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#812C65] transition-all outline-none shadow-sm"
            />
          </div>
        </header>

        {mensagem && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
            <Tag className="w-4 h-4" /> {mensagem}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#812C65]"></div>
            <p className="text-gray-500 animate-pulse">Buscando transações...</p>
          </div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-[#2A102D] rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma venda encontrada para o filtro selecionado.</p>
          </div>
        ) : (
          <>
            {/* MOBILE LIST */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {vendasFiltradas.map((v) => (
                <div key={v.id} className="bg-white dark:bg-[#2A102D] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                      #{v.id}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(v.valorTotal)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-3 h-3" />
                    {new Date(v.data).toLocaleDateString('pt-BR')}
                  </div>
                  <button
                    onClick={() => setSelected(v)}
                    className="w-full py-2 bg-gray-50 dark:bg-[#1a0a1d] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-[#812C65] dark:text-[#E8B7D4]"
                  >
                    <Eye className="w-4 h-4" /> Detalhes
                  </button>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block bg-white dark:bg-[#2A102D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-[#3d1a40]/30 border-b dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Data e Hora</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Canal</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Total</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vendasFiltradas.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium dark:text-white">#{v.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(v.data).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-full">
                          {v.canal}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#590C42] dark:text-[#E8B7D4]">
                        {formatCurrency(v.valorTotal)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelected(v)}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg text-purple-600 dark:text-pink-400 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL DETALHES - ESTILO RECIBO */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#2A102D] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-[#812C65] text-white">
                <div>
                  <h2 className="text-xl font-bold">Venda #{selected.id}</h2>
                  <p className="text-xs opacity-80 uppercase tracking-tighter">Comprovante de Transação</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Canal de Venda</p>
                    <div className="flex items-center gap-2 text-sm font-semibold dark:text-white">
                      <Tag className="w-4 h-4 text-[#812C65]" /> {selected.canal}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Pagamento</p>
                    <div className="flex items-center justify-end gap-2 text-sm font-semibold dark:text-white">
                      {selected.formaPagamento} <CreditCard className="w-4 h-4 text-[#812C65]" />
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <PackageCheck className="w-3 h-3" /> Itens do Pedido
                  </p>
                  <div className="bg-gray-50 dark:bg-[#1a0a1d] rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-800">
                    {selected.itens.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold dark:text-white">{i.produtoNome || `Produto ${i.produtoId}`}</span>
                          <span className="text-xs text-gray-500">{i.quantidade}x {formatCurrency(i.precoUnitario)}</span>
                        </div>
                        <span className="font-semibold dark:text-gray-300">{formatCurrency(i.quantidade * i.precoUnitario)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Section */}
                <div className="pt-4 border-t dark:border-gray-800 flex justify-between items-center">
                  <span className="text-lg font-bold dark:text-white">Total Geral</span>
                  <span className="text-2xl font-black text-[#812C65] dark:text-[#E8B7D4]">{formatCurrency(selected.valorTotal)}</span>
                </div>

                {selected.observacoes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                    <strong>Obs:</strong> {selected.observacoes}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-black/20 text-center">
                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 bg-[#812C65] hover:bg-[#590C42] text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
                >
                  Concluído
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}