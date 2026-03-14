import { useEffect, useState } from "react";
import api from "../api/api";

interface DashboardData {
  vendasDia: { total_vendas_dia: number; total_valor_dia: number };
  vendasMes: { total_vendas_mes: number; total_valor_mes: number };
  lucroMes: number;
  rankingVendedoras: { nome: string; vendas_realizadas: number; total_vendas: number }[];
  estoqueBaixo: { nome: string; total_estoque: number }[];
  produtosEncostados: { nome: string }[];
  produtosMaisVendidos: { nome: string; quantidade_vendida: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Erro ao buscar dashboard", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cardClass =
    "bg-white dark:bg-[#2A102D] p-5 rounded-xl shadow-md hover:shadow-[#812C65]/40 transition-all flex flex-col gap-2";

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-[#1a0a1d] text-[#2A102D] dark:text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-[#590C42] dark:text-[#E8B7D4]">
        Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-lg">Carregando...</p>
      ) : data ? (
        <>
          {/* Cards superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4]">
                Vendas do Dia
              </h3>
              <p>{data.vendasDia.total_vendas_dia} vendas</p>
              <p>R$ {Number(data.vendasDia.total_valor_dia).toFixed(2)}</p>
            </div>

            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4]">
                Vendas do Mês
              </h3>
              <p>{data.vendasMes.total_vendas_mes} vendas</p>
              <p>R$ {Number(data.vendasMes.total_valor_mes).toFixed(2)}</p>
            </div>

            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4]">
                Lucro do Mês
              </h3>
              <p>R$ {Number(data.lucroMes).toFixed(2)}</p>
            </div>

            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4]">
                Estoque Baixo
              </h3>
              {data.estoqueBaixo.length ? (
                <ul className="text-sm">
                  {data.estoqueBaixo.map((p, i) => (
                    <li key={i}>
                      {p.nome} → {p.total_estoque}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum</p>
              )}
            </div>
          </div>

          {/* Rankings e listas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ranking Vendedoras */}
            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4] mb-2">
                Ranking Vendedoras (Mês)
              </h3>
              <ol className="list-decimal pl-5 text-sm">
                {data.rankingVendedoras.length ? (
                  data.rankingVendedoras.map((v, i) => (
                    <li key={i}>
                      {v.nome} - {v.vendas_realizadas} vendas - R${" "}
                      {Number(v.total_vendas).toFixed(2)}
                    </li>
                  ))
                ) : (
                  <p>Nenhum registro</p>
                )}
              </ol>
            </div>

            {/* Produtos Mais Vendidos */}
            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4] mb-2">
                Produtos Mais Vendidos
              </h3>
              <ol className="list-decimal pl-5 text-sm">
                {data.produtosMaisVendidos.length ? (
                  data.produtosMaisVendidos.map((p, i) => (
                    <li key={i}>
                      {p.nome} - {p.quantidade_vendida} unidades
                    </li>
                  ))
                ) : (
                  <p>Nenhum registro</p>
                )}
              </ol>
            </div>

            {/* Produtos Encostados */}
            <div className={cardClass}>
              <h3 className="font-semibold text-[#590C42] dark:text-[#E8B7D4] mb-2">
                Produtos Encostados (30 dias)
              </h3>
              <ul className="list-disc pl-5 text-sm">
                {data.produtosEncostados.length ? (
                  data.produtosEncostados.map((p, i) => <li key={i}>{p.nome}</li>)
                ) : (
                  <p>Nenhum</p>
                )}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-lg">Nenhum dado disponível</p>
      )}
    </main>
  );
}