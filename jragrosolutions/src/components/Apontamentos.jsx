"use client"

import { useState, useEffect } from "react"
import { database } from "../firebase/firebase"
import { ref, onValue, update } from "firebase/database"
import {
  Settings,
  Truck,
  FileText,
  Fuel,
  Route,
  CheckCircle,
  ArrowLeft,
  ChevronDown,
  MapPin,
  Calendar,
  Eye,
  Hourglass,
} from "lucide-react"
import "../../styles/apontamentos.css"

const Apontamentos = () => {
  const [currentStep, setCurrentStep] = useState("categories") // categories, types, items
  const [selectedCategory, setSelectedCategory] = useState(null) // maquinas, veiculos
  const [selectedType, setSelectedType] = useState(null) // apontamentos, abastecimentos, percursos, abastecimentoVeiculos
  const [selectedStatus, setSelectedStatus] = useState("pending") // pending, validated
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Estados para os dados
  const [data, setData] = useState({
    apontamentos: [],
    abastecimentos: [],
    percursos: [],
    abastecimentoVeiculos: [],
  })
  const [loading, setLoading] = useState(true)

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        // Carregar apontamentos
        const apontamentosRef = ref(database, "propriedades/Matrice/apontamentos")
        onValue(apontamentosRef, (snapshot) => {
          const apontamentosData = snapshot.val()
          const apontamentosList = apontamentosData
            ? Object.keys(apontamentosData).map((key) => ({
                id: key,
                ...apontamentosData[key],
              }))
            : []
          setData((prev) => ({ ...prev, apontamentos: apontamentosList }))
        })

        // Carregar abastecimentos
        const abastecimentosRef = ref(database, "propriedades/Matrice/abastecimentos")
        onValue(abastecimentosRef, (snapshot) => {
          const abastecimentosData = snapshot.val()
          const abastecimentosList = abastecimentosData
            ? Object.keys(abastecimentosData).map((key) => ({
                id: key,
                ...abastecimentosData[key],
              }))
            : []
          setData((prev) => ({ ...prev, abastecimentos: abastecimentosList }))
        })

        // Carregar percursos
        const percursosRef = ref(database, "propriedades/Matrice/percursos")
        onValue(percursosRef, (snapshot) => {
          const percursosData = snapshot.val()
          const percursosList = percursosData
            ? Object.keys(percursosData).map((key) => ({
                id: key,
                ...percursosData[key],
              }))
            : []
          setData((prev) => ({ ...prev, percursos: percursosList }))
        })

        // Carregar abastecimento de veículos
        const abastecimentoVeiculosRef = ref(database, "propriedades/Matrice/abastecimentoVeiculos")
        onValue(abastecimentoVeiculosRef, (snapshot) => {
          const abastecimentoVeiculosData = snapshot.val()
          const abastecimentoVeiculosList = abastecimentoVeiculosData
            ? Object.keys(abastecimentoVeiculosData).map((key) => ({
                id: key,
                ...abastecimentoVeiculosData[key],
              }))
            : []
          setData((prev) => ({ ...prev, abastecimentoVeiculos: abastecimentoVeiculosList }))
          setLoading(false)
        })
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Função para validar item
  const validarItem = async (tipo, itemId) => {
    try {
      let path = ""
      switch (tipo) {
        case "apontamentos":
          path = `propriedades/Matrice/apontamentos/${itemId}`
          break
        case "abastecimentos":
          path = `propriedades/Matrice/abastecimentos/${itemId}`
          break
        case "percursos":
          path = `propriedades/Matrice/percursos/${itemId}`
          break
        case "abastecimentoVeiculos":
          path = `propriedades/Matrice/abastecimentoVeiculos/${itemId}`
          break
        default:
          throw new Error("Tipo inválido")
      }

      const itemRef = ref(database, path)
      await update(itemRef, { status: "validated" })
    } catch (error) {
      console.error("Erro ao validar item:", error)
      alert("Erro ao validar item. Tente novamente.")
    }
  }

  // Selecionar categoria
  const selectCategory = (category) => {
    setSelectedCategory(category)
    setCurrentStep("types")
  }

  // Selecionar tipo
  const selectType = (type) => {
    setSelectedType(type)
    setCurrentStep("items")
    setSelectedStatus("pending")
  }

  // Voltar para categorias
  const backToCategories = () => {
    setCurrentStep("categories")
    setSelectedCategory(null)
    setSelectedType(null)
  }

  // Obter dados filtrados
  const getFilteredData = () => {
    if (!selectedType) return []

    const currentData = data[selectedType] || []
    return currentData.filter((item) => item.status === selectedStatus)
  }

  // Contar itens por status
  const getStatusCounts = () => {
    if (!selectedType) return { pending: 0, validated: 0 }

    const currentData = data[selectedType] || []
    const pending = currentData.filter((item) => item.status === "pending").length
    const validated = currentData.filter((item) => item.status === "validated").length

    return { pending, validated }
  }

  // Abrir modal com detalhes
  const openModal = (item) => {
    setSelectedItem({ ...item, type: selectedType })
    setShowModal(true)
  }

  // Renderizar tela de categorias
  const renderCategories = () => (
    <div className="categories-container">
      <div className="category-card" onClick={() => selectCategory("maquinas")}>
        <div className="category-icon">
          <Settings size={48} />
        </div>
        <h2>Máquinas</h2>
        <p>Apontamentos e abastecimentos de máquinas agrícolas</p>
      </div>

      <div className="category-card" onClick={() => selectCategory("veiculos")}>
        <div className="category-icon">
          <Truck size={48} />
        </div>
        <h2>Veículos</h2>
        <p>Percursos e abastecimentos de veículos</p>
      </div>
    </div>
  )

  // Renderizar tela de tipos
  const renderTypes = () => (
    <div className="types-container">
      <button className="back-button" onClick={backToCategories}>
        <ArrowLeft size={20} />
        Voltar para categorias
      </button>

      <div className="types-grid">
        {selectedCategory === "maquinas" ? (
          <>
            <div
              className={`type-card ${selectedType === "apontamentos" ? "selected" : ""}`}
              onClick={() => selectType("apontamentos")}
            >
              <div className="type-icon">
                <FileText size={32} />
              </div>
              <h3>Apontamentos</h3>
            </div>

            <div
              className={`type-card ${selectedType === "abastecimentos" ? "selected" : ""}`}
              onClick={() => selectType("abastecimentos")}
            >
              <div className="type-icon">
                <Fuel size={32} />
              </div>
              <h3>Abastecimentos</h3>
            </div>
          </>
        ) : (
          <>
            <div
              className={`type-card ${selectedType === "percursos" ? "selected" : ""}`}
              onClick={() => selectType("percursos")}
            >
              <div className="type-icon">
                <Route size={32} />
              </div>
              <h3>Percursos</h3>
            </div>

            <div
              className={`type-card ${selectedType === "abastecimentoVeiculos" ? "selected" : ""}`}
              onClick={() => selectType("abastecimentoVeiculos")}
            >
              <div className="type-icon">
                <Fuel size={32} />
              </div>
              <h3>Abastecimentos</h3>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Renderizar item da lista
  const renderListItem = (item) => {
    const getItemTitle = () => {
      switch (selectedType) {
        case "apontamentos":
          return `Ficha de Controle: ${item.fichaControle || "N/A"}`
        case "abastecimentos":
          return `Equipamento: ${item.bem || "N/A"}`
        case "percursos":
          return `Percurso: ${item.veiculo || "N/A"} (${item.placa || "N/A"})`
        case "abastecimentoVeiculos":
          return `Abastecimento: ${item.veiculo || "N/A"} (${item.placa || "N/A"})`
        default:
          return "Item"
      }
    }

    const getItemDetails = () => {
      switch (selectedType) {
        case "apontamentos":
          return [
            { icon: <Settings size={16} />, label: "Cultura", value: item.cultura || "N/A" },
            { icon: <Calendar size={16} />, label: "Data", value: item.data || "N/A" },
          ]
        case "abastecimentos":
          return [
            { icon: <Fuel size={16} />, label: "Produto", value: item.produto || "N/A" },
            { icon: <Settings size={16} />, label: "Quantidade", value: `${item.quantidade || 0}L` },
          ]
        case "percursos":
          return [
            { icon: <MapPin size={16} />, label: "Objetivo", value: item.objetivo || "N/A" },
            { icon: <Calendar size={16} />, label: "Data", value: item.data || "N/A" },
          ]
        case "abastecimentoVeiculos":
          return [
            { icon: <Fuel size={16} />, label: "Produto", value: item.produto || "N/A" },
            { icon: <Settings size={16} />, label: "Quantidade", value: `${item.quantidade || 0}L` },
          ]
        default:
          return []
      }
    }

    return (
      <div key={item.id} className="list-item">
        <div className="item-content">
          <h4 className="item-title">{getItemTitle()}</h4>
          <div className="item-details">
            {getItemDetails().map((detail, index) => (
              <div key={index} className="detail-row">
                {detail.icon}
                <span className="detail-label">{detail.label}:</span>
                <span className="detail-value">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="item-actions">
          {selectedStatus === "pending" && (
            <button className="btn-validate" onClick={() => validarItem(selectedType, item.id)}>
              <CheckCircle size={16} />
              Validar
            </button>
          )}
          <button className="btn-details" onClick={() => openModal(item)}>
            <Eye size={16} />
            Ver Detalhes
          </button>
        </div>
      </div>
    )
  }

  // Renderizar tela de itens
  const renderItems = () => {
    const { pending, validated } = getStatusCounts()
    const filteredData = getFilteredData()

    return (
      <div className="items-container">
        <button className="back-button" onClick={() => setCurrentStep("types")}>
          <ArrowLeft size={20} />
          Voltar para categorias
        </button>

        <div className="status-buttons">
          <button
            className={`status-btn ${selectedStatus === "pending" ? "active" : ""}`}
            onClick={() => setSelectedStatus("pending")}
          >
            <Hourglass size={16} />
            Para Validar
          </button>
          <button
            className={`status-btn ${selectedStatus === "validated" ? "active" : ""}`}
            onClick={() => setSelectedStatus("validated")}
          >
            <CheckCircle size={16} />
            Validados
          </button>
        </div>

        <div className="items-list">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum item encontrado para esta categoria.</p>
            </div>
          ) : (
            filteredData.map((item) => renderListItem(item))
          )}
        </div>
      </div>
    )
  }

  // Renderizar modal
  const renderModal = () => {
    if (!selectedItem || !showModal) return null

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Detalhes do Item</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-details">
              {Object.entries(selectedItem)
                .filter(([key]) => !["id", "type"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="modal-detail-row">
                    <span className="modal-label">{key}:</span>
                    <span className="modal-value">
                      {typeof value === "object" ? JSON.stringify(value) : value || "N/A"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando registros...</p>
      </div>
    )
  }

  return (
    <div className="apontamentos-container">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-title">
            <CheckCircle size={24} className="header-icon" />
            <h1>Registros</h1>
          </div>
          <div className="filter-section">
            <button className="filter-button">
              <span>Filtro</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="main-content">
        {currentStep === "categories" && renderCategories()}
        {currentStep === "types" && renderTypes()}
        {currentStep === "items" && renderItems()}
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  )
}

export default Apontamentos
