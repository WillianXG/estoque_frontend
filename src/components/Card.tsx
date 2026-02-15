import React, { useState } from "react";

interface CardProps {
  id: number;
  nome: string;
  preco_venda: number | string | null | undefined;
  imagem_url?: string;
  quantidade_arara: number;
  quantidadeNoCarrinho: number;
  onAdicionar: () => boolean;
  onAumentar: () => boolean;
  onDiminuir: () => void;
}

const Card: React.FC<CardProps> = ({
  nome,
  preco_venda,
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

  // ✅ Tratamento seguro do preco_venda
  const precoNumero = Number(preco_venda);
  const precoValido = isNaN(precoNumero) ? 0 : precoNumero;

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoValido);

  return (
    <article
      className={`
        rounded-2xl p-5 flex flex-col justify-between
        bg-[#590C42] dark:bg-[#4B1F59]
        text-white
        shadow-lg border border-[#812C65]/50
        transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1
        ${erro ? "animate-shake border-[#E8B7D4]" : ""}
      `}
    >
      {/* Imagem + Infos */}
      <div className="flex flex-col items-center text-center">
        <img
          src={imagem_url || "https://via.placeholder.com/300x200"}
          alt={`Imagem do produto ${nome}`}
          className="w-full max-h-60 object-contain rounded-xl mb-4 border border-[#812C65]/40 bg-white/5"
        />

        <h3 className="font-bold text-lg tracking-wide">{nome}</h3>

        <p className="text-[#E8B7D4] font-extrabold mt-1 text-lg">
          {precoFormatado}
        </p>

        <p className="text-gray-200 dark:text-gray-300 text-sm mt-1">
          Estoque disponível: {quantidade_arara}
        </p>
      </div>

      {/* Ações */}
      <div className="mt-5 w-full">
        {quantidadeNoCarrinho === 0 ? (
          <button
            onClick={handleAdicionar}
            className="
              w-full bg-[#812C65] 
              hover:bg-[#954A79]
              active:scale-95
              text-white py-2.5 rounded-xl 
              font-semibold 
              transition-all duration-200
              shadow-md hover:shadow-lg
            "
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#E8B7D4] rounded-xl p-2 shadow-inner">
            <button
              onClick={onDiminuir}
              className="
                bg-[#F5A9D0] 
                hover:bg-[#F7B7DE] 
                active:scale-95
                text-white px-3 py-1 rounded-lg 
                transition-all duration-200
              "
            >
              −
            </button>

            <span className="font-bold text-lg text-[#590C42]">
              {quantidadeNoCarrinho}
            </span>

            <button
              onClick={handleAumentar}
              className="
                bg-[#812C65] 
                hover:bg-[#954A79] 
                active:scale-95
                text-white px-3 py-1 rounded-lg 
                transition-all duration-200
              "
            >
              +
            </button>
          </div>
        )}

        {erro && (
          <p className="text-[#F5A9D0] text-sm font-semibold mt-3 text-center">
            Estoque insuficiente
          </p>
        )}
      </div>
    </article>
  );
};

export default Card;
