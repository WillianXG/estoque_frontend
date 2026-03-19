import React, { useState } from "react";

interface CardProps {
  id: number;
  nome: string;
  preco_venda: number | string | null | undefined;
  imagem_url?: string;
  quantidade_arara: number;
  quantidade_deposito: number; // 👈 NOVO
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
  quantidade_deposito, // 👈 NOVO
  quantidadeNoCarrinho,
  onAdicionar,
  onAumentar,
  onDiminuir,
}) => {
  const [erro, setErro] = useState(false);

  const ativarErro = () => {
    setErro(true);
    setTimeout(() => setErro(false), 400);
  };

  const handleAdicionar = () => {
    if (!onAdicionar()) ativarErro();
  };

  const handleAumentar = () => {
    if (!onAumentar()) ativarErro();
  };

  // ✅ Formatação segura do preço
  const precoNumero = Number(preco_venda);
  const precoValido = isNaN(precoNumero) ? 0 : precoNumero;

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoValido);
  const total = quantidade_arara + quantidade_deposito;
  return (
    <article
      className={`
        rounded-2xl p-4 sm:p-5 flex flex-col justify-between
        bg-[#590C42] dark:bg-[#4B1F59]
        text-white
        shadow-lg border border-[#812C65]/50
        transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1
        ${erro ? "animate-shake border-[#E8B7D4]" : ""}
      `}
    >
      {/* Imagem + Info */}
      <div className="flex flex-col items-center text-center">
        <div className="w-full h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 overflow-hidden rounded-xl mb-3 border border-[#812C65]/40 bg-white/5">
          <img
            src={imagem_url || "https://via.placeholder.com/300x200"}
            alt={`Imagem do produto ${nome}`}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-bold text-lg sm:text-base md:text-lg lg:text-xl truncate w-full">
          {nome}
        </h3>

        <p className="text-[#E8B7D4] font-extrabold mt-1 text-base sm:text-lg md:text-lg">
          {precoFormatado}
        </p>

        <div className="text-gray-200 dark:text-gray-300 text-xs sm:text-xs md:text-sm mt-2 text-left w-full">
          <p>Arara: {quantidade_arara}</p>
          <p>Depósito: {quantidade_deposito}</p>
          <p className="font-bold text-[#E8B7D4]">
            Total: {total}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-4 sm:mt-5 w-full">
        {quantidadeNoCarrinho === 0 ? (
          <button
            onClick={handleAdicionar}
            className="
              w-full bg-[#812C65] 
              hover:bg-[#954A79]
              active:scale-95
              text-white py-2 sm:py-2.5 rounded-xl 
              font-semibold 
              transition-all duration-200
              shadow-md hover:shadow-lg
            "
          >
            Adicionar
          </button>
        ) : (
          <div className="flex items-center justify-between bg-[#E8B7D4] rounded-xl p-2 sm:p-2.5 shadow-inner">
            <button
              onClick={onDiminuir}
              className="
                bg-[#F5A9D0] 
                hover:bg-[#F7B7DE] 
                active:scale-95
                text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg 
                transition-all duration-200
                font-bold
              "
            >
              −
            </button>

            <span className="font-bold text-base sm:text-lg md:text-xl text-[#590C42]">
              {quantidadeNoCarrinho}
            </span>

            <button
              onClick={handleAumentar}
              className="
                bg-[#812C65] 
                hover:bg-[#954A79] 
                active:scale-95
                text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg 
                transition-all duration-200
                font-bold
              "
            >
              +
            </button>
          </div>
        )}

        {erro && (
          <p className="text-[#F5A9D0] text-sm font-semibold mt-2 sm:mt-3 text-center">
            Estoque insuficiente
          </p>
        )}
      </div>
    </article>
  );
};

export default Card;