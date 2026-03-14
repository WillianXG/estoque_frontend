/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/Carrinho.tsx
import { useState, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import api, { calcularFrete } from "../api/api";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem_url?: string;
  quantidade_arara: number;
  quantidade_deposito: number;
  quantidade: number;
}

export default function Carrinho() {
  const { carrinho, remover, limpar } = useCarrinho();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [canalVenda, setCanalVenda] = useState("");
  const [localVenda, setLocalVenda] = useState("arara");
  const [observacao, setObservacao] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<any>(null);
  const [frete, setFrete] = useState(0);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const navigate = useNavigate();

  const totalProdutos = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const total = totalProdutos + frete;

  useEffect(() => {
    async function carregar() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<Produto[]>("/produtos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProdutos(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    carregar();
  }, []);

  function obterEstoque(id: number) {
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return { quantidade_arara: 0, quantidade_deposito: 0 };
    return produto;
  }

  const handleCepChange = async (valor: string) => {
    setCep(valor);
    const cepLimpo = valor.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      setLoadingFrete(true);
      // Busca endereço via ViaCEP
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      setEndereco(data);

      // Prepara pacotes
      const pacotes = carrinho.map((_item) => ({
        weight: 1,   // ajustar conforme produto
        length: 20,
        width: 15,
        height: 10,
      }));

      // Calcula frete real
      const freteData = await calcularFrete(cepLimpo, pacotes);
      setFrete(freteData.valor ?? 0);
    } catch (err) {
      console.error(err);
      setFrete(0);
    } finally {
      setLoadingFrete(false);
    }
  };

  const finalizarVenda = async () => {
    if (!formaPagamento || !canalVenda) {
      alert("Selecione forma de pagamento e canal");
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
          cep: canalVenda === "Instagram" ? cep : null,
          frete: canalVenda === "Instagram" ? frete : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      limpar();
      alert("Venda concluída!");
      navigate("/pdv");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar venda");
    }
  };

  if (carrinho.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center text-gray-900 dark:text-gray-100">
          <h1 className="text-3xl font-bold mb-4">Carrinho vazio</h1>
          <button
            onClick={() => navigate("/pdv")}
            className="bg-purple-600 text-white px-6 py-2 rounded"
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
                  Arara {estoque.quantidade_arara} | Depósito {estoque.quantidade_deposito}
                </p>
                <p className="font-semibold">R$ {item.preco.toFixed(2)}</p>
              </div>
              <div className="text-right w-28">
                <p className="font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                <button onClick={() => remover(item.id)} className="text-red-500 text-sm">
                  remover
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
          <option value="">Forma pagamento</option>
          <option>Dinheiro</option>
          <option>Pix</option>
          <option>Cartão</option>
        </select>

        <select
          value={canalVenda}
          onChange={(e) => setCanalVenda(e.target.value)}
          className="border p-3 rounded bg-white dark:bg-gray-800"
        >
          <option value="">Canal venda</option>
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
          <input
            placeholder="CEP"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            className="border p-3 rounded bg-white dark:bg-gray-800"
          />

          {endereco && (
            <div className="text-sm">
              <p>{endereco.logradouro}</p>
              <p>{endereco.bairro}</p>
              <p>
                {endereco.localidade}-{endereco.uf}
              </p>
            </div>
          )}

          <p className="font-semibold">
            Frete: {loadingFrete ? "Calculando..." : `R$ ${frete.toFixed(2)}`}
          </p>
        </div>
      )}

      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Total R$ {total.toFixed(2)}</h2>
        <button
          onClick={finalizarVenda}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg"
        >
          Finalizar venda
        </button>
      </div>
    </main>
  );
}