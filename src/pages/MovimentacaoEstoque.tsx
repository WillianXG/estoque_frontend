import { useEffect, useState } from "react";
import api from "../api/api";

interface Movimentacao {
  id: number;
  produto_nome: string;
  local: "arara" | "deposito";
  tipo: "entrada" | "saida" | "ajuste";
  quantidade_modificada: number; // agora vem do backend
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

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  async function fetchMovimentacoes() {
    setLoading(true);
    try {
      const res = await api.get("/movimentacoes-estoque");
      let dados: Movimentacao[] = res.data;

      // Ordena do mais antigo para o mais recente (para consistência)
      dados.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      setMovimentacoes(dados.reverse()); // mais recentes no topo
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
        className="w-full sm:max-w-md p-2 rounded-lg border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
      />

      <div className="overflow-x-auto mt-2">
        <table className="w-full border-collapse text-left min-w-[500px] sm:min-w-full text-sm sm:text-base">
          <thead className="bg-purple-200 dark:bg-gray-800">
            <tr>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Produto</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Local</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Antes → Depois</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Tipo</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Autor</th>
              <th className="p-2 sm:p-3 text-gray-900 dark:text-pink-300">Data / Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-900 dark:text-white">
                  Carregando...
                </td>
              </tr>
            ) : movimentacoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-900 dark:text-white">
                  Nenhuma movimentação encontrada.
                </td>
              </tr>
            ) : (
              movimentacoesFiltradas.map((m) => {
                const dataFormatada = new Date(m.data).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Cor do texto de acordo com tipo
                let tipoClass = "text-gray-900 dark:text-white";
                if (m.tipo === "entrada") tipoClass = "text-green-600 dark:text-green-400";
                else if (m.tipo === "saida") tipoClass = "text-red-600 dark:text-red-400";
                else if (m.tipo === "ajuste") tipoClass = "text-yellow-600 dark:text-yellow-400";

                return (
                  <tr
                    key={m.id}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{m.produto_nome}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white capitalize">{m.local}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">
                      {m.quantidade_anterior} → {m.quantidade_nova}
                    </td>
                    <td className={`p-2 sm:p-3 font-semibold ${tipoClass} capitalize`}>{m.tipo}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{m.usuario_nome ?? m.usuario_id}</td>
                    <td className="p-2 sm:p-3 text-gray-900 dark:text-white">{dataFormatada}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}