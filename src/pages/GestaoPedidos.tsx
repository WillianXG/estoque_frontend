import { useState, useEffect } from "react";
import api from "../api/api";
import { 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiXCircle, 
  FiRefreshCw, 
  FiMessageSquare,
  FiShoppingBag
} from "react-icons/fi";

interface ItemPedidoOnline {
  id: number;
  pedido_online_id?: number;
  produto_id: number;
  cor?: string;
  tamanho?: string;
  quantidade: number;
  preco_unitario?: number;
  nome_produto?: string;
}

interface PedidoOnline {
  id: number;
  cliente_nome?: string;
  cliente_cpf?: string;
  cliente_whatsapp?: string;
  tipo_entrega?: string;
  endereco_completo?: string;
  status: "AGUARDANDO_PIX" | "PAGO" | "EMBALANDO" | "ENVIADO" | "CANCELADO" | string;
  valor_total: number;
  mp_payment_id?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  pedidos_online_itens?: ItemPedidoOnline[];
}

export default function GestaoEcommerce() {
  const [pedidos, setPedidos] = useState<PedidoOnline[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const carregarPedidos = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/vendas/pedidos-online", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao buscar pedidos online:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const atualizarStatusPedido = async (id: number, novoStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/vendas/pedidos-online/${id}/status`, { status: novoStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev =>
        prev.map(p => (p.id === id ? { ...p, status: novoStatus } : p))
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status do pedido.");
    }
  };

  const abrirWhatsApp = (fone?: string, idPedido?: number) => {
    if (!fone) return;
    const limpo = fone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Sou do suporte da loja. Gostaria de falar sobre o seu pedido #${idPedido}.`);
    window.open(`https://wa.me/55${limpo}?text=${msg}`, "_blank");
  };

  const pedidosFiltrados = filtroStatus === "todos"
    ? pedidos
    : pedidos.filter(p => p.status === filtroStatus);

  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-[#120514] p-4 sm:p-8 text-gray-800 dark:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#590C42] dark:text-[#E8B7D4] flex items-center gap-2">
              <FiShoppingBag /> Pedidos On-line
            </h1>
            <p className="text-gray-500 text-sm">Gerenciamento da tabela pedidos_online do e-commerce.</p>
          </div>

          <button
            onClick={carregarPedidos}
            className="flex items-center gap-2 bg-white dark:bg-[#2A102D] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all w-fit"
          >
            <FiRefreshCw className={carregando ? "animate-spin" : ""} /> Atualizar
          </button>
        </header>

        {/* FILTROS POR STATUS */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: "todos", label: "Todos" },
            { id: "AGUARDANDO_PIX", label: "⏳ Aguardando PIX" },
            { id: "PAGO", label: "✅ Pago" },
            { id: "EMBALANDO", label: "📦 Embalando" },
            { id: "ENVIADO", label: "🚚 Enviado" },
            { id: "CANCELADO", label: "❌ Cancelado" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltroStatus(item.id)}
              className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                filtroStatus === item.id
                  ? "bg-[#812C65] text-white shadow-md shadow-purple-900/20"
                  : "bg-white dark:bg-[#2A102D] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LISTA DE PEDIDOS */}
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#2A102D] rounded-3xl border border-gray-100 dark:border-white/5">
            <p className="text-gray-400 font-bold">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {pedidosFiltrados.map((pedido) => {
              const itens = pedido.pedidos_online_itens || [];
              const valorTotal = Number(pedido.valor_total || 0);

              return (
                <div
                  key={pedido.id}
                  className="bg-white dark:bg-[#2A102D] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div>
                    {/* CABEÇALHO DO CARD */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Pedido #{pedido.id}
                        </span>
                        <h3 className="font-bold text-lg dark:text-white">
                          {pedido.cliente_nome || "Cliente E-Commerce"}
                        </h3>
                        {pedido.cliente_whatsapp && (
                          <p className="text-xs text-gray-500">{pedido.cliente_whatsapp}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                          pedido.status === "PAGO" || pedido.status === "ENVIADO" || pedido.status === "EMBALANDO"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : pedido.status === "AGUARDANDO_PIX"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {pedido.status}
                        </span>

                        {pedido.tipo_entrega && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Entrega: {pedido.tipo_entrega}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BOTAO WHATSAPP */}
                    {pedido.cliente_whatsapp && (
                      <div className="mb-4">
                        <button
                          onClick={() => abrirWhatsApp(pedido.cliente_whatsapp, pedido.id)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/30 hover:opacity-80 transition-all"
                        >
                          <FiMessageSquare /> WhatsApp do Cliente
                        </button>
                      </div>
                    )}

                    {/* ITENS DO PEDIDO */}
                    <div className="space-y-2 mb-4 bg-gray-50 dark:bg-[#120514] p-4 rounded-2xl">
                      {itens.length > 0 ? (
                        itens.map((item, idx) => {
                          const nomeProd = item.nome_produto || `Produto #${item.produto_id}`;
                          const precoUnit = Number(item.preco_unitario || 0);
                          const qtd = Number(item.quantidade || 1);

                          return (
                            <div key={idx} className="flex justify-between items-center text-sm font-semibold">
                              <div>
                                <span>{qtd}x {nomeProd}</span>
                                <div className="flex gap-2 text-[10px] text-gray-400 uppercase font-black">
                                  {item.cor && <span>Cor: {item.cor}</span>}
                                  {item.tamanho && <span>Tam: {item.tamanho}</span>}
                                </div>
                              </div>
                              <span className="text-gray-500">
                                R$ {(precoUnit * qtd).toFixed(2)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400">Nenhum item encontrado.</p>
                      )}
                    </div>

                    {pedido.endereco_completo && (
                      <p className="text-xs text-gray-500 bg-gray-100 dark:bg-white/5 p-3 rounded-xl mb-4">
                        📍 <strong>Endereço:</strong> {pedido.endereco_completo}
                      </p>
                    )}
                  </div>

                  {/* RODAPÉ E AÇÕES DE STATUS */}
                  <div className="pt-4 border-t dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase">Valor Total</span>
                      <p className="text-xl font-black text-[#812C65] dark:text-[#E8B7D4]">
                        R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                      {pedido.status === "AGUARDANDO_PIX" && (
                        <button
                          onClick={() => atualizarStatusPedido(pedido.id, "PAGO")}
                          className="flex-1 sm:flex-none flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-600 transition-all"
                        >
                          <FiCheckCircle /> Confirmar PGTO
                        </button>
                      )}

                      {pedido.status === "PAGO" && (
                        <button
                          onClick={() => atualizarStatusPedido(pedido.id, "EMBALANDO")}
                          className="flex-1 sm:flex-none flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-all"
                        >
                          <FiClock /> Embalar
                        </button>
                      )}

                      {pedido.status === "EMBALANDO" && (
                        <button
                          onClick={() => atualizarStatusPedido(pedido.id, "ENVIADO")}
                          className="flex-1 sm:flex-none flex items-center gap-1 px-3 py-2 bg-[#812C65] text-white rounded-xl text-xs font-black hover:bg-[#590C42] transition-all"
                        >
                          <FiTruck /> Enviar
                        </button>
                      )}

                      {pedido.status !== "CANCELADO" && (
                        <button
                          onClick={() => atualizarStatusPedido(pedido.id, "CANCELADO")}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                          title="Cancelar Pedido"
                        >
                          <FiXCircle size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}