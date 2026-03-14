import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  async function fetchMovimentacoes() {
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
  }

  const movimentacoesFiltradas = movimentacoes.filter((m) =>
    m.produto_nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#2A102D] flex flex-col gap-4">

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-pink-300">
        Movimentações de Estoque
      </h1>

      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full sm:max-w-md p-2 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
      />

      {loading && (
        <p className="text-gray-900 dark:text-white">Carregando...</p>
      )}

      {!loading && movimentacoesFiltradas.length === 0 && (
        <p className="text-gray-900 dark:text-white">
          Nenhuma movimentação encontrada.
        </p>
      )}

      {/* MOBILE */}
      <div className="sm:hidden flex flex-col gap-2">

        {movimentacoesFiltradas.map((m) => {

          const dataFormatada = new Date(m.data).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-1"
            >

              {/* Produto */}
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {m.produto_nome}
              </div>

              {/* Linha compacta */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">

                <span>
                  {m.quantidade_anterior ?? 0} → {m.quantidade_nova ?? 0}
                </span>

                <span className="capitalize">
                  {m.tipo}
                </span>

                <span className="truncate max-w-[90px]">
                  {m.usuario_nome ?? `ID ${m.usuario_id}`}
                </span>

                <span>
                  {dataFormatada}
                </span>

              </div>

              <button
                onClick={() => setSelected(m)}
                className="text-xs text-purple-600 dark:text-pink-400 mt-1 text-right"
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
              <th className="p-3 text-gray-900 dark:text-pink-300">Produto</th>
              <th className="p-3 text-gray-900 dark:text-pink-300">Local</th>
              <th className="p-3 text-gray-900 dark:text-pink-300">Antes → Depois</th>
              <th className="p-3 text-gray-900 dark:text-pink-300">Tipo</th>
              <th className="p-3 text-gray-900 dark:text-pink-300">Autor</th>
              <th className="p-3 text-gray-900 dark:text-pink-300">Data / Hora</th>
            </tr>
          </thead>

          <tbody>

            {movimentacoesFiltradas.map((m) => {

              const dataFormatada = new Date(m.data).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr
                  key={m.id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700"
                >

                  <td className="p-3 text-gray-900 dark:text-white">
                    {m.produto_nome}
                  </td>

                  <td className="p-3 text-gray-900 dark:text-white capitalize">
                    {m.local}
                  </td>

                  <td className="p-3 text-gray-900 dark:text-white">
                    {m.quantidade_anterior ?? 0} → {m.quantidade_nova ?? 0}
                  </td>

                  <td className="p-3 text-gray-900 dark:text-white capitalize">
                    {m.tipo}
                  </td>

                  <td className="p-3 text-gray-900 dark:text-white">
                    {m.usuario_nome ?? `ID ${m.usuario_id}`}
                  </td>

                  <td className="p-3 text-gray-900 dark:text-white">
                    {dataFormatada}
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
              {selected.produto_nome}
            </h2>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Local:</strong> {selected.local}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Tipo:</strong> {selected.tipo}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Quantidade:</strong>{" "}
              {selected.quantidade_anterior} → {selected.quantidade_nova}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Autor:</strong>{" "}
              {selected.usuario_nome ?? `ID ${selected.usuario_id}`}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Data:</strong>{" "}
              {new Date(selected.data).toLocaleString("pt-BR")}
            </p>

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