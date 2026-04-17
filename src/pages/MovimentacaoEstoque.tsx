import { useEffect, useState, useCallback } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings2, 
  Search, 
  User, 
  MapPin, 
  History,
  X,
  ChevronRight
} from "lucide-react";
import api from "../api/api";

interface Movimentacao {
  id: number;
  produto_nome: string;
  local: "arara" | "deposito";
  tipo: "entrada" | "saida" | "ajuste";
  quantidade_anterior: number;
  quantidade_nova: number;
  usuario_id: number;
  usuario_nome?: string;
  data: string;
}

export default function MovimentacaoPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [selected, setSelected] = useState<Movimentacao | null>(null);

  const fetchMovimentacoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/movimentacoes-estoque");
      const dados: Movimentacao[] = res.data.sort(
        (a: Movimentacao, b: Movimentacao) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      setMovimentacoes(dados);
    } catch (err) {
      console.error("Erro ao buscar movimentações", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: ArrowDownLeft };
      case 'saida': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: ArrowUpRight };
      default: return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Settings2 };
    }
  };

  const movimentacoesFiltradas = movimentacoes.filter((m) =>
    m.produto_nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#1a0a1d] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] flex items-center gap-2">
              <History className="w-8 h-8" />
              Auditoria de Estoque
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Rastro completo de todas as alterações de produtos.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3d1a40] bg-white dark:bg-[#2A102D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#812C65] outline-none shadow-sm transition-all"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#812C65]"></div>
          </div>
        ) : (
          <>
            {/* MOBILE LIST */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              {movimentacoesFiltradas.map((m) => {
                const estilo = getTipoEstilo(m.tipo);
                return (
                  <div key={m.id} className="bg-white dark:bg-[#2A102D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${estilo.bg} ${estilo.text}`}>
                        <estilo.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(m.data).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{m.produto_nome}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm font-medium">
                        <span className="text-gray-400">{m.quantidade_anterior}</span>
                        <ChevronRight className="inline w-3 h-3 mx-1 text-gray-400" />
                        <span className="text-purple-600 dark:text-pink-400 font-bold">{m.quantidade_nova}</span>
                      </div>
                      <button onClick={() => setSelected(m)} className="text-xs font-bold text-[#812C65] dark:text-[#E8B7D4] uppercase">Detalhes</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block bg-white dark:bg-[#2A102D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-[#3d1a40]/30 border-b dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Produto</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Local</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Mudança</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Autor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {movimentacoesFiltradas.map((m) => {
                    const estilo = getTipoEstilo(m.tipo);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{m.produto_nome}</p>
                          <p className="text-[10px] text-gray-400">REF: #{m.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${estilo.bg} ${estilo.text}`}>
                            <estilo.icon className="w-3 h-3" />
                            {m.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {m.local}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          <span className="text-gray-400">{m.quantidade_anterior}</span>
                          <ChevronRight className="inline w-4 h-4 text-gray-300" />
                          <span className="font-bold dark:text-white">{m.quantidade_nova}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                           <div className="flex items-center gap-1">
                             <User className="w-3 h-3 opacity-50" /> {m.usuario_nome || `ID ${m.usuario_id}`}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(m.data).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL DETALHES */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#2A102D] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b dark:border-gray-800">
                <h2 className="text-xl font-bold dark:text-white">Detalhes da Movimentação</h2>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Produto</p>
                  <h3 className="text-2xl font-black text-[#812C65] dark:text-[#E8B7D4]">{selected.produto_nome}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-[#1a0a1d] p-4 rounded-2xl border dark:border-gray-800 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Anterior</p>
                    <p className="text-2xl font-bold dark:text-white">{selected.quantidade_anterior}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-center">
                    <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Nova</p>
                    <p className="text-2xl font-bold text-[#812C65] dark:text-[#E8B7D4]">{selected.quantidade_nova}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b dark:border-gray-800 pb-2">
                    <span className="text-gray-500 font-medium flex items-center gap-1"><MapPin className="w-4 h-4" /> Local</span>
                    <span className="font-bold dark:text-white capitalize">{selected.local}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b dark:border-gray-800 pb-2">
                    <span className="text-gray-500 font-medium flex items-center gap-1"><User className="w-4 h-4" /> Autor</span>
                    <span className="font-bold dark:text-white">{selected.usuario_nome || `ID ${selected.usuario_id}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium flex items-center gap-1"><History className="w-4 h-4" /> Data</span>
                    <span className="font-bold dark:text-white">{new Date(selected.data).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-black/20">
                <button 
                  onClick={() => setSelected(null)}
                  className="w-full py-4 bg-[#812C65] hover:bg-[#590C42] text-white rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all"
                >
                  Fechar Registro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}