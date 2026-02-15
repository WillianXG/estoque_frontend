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
  const [mensagem, setMensagem] = useState("");

  async function buscarProdutos() {
    const res = await api.get("/produtos");
    setProdutos(res.data);
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

  async function salvarProduto(p: Produto) {
    try {
      if (!p.nome || !p.preco_venda || !p.subcategoria_id) {
        setMensagem("Preencha todos os campos obrigatórios.");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("nome", p.nome);
      formData.append("variacao", p.variacao || "");
      formData.append("preco_venda", p.preco_venda);
      formData.append("preco_compra", p.preco_compra || "");
      formData.append("subcategoria_id", p.subcategoria_id);

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
    setMensagem("Produto removido!");
    buscarProdutos();
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

  useEffect(() => {
    buscarProdutos();
    buscarCategorias();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-[#2A102D] text-[#2A102D] dark:text-white transition-colors duration-300">
      
      <h1 className="text-3xl font-bold mb-6 text-[#590C42] dark:text-[#E8B7D4]">
        Produtos
      </h1>

      {mensagem && (
        <div className="mb-6 p-3 bg-[#E8B7D4]/20 border border-[#812C65] text-[#590C42] dark:text-[#E8B7D4] rounded-lg">
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
        className="mb-8 px-6 py-2 bg-[#812C65] hover:bg-[#954A79] active:scale-95 transition-all rounded-lg font-semibold text-white shadow-md"
      >
        + Criar Produto
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {produtos.map((prod) => (
          <div
            key={prod.id}
            className="bg-white dark:bg-[#2a1430] p-5 rounded-xl shadow-md hover:shadow-[#812C65]/40 hover:scale-[1.03] transition-all"
          >
            <div className="h-64 flex items-center justify-center bg-[#f3e3ef] dark:bg-[#1f0f25] rounded-lg mb-4 p-3">
              <img
                src={prod.imagem_url || "https://via.placeholder.com/300"}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <h3 className="font-bold text-lg text-[#590C42] dark:text-[#E8B7D4]">
              {prod.nome}
            </h3>

            <p className="text-sm text-[#812C65] dark:text-[#D39AC1]">
              {prod.variacao}
            </p>

            <p className="font-semibold mt-2 text-[#2A102D] dark:text-[#E8B7D4]">
              Venda: R$ {prod.preco_venda}
            </p>

            <p className="text-sm text-[#812C65] dark:text-[#D39AC1]">
              Compra: R$ {prod.preco_compra}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setModalProduto(prod);
                  if (prod.categoria_id) {
                    buscarSubcategorias(prod.categoria_id);
                  }
                }}
                className="flex-1 bg-[#812C65] hover:bg-[#954A79] text-white py-1.5 rounded-lg transition-all"
              >
                Editar
              </button>

              <button
                onClick={() => prod.id && removerProduto(prod.id)}
                className="flex-1 bg-[#E8B7D4] hover:bg-[#D39AC1] text-[#2A102D] font-semibold py-1.5 rounded-lg transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalProduto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-[#2a1430] p-6 rounded-xl w-full max-w-md shadow-2xl border border-[#812C65]/30 transition-colors">

            <h2 className="text-xl font-bold mb-4 text-[#590C42] dark:text-[#E8B7D4]">
              {modalProduto.id ? "Editar Produto" : "Criar Produto"}
            </h2>

            <input
              placeholder="Nome"
              value={modalProduto.nome}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, nome: e.target.value })
              }
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
            />

            <input
              placeholder="Variação"
              value={modalProduto.variacao}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, variacao: e.target.value })
              }
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
            />

            <input
              placeholder="Preço Venda"
              value={modalProduto.preco_venda}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, preco_venda: e.target.value })
              }
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
            />

            <input
              placeholder="Preço Compra"
              value={modalProduto.preco_compra}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, preco_compra: e.target.value })
              }
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
            />

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
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
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
                setModalProduto({
                  ...modalProduto,
                  subcategoria_id: e.target.value,
                })
              }
              className="w-full mb-3 bg-[#f3e3ef] dark:bg-[#1f0f25] border border-[#812C65]/40 p-2 rounded text-[#2A102D] dark:text-white"
            >
              <option value="">Selecione Subcategoria</option>
              {subcategorias.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) =>
                e.target.files && handleFileChange(e.target.files[0])
              }
              className="w-full mb-3 text-sm"
            />

            {modalProduto.imagem_url && (
              <div className="h-40 flex items-center justify-center bg-[#f3e3ef] dark:bg-[#1f0f25] rounded-lg p-3 mb-3">
                <img
                  src={modalProduto.imagem_url}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalProduto(null)}
                className="px-4 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={() => salvarProduto(modalProduto)}
                className="px-4 py-1 bg-[#812C65] hover:bg-[#954A79] text-white rounded-lg"
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}