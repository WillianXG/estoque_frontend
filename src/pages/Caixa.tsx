/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import { FiPackage, FiLock, FiUnlock, FiDollarSign, FiClock, FiPlusCircle, FiMinusCircle, FiTrendingUp } from "react-icons/fi";

interface CaixaData {
  Id?: number;
  id?: number;
  Status: "ABERTO" | "FECHADO";
  ValorInicial: number;
  DataAbertura: string;
  ValorFechamentoDinheiro?: number;
}

interface ResumoMovimentacao {
  Tipo: "SANGRIA" | "SUPRIMENTO" | "VENDA_DINHEIRO";
  total: string | number;
}

type TipoMovimentacao = "SUPRIMENTO" | "SANGRIA" | "VENDA_DINHEIRO" | "";

export default function CaixaPage() {
  const [statusSessao, setStatusSessao] = useState<"ABERTO" | "FECHADO">("FECHADO");
  const [caixa, setCaixa] = useState<CaixaData | null>(null);
  const [resumo, setResumo] = useState<ResumoMovimentacao[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  
  // Estados para os modais principais (Abrir/Fechar)
  const [valorInicialInput, setValorInicialInput] = useState("");
  const [valorFechamentoInput, setValorFechamentoInput] = useState("");
  const [mostrarModalAbrir, setMostrarModalAbrir] = useState(false);
  const [mostrarModalFechar, setMostrarModalFechar] = useState(false);

  // Estados para o novo modal de Movimentações Manuais
  const [mostrarModalMovimentacao, setMostrarModalMovimentacao] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacao>("");
  const [valorMovimentacao, setValorMovimentacao] = useState("");
  const [obsMovimentacao, setObsMovimentacao] = useState("");

  useEffect(() => {
    buscarStatusCaixa();
  }, []);

  async function buscarStatusCaixa() {
    try {
      const res = await api.get("/caixa/status");
      setStatusSessao(res.data.status);
      setCaixa(res.data.caixa);
      setResumo(res.data.resumo || []);
    } catch (err) {
      console.error("Erro ao buscar status do caixa:", err);
    }
  }

  async function abrirCaixa() {
    if (!valorInicialInput || isNaN(Number(valorInicialInput))) {
      alert("Por favor, insira um valor inicial válido.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/caixa/abrir", {
        valorInicial: Number(valorInicialInput),
        idUsuario: 1
      });

      setMensagem("Caixa aberto com sucesso!");
      setMostrarModalAbrir(false);
      setValorInicialInput("");
      await buscarStatusCaixa();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Erro ao abrir o caixa.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function fecharCaixa() {
    const idSessao = caixa?.Id !== undefined ? caixa.Id : caixa?.id;

    if (!idSessao) {
      alert("ID da sessão de caixa não encontrado.");
      return;
    }
    if (!valorFechamentoInput || isNaN(Number(valorFechamentoInput))) {
      alert("Por favor, insira o valor contado na gaveta.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/caixa/fechar", {
        idSessao: idSessao,
        valorFechamentoDinheiro: Number(valorFechamentoInput)
      });

      setMensagem("Caixa fechado com sucesso!");
      setMostrarModalFechar(false);
      setValorFechamentoInput("");
      await buscarStatusCaixa();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Erro ao fechar o caixa.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function executarMovimentacao() {
    const idSessao = caixa?.Id !== undefined ? caixa.Id : caixa?.id;

    if (!idSessao) {
      alert("Sessão de caixa não identificada.");
      return;
    }
    if (!valorMovimentacao || isNaN(Number(valorMovimentacao)) || Number(valorMovimentacao) <= 0) {
      alert("Insira um valor válido maior que zero.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/caixa/movimentacao", {
        idSessao: idSessao,
        tipo: tipoMovimentacao,
        valor: Number(valorMovimentacao),
        observacao: obsMovimentacao || `Movimentação de ${tipoMovimentacao} lançada manualmente`
      });

      setMensagem("Movimentação registrada com sucesso!");
      setMostrarModalMovimentacao(false);
      setValorMovimentacao("");
      setObsMovimentacao("");
      await buscarStatusCaixa();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Erro ao registrar movimentação.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  const abrirModalMovimentacao = (tipo: TipoMovimentacao) => {
    setTipoMovimentacao(tipo);
    setMostrarModalMovimentacao(true);
  };

  const obterTotalPorTipo = (tipo: "SANGRIA" | "SUPRIMENTO" | "VENDA_DINHEIRO") => {
    const mov = resumo.find((r) => r.Tipo === tipo);
    return mov ? Number(mov.total) : 0;
  };

  const obterTituloMovimentacao = () => {
    if (tipoMovimentacao === "SUPRIMENTO") return "Adicionar Suprimento (Troco)";
    if (tipoMovimentacao === "SANGRIA") return "Realizar Sangria (Retirada)";
    return "Registrar Venda Manual (Dinheiro)";
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#120514] p-4 sm:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#590C42] dark:text-[#E8B7D4] tracking-tight">Controle de Caixa</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Gerencie a abertura, movimentações manuais e encerramento do caixa diário.
          </p>
        </header>

        {mensagem && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-3">
            <FiPackage /> {mensagem}
          </div>
        )}

        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center justify-center text-center">
          
          <div className={`mb-6 px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
            statusSessao === "ABERTO" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${statusSessao === "ABERTO" ? "bg-green-500" : "bg-red-500"}`} />
            Caixa {statusSessao}
          </div>

          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg">
            {statusSessao === "ABERTO" ? <FiUnlock /> : <FiLock />}
          </div>

          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
            {statusSessao === "ABERTO" ? "O sistema está pronto para realizar vendas" : "O caixa está fechado no momento"}
          </h2>
          
          {statusSessao === "ABERTO" && caixa?.DataAbertura && (
            <div className="text-gray-400 dark:text-gray-500 font-medium text-sm space-y-1 mb-6">
              <p className="flex items-center justify-center gap-1.5">
                <FiClock /> Aberto em: {new Date(caixa.DataAbertura).toLocaleDateString("pt-BR")} às {new Date(caixa.DataAbertura).toLocaleTimeString("pt-BR")}
              </p>
              <p className="font-bold text-[#812C65] dark:text-[#E8B7D4]">
                Valor de Abertura: R$ {Number(caixa.ValorInicial).toFixed(2)}
              </p>
            </div>
          )}

          {/* Cards do Resumo */}
          {statusSessao === "ABERTO" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-6">
              <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center justify-center gap-1"><FiPlusCircle className="text-green-500"/> Suprimentos</div>
                <div className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">R$ {obterTotalPorTipo("SUPRIMENTO").toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center justify-center gap-1"><FiMinusCircle className="text-red-500"/> Sangrias</div>
                <div className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">R$ {obterTotalPorTipo("SANGRIA").toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center justify-center gap-1"><FiDollarSign className="text-purple-500"/> Vendas (Dinheiro)</div>
                <div className="text-lg font-black text-gray-700 dark:text-gray-200 mt-1">R$ {obterTotalPorTipo("VENDA_DINHEIRO").toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Botões Operacionais Internos */}
          {statusSessao === "ABERTO" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
              <button
                onClick={() => abrirModalMovimentacao("SUPRIMENTO")}
                className="py-3.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-900 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
              >
                <FiPlusCircle /> + SUPRIMENTO
              </button>
              <button
                onClick={() => abrirModalMovimentacao("SANGRIA")}
                className="py-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
              >
                <FiMinusCircle /> - SANGRIA
              </button>
              <button
                onClick={() => abrirModalMovimentacao("VENDA_DINHEIRO")}
                className="py-3.5 bg-purple-50 dark:bg-purple-950/20 text-[#812C65] dark:text-[#E8B7D4] font-bold border border-purple-200 dark:border-purple-900/30 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs"
              >
                <FiTrendingUp /> + VENDA MANUAL
              </button>
            </div>
          )}

          {/* Botão Principal de Fechamento/Abertura */}
          <button
            onClick={() => statusSessao === "ABERTO" ? setMostrarModalFechar(true) : setMostrarModalAbrir(true)}
            disabled={loading}
            className={`w-full max-w-sm py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${
              statusSessao === "ABERTO"
                ? "bg-gradient-to-r from-red-600 to-red-800 shadow-red-500/10"
                : "bg-gradient-to-r from-[#812C65] to-[#590C42] shadow-purple-500/10"
            }`}
          >
            <FiDollarSign />
            {statusSessao === "ABERTO" ? "FECHAR SESSÃO DE CAIXA" : "ABRIR NOVA SESSÃO"}
          </button>

        </div>
      </div>

      {/* MODAL DE ABERTURA DE CAIXA */}
      {mostrarModalAbrir && (
        <div className="fixed inset-0 bg-[#120514]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1A0B1C] p-8 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/10">
            <h3 className="text-2xl font-black text-[#590C42] dark:text-[#E8B7D4] mb-2">Abrir Sessão</h3>
            <p className="text-gray-400 text-sm font-semibold mb-6">Informe o valor de fundo de caixa disponível na gaveta.</p>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl mb-6 border border-gray-100 dark:border-white/10">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-1">Valor Inicial (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={valorInicialInput}
                onChange={(e) => setValorInicialInput(e.target.value)}
                className="w-full bg-transparent text-2xl font-black focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setMostrarModalAbrir(false)} className="w-1/2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 font-bold py-4 rounded-2xl">Cancelar</button>
              <button onClick={abrirCaixa} disabled={loading} className="w-1/2 bg-[#590C42] text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-900/20">{loading ? "GRAVANDO..." : "CONFIRMAR"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INTERVENÇÃO MANUAL */}
      {mostrarModalMovimentacao && (
        <div className="fixed inset-0 bg-[#120514]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1A0B1C] p-8 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/10">
            <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">{obterTituloMovimentacao()}</h3>
            <p className="text-gray-400 text-xs font-semibold mb-6">Insira os detalhes e o valor exato da movimentação.</p>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl mb-4 border border-gray-100 dark:border-white/10">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 px-1">Valor (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={valorMovimentacao}
                onChange={(e) => setValorMovimentacao(e.target.value)}
                className="w-full bg-transparent text-xl font-black focus:outline-none dark:text-white"
              />
            </div>

            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl mb-6 border border-gray-100 dark:border-white/10">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 px-1">Observação / Motivo</label>
              <input
                type="text"
                placeholder="Ex: Troco inicial, retirada para sangria..."
                value={obsMovimentacao}
                onChange={(e) => setObsMovimentacao(e.target.value)}
                className="w-full bg-transparent text-sm font-medium focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setMostrarModalMovimentacao(false)} className="w-1/2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 font-bold py-3 rounded-2xl text-sm">Cancelar</button>
              <button onClick={executarMovimentacao} disabled={loading} className="w-1/2 bg-[#590C42] text-white font-black py-3 rounded-2xl shadow-lg text-sm">{loading ? "SALVANDO..." : "CONFIRMAR"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FECHAMENTO DE CAIXA */}
      {mostrarModalFechar && (
        <div className="fixed inset-0 bg-[#120514]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1A0B1C] p-8 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/10">
            <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2">Fechar Sessão</h3>
            <p className="text-gray-400 text-sm font-semibold mb-6">Conte o dinheiro físico da gaveta e informe o valor total abaixo.</p>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl mb-6 border border-gray-100 dark:border-white/10">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-1">Total em Dinheiro Contado (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={valorFechamentoInput}
                onChange={(e) => setValorFechamentoInput(e.target.value)}
                className="w-full bg-transparent text-2xl font-black focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setMostrarModalFechar(false)} className="w-1/2 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 font-bold py-4 rounded-2xl">Cancelar</button>
              <button onClick={fecharCaixa} disabled={loading} className="w-1/2 bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-900/20">{loading ? "CONCLUINDO..." : "ENCERRAR"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}