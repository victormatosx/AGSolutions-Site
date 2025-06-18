import { Routes, Route } from "react-router-dom"
import DashboardComponent from "../components/DashboardComponent"
import Cadastro from "../components/Cadastro"
import Header from "../components/HeaderDashboard"
import "../../styles/dashboard.css"

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Header />
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardComponent />} />
          <Route path="/cadastros" element={<Cadastro />} />
          {/* Adicione outras rotas aqui conforme necessário */}
          <Route path="/apontamentos" element={<div>Página de Apontamentos em desenvolvimento</div>} />
        </Routes>
      </main>
    </div>
  )
}
