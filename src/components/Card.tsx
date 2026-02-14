import React, { useState } from "react";

interface CardProps {
  id: number;
  nome: string;
  preco: number;
  imagem_url?: string;
  quantidade_arara: number;
  quantidadeNoCarrinho: number;
  onAdicionar: () => boolean;
  onAumentar: () => boolean;
  onDiminuir: () => void;
}

const Card: React.FC<CardProps> = ({
  nome,
  preco,
  imagem_url,
  quantidade_arara,
  quantidadeNoCarrinho,
  onAdicionar,
  onAumentar,
  onDiminuir,
}) => {
  const [erro, setErro] = useState(false);

  function ativarErro() {
    setErro(true);
    setTimeout(() => setErro(false), 400);
  }

  function handleAdicionar() {
    if (!onAdicionar()) ativarErro();
  }

  function handleAumentar() {
    if (!onAumentar()) ativarErro();
  }

  return (
    <div
      className={`rounded-2xl p-4 shadow-md flex flex-col justify-between
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      transition-all duration-300 hover:shadow-xl
      ${erro ? "shake border-red-500" : ""}`}
    >
      <div>
        <img
          src={imagem_url || "https://via.placeholder.com/150"}
          alt={nome}
          className="h-40 w-full object-cover rounded-xl mb-3"
        />

        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {nome}
        </p>

        <p className="text-green-600 font-bold mt-1">
          R$ {Number(preco).toFixed(2)}
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Estoque: {quantidade_arara}
        </p>
      </div>

      <div className="mt-4">
        {quantidadeNoCarrinho === 0 ? (
          <button
            onClick={handleAdicionar}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
            <button
              onClick={onDiminuir}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
            >
              -
            </button>

            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {quantidadeNoCarrinho}
            </span>

            <button
              onClick={handleAumentar}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
            >
              +
            </button>
          </div>
        )}

        <div className="h-5 mt-2">
          {erro && (
            <p className="text-red-500 text-sm font-semibold">
              Estoque insuficiente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
