import { FiCamera, FiImage, FiPlus, FiSave, FiX } from "react-icons/fi";
import type { Categoria, Produto, Subcategoria, Variante } from "../../types/produtos";
import { VarianteItem } from "./VarianteItem";

interface ModalProdutoProps {
    modalProduto: Produto;
    setModalProduto: React.Dispatch<React.SetStateAction<Produto | null>>;
    variantes: Variante[];
    setVariantes: React.Dispatch<React.SetStateAction<Variante[]>>;
    categorias: Categoria[];
    subcategorias: Subcategoria[];
    imagemPreview: string | null;
    loading: boolean;
    tentouSalvar: boolean;
    onClose: () => void;
    onSave: (p: Produto) => void;
    onFileChange: (file: File) => void;
    onVarianteImageChange: (index: number, file: File) => void;
    onVarianteImageRemove: (index: number) => void;
    onCategoriaChange: (categoriaId: string) => void;
}

export function ModalProduto({
    modalProduto,
    setModalProduto,
    variantes,
    setVariantes,
    categorias,
    subcategorias,
    imagemPreview,
    loading,
    tentouSalvar,
    onClose,
    onSave,
    onFileChange,
    onVarianteImageChange,
    onVarianteImageRemove,
    onCategoriaChange,
}: ModalProdutoProps) {
    const adicionarVariante = () => {
        setVariantes((prev) => [
            ...prev,
            {
                variacao: "",
                tamanho: "",
                quantidade_arara: 0,
                quantidade_deposito: 0,
                imagem_url: "",
                imagemFile: null,
            },
        ]);
    };

    const removerVariante = (index: number) => {
        setVariantes((prev) => {
            const novas = prev.filter((_, i) => i !== index);
            if (prev[index]?.imagem_url?.startsWith("blob:")) {
                URL.revokeObjectURL(prev[index].imagem_url!);
            }
            return novas;
        });
    };

    const handleVarianteChange = (index: number, updated: Variante) => {
        setVariantes((prev) => {
            const novas = [...prev];
            novas[index] = updated;
            return novas;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-hidden" onClick={onClose}>
            <div
                className="relative bg-white dark:bg-[#1f1222] w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3 sm:hidden" onClick={onClose} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {modalProduto.id ? "Editar Produto" : "Novo Produto"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden group">
                                <img
                                    src={imagemPreview || modalProduto.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                                    alt="Preview"
                                    className="max-h-full max-w-full object-contain p-4"
                                />
                                {loading && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-[#812C65] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#812C65] text-white rounded-xl font-bold cursor-pointer hover:bg-[#954A79] active:scale-95 transition-all text-sm">
                                    <FiCamera size={18} /> Câmera
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])} />
                                </label>
                                <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-200 active:scale-95 transition-all text-sm">
                                    <FiImage size={18} /> Galeria
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    Nome do Produto (Opcional)
                                </label>
                                <input
                                    placeholder="Ex: Deixe em branco para usar a subcategoria"
                                    value={modalProduto.nome || ""}
                                    onChange={(e) => setModalProduto({ ...modalProduto, nome: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0d050f] border border-white/10 focus:border-[#812C65] transition-all outline-none text-sm text-white placeholder-gray-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Venda *</label>
                                    <input
                                        placeholder="0,00"
                                        value={modalProduto.preco_venda || ""}
                                        onChange={(e) => setModalProduto({ ...modalProduto, preco_venda: e.target.value })}
                                        className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 dark:text-white focus:border-[#812C65] outline-none ${tentouSalvar && !modalProduto.preco_venda ? "border-red-400" : "border-transparent"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Compra</label>
                                    <input
                                        placeholder="0,00"
                                        value={modalProduto.preco_compra || ""}
                                        onChange={(e) => setModalProduto({ ...modalProduto, preco_compra: e.target.value })}
                                        className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:text-white focus:border-[#812C65] outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Categoria *</label>
                            <select
                                value={modalProduto.categoria_id || ""}
                                onChange={(e) => {
                                    setModalProduto({ ...modalProduto, categoria_id: e.target.value, subcategoria_id: "" });
                                    onCategoriaChange(e.target.value);
                                }}
                                className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 dark:text-white ${tentouSalvar && !modalProduto.categoria_id ? "border-red-400" : "border-transparent"} focus:border-[#812C65] outline-none appearance-none`}
                            >
                                <option value="">Selecionar...</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Subcategoria *</label>
                            <select
                                value={modalProduto.subcategoria_id || ""}
                                onChange={(e) => setModalProduto({ ...modalProduto, subcategoria_id: e.target.value })}
                                className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 dark:text-white ${tentouSalvar && !modalProduto.subcategoria_id ? "border-red-400" : "border-transparent"} focus:border-[#812C65] outline-none appearance-none`}
                            >
                                <option value="">Selecionar...</option>
                                {subcategorias.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 dark:text-white uppercase text-sm tracking-widest">Estoque por Cor e Tamanho</h3>
                            <button
                                type="button"
                                onClick={adicionarVariante}
                                className="flex items-center gap-1 text-sm font-bold text-[#812C65] hover:text-[#954A79] transition-colors"
                            >
                                <FiPlus /> Adicionar Variante
                            </button>
                        </div>

                        <div className="space-y-3">
                            {variantes.map((v, index) => (
                                <VarianteItem
                                    key={v.id || index}
                                    variante={v}
                                    index={index}
                                    onChange={handleVarianteChange}
                                    onRemove={removerVariante}
                                    onImageChange={onVarianteImageChange}
                                    onImageRemove={onVarianteImageRemove}
                                />
                            ))}

                            {variantes.length === 0 && (
                                <p className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                    Nenhuma variante adicionada.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/80 grid grid-cols-2 gap-3 sm:flex sm:justify-end border-t border-gray-100 dark:border-gray-800 rounded-b-[32px]">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold shadow-sm active:scale-95 transition-all order-2 sm:order-1 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(modalProduto)}
                        disabled={loading}
                        className={`px-8 py-3.5 bg-[#812C65] text-white rounded-2xl font-bold shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all order-1 sm:order-2 ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#954A79]"}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiSave size={20} />
                        )}
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}