import { useState } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
export default function Carrinho() {
    const { carrinho, remover, limpar } = useCarrinho();
    const [formaPagamento, setFormaPagamento] = useState("");
    const navigate = useNavigate();

    const total = carrinho.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
    );

    async function finalizarVenda() {

        const itens = carrinho.map(item => ({
            produto_id: item.id,
            quantidade: item.quantidade,
            preco: item.preco
        }));
        console.log("TOKEN:", localStorage.getItem("token"));

        await api.post("/vendas", {
            itens,
            forma_pagamento: formaPagamento
        });

        limpar();
        navigate("/pdv");
    }

    return (
        <div className="min-h-screen p-4">
            <h1 className="text-xl font-bold mb-4">Carrinho</h1>

            {carrinho.map(item => (
                <div key={item.id} className="border-b py-2">
                    <p className="font-semibold">{item.nome}</p>
                    <p>{item.quantidade} x R$ {item.preco}</p>
                    <button
                        onClick={() => remover(item.id)}
                        className="text-red-500 text-sm"
                    >
                        Remover
                    </button>
                </div>
            ))}

            <p className="text-lg font-bold mt-4">
                Total: R$ {total.toFixed(2)}
            </p>

            <select
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
            >
                <option value="">Forma de pagamento</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão">Cartão</option>
                <option value="Pix">Pix</option>
            </select>

            <button
                onClick={finalizarVenda}
                className="w-full bg-green-600 text-white mt-4 p-3 rounded-xl"
            >
                Finalizar Venda
            </button>
        </div>
    );
}