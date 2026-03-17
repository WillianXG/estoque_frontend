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
import Dashboard from "./pages/Dashboard";
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

            {/* Layout protegido (precisa estar logado) */}
            <Route
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >

              {/* ADMIN */}
              <Route
                path="/"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/categorias"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Categorias />
                  </PrivateRoute>
                }
              />

              <Route
                path="/produtos"
                element={
                  <PrivateRoute roles={["admin", "vendedora"]}>
                    <Produtos />
                  </PrivateRoute>
                }
              />

              <Route
                path="/vendas"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Vendas />
                  </PrivateRoute>
                }
              />

              <Route
                path="/vendedoras"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Vendedoras />
                  </PrivateRoute>
                }
              />

              <Route
                path="/MovimentacaoEstoque"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <MovimentacaoPage />
                  </PrivateRoute>
                }
              />

              {/* ADMIN e VENDEDORA */}

              <Route
                path="/pdv"
                element={
                  <PrivateRoute roles={["admin", "vendedora"]}>
                    <PDV />
                  </PrivateRoute>
                }
              />

              <Route
                path="/pdv/carrinho"
                element={
                  <PrivateRoute roles={["admin", "vendedora"]}>
                    <Carrinho />
                  </PrivateRoute>
                }
              />

              <Route
                path="/estoque"
                element={
                  <PrivateRoute roles={["admin", "vendedora"]}>
                    <Estoque />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Dashboard />} />

            </Route>

          </Routes>
        </BrowserRouter>
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default App;