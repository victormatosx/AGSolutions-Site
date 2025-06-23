"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import DashboardComponent from "../components/DashboardComponent"
import Cadastro from "../components/Cadastro"
import Header from "../components/HeaderDashboard"
import Apontamentos from "../components/Apontamentos"
import ProtectedRoute from "../components/ProtectedRoute"
import "../../styles/dashboard.css"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const navigate = useNavigate()

  const handleNavigation = (page) => {
    if (page === "home") {
      navigate("/") // redireciona para a home page ("/")
    } else {
      setCurrentPage(page)
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardComponent />
      case "cadastros":
        return <Cadastro />
      case "apontamentos":
        return <Apontamentos />
      default:
        return <DashboardComponent />
    }
  }

  return (
    <ProtectedRoute requiredRole="manager">
      <div className="dashboard-layout">
        <Header onNavigate={handleNavigation} currentPage={currentPage} />
        <main className="dashboard-main">{renderCurrentPage()}</main>
      </div>
    </ProtectedRoute>
  )
}
