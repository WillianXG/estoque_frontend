import { FiTrash2 } from "react-icons/fi";
import type { Produto } from "../../types/produtos";

interface ProdutoCardProps {
  produto: Produto;
  onEdit: (produto: Produto) => void;
  onRemove: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onEdit, onRemove }: ProdutoCardProps) {
  return (
    <div className="bg-[#150a17] text-white p-4 rounded-3xl shadow-sm border border-white/10 flex flex-col hover:border-[#812C65] transition-all">
      <div className="relative group h-64 flex items-center justify-center bg-[#0d050f] rounded-2xl mb-4 overflow-hidden border border-white/5">
        <img
          src={produto.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
          alt={produto.nome || "Produto"}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <h3 className="font-bold text-base text-white truncate">
        {produto.nome && produto.nome.trim() !== "" ? produto.nome : "Peça sem nome"}
      </h3>

      <div className="mt-auto space-y-1 pt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Venda:</span>
          <span className="font-bold text-[#E8B7D4]">R$ {produto.preco_venda || "0,00"}</span>
        </div>
        {produto.preco_compra && (
          <div className="flex justify-between text-xs text-gray-500 border-t border-white/5 pt-1">
            <span>Compra:</span>
            <span>R$ {produto.preco_compra}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(produto)}
          className="flex-1 bg-[#812C65] hover:bg-[#954A79] text-white py-2 rounded-xl font-bold text-xs transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onRemove(produto)}
          className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/20"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}