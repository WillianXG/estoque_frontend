/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  FiTrash2,
  FiArrowLeft,
  FiTruck,
  FiCreditCard,
  FiShoppingCart,
  FiMessageSquare
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

  // Cálculo de totais
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

      // AJUSTE AQUI: Garantindo que enviamos os dados corretos da variante
      const itensvenda = carrinho.map((item) => ({
        produto_id: item.id,            // ID do produto (numérico)
        id_variante: item.id_variante,  // ID da variante específica (numérico)
        quantidade: item.quantidade,
        preco: item.preco,
        origem: item.origem             // 'arara' ou 'deposito'
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
      alert("🎉 Venda finalizada com sucesso!");
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#120514] p-6 text-center">
        <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <FiShoppingCart size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold dark:text-white mb-2">Seu carrinho está vazio</h1>
        <button
          onClick={() => navigate("/pdv")}
          className="flex items-center gap-2 bg-[#812C65] text-white px-8 py-3 rounded-2xl font-bold mt-4"
        >
          <FiArrowLeft /> Voltar ao PDV
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#120514] p-4 sm:p-8 pb-24 transition-colors">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/pdv")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#812C65] mb-6 font-medium"
        >
          <FiArrowLeft /> Continuar Comprando
        </button>

        <h1 className="text-4xl font-black text-[#590C42] dark:text-[#E8B7D4] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-4">
            {/* Substitua o mapeamento dos itens por este bloco no Carrinho.tsx */}
            {carrinho.map((item: any) => (
              <div
                key={item.id_carrinho} // Usando a nova chave única
                className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 rounded-[2rem] flex items-center gap-4 shadow-sm"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.imagem_url} className="w-full h-full object-cover" alt={item.nome} />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                    {item.nome}
                  </h3>

                  {/* DETALHES DA VARIANTE: TAMANHO E COR/TIPO */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold uppercase">
                      Tam: {item.tamanho}
                    </span>
                    {item.variacao && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold uppercase">
                        {item.variacao}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${item.origem === 'arara'
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                      }`}>
                      {item.origem}
                    </span>
                  </div>

                  <p className="text-[#812C65] dark:text-[#E8B7D4] font-black mt-2">
                    {item.quantidade}x R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <button
                  onClick={() => remover(item.id_carrinho)} // Remove pela chave única
                  className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-[2.5rem] shadow-xl">
              <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <FiCreditCard className="text-[#812C65]" /> Detalhes
              </h2>

              <div className="space-y-4">
                <select
                  value={canalVenda}
                  onChange={(e) => setCanalVenda(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none text-sm dark:text-white"
                >
                  <option value="">Canal de Venda</option>
                  <option value="Loja">🏪 Loja Física</option>
                  <option value="Instagram">📸 Instagram</option>
                  <option value="WhatsApp">💬 WhatsApp</option>
                </select>

                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none text-sm dark:text-white"
                >
                  <option value="">Forma de Pagamento</option>
                  <option value="Dinheiro">💵 Dinheiro</option>
                  <option value="Pix">📱 Pix</option>
                  <option value="Cartão Credito">💳 Cartão de Crédito</option>
                </select>

                {(canalVenda === "Instagram" || canalVenda === "WhatsApp") && (
                  <div className="relative">
                    <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      onChange={(e) => {
                        const reg = regioes.find(r => r.nome === e.target.value) || null;
                        setRegiaoSelecionada(reg);
                        calcularUber(reg);
                      }}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none text-sm dark:text-white appearance-none"
                    >
                      <option value="">Selecione a Região</option>
                      {regioes.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <FiMessageSquare className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    placeholder="Observações..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none text-sm dark:text-white min-h-[80px]"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-white/10 space-y-2">
                <div className="flex justify-between text-xl font-black text-gray-800 dark:text-white">
                  <span>Total</span>
                  <span className="text-[#812C65] dark:text-[#E8B7D4]">
                    R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={finalizarVenda}
                disabled={finalizando}
                className="w-full mt-8 bg-[#812C65] text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50"
              >
                {finalizando ? "Processando..." : "FINALIZAR VENDA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}