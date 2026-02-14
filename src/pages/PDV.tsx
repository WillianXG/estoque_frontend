import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCarrinho } from "../context/CarrinhoContext";
import api from "../api/api";
import Card from "../components/Card";

interface Produto {
    id: number;
    nome: string;
    preco: number;
    imagem_url: string;
    quantidade_arara: number;
}

export default function PDV() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const { adicionar, carrinho, aumentar, diminuir } = useCarrinho();
    const navigate = useNavigate();

    useEffect(() => {
        buscarProdutos();
    }, []);

    async function buscarProdutos() {
        const token = localStorage.getItem("token");

        const res = await axios.get(
            api.defaults.baseURL + "/produtos",
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        setProdutos(res.data);
    }

    const totalItens = carrinho.reduce(
        (acc, item) => acc + item.quantidade,
        0
    );

    return (
        <div className="min-h-screen p-4 pb-20">
            <h1 className="text-xl font-bold mb-4">PDV</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {produtos.map((produto) => {
                    const itemNoCarrinho = carrinho.find(
                        (item) => item.id === produto.id
                    );

                    return (
                        <Card
                            key={produto.id}
                            id={produto.id}
                            nome={produto.nome}
                            preco={produto.preco}
                            imagem_url={produto.imagem_url}
                            quantidade_arara={produto.quantidade_arara}
                            quantidadeNoCarrinho={itemNoCarrinho?.quantidade || 0}
                            onAdicionar={() =>
                                adicionar({
                                    ...produto,
                                    quantidade: 1,
                                    estoque: produto.quantidade_arara
                                })
                            }

                            onAumentar={() => aumentar(produto.id)}
                            onDiminuir={() => diminuir(produto.id)}
                        />
                    );
                })}
            </div>

            {carrinho.length > 0 && (
                <button
                    onClick={() => navigate("/pdv/carrinho")}
                    className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 text-center font-bold"
                >
                    🛒 {totalItens} itens
                </button>
            )}
        </div>
    );
}
