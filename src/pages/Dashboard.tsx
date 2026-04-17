/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Trophy, 
  Package, 
  Archive,
  RefreshCw 
} from "lucide-react";
import api from "../api/api";

// --- Interfaces ---
interface DashboardData {
  vendasDia: { total_vendas_dia: number; total_valor_dia: number };
  vendasMes: { total_vendas_mes: number; total_valor_mes: number };
  lucroMes: number;
  rankingVendedoras: { nome: string; vendas_realizadas: number; total_vendas: number }[];
  estoqueBaixo: { nome: string; total_estoque: number }[];
  produtosEncostados: { nome: string }[];
  produtosMaisVendidos: { nome: string; quantidade_vendida: number }[];
}

// --- Helper Functions ---
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Erro ao buscar dashboard", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Sub-componente de Card para evitar repetição
  const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-[#2A102D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3d1a40] flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <h2 className="text-2xl font-bold mt-1 dark:text-white">{value}</h2>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {subValue && <p className="text-sm mt-4 text-gray-600 dark:text-gray-400 font-medium">{subValue}</p>}
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#1a0a1d] text-[#2A102D] dark:text-white transition-colors">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#590C42] dark:text-[#E8B7D4]">Dashboard Operacional</h1>
          <p className="text-gray-500 dark:text-gray-400">Visão geral do seu negócio em tempo real.</p>
        </div>
        <button 
          onClick={fetchDashboard}
          disabled={loading}
          className="p-2 bg-white dark:bg-[#2A102D] rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#3d1a40] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        {loading && !data ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#590C42]"></div>
          </div>
        ) : data ? (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Vendas hoje" 
                value={data.vendasDia.total_vendas_dia} 
                subValue={formatCurrency(data.vendasDia.total_valor_dia)}
                icon={TrendingUp}
                color="bg-blue-500 text-blue-500"
              />
              <StatCard 
                title="Vendas no Mês" 
                value={data.vendasMes.total_vendas_mes} 
                subValue={formatCurrency(data.vendasMes.total_valor_mes)}
                icon={Calendar}
                color="bg-purple-500 text-purple-500"
              />
              <StatCard 
                title="Lucro Estimado" 
                value={formatCurrency(data.lucroMes)} 
                icon={DollarSign}
                color="bg-emerald-500 text-emerald-500"
              />
              <StatCard 
                title="Itens Críticos" 
                value={data.estoqueBaixo.length} 
                subValue="Necessitam reposição"
                icon={AlertTriangle}
                color="bg-red-500 text-red-500"
              />
            </div>

            {/* Middle Section: Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Ranking */}
              <section className="bg-white dark:bg-[#2A102D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3d1a40]">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-lg">Top Vendedoras</h3>
                </div>
                <div className="space-y-4">
                  {data.rankingVendedoras.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#3d1a40]/30">
                      <span className="text-sm font-medium">{i + 1}º {v.nome}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{v.vendas_realizadas} vendas</p>
                        <p className="text-sm font-bold text-[#590C42] dark:text-[#E8B7D4]">{formatCurrency(v.total_vendas)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mais Vendidos */}
              <section className="bg-white dark:bg-[#2A102D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3d1a40]">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-lg">Mais Vendidos</h3>
                </div>
                <div className="space-y-3">
                  {data.produtosMaisVendidos.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="truncate max-w-[150px]">{p.nome}</span>
                      <span className="font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                        {p.quantidade_vendida} un.
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Encostados e Estoque */}
              <div className="flex flex-col gap-6">
                <section className="bg-white dark:bg-[#2A102D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#3d1a40] flex-1">
                  <div className="flex items-center gap-2 mb-4 text-orange-500">
                    <Archive className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Sem saída (30d)</h3>
                  </div>
                  <ul className="text-sm space-y-1">
                    {data.produtosEncostados.slice(0, 5).map((p, i) => (
                      <li key={i} className="text-gray-600 dark:text-gray-400">• {p.nome}</li>
                    ))}
                  </ul>
                </section>
              </div>

            </div>
          </>
        ) : (
          <div className="text-center py-20">
             <p className="text-xl text-gray-500">Dados não encontrados.</p>
          </div>
        )}
      </div>
    </main>
  );
}