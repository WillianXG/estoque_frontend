/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import { FiSearch, FiAlertTriangle, FiEdit3, FiPackage, FiLayers, FiMinus, FiPlus, FiX } from "react-icons/fi";

// 1. RECOLOQUE AS INTERFACES (Isso resolve o erro "Cannot find name 'Estoque'")
interface Estoque {
  id: number;
  produto_id: number;
  produto_nome: string;
  cor: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
}

interface ModalEstoque extends Estoque {
  nova_arara: string;
  novo_deposito: string;
}

export default function EstoquePage() {
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [modalItem, setModalItem] = useState<ModalEstoque | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mostrarEstoqueBaixo, setMostrarEstoqueBaixo] = useState(false);

  useEffect(() => {
    fetchEstoques();
  }, []);

  async function fetchEstoques() {
    try {
      const res = await api.get("/estoque");
      setEstoques(res.data.map((e: any) => ({
        ...e,
        quantidade_arara: e.quantidade_arara ?? 0,
        quantidade_deposito: e.quantidade_deposito ?? 0,
      })));
    } catch (err) {
      console.error(err);
    }
  }

  // 2. FUNÇÃO ABRIR MODAL (Resolve o erro "Cannot find name 'abrirModal'")
  function abrirModal(item: Estoque) {
    setModalItem({
      ...item,
      nova_arara: String(item.quantidade_arara),
      novo_deposito: String(item.quantidade_deposito),
    });
  }

  const ajustarValorModal = (campo: 'nova_arara' | 'novo_deposito', delta: number) => {
    if (!modalItem) return;
    const valorAtual = Number(modalItem[campo]);
    const novoValor = Math.max(0, valorAtual + delta);
    setModalItem({ ...modalItem, [campo]: String(novoValor) });
  };

  async function salvarAlteracoes() {
    if (!modalItem) return;
    setLoading(true);

    try {
      const araraFinal = Number(modalItem.nova_arara);
      const depositoFinal = Number(modalItem.novo_deposito);
      const difArara = araraFinal - modalItem.quantidade_arara;
      const difDeposito = depositoFinal - modalItem.quantidade_deposito;

      const promises = [];

      if (difArara !== 0) {
        promises.push(api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalItem.produto_id,
          cor: modalItem.cor,
          tamanho: modalItem.tamanho,
          tipo: difArara > 0 ? "entrada" : "saida",
          local: "arara",
          quantidade: Math.abs(difArara),
          motivo: "Ajuste manual",
        }));
      }

      if (difDeposito !== 0) {
        promises.push(api.post("/movimentacoes-estoque/ajustar", {
          produto_id: modalItem.produto_id,
          cor: modalItem.cor,
          tamanho: modalItem.tamanho,
          tipo: difDeposito > 0 ? "entrada" : "saida",
          local: "deposito",
          quantidade: Math.abs(difDeposito),
          motivo: "Ajuste manual",
        }));
      }

      if (promises.length > 0) await Promise.all(promises);
      
      setMensagem("Estoque atualizado!");
      await fetchEstoques();
      setModalItem(null);
    } catch (error: any) { // Mudado de 'err' para 'error' para evitar conflito de nomes
      console.error(error);
      setMensagem("Erro ao salvar.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  const estoquesFiltrados = estoques.filter(item => {
    const termo = filtro.toLowerCase();
    const matchesFiltro = 
      item.produto_nome.toLowerCase().includes(termo) ||
      item.cor.toLowerCase().includes(termo) ||
      item.tamanho.toLowerCase().includes(termo);

    return mostrarEstoqueBaixo 
      ? matchesFiltro && (item.quantidade_arara < 5 || item.quantidade_deposito < 5) 
      : matchesFiltro;
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#120514] p-4 sm:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#590C42] dark:text-[#E8B7D4] tracking-tight">Gestão de Grade</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Controle total de variantes e locais.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full sm:w-80 pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 ring-purple-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button
              onClick={() => setMostrarEstoqueBaixo(!mostrarEstoqueBaixo)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                mostrarEstoqueBaixo 
                ? "bg-purple-600 text-white shadow-purple-500/20" 
                : "bg-white dark:bg-white/5 text-red-500 border border-red-200 dark:border-red-900/30"
              }`}
            >
              {mostrarEstoqueBaixo ? <FiLayers /> : <FiAlertTriangle />}
              {mostrarEstoqueBaixo ? "Todos Itens" : "Estoque Baixo"}
            </button>
          </div>
        </header>

        {mensagem && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-3">
            <FiPackage /> {mensagem}
          </div>
        )}

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-gray-50 dark:bg-white/5 border-b dark:border-white/10">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-gray-400">Produto / Variante</th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Arara</th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Depósito</th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-gray-400 text-center">Total</th>
                <th className="p-6 text-xs font-black uppercase tracking-wider text-gray-400 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {estoquesFiltrados.map((item) => (
                <tr key={item.id} className="flex flex-col md:table-row hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black">
                        {item.tamanho}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          {item.produto_nome}
                          {(item.quantidade_arara < 5 || item.quantidade_deposito < 5) && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{item.cor}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-2 md:py-6 text-center">
                    <div className="flex flex-col md:items-center">
                      <span className="md:hidden text-[10px] font-black text-gray-400 uppercase mb-1 text-left">Arara</span>
                      <span className="text-lg font-black text-gray-700 dark:text-gray-200">{item.quantidade_arara}</span>
                    </div>
                  </td>

                  <td className="px-6 py-2 md:py-6 text-center">
                    <div className="flex flex-col md:items-center">
                      <span className="md:hidden text-[10px] font-black text-gray-400 uppercase mb-1 text-left">Depósito</span>
                      <span className="text-lg font-black text-gray-700 dark:text-gray-200">{item.quantidade_deposito}</span>
                    </div>
                  </td>

                  <td className="px-6 py-2 md:py-6 text-center">
                    <div className="flex flex-col md:items-center">
                      <span className="md:hidden text-[10px] font-black text-gray-400 uppercase mb-1 text-left">Total</span>
                      <span className="text-xl font-black text-[#812C65] dark:text-[#E8B7D4]">
                        {item.quantidade_arara + item.quantidade_deposito}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-right">
                    <button
                      onClick={() => abrirModal(item)}
                      className="w-full md:w-auto p-3 md:p-4 bg-gray-100 dark:bg-white/10 hover:bg-[#812C65] hover:text-white rounded-2xl transition-all"
                    >
                      <FiEdit3 className="inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajustar Estoque */}
      {modalItem && (
        <div className="fixed inset-0 bg-[#120514]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1A0B1C] p-8 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#590C42] dark:text-[#E8B7D4] leading-tight">Ajustar Grade</h2>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{modalItem.produto_nome} • {modalItem.tamanho}</p>
              </div>
              <button onClick={() => setModalItem(null)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-full">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 px-2">Local: Arara</label>
                <div className="flex items-center justify-between gap-4">
                  <button onClick={() => ajustarValorModal('nova_arara', -1)} className="p-3 bg-white dark:bg-white/10 rounded-2xl hover:scale-110 active:scale-95 transition-transform">
                    <FiMinus className="text-purple-500" />
                  </button>
                  <input
                    type="number"
                    value={modalItem.nova_arara}
                    onChange={(e) => setModalItem({ ...modalItem, nova_arara: e.target.value })}
                    className="w-20 text-center bg-transparent text-2xl font-black focus:outline-none dark:text-white"
                  />
                  <button onClick={() => ajustarValorModal('nova_arara', 1)} className="p-3 bg-white dark:bg-white/10 rounded-2xl hover:scale-110 active:scale-95 transition-transform">
                    <FiPlus className="text-purple-500" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 px-2">Local: Depósito</label>
                <div className="flex items-center justify-between gap-4">
                  <button onClick={() => ajustarValorModal('novo_deposito', -1)} className="p-3 bg-white dark:bg-white/10 rounded-2xl hover:scale-110 active:scale-95 transition-transform">
                    <FiMinus className="text-pink-500" />
                  </button>
                  <input
                    type="number"
                    value={modalItem.novo_deposito}
                    onChange={(e) => setModalItem({ ...modalItem, novo_deposito: e.target.value })}
                    className="w-20 text-center bg-transparent text-2xl font-black focus:outline-none dark:text-white"
                  />
                  <button onClick={() => ajustarValorModal('novo_deposito', 1)} className="p-3 bg-white dark:bg-white/10 rounded-2xl hover:scale-110 active:scale-95 transition-transform">
                    <FiPlus className="text-pink-500" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={salvarAlteracoes}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-[#812C65] to-[#590C42] text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "ATUALIZANDO..." : "CONFIRMAR AJUSTE"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}