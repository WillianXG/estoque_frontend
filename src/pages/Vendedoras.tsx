import { useEffect, useState, useCallback } from "react";
import { 
  UserPlus, 
  UserCircle, 
  Phone, 
  Hash, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  X, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../api/api";

interface Vendedora {
  id: string;
  nome: string;
  telefone: string;
  codigo: string;
  role: "vendedora" | "admin";
}

export default function Vendedoras() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [modalVendedora, setModalVendedora] = useState<Vendedora | null>(null);
  const [filtro, setFiltro] = useState("");

  const buscarVendedoras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendedoras");
      setVendedoras(res.data);
    } catch {
      mostrarMensagem("Erro ao carregar vendedoras", 'erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarVendedoras();
  }, [buscarVendedoras]);

  function mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3000);
  }

  async function salvarVendedora(v: Vendedora) {
    try {
      setLoading(true);
      if (v.id) {
        const res = await api.put(`/vendedoras/${v.id}`, v);
        setVendedoras((prev) => prev.map((x) => (x.id === v.id ? res.data : x)));
        mostrarMensagem("Cadastro atualizado com sucesso!", 'sucesso');
      } else {
        const res = await api.post("/vendedoras", v);
        setVendedoras((prev) => [...prev, res.data]);
        mostrarMensagem("Nova vendedora cadastrada!", 'sucesso');
      }
      setModalVendedora(null);
    } catch {
      mostrarMensagem("Erro ao salvar dados. Verifique os campos.", 'erro');
    } finally {
      setLoading(false);
    }
  }

  async function removerVendedora(id: string) {
    if (!window.confirm("Deseja realmente remover esta vendedora?")) return;
    try {
      setLoading(true);
      await api.delete(`/vendedoras/${id}`);
      setVendedoras((prev) => prev.filter((v) => v.id !== id));
      mostrarMensagem("Vendedora removida do sistema.", 'sucesso');
    } catch {
      mostrarMensagem("Erro ao remover vendedora.", 'erro');
    } finally {
      setLoading(false);
    }
  }

  const vendedorasFiltradas = vendedoras.filter(v => 
    v.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    v.codigo.includes(filtro)
  );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#1a0a1d] transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#590C42] dark:text-[#E8B7D4] flex items-center gap-2">
              <UserCircle className="w-8 h-8" />
              Equipe de Vendas
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie os acessos e informações da sua equipe.</p>
          </div>

          <button
            onClick={() => setModalVendedora({ id: "", nome: "", telefone: "", codigo: "", role: "vendedora" })}
            className="flex items-center justify-center gap-2 bg-[#812C65] hover:bg-[#590C42] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" /> Adicionar Membro
          </button>
        </header>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3d1a40] bg-white dark:bg-[#2A102D] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#812C65] outline-none shadow-sm transition-all"
          />
        </div>

        {mensagem && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{mensagem.texto}</span>
          </div>
        )}

        {/* CONTENT */}
        {loading && <div className="text-center py-10 animate-pulse text-gray-400">Processando...</div>}

        {/* MOBILE CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {vendedorasFiltradas.map((v) => (
            <div key={v.id} className="bg-white dark:bg-[#2A102D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[#812C65] dark:text-[#E8B7D4] font-bold text-lg">
                {v.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{v.nome}</h3>
                <p className="text-xs text-gray-500">{v.telefone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModalVendedora(v)} className="p-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => removerVendedora(v.id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block bg-white dark:bg-[#2A102D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#3d1a40]/30 border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Colaboradora</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Código</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Nível</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {vendedorasFiltradas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#812C65] dark:text-[#E8B7D4] font-bold">
                      {v.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{v.nome}</p>
                      <p className="text-xs text-gray-500">{v.telefone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">#{v.codigo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      v.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                      {v.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModalVendedora(v)} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 rounded-xl transition-colors"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => removerVendedora(v.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL EDITAR/CRIAR */}
        {modalVendedora && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#2A102D] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 bg-[#812C65] text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{modalVendedora.id ? "Editar Perfil" : "Novo Cadastro"}</h2>
                <button onClick={() => setModalVendedora(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome Completo</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ex: Maria Silva"
                      value={modalVendedora.nome}
                      onChange={(e) => setModalVendedora({ ...modalVendedora, nome: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-[#1a0a1d] dark:text-white focus:ring-2 focus:ring-[#812C65] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="(00) 0000-0000"
                        value={modalVendedora.telefone}
                        onChange={(e) => setModalVendedora({ ...modalVendedora, telefone: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-[#1a0a1d] dark:text-white focus:ring-2 focus:ring-[#812C65] outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Código</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="VEND01"
                        value={modalVendedora.codigo}
                        onChange={(e) => setModalVendedora({ ...modalVendedora, codigo: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-[#1a0a1d] dark:text-white focus:ring-2 focus:ring-[#812C65] outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 text-center block">Nível de Acesso</label>
                  <div className="flex p-1 bg-gray-100 dark:bg-[#1a0a1d] rounded-2xl gap-1">
                    <button 
                      onClick={() => setModalVendedora({...modalVendedora, role: 'vendedora'})}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${modalVendedora.role === 'vendedora' ? 'bg-white dark:bg-[#2A102D] shadow-sm text-blue-600' : 'text-gray-400'}`}
                    >
                      Vendedora
                    </button>
                    <button 
                      onClick={() => setModalVendedora({...modalVendedora, role: 'admin'})}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${modalVendedora.role === 'admin' ? 'bg-white dark:bg-[#2A102D] shadow-sm text-purple-600' : 'text-gray-400'}`}
                    >
                      <ShieldCheck className="w-4 h-4 inline mr-1" /> Admin
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalVendedora(null)}
                    className="flex-1 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => modalVendedora && salvarVendedora(modalVendedora)}
                    className="flex-1 py-3 bg-[#812C65] hover:bg-[#590C42] text-white rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                  >
                    Salvar Dados
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}