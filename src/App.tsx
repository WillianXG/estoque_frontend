import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import DashboardLayout from "./layout/DashboardLayout";
import Categorias from "./pages/Categorias";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Vendedoras from "./pages/Vendedoras";
import Dashboard from "./pages/Dashboard"; // sua página real de dashboard
import PDV from "./pages/PDV";
import Carrinho from "./pages/Carrinho";
import Estoque from "./pages/Estoque";
import MovimentacaoPage from "./pages/MovimentacaoEstoque";

function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />
          {/* Rotas privadas */}
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/vendedoras" element={<Vendedoras />} />
            <Route path="/pdv" element={<PDV />} /> 
            <Route path="/pdv/carrinho" element={<Carrinho />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/MovimentacaoEstoque" element={<MovimentacaoPage />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default App;
