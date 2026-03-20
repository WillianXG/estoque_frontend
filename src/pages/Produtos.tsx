/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import imageCompression from "browser-image-compression";
import { FiCamera, FiImage, FiPlus, FiTrash2, FiX, FiSave } from "react-icons/fi";

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
  categoria_id: string;
}

interface Produto {
  id?: string;
  nome: string;
  variacao: string;
  imagem_url: string;
  categoria_id?: string;
  subcategoria_id?: string;
  preco_venda?: string;
  preco_compra?: string;
  quantidade_arara?: string;
  quantidade_deposito?: string;
  variantes?: {
    id?: string;
    variacao: string;
    tamanho: string;
    quantidade_arara: number;
    quantidade_deposito: number;
  }[];
}

interface Variante {
  variacao: string;
  tamanho: string;
  quantidade_arara: number;
  quantidade_deposito: number;
}

export default function Produtos() {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [modalConfirmarRemocao, setModalConfirmarRemocao] = useState(false);
  const [produtoParaRemover, setProdutoParaRemover] = useState<Produto | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [, setImagemPreview] = useState<string | null>(null);
  const [modalErro, setModalErro] = useState(false);

  async function buscarProdutos() {
    setLoadingProdutos(true);
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data);
    } finally {
      setLoadingProdutos(false);
    }
  }

  async function buscarCategorias() {
    const res = await api.get("/categorias");
    setCategorias(res.data);
  }

  const adicionarVariante = () => {
    setVariantes([
      ...variantes,
      { variacao: "", tamanho: "", quantidade_arara: 0, quantidade_deposito: 0 },
    ]);
  };

  const removerVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  async function buscarSubcategorias(categoriaId: string) {
    if (!categoriaId) return;
    const res = await api.get(`/subcategorias?categoriaId=${categoriaId}`);
    setSubcategorias(res.data);
  }

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMensagem("Selecione apenas imagens.");
      return;
    }

    // Cria o preview instantâneo para o usuário não esperar
    const objectUrl = URL.createObjectURL(file);
    setImagemPreview(objectUrl);

    try {
      setLoading(true);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setImagemFile(compressedFile);

      // Atualiza o modalProduto com o base64 para garantir a exibição
      const reader = new FileReader();
      reader.onloadend = () => {
        if (modalProduto) {
          setModalProduto({ ...modalProduto, imagem_url: reader.result as string });
        }
        setLoading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMensagem("Erro ao processar imagem.");
    }
  };
  async function salvarProduto(p: Produto) {
    setTentouSalvar(true);

    // Verificação básica
    if (!p.nome || !p.preco_venda || !p.subcategoria_id || !p.categoria_id) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      // CORREÇÃO AQUI: String(valor) garante que o replace funcione mesmo se vier número do banco
      const precoVenda = String(p.preco_venda).replace(",", ".");
      const precoCompra = p.preco_compra ? String(p.preco_compra).replace(",", ".") : "0";

      const payloadVariantes =
        variantes.length > 0
          ? variantes
          : [{
            variacao: p.variacao || "Padrão",
            tamanho: "Único",
            quantidade_arara: 0,
            quantidade_deposito: 0
          }];

      const formData = new FormData();
      formData.append("nome", p.nome);
      formData.append("variacao", p.variacao || "");
      formData.append("preco_venda", precoVenda);
      formData.append("preco_compra", precoCompra);
      formData.append("subcategoria_id", p.subcategoria_id);
      formData.append("categoria_id", p.categoria_id);

      if (imagemFile) formData.append("imagem", imagemFile);
      formData.append("variantes", JSON.stringify(payloadVariantes));

      if (p.id) {
        await api.put(`/produtos/${p.id}`, formData);
        setMensagem("Produto atualizado!");
      } else {
        await api.post("/produtos", formData);
        setMensagem("Produto criado com estoque!");
      }

      await buscarProdutos();
      setModalProduto(null);
      setImagemFile(null);
      setTentouSalvar(false);

    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar produto.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  function abrirConfirmacaoRemover(produto: Produto) {
    setProdutoParaRemover(produto);
    setModalConfirmarRemocao(true);
  }

  async function confirmarRemocao() {
    if (!produtoParaRemover?.id) return;
    setRemovendo(true);
    try {
      await api.delete(`/produtos/${produtoParaRemover.id}`);
      setProdutos((old) => old.filter((p) => p.id !== produtoParaRemover.id));
      setModalConfirmarRemocao(false);
      setProdutoParaRemover(null);
      setModalSucesso(true);
    } catch (err) {
      console.error(err);
      setModalErro(true);
    } finally {
      setRemovendo(false);
    }
  }

  useEffect(() => {
    buscarProdutos();
    buscarCategorias();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-[#1a0a1d] transition-colors duration-300">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#590C42] dark:text-[#E8B7D4]">Produtos</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Gerencie produtos, categorias e subcategorias</p>
      </header>

      {/* MENSAGEM */}
      {mensagem && (
        <div className="fixed top-4 right-4 z-[60] p-4 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-100 rounded-2xl shadow-lg border border-pink-200 dark:border-pink-800 animate-bounce">
          {mensagem}
        </div>
      )}

      {/* BOTÃO CRIAR */}
      <button
        onClick={() => {
          setModalProduto({ nome: "", variacao: "", imagem_url: "", preco_venda: "", preco_compra: "", categoria_id: "", subcategoria_id: "" });
          setVariantes([]);
          setImagemFile(null);
          setImagemPreview(null); // Limpa o preview ao criar novo
          setTentouSalvar(false);
        }}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-[#812C65] hover:bg-[#954A79] text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
      >
        <FiPlus size={20} /> Criar Produto
      </button>

      {/* GRID PRODUTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProdutos
          ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-md">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 mb-2 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 rounded" />
            </div>
          ))
          : produtos.map((prod) => (
            <div key={prod.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-xl transition-shadow">
              <div className="relative group h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl mb-4 overflow-hidden">
                <img
                  src={prod.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                  alt={prod.nome}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{prod.nome}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">{prod.variacao || "Sem variação"}</p>

              <div className="mt-auto space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Venda:</span>
                  <span className="font-bold text-[#812C65] dark:text-[#E8B7D4]">R$ {prod.preco_venda}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-50 dark:border-gray-700 pt-1">
                  <span className="text-gray-500">Compra:</span>
                  <span className="text-gray-700 dark:text-gray-300">R$ {prod.preco_compra}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setModalProduto(prod);
                    setImagemPreview(prod.imagem_url); // Define o preview da imagem existente
                    if (prod.categoria_id) buscarSubcategorias(prod.categoria_id);
                    setVariantes(prod.variantes?.map((v: any) => ({
                      variacao: v.variacao,
                      tamanho: v.tamanho,
                      quantidade_arara: Number(v.quantidade_arara),
                      quantidade_deposito: Number(v.quantidade_deposito),
                    })) || []);
                    setTentouSalvar(false);
                  }}
                  className="flex-1 bg-[#812C65] hover:bg-[#954A79] text-white py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => abrirConfirmacaoRemover(prod)}
                  className="px-3 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 rounded-xl transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL PRODUTO (Caprichado no Mobile) */ }
  {
    modalProduto && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-hidden" onClick={() => setModalProduto(null)}>
        <div
          className="relative bg-white dark:bg-[#1f1222] w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* BARRA DE FECHAMENTO NO MOBILE */}
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3 sm:hidden" onClick={() => setModalProduto(null)} />

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {modalProduto.id ? "Editar Produto" : "Novo Produto"}
            </h2>
            <button onClick={() => setModalProduto(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
              <FiX size={24} />
            </button>
          </div>

          {/* CONTEÚDO COM SCROLL */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">

            {/* SEÇÃO IMAGEM E INFOS BÁSICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative aspect-square w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden group">
                  <img
                    src={modalProduto.imagem_url || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
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
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold cursor-pointer hover:bg-gray-200 active:scale-95 transition-all text-sm">
                    <FiImage size={18} /> Galeria
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Nome do Produto *</label>
                  <input
                    placeholder="Ex: Vestido Floral"
                    value={modalProduto.nome || ""}
                    onChange={(e) => setModalProduto({ ...modalProduto, nome: e.target.value })}
                    className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 dark:text-white ${tentouSalvar && !modalProduto.nome ? "border-red-400" : "border-transparent"} focus:bg-white dark:focus:bg-gray-800 focus:border-[#812C65] transition-all outline-none`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Cor / Estampa Base</label>
                  <input
                    placeholder="Ex: Vermelho ou Poá"
                    value={modalProduto.variacao || ""}
                    onChange={(e) => setModalProduto({ ...modalProduto, variacao: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:border-[#812C65] transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Venda *</label>
                    <input
                      placeholder="0,00"
                      value={modalProduto.preco_venda || ""}
                      onChange={(e) => setModalProduto({ ...modalProduto, preco_venda: e.target.value })}
                      className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:text-white focus:border-[#812C65] outline-none  ${tentouSalvar && !modalProduto.preco_venda ? "border-red-400" : "border-transparent"}`}
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

            {/* CATEGORIAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Categoria *</label>
                <select
                  value={modalProduto.categoria_id || ""}
                  onChange={(e) => {
                    setModalProduto({ ...modalProduto, categoria_id: e.target.value, subcategoria_id: "" });
                    buscarSubcategorias(e.target.value);
                  }}
                  className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 dark:text-white ${tentouSalvar && !modalProduto.categoria_id ? "border-red-400" : "border-transparent"} focus:border-[#812C65] outline-none appearance-none`}
                >
                  <option value="">Selecionar...</option>
                  {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
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
                  {subcategorias.map((sub) => <option key={sub.id} value={sub.id}>{sub.nome}</option>)}
                </select>
              </div>
            </div>

            {/* VARIANTES / ESTOQUE */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white uppercase text-sm tracking-widest">Estoque por Tamanho</h3>
                <button
                  type="button"
                  onClick={adicionarVariante}
                  className="flex items-center gap-1 text-sm font-bold text-[#812C65] hover:text-[#954A79] transition-colors"
                >
                  <FiPlus /> Adicionar
                </button>
              </div>

              <div className="space-y-3">
                {variantes.map((v, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 relative group animate-in zoom-in-95"
                  >
                    <button
                      onClick={() => removerVariante(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 transition-colors"
                    >
                      <FiX size={14} />
                    </button>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Cor</label>
                        <input
                          placeholder="Cor"
                          value={v.variacao || ""}
                          onChange={(e) => {
                            const newVar = [...variantes];
                            newVar[index].variacao = e.target.value;
                            setVariantes(newVar);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Tam</label>
                        <input
                          placeholder="G, P, 42..."
                          value={v.tamanho || ""}
                          onChange={(e) => {
                            const newVar = [...variantes];
                            newVar[index].tamanho = e.target.value;
                            setVariantes(newVar);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Arara</label>
                        <input
                          type="number"
                          value={v.quantidade_arara}
                          onChange={(e) => {
                            const newVar = [...variantes];
                            newVar[index].quantidade_arara = Number(e.target.value);
                            setVariantes(newVar);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Depósito</label>
                        <input
                          type="number"
                          value={v.quantidade_deposito}
                          onChange={(e) => {
                            const newVar = [...variantes];
                            newVar[index].quantidade_deposito = Number(e.target.value);
                            setVariantes(newVar);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 dark:text-white py-1 outline-none focus:border-[#812C65]"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {variantes.length === 0 && (
                  <p className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    Nenhuma variante adicionada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RODAPÉ / AÇÕES */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/80 grid grid-cols-2 gap-3 sm:flex sm:justify-end border-t border-gray-100 dark:border-gray-800 rounded-b-[32px]">
            <button
              onClick={() => setModalProduto(null)}
              className="px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold shadow-sm active:scale-95 transition-all order-2 sm:order-1 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => salvarProduto(modalProduto)}
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
    )
  }

  {/* MODAL CONFIRMAR REMOÇÃO */ }
  {
    modalConfirmarRemocao && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">Remover?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Deseja mesmo apagar <span className="font-bold text-gray-800 dark:text-white">{produtoParaRemover?.nome}</span>? Esta ação não pode ser desfeita.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setModalConfirmarRemocao(false)} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95">Não</button>
            <button onClick={confirmarRemocao} disabled={removendo} className="px-4 py-3 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20">
              {removendo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sim, apagar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* MODAL SUCESSO / ERRO (Simplificados) */ }
  {
    (modalSucesso || modalErro) && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalSucesso ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {modalSucesso ? '✓' : '✕'}
          </div>
          <h2 className={`text-xl font-bold mb-2 ${modalSucesso ? 'text-green-600' : 'text-red-600'}`}>
            {modalSucesso ? 'Tudo certo!' : 'Algo deu errado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {modalSucesso ? 'O produto foi removido.' : 'Não conseguimos processar sua solicitação.'}
          </p>
          <button
            onClick={() => { setModalSucesso(false); setModalErro(false); }}
            className={`w-full py-3 text-white rounded-2xl font-bold transition-all active:scale-95 ${modalSucesso ? 'bg-green-600 shadow-green-900/20' : 'bg-red-600 shadow-red-900/20'} shadow-lg`}
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }
    </main >
  );
}