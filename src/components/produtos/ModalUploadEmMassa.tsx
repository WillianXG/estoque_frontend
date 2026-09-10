import { useState } from "react";
import { FiUploadCloud, FiX, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import type { Categoria, Subcategoria } from "../../types/produtos";
import imageCompression from "browser-image-compression";

interface ModalUploadEmMassaProps {
    categorias: Categoria[];
    subcategorias: Subcategoria[];
    loading: boolean;
    onClose: () => void;
    onCategoriaChange: (categoriaId: string) => void;
    onSalvarLote: (lote: {
        categoria_id: string;
        subcategoria_id: string;
        preco_venda: string;
        preco_compra: string;
        arquivos: File[];
    }) => Promise<void>;
}

export function ModalUploadEmMassa({
    categorias,
    subcategorias,
    loading,
    onClose,
    onCategoriaChange,
    onSalvarLote,
}: ModalUploadEmMassaProps) {
    const [categoriaId, setCategoriaId] = useState("");
    const [subcategoriaId, setSubcategoriaId] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [precoCompra, setPrecoCompra] = useState("");
    const [arquivos, setArquivos] = useState<{ file: File; preview: string }[]>([]);
    const [processandoImagens, setProcessandoImagens] = useState(false);
    const [tentouSalvar, setTentouSalvar] = useState(false);

    // Faixas de preços predefinidas para clique rápido
    const faixasPreco = ["20,00", "25,00", "30,00", "35,00", "40,00", "50,00", "60,00", "80,00"];

    const handleFilesSelected = async (filesList: FileList | null) => {
        if (!filesList || filesList.length === 0) return;

        setProcessandoImagens(true);
        const novosArquivos: { file: File; preview: string }[] = [];

        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            if (!file.type.startsWith("image/")) continue;

            try {
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                const preview = URL.createObjectURL(compressedFile);
                novosArquivos.push({ file: compressedFile, preview });
            } catch (e) {
                console.error("Erro ao comprimir imagem em lote:", e);
            }
        }

        setArquivos((prev) => [...prev, ...novosArquivos]);
        setProcessandoImagens(false);
    };

    const removerArquivo = (index: number) => {
        setArquivos((prev) => {
            const item = prev[index];
            if (item?.preview.startsWith("blob:")) {
                URL.revokeObjectURL(item.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSalvar = () => {
        setTentouSalvar(true);
        if (!subcategoriaId || !precoVenda || arquivos.length === 0) {
            return;
        }

        onSalvarLote({
            categoria_id: categoriaId,
            subcategoria_id: subcategoriaId,
            preco_venda: precoVenda,
            preco_compra: precoCompra,
            arquivos: arquivos.map((a) => a.file),
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative bg-[#150a17] text-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-white/10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#1e0f22]">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                            <FiUploadCloud className="text-[#E8B7D4]" /> Cadastrar Produtos em Lote
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Envie dezenas de fotos de uma só vez sem precisar digitar nomes!
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
                    {/* Configurações do Lote */}
                    <div className="bg-[#0d050f] p-4 rounded-2xl border border-white/10 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8B7D4]">
                            1. Dados Padrão para este Lote
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Categoria *
                                </label>
                                <select
                                    value={categoriaId}
                                    onChange={(e) => {
                                        setCategoriaId(e.target.value);
                                        setSubcategoriaId("");
                                        onCategoriaChange(e.target.value);
                                    }}
                                    className={`w-full px-3 py-3 rounded-xl bg-[#150a17] border ${tentouSalvar && !categoriaId ? "border-red-500" : "border-white/10"
                                        } focus:border-[#812C65] outline-none text-sm text-white`}
                                >
                                    <option value="">Selecionar...</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Subcategoria *
                                </label>
                                <select
                                    value={subcategoriaId}
                                    onChange={(e) => setSubcategoriaId(e.target.value)}
                                    className={`w-full px-3 py-3 rounded-xl bg-[#150a17] border ${tentouSalvar && !subcategoriaId ? "border-red-500" : "border-white/10"
                                        } focus:border-[#812C65] outline-none text-sm text-white`}
                                >
                                    <option value="">Selecionar...</option>
                                    {subcategorias.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Preços e Atributos Rápidos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Preço de Venda Padrão (R$) *
                                </label>
                                <input
                                    placeholder="Ex: 35,00"
                                    value={precoVenda}
                                    onChange={(e) => setPrecoVenda(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl bg-[#150a17] border ${tentouSalvar && !precoVenda ? "border-red-500" : "border-white/10"
                                        } focus:border-[#812C65] outline-none text-sm text-white`}
                                />
                                {/* Atributos Rápidos de Preço */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {faixasPreco.map((valor) => (
                                        <button
                                            key={valor}
                                            type="button"
                                            onClick={() => setPrecoVenda(valor)}
                                            className="px-2.5 py-1 text-[10px] font-bold bg-white/5 hover:bg-[#812C65] hover:text-white rounded-lg border border-white/10 transition-colors"
                                        >
                                            R$ {valor}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Preço de Compra (Opcional)
                                </label>
                                <input
                                    placeholder="0,00"
                                    value={precoCompra}
                                    onChange={(e) => setPrecoCompra(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#150a17] border border-white/10 focus:border-[#812C65] outline-none text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seleção de Múltiplas Fotos */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8B7D4] flex items-center justify-between">
                            <span>2. Fotos das Peças ({arquivos.length} selecionadas)</span>
                            {arquivos.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setArquivos([])}
                                    className="text-red-400 hover:underline text-[10px] lowercase"
                                >
                                    limpar todas
                                </button>
                            )}
                        </h3>

                        <label className="border-2 border-dashed border-white/20 hover:border-[#812C65] bg-[#0d050f]/60 hover:bg-[#0d050f] transition-all p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center group">
                            <FiUploadCloud size={40} className="text-gray-400 group-hover:text-[#E8B7D4] mb-2 transition-colors" />
                            <p className="text-sm font-semibold text-gray-200">
                                Clique para selecionar várias fotos (50, 100 de uma vez)
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG ou WEBP</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFilesSelected(e.target.files)}
                            />
                        </label>

                        {processandoImagens && (
                            <div className="p-4 bg-white/5 rounded-xl flex items-center justify-center gap-3 text-sm text-gray-300">
                                <div className="w-5 h-5 border-2 border-[#812C65] border-t-transparent rounded-full animate-spin" />
                                Otimizando fotos selecionadas...
                            </div>
                        )}

                        {/* Grid de Previews Selecionados */}
                        {arquivos.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 bg-[#0d050f] rounded-2xl border border-white/10 custom-scrollbar">
                                {arquivos.map((item, idx) => (
                                    <div key={idx} className="relative aspect-square bg-[#150a17] rounded-xl overflow-hidden group border border-white/10">
                                        <img src={item.preview} alt={`Item ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removerArquivo(idx)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tentouSalvar && arquivos.length === 0 && (
                            <p className="text-xs text-red-400">Selecione pelo menos 1 foto para enviar o lote.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#1e0f22] flex justify-end gap-3 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold text-sm border border-white/10"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        disabled={loading || processandoImagens || arquivos.length === 0}
                        className={`px-6 py-2.5 bg-[#812C65] text-white rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 ${loading || processandoImagens || arquivos.length === 0
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-[#954A79]"
                            }`}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiCheckCircle size={16} />
                        )}
                        Cadastrar {arquivos.length} Peça(s)
                    </button>
                </div>
            </div>
        </div>
    );
}