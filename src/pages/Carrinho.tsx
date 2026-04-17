/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  FiTrash2,
  FiArrowLeft,
  FiTruck,
  FiShoppingBag,
  FiCheckCircle
} from "react-icons/fi";

interface Regiao {
  nome: string;
  precoMin: number;
  precoMax: number;
}

export default function Carrinho() {
  const { carrinho, remover, limpar } = useCarrinho();
  const [formaPagamento, setFormaPagamento] = useState("");
  const [canalVenda, setCanalVenda] = useState("");
  const [observacao, setObservacao] = useState("");
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<Regiao | null>(null);
  const [valorUber, setValorUber] = useState<number | null>(null);
  const [finalizando, setFinalizando] = useState(false);

  const navigate = useNavigate();

  const totalProdutos = useMemo(() =>
    carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
    [carrinho]);

  const totalGeral = totalProdutos + (valorUber ?? 0);

  const regioes: Regiao[] = [
    { nome: "Chatuba / Mesquita", precoMin: 15, precoMax: 25 },
    { nome: "Anchieta / RJ", precoMin: 20, precoMax: 30 },
    { nome: "Inhaúma / Rio de Janeiro", precoMin: 25, precoMax: 35 },
    { nome: "Outros bairros distantes", precoMin: 50, precoMax: 70 },
  ];

  const calcularUber = (regiao: Regiao | null) => {
    if (!regiao) { setValorUber(null); return; }
    let valor = Math.random() * (regiao.precoMax - regiao.precoMin) + regiao.precoMin;
    const hora = new Date().getHours();
    if (hora >= 10 && hora < 16) valor *= 0.9;
    setValorUber(valor);
  };

  const finalizarVenda = async () => {
    if (!formaPagamento || !canalVenda) {
      alert("Por favor, selecione o pagamento e o canal de venda.");
      return;
    }

    setFinalizando(true);
    try {
      const token = localStorage.getItem("token");
      const itensvenda = carrinho.map((item) => ({
        produto_id: item.id,
        id_variante: item.id_variante,
        quantidade: item.quantidade,
        preco: item.preco,
        origem: item.origem
      }));

      await api.post("/vendas", {
        itens: itensvenda,
        forma_pagamento: formaPagamento,
        observacoes: observacao,
        canal: canalVenda,
        regiao: regiaoSelecionada?.nome || null,
        uber_estimativa: valorUber ?? 0,
        total: totalGeral
      }, { headers: { Authorization: `Bearer ${token}` } });

      limpar();
      navigate("/pdv");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar venda.");
    } finally {
      setFinalizando(false);
    }
  };

  if (carrinho.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#120514] p-6 text-center">
        <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-xl dark:shadow-none border border-gray-100 dark:border-white/10">
          <FiShoppingBag size={48} className="text-[#812C65] dark:text-[#E8B7D4]" />
        </div>
        <h1 className="text-3xl font-black text-[#590C42] dark:text-white mb-2">Sacola Vazia</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">Parece que você ainda não adicionou nenhum produto para vender.</p>
        <button
          onClick={() => navigate("/pdv")}
          className="flex items-center gap-2 bg-[#812C65] hover:bg-[#590C42] text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95"
        >
          <FiArrowLeft /> Ir para o PDV
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-[#120514] p-4 sm:p-8 pb-24 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col gap-2 mb-8">
            <button
            onClick={() => navigate("/pdv")}
            className="flex items-center gap-2 text-[#812C65] dark:text-[#E8B7D4] hover:underline mb-2 font-bold transition-all w-fit"
            >
            <FiArrowLeft /> Adicionar mais itens
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-[#590C42] dark:text-[#E8B7D4] tracking-tight">
                Finalizar Venda
            </h1>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* LISTA DE PRODUTOS */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Seu Carrinho ({carrinho.length})</span>
            </div>
            
            {carrinho.map((item: any) => (
              <div
                key={item.id_carrinho}
                className="bg-white dark:bg-[#2A102D] border border-gray-100 dark:border-white/5 p-4 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-24 h-24 bg-gray-50 dark:bg-[#120514] rounded-2xl overflow-hidden flex-shrink-0 border dark:border-white/10">
                  <img src={item.imagem_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.nome} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">
                    {item.nome}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase border dark:border-white/10">
                      TAM: {item.tamanho}
                    </span>
                    {item.variacao && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase border dark:border-white/10">
                        {item.variacao}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${item.origem === 'arara'
                      ? 'bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-900/30 text-pink-600 dark:text-pink-400'
                      : 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30 text-purple-600 dark:text-purple-400'
                      }`}>
                      {item.origem}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-2xl font-black text-[#812C65] dark:text-[#E8B7D4]">
                        <span className="text-sm font-normal text-gray-400 mr-1">{item.quantidade}x</span>
                        R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => remover(item.id_carrinho)}
                  className="p-4 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <FiTrash2 size={24} />
                </button>
              </div>
            ))}
          </div>

          {/* FORMULÁRIO E TOTAIS */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#2A102D] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl sticky top-8">
              <h2 className="text-2xl font-black dark:text-white mb-8 flex items-center gap-3">
                <FiCheckCircle className="text-[#812C65] dark:text-[#E8B7D4]" /> 
                Dados da Venda
              </h2>

              <div className="space-y-5">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Origem da Venda</label>
                    <select
                        value={canalVenda}
                        onChange={(e) => setCanalVenda(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-[#120514] rounded-2xl border-2 border-transparent focus:border-[#812C65] dark:text-white transition-all appearance-none outline-none font-bold text-sm"
                    >
                        <option value="">Selecione o Canal</option>
                        <option value="Loja">Loja Física</option>
                        <option value="Instagram">Instagram</option>
                        <option value="WhatsApp">WhatsApp</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Método de Pagamento</label>
                    <div className="grid grid-cols-1 gap-2">
                        {["Dinheiro", "Pix", "Cartão Credito"].map((metodo) => (
                            <button
                                key={metodo}
                                onClick={() => setFormaPagamento(metodo)}
                                className={`p-4 rounded-2xl text-left font-bold text-sm border-2 transition-all flex items-center justify-between ${
                                    formaPagamento === metodo 
                                    ? 'border-[#812C65] bg-purple-50 dark:bg-purple-900/20 text-[#812C65] dark:text-[#E8B7D4]' 
                                    : 'border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                {metodo === 'Cartão Credito' ? 'Cartão de Crédito' : metodo}
                                {formaPagamento === metodo && <FiCheckCircle />}
                            </button>
                        ))}
                    </div>
                </div>

                {(canalVenda === "Instagram" || canalVenda === "WhatsApp") && (
                  <div className="space-y-1 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1">
                        <FiTruck /> Taxa de Entrega (Uber)
                    </label>
                    <select
                      onChange={(e) => {
                        const reg = regioes.find(r => r.nome === e.target.value) || null;
                        setRegiaoSelecionada(reg);
                        calcularUber(reg);
                      }}
                      className="w-full p-4 bg-gray-50 dark:bg-[#120514] rounded-2xl border-2 border-transparent focus:border-[#812C65] dark:text-white transition-all outline-none font-bold text-sm"
                    >
                      <option value="">Selecione a Região</option>
                      {regioes.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Notas Internas</label>
                    <textarea
                        placeholder="Ex: Cliente vai buscar na loja, embalagem para presente..."
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-[#120514] rounded-2xl border-none text-sm dark:text-white min-h-[100px] outline-none focus:ring-2 focus:ring-[#812C65]"
                    />
                </div>
              </div>

              {/* RESUMO DE VALORES */}
              <div className="mt-8 pt-6 border-t dark:border-white/10 space-y-3">
                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold">
                  <span>Subtotal</span>
                  <span>R$ {totalProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {valorUber && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                        <span className="flex items-center gap-1"><FiTruck /> Frete Estimado</span>
                        <span>+ R$ {valorUber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                )}

                <div className="flex justify-between text-3xl font-black text-[#590C42] dark:text-white pt-2">
                  <span>Total</span>
                  <span className="text-[#812C65] dark:text-[#E8B7D4]">
                    R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={finalizarVenda}
                disabled={finalizando}
                className="w-full mt-8 bg-[#812C65] hover:bg-[#590C42] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {finalizando ? "PROCESSANDO..." : "CONCLUIR PEDIDO"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}