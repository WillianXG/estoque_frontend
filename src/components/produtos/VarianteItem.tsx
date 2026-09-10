import { FiCamera, FiTrash2, FiX } from "react-icons/fi";
import type { Variante } from "../../types/produtos";

interface VarianteItemProps {
  variante: Variante;
  index: number;
  onChange: (index: number, updated: Variante) => void;
  onRemove: (index: number) => void;
  onImageChange: (index: number, file: File) => void;
  onImageRemove: (index: number) => void;
}

export function VarianteItem({
  variante,
  index,
  onChange,
  onRemove,
  onImageChange,
  onImageRemove,
}: VarianteItemProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 relative group animate-in zoom-in-95">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 transition-colors z-10"
      >
        <FiX size={14} />
      </button>

      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-12 sm:col-span-3 flex items-center gap-2">
          {variante.loading ? (
            <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="w-5 h-5 border-2 border-[#812C65] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : variante.imagem_url ? (
            <div className="relative w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group/img flex-shrink-0">
              <img src={variante.imagem_url} alt="Variante" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ) : (
            <label className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#812C65] transition-colors flex-shrink-0">
              <FiCamera size={16} className="text-gray-400" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onImageChange(index, e.target.files[0])}
              />
            </label>
          )}
          <span className="text-xs text-gray-400 font-medium sm:hidden">Foto Variante</span>
        </div>

        <div className="col-span-6 sm:col-span-3">
          <label className="text-[10px] font-black text-gray-400 uppercase">Cor</label>
          <input
            placeholder="Ex: Verde"
            value={variante.variacao || ""}
            onChange={(e) => onChange(index, { ...variante, variacao: e.target.value })}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase">Tam</label>
          <input
            placeholder="G, P, 42..."
            value={variante.tamanho || ""}
            onChange={(e) => onChange(index, { ...variante, tamanho: e.target.value })}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase">Arara</label>
          <input
            type="number"
            value={variante.quantidade_arara}
            onChange={(e) => onChange(index, { ...variante, quantidade_arara: Number(e.target.value) })}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase">Depósito</label>
          <input
            type="number"
            value={variante.quantidade_deposito}
            onChange={(e) => onChange(index, { ...variante, quantidade_deposito: Number(e.target.value) })}
            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
          />
        </div>
      </div>
    </div>
  );
}