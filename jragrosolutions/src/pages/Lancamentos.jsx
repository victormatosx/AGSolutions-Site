"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/firebase"
import { Settings, Fuel, ArrowLeft, CheckCircle, AlertCircle, FileText, Truck, X } from "lucide-react"
import ProtectedRoute from "../components/ProtectedRoute"
import HeaderLancamento from "../components/HeaderLancamento"
import FormAbastecimentoMaquina from "../components/FormAbastecimentoMaquina"
import FormApontamentoMaquina from "../components/FormApontamentoMaquina"
import FormAbastecimentoVeiculo from "../components/FormAbastecimentoVeiculo"

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
    // The actual saving is done in FormApontamentoMaquina.jsx
    setMessage({
      type: "success",
      text: "Apontamento enviado com sucesso!",
    })

    setTimeout(() => {
      setCurrentView("categories")
      setSelectedCategory(null)
      setSelectedType(null)
      setMessage({ type: "", text: "" })
    }, 3000) // Aumentado tempo para 3 segundos
  }

  const handleFormCancel = () => {
    setCurrentView("types")
    setSelectedType(null)
  }

  const renderCategories = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div
          className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 hover:border-green-200"
          onClick={() => handleCategorySelect("maquinas")}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
            Máquinas
          </h2>
          <p className="text-slate-600 leading-relaxed">Registre apontamentos e abastecimentos de máquinas agrícolas</p>
          <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>

        <div
          className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 hover:border-green-200"
          onClick={() => handleCategorySelect("veiculos")}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
            Veículos
          </h2>
          <p className="text-slate-600 leading-relaxed">Registre abastecimentos de veículos da propriedade</p>
          <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>
      </div>
    </div>
  )

  const renderTypes = () => (
    <div className="max-w-4xl mx-auto">
      <button
        className="flex items-center gap-3 mb-8 px-4 py-2 text-slate-600 hover:text-green-600 transition-colors duration-300 group"
        onClick={handleBack}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Voltar para categorias</span>
      </button>

      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {selectedCategory === "maquinas" ? (
            <>
              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  selectedType === "apontamento"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => handleTypeSelect("apontamento")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Apontamento
                </h3>
                <p className="text-slate-600 mt-2">Registrar horas trabalhadas</p>
              </div>

              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  selectedType === "abastecimento"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => handleTypeSelect("abastecimento")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Fuel className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Abastecimento
                </h3>
                <p className="text-slate-600 mt-2">Registrar abastecimento de máquina</p>
              </div>
            </>
          ) : (
            <div className="col-span-full flex justify-center">
              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 max-w-md ${
                  selectedType === "abastecimento"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => handleTypeSelect("abastecimento")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Fuel className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Abastecimento
                </h3>
                <p className="text-slate-600 mt-2">Registrar abastecimento de veículo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

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
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
        <HeaderLancamento onNavigate={handleNavigation} currentPage="apontamentos" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message.text && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
              <div
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border max-w-md ${
                  message.type === "success"
                    ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                    : "bg-red-50/95 border-red-200 text-red-800"
                }`}
              >
                {message.type === "success" ? (
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-relaxed">{message.text}</p>
                  {message.type === "success" && (
                    <p className="text-xs text-emerald-600 mt-1">Redirecionando automaticamente...</p>
                  )}
                </div>
                <button
                  onClick={() => setMessage({ type: "", text: "" })}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentView === "categories" && renderCategories()}
          {currentView === "types" && renderTypes()}
          {currentView === "form" && (
            <div className="max-w-4xl mx-auto">
              <button
                className="flex items-center gap-3 mb-8 px-4 py-2 text-slate-600 hover:text-green-600 transition-colors duration-300 group"
                onClick={handleBack}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Voltar</span>
              </button>
              {renderForm()}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Lancamento
