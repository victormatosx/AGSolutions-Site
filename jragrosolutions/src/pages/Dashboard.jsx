import { useState } from "react"
import DashboardComponent from "../components/DashboardComponent"
import Cadastro from "../components/Cadastro"
import Header from "../components/HeaderDashboard"
import "../../styles/dashboard.css"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardComponent />
      case 'cadastros':
        return <Cadastro />
      case 'apontamentos':
        return <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Apontamentos</h2>
          <p className="text-gray-600">Página de Apontamentos em desenvolvimento</p>
        </div>
      case 'home':
        // Redirecionar para a página inicial ou mostrar uma mensagem
        return <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Redirecionando...</h2>
          <p className="text-gray-600">Redirecionando para a página inicial</p>
        </div>
      default:
        return <DashboardComponent />
    }
  }

  return (
    <div className="dashboard-layout">
      <Header onNavigate={handleNavigation} currentPage={currentPage} />
      <main className="dashboard-main">
        {renderCurrentPage()}
      </main>
    </div>
  )
}