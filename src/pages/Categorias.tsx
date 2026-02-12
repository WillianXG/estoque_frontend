import { useState } from "react";

export default function Categorias() {
  const [categorias, setCategorias] = useState([
    { id: 1, nome: "Roupas" },
    { id: 2, nome: "Calçados" }
  ]);

  const [novaCategoria, setNovaCategoria] = useState("");

  function adicionarCategoria() {
    if (!novaCategoria) return;

    const nova = {
      id: Date.now(),
      nome: novaCategoria
    };

    setCategorias([...categorias, nova]);
    setNovaCategoria("");
  }

  function removerCategoria(id: number) {
    setCategorias(categorias.filter(c => c.id !== id));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <button
          onClick={adicionarCategoria}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-right p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-3">{cat.nome}</td>
              <td className="p-3 text-right">
                <button
                  onClick={() => removerCategoria(cat.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}