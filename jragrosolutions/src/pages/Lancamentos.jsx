"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { ref, get, push } from "firebase/database"
import { auth, database } from "../firebase/firebase"
import { Settings, Car, Fuel, ArrowLeft, CheckCircle, AlertCircle, FileText } from "lucide-react"
import ProtectedRoute from "../components/ProtectedRoute"
import HeaderLancamento from "../components/HeaderLancamento"
import FormAbastecimentoMaquina from "../components/FormAbastecimentoMaquina"
import FormApontamentoMaquina from "../components/FormApontamentoMaquina"
import FormAbastecimentoVeiculo from "../components/FormAbastecimentoVeiculo"
import "../../styles/lancamento.css"

const Lancamento = () => {
  const [user] = useAuthState(auth)
  const [currentView, setCurrentView] = useState("categories") // categories, types, form
  const [selectedCategory, setSelectedCategory] = useState(null) // maquinas, veiculos
  const [selectedType, setSelectedType] = useState(null) // abastecimento, apontamento
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const navigate = useNavigate()

  const handleNavigation = (page) => {
    if (page === "home") {
      navigate("/")
    } else if (page === "dashboard") {
      navigate("/dashboard")
    } else if (page === "apontamentos") {
      navigate("/apontamentos")
    } else if (page === "cadastros") {
      navigate("/cadastros")
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCurrentView("types")
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setCurrentView("form")
  }

  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("types")
      setSelectedType(null)
    } else if (currentView === "types") {
      setCurrentView("categories")
      setSelectedCategory(null)
    }
  }

  const handleFormSubmit = async (formData) => {
    if (!user) return

    setIsLoading(true)
    try {
      const propriedadesRef = ref(database, "propriedades")
      const propriedadesSnapshot = await get(propriedadesRef)

      if (propriedadesSnapshot.exists()) {
        const propriedades = propriedadesSnapshot.val()
        let userProperty = null

        for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
          if (propriedadeData.users && propriedadeData.users[user.uid]) {
            userProperty = propriedadeName
            break
          }
        }

        if (userProperty) {
          const apontamentosRef = ref(database, `propriedades/${userProperty}/apontamentos/${user.uid}`)
          await push(apontamentosRef, {
            ...formData,
            createdAt: new Date().toISOString(),
            userId: user.uid,
          })

          setMessage({
            type: "success",
            text: "Apontamento salvo com sucesso!",
          })

          // Reset form after 2 seconds
          setTimeout(() => {
            setCurrentView("categories")
            setSelectedCategory(null)
            setSelectedType(null)
            setMessage({ type: "", text: "" })
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Erro ao salvar apontamento:", error)
      setMessage({
        type: "error",
        text: "Erro ao salvar apontamento. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormCancel = () => {
    setCurrentView("types")
    setSelectedType(null)
  }

  const getBreadcrumb = () => {
    const items = ["Apontamentos"]

    if (selectedCategory) {
      items.push(selectedCategory === "maquinas" ? "Máquinas" : "Veículos")
    }

    if (selectedType) {
      if (selectedType === "abastecimento") {
        items.push("Abastecimento")
      } else if (selectedType === "apontamento") {
        items.push("Apontamento")
      }
    }

    return items
  }

  const renderCategories = () => (
    <div className="categories-container">
      <div className="category-card" onClick={() => handleCategorySelect("maquinas")}>
        <div className="category-icon">
          <Settings className="w-10 h-10" />
        </div>
        <h2>Máquinas</h2>
        <p>Registre apontamentos e abastecimentos de máquinas agrícolas</p>
      </div>

      <div className="category-card" onClick={() => handleCategorySelect("veiculos")}>
        <div className="category-icon">
          <Car className="w-10 h-10" />
        </div>
        <h2>Veículos</h2>
        <p>Registre abastecimentos de veículos da propriedade</p>
      </div>
    </div>
  )

  const renderTypes = () => {
    if (selectedCategory === "maquinas") {
      return (
        <div className="types-grid">
          <div className="type-card" onClick={() => handleTypeSelect("abastecimento")}>
            <div className="type-icon">
              <Fuel className="w-8 h-8" />
            </div>
            <h3>Abastecimento</h3>
            <p>Registrar abastecimento de máquina</p>
          </div>

          <div className="type-card" onClick={() => handleTypeSelect("apontamento")}>
            <div className="type-icon">
              <FileText className="w-8 h-8" />
            </div>
            <h3>Apontamento</h3>
            <p>Registrar horas trabalhadas</p>
          </div>
        </div>
      )
    } else if (selectedCategory === "veiculos") {
      return (
        <div className="types-grid">
          <div className="type-card" onClick={() => handleTypeSelect("abastecimento")}>
            <div className="type-icon">
              <Fuel className="w-8 h-8" />
            </div>
            <h3>Abastecimento</h3>
            <p>Registrar abastecimento de veículo</p>
          </div>
        </div>
      )
    }
  }

  const renderForm = () => {
    if (selectedCategory === "maquinas" && selectedType === "abastecimento") {
      return <FormAbastecimentoMaquina onSubmit={handleFormSubmit} onCancel={handleFormCancel} isLoading={isLoading} />
    } else if (selectedCategory === "maquinas" && selectedType === "apontamento") {
      return <FormApontamentoMaquina onSubmit={handleFormSubmit} onCancel={handleFormCancel} isLoading={isLoading} />
    } else if (selectedCategory === "veiculos" && selectedType === "abastecimento") {
      return <FormAbastecimentoVeiculo onSubmit={handleFormSubmit} onCancel={handleFormCancel} isLoading={isLoading} />
    }
  }

  return (
    <ProtectedRoute requiredRole="user">
      <div className="lancamento-container">
        <HeaderLancamento onNavigate={handleNavigation} currentPage="apontamentos" />

        <main className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            {getBreadcrumb().map((item, index) => (
              <div key={index} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Back Button */}
          {currentView !== "categories" && (
            <button onClick={handleBack} className="back-button">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}

          {/* Success/Error Messages */}
          {message.text && (
            <div className={`${message.type}-message`}>
              {message.type === "success" ? (
                <CheckCircle className={`${message.type}-icon w-5 h-5`} />
              ) : (
                <AlertCircle className={`${message.type}-icon w-5 h-5`} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Content */}
          {currentView === "categories" && renderCategories()}
          {currentView === "types" && <div className="types-container">{renderTypes()}</div>}
          {currentView === "form" && renderForm()}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Lancamento
