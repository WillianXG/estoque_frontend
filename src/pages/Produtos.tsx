/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import imageCompression from "browser-image-compression";
import { FiPlus, FiUploadCloud } from "react-icons/fi";
import type { Categoria, Produto, Subcategoria, Variante } from "../types/produtos";
import { ProdutoCard } from "../components/produtos/ProdutoCard";
import { ModalProduto } from "../components/produtos/ModalProduto";
import { ModaisFeedback } from "../components/produtos/ModaisFeedback";
import { ModalUploadEmMassa } from "../components/produtos/ModalUploadEmMassa";

export default function Produtos() {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [modalEmMassaAberto, setModalEmMassaAberto] = useState(false);

  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [modalConfirmarRemocao, setModalConfirmarRemocao] = useState(false);
  const [produtoParaRemover, setProdutoParaRemover] = useState<Produto | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalErro, setModalErro] = useState(false);

  async function buscarProdutos() {
    setLoadingProdutos(true);
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoadingProdutos(false);
    }
  }

  async function buscarCategorias() {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  }

  async function buscarSubcategorias(categoriaId: string) {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    try {
      const res = await api.get(`/subcategorias?categoriaId=${categoriaId}`);
      setSubcategorias(res.data);
    } catch (err) {
      console.error("Erro ao buscar subcategorias:", err);
    }
  }

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMensagem("Selecione apenas imagens.");
      return;
    }

    if (imagemPreview && imagemPreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagemPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setImagemPreview(objectUrl);

    try {
      setLoading(true);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      setImagemFile(compressedFile);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao processar imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleVarianteImageChange = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return;

    setVariantes((prev) => {
      const novas = [...prev];
      novas[index] = { ...novas[index], loading: true };
      return novas;
    });

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);

      setVariantes((prev) => {
        const novas = [...prev];
        if (novas[index].imagem_url?.startsWith("blob:")) {
          URL.revokeObjectURL(novas[index].imagem_url!);
        }
        novas[index] = {
          ...novas[index],
          imagemFile: compressedFile,
          imagem_url: previewUrl,
          loading: false,
        };
        return novas;
      });
    } catch (err) {
      console.error("Erro ao comprimir imagem da variante:", err);
      setVariantes((prev) => {
        const novas = [...prev];
        novas[index] = { ...novas[index], loading: false };
        return novas;
      });
    }
  };

  const removerImagemVariante = (index: number) => {
    setVariantes((prev) => {
      const novas = [...prev];
      if (novas[index].imagem_url?.startsWith("blob:")) {
        URL.revokeObjectURL(novas[index].imagem_url!);
      }
      novas[index] = {
        ...novas[index],
        imagemFile: null,
        imagem_url: "",
      };
      return novas;
    });
  };

  // SALVAR INDIVIDUAL
  async function salvarProduto(p: Produto) {
    setTentouSalvar(true);

    if (!p.preco_venda || !p.subcategoria_id || !p.categoria_id) {
      setMensagem("Preencha categoria, subcategoria e preço.");
      return;
    }

    setLoading(true);

    try {
      const precoVenda = String(p.preco_venda).replace(",", ".");
      const precoCompra = p.preco_compra ? String(p.preco_compra).replace(",", ".") : "0";

      const payloadVariantes =
        variantes.length > 0
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ? variantes.map(({ imagemFile: _imagemFile, loading: _loading, ...rest }) => rest)
          : [
              {
                variacao: "Padrão",
                tamanho: "Único",
                quantidade_arara: 0,
                quantidade_deposito: 0,
                imagem_url: "",
              },
            ];

      const formData = new FormData();
      if (p.nome && p.nome.trim() !== "") {
        formData.append("nome", p.nome);
      }
      formData.append("preco_venda", precoVenda);
      formData.append("preco_compra", precoCompra);
      formData.append("subcategoria_id", p.subcategoria_id);
      formData.append("categoria_id", p.categoria_id);

      if (imagemFile) {
        formData.append("imagem", imagemFile);
      }

      formData.append("variantes", JSON.stringify(payloadVariantes));

      variantes.forEach((v, index) => {
        if (v.imagemFile) {
          formData.append(`variante_imagem_${index}`, v.imagemFile);
        }
      });

      if (p.id) {
        await api.put(`/produtos/${p.id}`, formData);
        setMensagem("Produto atualizado!");
      } else {
        await api.post("/produtos", formData);
        setMensagem("Produto criado!");
      }

      await buscarProdutos();
      fecharModalProduto();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar produto.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  // SALVAR LOTE (UPLOAD EM MASSA) - Envia para a rota POST /produtos/lote
  // SALVAR LOTE (UPLOAD EM MASSA) - Envia para a rota POST /produtos/lote
  // SALVAR LOTE (UPLOAD EM MASSA)
  async function salvarLoteEmMassa(lote: {
    categoria_id: string;
    subcategoria_id: string;
    preco_venda: string;
    preco_compra: string;
    arquivos: File[];
  }) {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Envia subcategoria_id obrigatoriamente
      formData.append("subcategoria_id", String(lote.subcategoria_id));
      
      // Converte preço trocando vírgula por ponto
      const pVenda = lote.preco_venda ? String(lote.preco_venda).replace(",", ".") : "0";
      const pCompra = lote.preco_compra ? String(lote.preco_compra).replace(",", ".") : "0";
      
      formData.append("preco_venda", pVenda);
      formData.append("preco_compra", pCompra);

      // Anexa os arquivos sob o nome 'imagens'
      lote.arquivos.forEach((file) => {
        formData.append("imagens", file);
      });

      const res = await api.post("/produtos/lote", formData);

      setMensagem(res.data.mensagem || `${lote.arquivos.length} produtos cadastrados com sucesso!`);
      setModalEmMassaAberto(false);
      await buscarProdutos();
    } catch (err: any) {
      console.error("Erro no cadastro em lote:", err);
      // Exibe a mensagem de erro vinda diretamente do PostgreSQL/Backend
      const msgErro = 
        err.response?.data?.detalhes || 
        err.response?.data?.erro || 
        "Erro ao cadastrar lote de produtos.";
      setMensagem(`Erro 500: ${msgErro}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 5000);
    }
  }

  function fecharModalProduto() {
    if (imagemPreview && imagemPreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagemPreview);
    }

    variantes.forEach((v) => {
      if (v.imagem_url?.startsWith("blob:")) {
        URL.revokeObjectURL(v.imagem_url);
      }
    });

    setModalProduto(null);
    setImagemFile(null);
    setImagemPreview(null);
    setTentouSalvar(false);
    setVariantes([]);
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
    <main className="min-h-screen p-4 sm:p-6 bg-[#1a0a1d] text-white transition-colors duration-300">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#E8B7D4]">Produtos</h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie produtos por foto e lote rápido</p>
      </header>

      {mensagem && (
        <div className="fixed top-4 right-4 z-[60] p-4 bg-[#812C65] text-white rounded-2xl shadow-xl border border-white/20 animate-bounce text-sm">
          {mensagem}
        </div>
      )}

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => {
            setModalProduto({
              nome: "",
              imagem_url: "",
              preco_venda: "",
              preco_compra: "",
              categoria_id: "",
              subcategoria_id: "",
            });
            setVariantes([]);
            setImagemFile(null);
            setImagemPreview(null);
            setTentouSalvar(false);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm"
        >
          <FiPlus size={18} /> Novo Individual
        </button>

        <button
          onClick={() => setModalEmMassaAberto(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#812C65] hover:bg-[#954A79] text-white font-bold rounded-2xl shadow-lg shadow-pink-900/30 transition-all active:scale-95 text-sm"
        >
          <FiUploadCloud size={20} /> Upload em Massa (Lote)
        </button>
      </div>

      {/* GRID PRODUTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProdutos
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-[#150a17] p-5 rounded-3xl border border-white/5">
                <div className="h-64 bg-white/5 rounded-2xl mb-4" />
                <div className="h-4 bg-white/5 mb-2 rounded w-3/4" />
                <div className="h-4 bg-white/5 w-1/2 rounded" />
              </div>
            ))
          : produtos.map((prod) => (
              <ProdutoCard
                key={prod.id}
                produto={prod}
                onEdit={(p) => {
                  setModalProduto(p);
                  setImagemPreview(p.imagem_url || null);
                  if (p.categoria_id) buscarSubcategorias(p.categoria_id);
                  setVariantes(
                    p.variantes?.map((v: any) => ({
                      id: v.id,
                      variacao: v.variacao,
                      tamanho: v.tamanho,
                      quantidade_arara: Number(v.quantidade_arara),
                      quantidade_deposito: Number(v.quantidade_deposito),
                      imagem_url: v.imagem_url || "",
                      imagemFile: null,
                    })) || []
                  );
                  setTentouSalvar(false);
                }}
                onRemove={abrirConfirmacaoRemover}
              />
            ))}
      </div>

      {/* MODAL PRODUTO INDIVIDUAL */}
      {modalProduto && (
        <ModalProduto
          modalProduto={modalProduto}
          setModalProduto={setModalProduto}
          variantes={variantes}
          setVariantes={setVariantes}
          categorias={categorias}
          subcategorias={subcategorias}
          imagemPreview={imagemPreview}
          loading={loading}
          tentouSalvar={tentouSalvar}
          onClose={fecharModalProduto}
          onSave={salvarProduto}
          onFileChange={handleFileChange}
          onVarianteImageChange={handleVarianteImageChange}
          onVarianteImageRemove={removerImagemVariante}
          onCategoriaChange={buscarSubcategorias}
        />
      )}

      {/* MODAL UPLOAD EM MASSA */}
      {modalEmMassaAberto && (
        <ModalUploadEmMassa
          categorias={categorias}
          subcategorias={subcategorias}
          loading={loading}
          onClose={() => setModalEmMassaAberto(false)}
          onCategoriaChange={buscarSubcategorias}
          onSalvarLote={salvarLoteEmMassa}
        />
      )}

      {/* MODAIS DE REMOÇÃO / FEEDBACK */}
      <ModaisFeedback
        modalConfirmarRemocao={modalConfirmarRemocao}
        produtoParaRemover={produtoParaRemover}
        removendo={removendo}
        onConfirmarRemocao={confirmarRemocao}
        onCancelarRemocao={() => setModalConfirmarRemocao(false)}
        modalSucesso={modalSucesso}
        modalErro={modalErro}
        onFecharFeedback={() => {
          setModalSucesso(false);
          setModalErro(false);
        }}
      />
    </main>
  );
}