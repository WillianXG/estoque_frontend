/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "../api/api";
import imageCompression from "browser-image-compression";

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
}

export default function Produtos() {
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
  const [modalErro, setModalErro] = useState(false);

  async function buscarProdutos() {
    setLoadingProdutos(true);
    const res = await api.get("/produtos");
    setProdutos(res.data);
    setLoadingProdutos(false);
  }

  async function buscarCategorias() {
    const res = await api.get("/categorias");
    setCategorias(res.data);
  }

  async function buscarSubcategorias(categoriaId: string) {
    if (!categoriaId) return;
    const res = await api.get(`/subcategorias?categoriaId=${categoriaId}`);
    setSubcategorias(res.data);
  }

  const handleFileChange = async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        setMensagem("Selecione apenas imagens.");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      setImagemFile(compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (modalProduto) {
          setModalProduto({
            ...modalProduto,
            imagem_url: reader.result as string,
          });
        }
      };

      reader.readAsDataURL(compressedFile);

    } catch (err) {
      console.error(err);
      setMensagem("Erro ao processar imagem.");
    }
  };

  async function salvarProduto(p: Produto) {
    setTentouSalvar(true);

    if (!p.nome || !p.preco_venda || !p.subcategoria_id || !p.categoria_id) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const precoVenda = p.preco_venda?.replace(",", ".");
      const precoCompra = p.preco_compra?.replace(",", ".");
      const formData = new FormData();
      formData.append("nome", p.nome);
      formData.append("variacao", p.variacao || "");
      formData.append("preco_venda", precoVenda || "");
      formData.append("preco_compra", precoCompra || "");
      formData.append("subcategoria_id", p.subcategoria_id);
      formData.append("categoria_id", p.categoria_id);

      if (imagemFile) {
        formData.append("imagem", imagemFile);
      }

      if (p.id) {
        await api.put(`/produtos/${p.id}`, formData);
        setMensagem("Produto atualizado!");
      } else {
        await api.post("/produtos", formData);
        setMensagem("Produto criado!");
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

      setProdutos((old) =>
        old.filter((p) => p.id !== produtoParaRemover.id)
      );

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
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-[#1a0a1d] transition-colors duration-300">

      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#590C42] dark:text-[#E8B7D4]">
          Produtos
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
          Gerencie produtos, categorias e subcategorias
        </p>
      </header>

      {mensagem && (
        <div className="mb-6 p-3 bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200 rounded-xl">
          {mensagem}
        </div>
      )}

      <button
        onClick={() => {
          setModalProduto({
            nome: "",
            variacao: "",
            imagem_url: "",
            preco_venda: "",
            preco_compra: "",
            categoria_id: "",
            subcategoria_id: "",
          });

          setImagemFile(null);
          setTentouSalvar(false);
        }}
        className="mb-6 px-6 py-3 bg-[#812C65] hover:bg-[#954A79] text-white font-bold rounded-xl transition-colors duration-300"
      >
        + Criar Produto
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {loadingProdutos
          ? Array.from({ length: 8 }).map((_, i) => (

            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md"
            >

              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />

              <div className="h-4 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />

              <div className="h-4 bg-gray-300 dark:bg-gray-700 w-2/3 rounded" />

            </div>

          ))
          : produtos.map((prod) => (

            <div
              key={prod.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex flex-col"
            >

              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 p-3">

                <img
                  src={
                    prod.imagem_url ||
                    "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                  }
                  className="max-h-full max-w-full object-contain"
                />

              </div>

              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                {prod.nome}
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                {prod.variacao}
              </p>

              <p className="text-gray-700 dark:text-gray-200">
                Venda: R$ {prod.preco_venda}
              </p>

              <p className="text-gray-700 dark:text-gray-200">
                Compra: R$ {prod.preco_compra}
              </p>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => {
                    setModalProduto(prod);

                    if (prod.categoria_id)
                      buscarSubcategorias(prod.categoria_id);

                    setTentouSalvar(false);
                  }}
                  className="flex-1 bg-[#812C65] hover:bg-[#954A79] text-white py-2 rounded-xl font-bold transition-colors duration-300"
                >
                  Editar
                </button>

                <button
                  onClick={() => abrirConfirmacaoRemover(prod)}
                  className="flex-1 bg-pink-300 hover:bg-pink-400 text-white py-2 rounded-xl font-bold transition-colors duration-300"
                >
                  Remover
                </button>

              </div>

            </div>

          ))}
      </div>

      {modalProduto && (

        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setModalConfirmarRemocao(false)}
        >

          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {loading && (

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl z-10">

                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

              </div>

            )}

            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              {modalProduto.id ? "Editar Produto" : "Criar Produto"}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
              Clique na imagem para adicionar uma foto do produto (opcional)
            </p>

            <label htmlFor="fileInput">
              <div className="h-64 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 p-3 cursor-pointer">

                <img
                  src={
                    modalProduto.imagem_url ||
                    "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                  }
                  className="max-h-full max-w-full object-contain"
                />

              </div>
            </label>

            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {/* INPUTS */}

            {[
              { placeholder: "Nome (Ex.: Camiseta P)", key: "nome", required: true },
              { placeholder: "Variação (Ex.: Vermelha, Azul)", key: "variacao", required: false },
              { placeholder: "Preço Venda (Ex.: 50,00)", key: "preco_venda", required: true },
              { placeholder: "Preço Compra (Ex.: 30,00)", key: "preco_compra", required: false },
            ].map((input) => (

              <div key={input.key} className="mb-3">

                <input
                  placeholder={input.placeholder}
                  value={(modalProduto as any)[input.key] || ""}
                  onChange={(e) =>
                    setModalProduto({
                      ...modalProduto,
                      [input.key]: e.target.value
                    })
                  }
                  className={`w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border ${input.required && tentouSalvar && !(modalProduto as any)[input.key]
                    ? "border-red-500"
                    : "border-transparent"
                    }`}
                />

                {input.required && tentouSalvar && !(modalProduto as any)[input.key] && (
                  <p className="text-red-500 text-sm mt-1">
                    Preencha este campo!
                  </p>
                )}

              </div>

            ))}

            {/* SELECTS */}

            <div className="mb-3">

              <select
                value={modalProduto.categoria_id || ""}
                onChange={(e) => {

                  setModalProduto({
                    ...modalProduto,
                    categoria_id: e.target.value,
                    subcategoria_id: "",
                  });

                  buscarSubcategorias(e.target.value);

                }}
                className={`w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border ${tentouSalvar && !modalProduto.categoria_id
                  ? "border-red-500"
                  : "border-transparent"
                  }`}
              >

                <option value="">
                  Selecione Categoria
                </option>

                {categorias.map((cat) => (

                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>

                ))}

              </select>

              {tentouSalvar && !modalProduto.categoria_id && (
                <p className="text-red-500 text-sm mt-1">
                  Escolha uma categoria!
                </p>
              )}

            </div>

            <div className="mb-3">

              <select
                value={modalProduto.subcategoria_id || ""}
                onChange={(e) =>
                  setModalProduto({
                    ...modalProduto,
                    subcategoria_id: e.target.value
                  })
                }
                className={`w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border ${tentouSalvar && !modalProduto.subcategoria_id
                  ? "border-red-500"
                  : "border-transparent"
                  }`}
              >

                <option value="">
                  Selecione Subcategoria
                </option>

                {subcategorias.map((sub) => (

                  <option key={sub.id} value={sub.id}>
                    {sub.nome}
                  </option>

                ))}

              </select>

              {tentouSalvar && !modalProduto.subcategoria_id && (
                <p className="text-red-500 text-sm mt-1">
                  Escolha uma subcategoria!
                </p>
              )}

            </div>

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setModalProduto(null)}
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-xl font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={() => salvarProduto(modalProduto)}
                disabled={loading}
                className={`px-4 py-2 bg-[#812C65] hover:bg-[#954A79] text-white rounded-xl font-bold flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >

                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}

                {loading ? "Salvando..." : "Salvar"}

              </button>

            </div>

          </div>

        </div>

      )}
      {modalConfirmarRemocao && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl">

            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
              Remover Produto
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja remover
              <span className="font-bold">
                {" "} {produtoParaRemover?.nome}
              </span> ?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setModalConfirmarRemocao(false)}
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-xl font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarRemocao}
                disabled={removendo}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2"
              >

                {removendo && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}

                {removendo ? "Removendo..." : "Remover"}

              </button>

            </div>

          </div>

        </div>

      )}

      {modalSucesso && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm text-center shadow-xl">

            <h2 className="text-xl font-bold text-green-600 mb-3">
              Sucesso
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Produto removido com sucesso!
            </p>

            <button
              onClick={() => setModalSucesso(false)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
            >
              OK
            </button>

          </div>

        </div>

      )}

      {modalErro && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm text-center shadow-xl">

            <h2 className="text-xl font-bold text-red-600 mb-3">
              Erro
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Não foi possível remover o produto.
            </p>

            <button
              onClick={() => setModalErro(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Fechar
            </button>

          </div>

        </div>

      )}
    </main>
  );
}