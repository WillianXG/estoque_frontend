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
  const [, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // BUSCAR PRODUTOS
  async function buscarProdutos() {
    try {
      setLoading(true);
      const res = await api.get("/produtos");
      setProdutos(res.data);
    } catch {
      setMensagem("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  // BUSCAR CATEGORIAS
  async function buscarCategorias() {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch {
      setMensagem("Erro ao carregar categorias.");
    }
  }

  // BUSCAR SUBCATEGORIAS
  async function buscarSubcategorias(categoriaId: string) {
    try {
      const res = await api.get(`/subcategorias?categoriaId=${categoriaId}`);
      setSubcategorias(res.data);
    } catch {
      setMensagem("Erro ao carregar subcategorias.");
    }
  }

  // SALVAR PRODUTO (CRIAR OU EDITAR)
  async function salvarProduto(p: Produto) {
    try {
      setLoading(true);
      if (p.id) {
        const res = await api.put(`/produtos/${p.id}`, p);
        setProdutos((prev) => prev.map((x) => (x.id === p.id ? res.data : x)));
        setMensagem("Produto atualizado!");
      } else {
        const res = await api.post("/produtos", p);
        setProdutos((prev) => [...prev, res.data]);
        setMensagem("Produto criado!");
      }
      setModalProduto(null);
    } catch {
      setMensagem("Erro ao salvar produto.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  async function removerProduto(id: string) {
    if (!window.confirm("Tem certeza que deseja remover?")) return;
    try {
      setLoading(true);
      await api.delete(`/produtos/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setMensagem("Produto removido!");
    } catch {
      setMensagem("Erro ao remover produto.");
    } finally {
      setLoading(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  // CONVERTER IMAGEM PARA BASE64
  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (modalProduto) {
        setModalProduto({ ...modalProduto, imagem_url: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    buscarProdutos();
    buscarCategorias();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      {mensagem && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{mensagem}</div>
      )}

      <button
        onClick={() =>
          setModalProduto({
            nome: "",
            variacao: "",
            imagem_url: "",
            preco_venda: "",
            preco_compra: "",
          })
        }
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Criar Produto
      </button>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtos.map((prod) => (
          <div
            key={prod.id}
            className="border rounded-xl p-4 shadow flex flex-col items-center"
          >
            <img
              src={prod.imagem_url || "https://via.placeholder.com/150"}
              alt={prod.nome}
              className="h-32 w-32 object-cover rounded mb-2"
            />
            <p className="font-semibold text-gray-800 text-center">{prod.nome}</p>
            <p className="text-gray-500 text-sm">{prod.variacao}</p>
            <p className="text-gray-500 text-sm">
              Subcategoria: {prod.subcategoria_id || "-"}
            </p>
            <p className="text-green-600 font-bold mt-1">
              Venda: R$ {prod.preco_venda}
            </p>
            <p className="text-gray-500 text-sm">
              Compra: R$ {prod.preco_compra}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setModalProduto(prod)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => prod.id && removerProduto(prod.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative">
            <h2 className="text-xl font-bold mb-4">
              {modalProduto.id ? "Editar" : "Criar"} Produto
            </h2>

            <input
              type="text"
              placeholder="Nome"
              value={modalProduto.nome}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, nome: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

            <input
              type="text"
              placeholder="Variação"
              value={modalProduto.variacao}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, variacao: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

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
              className="border rounded px-3 py-2 w-full mb-2"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={modalProduto.subcategoria_id || ""}
              onChange={(e) =>
                setModalProduto({
                  ...modalProduto,
                  subcategoria_id: e.target.value,
                })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            >
              <option value="">Selecione a subcategoria</option>
              {subcategorias.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Preço de venda"
              value={modalProduto.preco_venda || ""}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, preco_venda: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

            <input
              type="text"
              placeholder="Preço de compra"
              value={modalProduto.preco_compra || ""}
              onChange={(e) =>
                setModalProduto({ ...modalProduto, preco_compra: e.target.value })
              }
              className="border rounded px-3 py-2 w-full mb-2"
            />

            {/* Upload / Foto */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="border rounded px-3 py-2 w-full mb-2"
            />

            {modalProduto.imagem_url && (
              <img
                src={modalProduto.imagem_url}
                alt="Preview"
                className="h-32 w-32 object-cover rounded mb-2 mx-auto"
              />
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalProduto(null)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => modalProduto && salvarProduto(modalProduto)}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 