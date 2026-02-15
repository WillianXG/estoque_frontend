import { Link, useLocation } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const location = useLocation();

  const routes = [
    { path: "/", name: "Dashboard" },
    { path: "/categorias", name: "Categorias" },
    { path: "/produtos", name: "Produtos" },
    { path: "/vendas", name: "Vendas" },
    { path: "/vendedoras", name: "Vendedoras" },
    { path: "/pdv", name: "PDV" },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-30 md:hidden
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        aria-label="Menu lateral"
        className={`
          fixed z-40 h-full w-64
          bg-[#590C42] dark:bg-[#4B1F59]
          text-white
          border-r border-[#812C65]/40
          shadow-xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Cabeçalho */}
        <header className="p-6 border-b border-[#812C65]/40 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-wide text-[#E8B7D4]">
            ERP Duda
          </h2>

          <button
            onClick={onClose}
            className="md:hidden text-[#E8B7D4] hover:text-white text-2xl transition-colors"
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </header>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2" aria-label="Links principais">
          {routes.map((route) => {
            const isActive = location.pathname === route.path;

            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={onClose}
                className={`
                  block px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#812C65] text-white shadow-md"
                      : "hover:bg-[#812C65]/70 hover:text-white"
                  }
                `}
              >
                {route.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
