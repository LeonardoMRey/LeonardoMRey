import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/Layout";
import NotFound from "./pages/NotFound";
import DesempenhoOperacional from "./pages/DesempenhoOperacional";
import EficienciaCompras from "./pages/EficienciaCompras";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import GestaoFornecedores from "./pages/GestaoFornecedores";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Navigate to="/desempenho-operacional" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="desempenho-operacional" element={<DesempenhoOperacional />} />
            <Route path="eficiencia-compras" element={<EficienciaCompras />} />
            <Route path="gestao-financeira" element={<GestaoFinanceira />} />
            <Route path="gestao-fornecedores" element={<GestaoFornecedores />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;