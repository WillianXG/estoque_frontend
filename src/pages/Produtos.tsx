import { useState } from "react";

export default function Produtos() {
  const [produtos, setProdutos] = useState([
    { id: 1, nome: "Camiseta", preco: 59.9 },
    { id: 2, nome: "Tênis", preco: 199.9 }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Nome</th>
            <th className="text-left p-3">Preço</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((prod) => (
            <tr key={prod.id} className="border-t">
              <td className="p-3">{prod.nome}</td>
              <td className="p-3">R$ {prod.preco}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}