import { useEffect, useState } from "react";
import api from "../api/api";
import { 
  FiArrowLeft, 
  FiChevronRight,
  FiMessageSquare,
  FiPlusCircle,
  FiMinusCircle,
  FiTrendingUp,
  FiX,
  FiClock,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";

interface MovimentacaoDetalhe {
  Id: number;
  Tipo: "SANGRIA" | "SUPRIMENTO" | "VENDA_DINHEIRO";
  Valor: number;
  Observacao: string;
  DataCriacao?: string;
}

interface HistoricoCaixa {
  Id: number;
  DataAbertura: string;
  DataFechamento: string;
  ValorInicial: number;
  TotalSuprimentos: number;
  TotalSangrias: number;
  TotalVendas: number;
  SaldoEstimado: number;
  ValorInformado: number;
  Diferenca: number;
  ResultadoFechamento: "OK" | "QUEBRA" | "SOBRA";
}

export default function HistoricoCaixaPage() {
  const [historico, setHistorico] = useState<HistoricoCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o controle do Modal
  const [caixaSelecionado, setCaixaSelecionado] = useState<HistoricoCaixa | null>(null);
  const [movimentacoesModal, setMovimentacoesModal] = useState<MovimentacaoDetalhe[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    buscarHistorico();
  }, []);

  async function buscarHistorico() {
    try {
      const res = await api.get("/caixa/historico");
      setHistorico(res.data);
    } catch (err) {
      console.error("Erro ao buscar histórico de caixas:", err);
      alert("Erro ao carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }

  // Abre o modal e busca as movimentações e mensagens daquela sessão
  async function abrirModalMovimentacoes(caixa: HistoricoCaixa) {
    setCaixaSelecionado(caixa);
    setLoadingModal(true);
    try {
      const res = await api.get(`/caixa/movimentacoes/${caixa.Id}`);
      setMovimentacoesModal(res.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes das movimentações", err);
      alert("Não foi possível carregar as justificativas desta sessão.");
    } finally {
      setLoadingModal(false);
    }
  }

  function fecharModal() {
    setCaixaSelecionado(null);
    setMovimentacoesModal([]);
  }

  const retornarIconeTipo = (tipo: string) => {
    if (tipo === "SUPRIMENTO") return <FiPlusCircle className="text-green-500 text-lg" />;
    if (tipo === "SANGRIA") return <FiMinusCircle className="text-red-500 text-lg" />;
    return <FiTrendingUp className="text-purple-500 text-lg" />;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#120514] p-4 sm:p-8 transition-colors relative">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#590C42] dark:text-[#E8B7D4] tracking-tight">Histórico de Caixas</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Auditoria de fechamentos, quebras e mensagens de justificativas de retiradas.
            </p>
          </div>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl font-bold text-gray-700 dark:text-gray-300 text-sm active:scale-95 transition-all w-full sm:w-auto"
          >
            <FiArrowLeft /> Voltar ao Painel
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse">
            Carregando histórico de auditoria...
          </div>
        ) : historico.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-12 text-center text-gray-400 font-medium">
            Nenhum caixa foi fechado ou registrado até ao momento.
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-4 sm:p-6 shadow-xl overflow-hidden">
            
            {/* VIEW PARA DESKTOP (TABELA) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="pb-4 pl-4">Período (Abertura / Encerramento)</th>
                    <th className="pb-4">Fundo Inicial</th>
                    <th className="pb-4 text-green-500">Fluxo (+Entradas)</th>
                    <th className="pb-4 text-red-500">Fluxo (-Saídas)</th>
                    <th className="pb-4 text-purple-500">Saldo Estimado</th>
                    <th className="pb-4">Informado</th>
                    <th className="pb-4 text-center">Status / Diferença</th>
                    <th className="pb-4 pr-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {historico.map((row) => (
                    <tr 
                      key={row.Id} 
                      onClick={() => abrirModalMovimentacoes(row)}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-5 pl-4 flex flex-col gap-0.5 justify-center">
                        <span className="text-xs font-bold text-gray-400">
                          Abre: {new Date(row.DataAbertura).toLocaleString("pt-BR")}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          Fecha: {new Date(row.DataFechamento).toLocaleString("pt-BR")}
                        </span>
                      </td>
                      <td className="py-5">R$ {row.ValorInicial.toFixed(2)}</td>
                      <td className="py-5 text-green-600 dark:text-green-400">R$ {(row.TotalVendas + row.TotalSuprimentos).toFixed(2)}</td>
                      <td className="py-5 text-red-600 dark:text-red-400">R$ {row.TotalSangrias.toFixed(2)}</td>
                      <td className="py-5 font-bold text-purple-600 dark:text-purple-400">R$ {row.SaldoEstimado.toFixed(2)}</td>
                      <td className="py-5 font-bold">R$ {row.ValorInformado.toFixed(2)}</td>
                      <td className="py-5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase ${
                            row.ResultadoFechamento === "OK" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            row.ResultadoFechamento === "QUEBRA" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {row.ResultadoFechamento === "OK" ? "✓ BATEU" : row.ResultadoFechamento}
                          </span>
                          {row.Diferenca !== 0 && (
                            <span className={`text-xs font-black ${row.Diferenca < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {row.Diferenca < 0 ? "-" : "+"} R$ {Math.abs(row.Diferenca).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 pr-4 text-gray-400 group-hover:text-purple-500 transition-colors text-right">
                        <FiChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* VIEW PARA MOBILE (CARDS) */}
            <div className="block md:hidden space-y-4">
              {historico.map((row) => (
                <div 
                  key={row.Id}
                  onClick={() => abrirModalMovimentacoes(row)}
                  className="border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl overflow-hidden transition-all active:scale-98 cursor-pointer"
                >
                  <div className="p-4 flex items-center justify-between gap-2 bg-white dark:bg-white/5">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Sessão #{row.Id}</div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {new Date(row.DataFechamento).toLocaleDateString("pt-BR")} às {new Date(row.DataFechamento).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          row.ResultadoFechamento === "OK" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"
                        }`}>
                          {row.ResultadoFechamento}
                        </span>
                        {row.Diferenca !== 0 && (
                          <div className={`text-xs font-black mt-0.5 ${row.Diferenca < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                            R$ {row.Diferenca.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <FiChevronRight className="text-gray-400" />
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-3 text-xs border-t border-gray-100 dark:border-white/5 font-medium">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-black">Fundo Inicial</span>
                      <span className="text-gray-700 dark:text-gray-200">R$ {row.ValorInicial.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-black">Saldo Estimado</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">R$ {row.SaldoEstimado.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* MODAL DETALHADO DE MOVIMENTAÇÕES */}
      {caixaSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1b0a1e] w-full max-w-2xl rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header do Modal */}
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black text-[#590C42] dark:text-[#E8B7D4]">Movimentações da Sessão #{caixaSelecionado.Id}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-3">
                  <span className="flex items-center gap-1"><FiClock /> Abre: {new Date(caixaSelecionado.DataAbertura).toLocaleDateString("pt-BR")}</span>
                  <span className="flex items-center gap-1"><FiClock /> Fecha: {new Date(caixaSelecionado.DataFechamento).toLocaleDateString("pt-BR")}</span>
                </p>
              </div>
              <button 
                onClick={fecharModal}
                className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95 transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Corpo do Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Resumo Rápido de Valores dentro do Modal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-xs font-medium">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-black">Inicial</span>
                  <span className="text-gray-700 dark:text-gray-200">R$ {caixaSelecionado.ValorInicial.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-green-500 block text-[10px] uppercase font-black">Entradas</span>
                  <span className="text-green-600 dark:text-green-400">R$ {(caixaSelecionado.TotalVendas + caixaSelecionado.TotalSuprimentos).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-red-500 block text-[10px] uppercase font-black">Saídas</span>
                  <span className="text-red-600 dark:text-red-400">R$ {caixaSelecionado.TotalSangrias.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-purple-500 block text-[10px] uppercase font-black">Informado</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">R$ {caixaSelecionado.ValorInformado.toFixed(2)}</span>
                </div>
              </div>

              {/* Status do Fechamento */}
              <div className="flex items-center justify-between p-4 rounded-2xl border bg-white dark:bg-white/5 border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  {caixaSelecionado.ResultadoFechamento === "OK" ? (
                    <FiCheckCircle className="text-green-500 text-xl" />
                  ) : (
                    <FiAlertCircle className="text-red-500 text-xl" />
                  )}
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Balanço de Encerramento</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                    caixaSelecionado.ResultadoFechamento === "OK" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {caixaSelecionado.ResultadoFechamento === "OK" ? "Caixa Bateu" : caixaSelecionado.ResultadoFechamento}
                  </span>
                  {caixaSelecionado.Diferenca !== 0 && (
                    <div className={`text-xs font-black mt-1 ${caixaSelecionado.Diferenca < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      Diferença: {caixaSelecionado.Diferenca < 0 ? "-" : "+"} R$ {Math.abs(caixaSelecionado.Diferenca).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista Detalhada com Justificativas */}
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
                  <FiMessageSquare /> Histórico Lançado / Mensagens e Motivos
                </h4>
                
                {loadingModal ? (
                  <div className="text-center py-8 text-xs text-gray-400 animate-pulse font-bold">Buscando lançamentos no Supabase...</div>
                ) : movimentacoesModal.length === 0 ? (
                  <p className="text-xs font-medium text-gray-400 italic bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                    Nenhuma movimentação manual ou venda direta em dinheiro foi lançada nesta sessão.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {movimentacoesModal.map((m) => (
                      <div 
                        key={m.Id} 
                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {retornarIconeTipo(m.Tipo)}
                          <div>
                            <span className="font-black uppercase tracking-wide text-[9px] text-gray-400 block">{m.Tipo}</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-200 block mt-0.5">
                              {m.Observacao ? `"${m.Observacao}"` : <span className="text-gray-400 italic font-normal">Sem mensagem descritiva</span>}
                            </span>
                          </div>
                        </div>
                        <div className="font-black text-gray-800 dark:text-white shrink-0 text-right">
                          R$ {Number(m.Valor).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}