import { useEffect, useState } from "react";
import api from "../api/api";

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

  const handleFileChange = (file: File) => {
    setImagemFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (modalProduto) {
        setModalProduto({
          ...modalProduto,
          imagem_url: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  async function salvarProduto(p: Produto) {
    if (!p.nome || !p.preco_venda || !p.subcategoria_id) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nome", p.nome);
      formData.append("variacao", p.variacao || "");
      formData.append("preco_venda", p.preco_venda);
      formData.append("preco_compra", p.preco_compra || "");
      formData.append("subcategoria_id", p.subcategoria_id);
      if (imagemFile) formData.append("imagem", imagemFile);

      if (p.id) {
        const res = await api.put(`/produtos/${p.id}`, formData);
        setProdutos((old) =>
          old.map((prod) => (prod.id === p.id ? res.data : prod))
        );
        setMensagem("Produto atualizado!");
      } else {
        await api.post("/produtos", formData);
        await buscarProdutos();
        setMensagem("Produto criado!");
      }

      setModalProduto(null);
      setImagemFile(null);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar produto.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerProduto(id: string) {
    if (!window.confirm("Tem certeza que deseja remover?")) return;
    await api.delete(`/produtos/${id}`);
    setProdutos((old) => old.filter((p) => p.id !== id));
    setMensagem("Produto removido!");
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
        onClick={() =>
          setModalProduto({
            nome: "",
            variacao: "",
            imagem_url: "",
            preco_venda: "",
            preco_compra: "",
            categoria_id: "",
            subcategoria_id: "",
          })
        }
        className="mb-6 px-6 py-3 bg-[#812C65] hover:bg-[#954A79] text-white font-bold rounded-xl transition-colors duration-300"
      >
        + Criar Produto
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loadingProdutos
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
                <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 mb-2 rounded" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-2/3 rounded" />
              </div>
            ))
          : produtos.map((prod) => (
              <div key={prod.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex flex-col">
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 p-3">
                  <img
                    src={
                      prod.imagem_url ||
                      "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                    }
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{prod.nome}</h3>
                <p className="text-gray-600 dark:text-gray-300">{prod.variacao}</p>
                <p className="text-gray-700 dark:text-gray-200">Venda: R$ {prod.preco_venda}</p>
                <p className="text-gray-700 dark:text-gray-200">Compra: R$ {prod.preco_compra}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setModalProduto(prod);
                      if (prod.categoria_id) buscarSubcategorias(prod.categoria_id);
                    }}
                    className="flex-1 bg-[#812C65] hover:bg-[#954A79] text-white py-2 rounded-xl font-bold transition-colors duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => prod.id && removerProduto(prod.id)}
                    className="flex-1 bg-pink-300 hover:bg-pink-400 text-white py-2 rounded-xl font-bold transition-colors duration-300"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
      </div>

      {modalProduto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">

            {loading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl z-10">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {modalProduto.id ? "Editar Produto" : "Criar Produto"}
            </h2>

            {/* IMAGEM */}
            <div
              className="h-64 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 p-3 cursor-pointer"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <img
                src={
                  modalProduto.imagem_url ||
                  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                }
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />

            {/* INPUTS */}
            {[
              { placeholder: "Nome", key: "nome", value: modalProduto.nome },
              { placeholder: "Variação", key: "variacao", value: modalProduto.variacao },
              { placeholder: "Preço Venda", key: "preco_venda", value: modalProduto.preco_venda },
              { placeholder: "Preço Compra", key: "preco_compra", value: modalProduto.preco_compra },
            ].map((input) => (
              <input
                key={input.key}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(e) =>
                  setModalProduto({ ...modalProduto, [input.key]: e.target.value })
                }
                className="w-full mb-3 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
            ))}

            {/* SELECTS */}
            <select
              value={modalProduto.categoria_id}
              onChange={(e) => {
                setModalProduto({
                  ...modalProduto,
                  categoria_id: e.target.value,
                  subcategoria_id: "",
                });
                buscarSubcategorias(e.target.value);
              }}
              className="w-full mb-3 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Selecione Categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>

            <select
              value={modalProduto.subcategoria_id}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, subcategoria_id: e.target.value })
              }
              className="w-full mb-3 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Selecione Subcategoria</option>
              {subcategorias.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))}
            </select>

            {/* BOTÕES */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalProduto(null)}
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-xl font-bold transition-colors duration-300"
              >
                Cancelar
              </button>

              <button
                onClick={() => salvarProduto(modalProduto)}
                disabled={loading}
                className="px-4 py-2 bg-[#812C65] hover:bg-[#954A79] text-white rounded-xl font-bold flex items-center gap-2 transition-colors duration-300"
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
    </main>
  );
}