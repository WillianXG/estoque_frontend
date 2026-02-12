import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        ERP Duda
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className="block p-2 rounded hover:bg-gray-700">
          Dashboard
        </Link>

        <Link to="/categorias" className="block p-2 rounded hover:bg-gray-700">
          Categorias
        </Link>

        <Link to="/produtos" className="block p-2 rounded hover:bg-gray-700">
          Produtos
        </Link>

        <Link to="/vendas" className="block p-2 rounded hover:bg-gray-700">
          Vendas
        </Link>

        <Link to="/vendedoras" className="block p-2 rounded hover:bg-gray-700">
          Vendedoras
        </Link>
      </nav>
    </div>
  );
}