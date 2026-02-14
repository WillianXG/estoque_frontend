import { Link } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Overlay escuro no mobile quando aberto */}
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 h-full w-64 bg-gray-900 text-white
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Cabeçalho */}
        <div className="p-6 text-xl font-bold border-b border-gray-700 flex justify-between items-center">
          ERP Duda
          {/* Botão fechar só em mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2">
          {["/", "/categorias", "/produtos", "/vendas", "/vendedoras", "/pdv"].map((path, i) => {
            const names = ["Dashboard", "Categorias", "Produtos", "Vendas", "Vendedoras", "PDV"];
            return (
              <Link
                key={i}
                to={path}
                className="block p-2 rounded-lg hover:bg-gray-700 transition"
                onClick={onClose} // fecha sidebar ao clicar no link
              >
                {names[i]}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}