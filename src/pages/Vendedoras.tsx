import { useState } from "react";

export default function Vendedoras() {
  const [vendedoras, setVendedoras] = useState([
    { id: 1, nome: "Ana" },
    { id: 2, nome: "Maria" }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendedoras</h1>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Nome</th>
          </tr>
        </thead>
        <tbody>
          {vendedoras.map((v) => (
            <tr key={v.id} className="border-t">
              <td className="p-3">{v.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}