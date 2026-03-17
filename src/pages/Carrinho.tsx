// eslint-disable @typescript-eslint/no-explicit-any
import { useState, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem_url?: string;
  quantidade_arara: number;
  quantidade_deposito: number;
  quantidade: number;
}

interface Regiao {
  nome: string;
  precoMin: number;
  precoMax: number;
}

export default function Carrinho() {
  const { carrinho, remover, limpar } = useCarrinho();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [canalVenda, setCanalVenda] = useState("");
  const [localVenda, setLocalVenda] = useState("arara");
  const [observacao, setObservacao] = useState("");
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<Regiao | null>(null);
  const [valorUber, setValorUber] = useState<number | null>(null);

  const navigate = useNavigate();

  const totalProdutos = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const total = totalProdutos + (valorUber ?? 0);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<Produto[]>("/produtos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProdutos(res.data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    };
    carregarProdutos();
  }, []);

  const obterEstoque = (id: number) => {
    const produto = produtos.find((p) => p.id === id);
    return produto || { quantidade_arara: 0, quantidade_deposito: 0 };
  };

  // Lista de regiões com preço base (quanto mais longe, maior)
  const regioes: Regiao[] = [
    { nome: "Chatuba / Mesquita", precoMin: 15, precoMax: 25 }, // perto
    { nome: "Anchieta / RJ", precoMin: 20, precoMax: 30 },       // próximo, mais barato que Inhaúma
    { nome: "Inhaúma / Rio de Janeiro", precoMin: 25, precoMax: 35 }, // mais longe
    { nome: "Outros bairros distantes", precoMin: 50, precoMax: 70 },
  ];

  const calcularUberPorRegiao = (regiao: Regiao | null) => {
    if (!regiao) {
      setValorUber(null);
      return;
    }

    // Valor base aleatório dentro da faixa
    let valor = Math.random() * (regiao.precoMax - regiao.precoMin) + regiao.precoMin;

    // Ajuste por horário
    const horaAtual = new Date().getHours();

    if (horaAtual >= 10 && horaAtual < 16) {
      // Fora do pico → desconto 10%
      valor *= 0.9;
    } else if ((horaAtual >= 7 && horaAtual < 10) || (horaAtual >= 17 && horaAtual < 20)) {
      // Pico → preço normal
      valor *= 1;
    } else if (horaAtual >= 0 && horaAtual < 6) {
      // Madrugada → desconto leve 10%
      valor *= 0.9;
    } else {
      // Meio período noite → preço normal
      valor *= 1;
    }

    setValorUber(valor);
  };

  const finalizarVenda = async () => {
    if (!formaPagamento || !canalVenda) {
      alert("Selecione forma de pagamento e canal de venda.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const itens = carrinho.map((item) => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        preco: item.preco,
      }));

      await api.post(
        "/vendas",
        {
          itens,
          forma_pagamento: formaPagamento,
          observacoes: observacao,
          canal: canalVenda,
          local_venda: localVenda,
          regiao: regiaoSelecionada?.nome || null,
          uber_estimativa: valorUber ?? 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      limpar();
      alert("Venda concluída com sucesso!");
      navigate("/pdv");
    } catch (err) {
      console.error("Erro ao finalizar venda:", err);
      alert("Erro ao finalizar a venda.");
    }
  };

  if (carrinho.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <h1 className="text-3xl font-bold mb-4">Carrinho vazio</h1>
          <button
            onClick={() => navigate("/pdv")}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Voltar ao PDV
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Carrinho</h1>

      <div className="space-y-4">
        {carrinho.map((item) => {
          const estoque = obterEstoque(item.id);
          return (
            <div
              key={item.id}
              className="flex items-center bg-white dark:bg-gray-800 shadow rounded-xl p-4 gap-4"
            >
              <img
                src={item.imagem_url || "https://via.placeholder.com/150"}
                className="w-20 h-20 object-contain"
              />
              <div className="flex-1">
                <h2 className="font-bold">{item.nome}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Arara: {estoque.quantidade_arara} | Depósito: {estoque.quantidade_deposito}
                </p>
                <p className="font-semibold">R$ {item.preco.toFixed(2)}</p>
              </div>
              <div className="text-right w-28">
                <p className="font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                <button
                  onClick={() => remover(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <select
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          className="border p-3 rounded bg-white dark:bg-gray-800"
        >
          <option value="">Forma de pagamento</option>
          <option>Dinheiro</option>
          <option>Pix</option>
          <option>Cartão</option>
        </select>

        <select
          value={canalVenda}
          onChange={(e) => setCanalVenda(e.target.value)}
          className="border p-3 rounded bg-white dark:bg-gray-800"
        >
          <option value="">Canal de venda</option>
          <option>Loja</option>
          <option>Instagram</option>
        </select>

        <select
          value={localVenda}
          onChange={(e) => setLocalVenda(e.target.value)}
          className="border p-3 rounded bg-white dark:bg-gray-800"
        >
          <option value="arara">Arara</option>
          <option value="deposito">Depósito</option>
        </select>

        <textarea
          placeholder="Observações"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="border p-3 rounded bg-white dark:bg-gray-800"
        />
      </div>

      {canalVenda === "Instagram" && (
        <div className="mt-6 space-y-2">
          <select
            value={regiaoSelecionada?.nome || ""}
            onChange={(e) => {
              const reg = regioes.find(r => r.nome === e.target.value) || null;
              setRegiaoSelecionada(reg);
              calcularUberPorRegiao(reg);
            }}
            className="border p-3 rounded bg-white dark:bg-gray-800"
          >
            <option value="">Selecione a região</option>
            {regioes.map((r) => (
              <option key={r.nome} value={r.nome}>
                {r.nome}
              </option>
            ))}
          </select>

          <p className="font-semibold">
            {valorUber === null ? "Selecione a região" : `Uber aproximado: R$ ${valorUber.toFixed(2)}`}
          </p>
        </div>
      )}

      <div className="mt-8 border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Total R$ {total.toFixed(2)}</h2>
        <button
          onClick={finalizarVenda}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Finalizar venda
        </button>
      </div>
    </main>
  );
}