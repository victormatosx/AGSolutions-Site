"use client"

import { useState, useEffect } from "react"
import { database } from "../firebase/firebase"
import { ref, onValue, update, remove } from "firebase/database"
import {
  Settings,
  Truck,
  FileText,
  Fuel,
  Route,
  ArrowLeft,
  ChevronDown,
  MapPin,
  Calendar,
  Eye,
  Filter,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus, // Added UserPlus import
} from "lucide-react"

const Apontamentos = () => {
  const [currentStep, setCurrentStep] = useState("categories") // categories, types, items
  const [selectedCategory, setSelectedCategory] = useState(null) // maquinas, veiculos
  const [selectedType, setSelectedType] = useState(null) // apontamentos, abastecimentos, percursos, abastecimentoVeiculos
  const [selectedStatus, setSelectedStatus] = useState("pending") // pending, validated
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  })

  // Estados para os dados
  const [data, setData] = useState({
    apontamentos: [],
    abastecimentos: [],
    percursos: [],
    abastecimentoVeiculos: [],
  })
  const [loading, setLoading] = useState(true)

  // Adicionar após os outros estados
  const [usuarios, setUsuarios] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(null)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  // Estados para notificações e confirmação
  const [notification, setNotification] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        // Carregar usuários
        const usersRef = ref(database, "propriedades/Matrice/users")
        onValue(usersRef, (snapshot) => {
          const usersData = snapshot.val()
          if (usersData) {
            setUsuarios(usersData)
          }
        })

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
        showNotification("Erro ao carregar dados.", "error")
      }
    }

    loadData()
  }, [])

  // Sistema de notificações
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

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
      showNotification("Item validado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao validar item:", error)
      showNotification("Erro ao validar item. Tente novamente.", "error")
    }
  }

  // Função para excluir item
  const handleDeleteItem = async (tipo, itemId) => {
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
      await remove(itemRef)
      setDeleteConfirmation(null)
      setShowModal(false) // Close modal if the deleted item was open
      showNotification("Item excluído com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao excluir item:", error)
      showNotification("Erro ao excluir item", "error")
    }
  }

  const confirmDelete = (item) => {
    setDeleteConfirmation({
      item,
      title: "Excluir Registro",
      message: `Tem certeza que deseja excluir este registro?`,
    })
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

    let currentData = data[selectedType] || []

    // Filtrar por status
    currentData = currentData.filter((item) => item.status === selectedStatus)

    // Filtrar por termo de busca
    if (filters.searchTerm) {
      currentData = currentData.filter((item) => {
        const searchFields = [
          item.fichaControle,
          item.bem,
          item.veiculo,
          item.placa,
          item.cultura,
          item.produto,
          item.objetivo,
          item.userId ? usuarios[item.userId]?.nome : null, // Search by user name
        ].filter(Boolean)

        return searchFields.some((field) => field.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      })
    }

    // Filtrar por data
    if (filters.dateFrom || filters.dateTo) {
      currentData = currentData.filter((item) => {
        const itemDate = new Date(item.data || item.dataHora || item.timestamp)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null

        if (fromDate && itemDate < fromDate) return false
        if (toDate && itemDate > toDate) return false
        return true
      })
    }

    // Ordenar por mais recente
    currentData.sort((a, b) => {
      const dateA = new Date(a.data || a.dataHora || a.timestamp || 0)
      const dateB = new Date(b.data || b.dataHora || b.timestamp || 0)
      return dateB - dateA // Mais recente primeiro
    })

    return currentData
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

  const startEditing = () => {
    setEditedItem({ ...selectedItem })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedItem(null)
  }

  const confirmSave = () => {
    setShowSaveConfirmation(true)
  }

  const saveChanges = async () => {
    try {
      const { id, type, ...dataToSave } = editedItem

      let path = ""
      switch (type) {
        case "apontamentos":
          path = `propriedades/Matrice/apontamentos/${id}`
          break
        case "abastecimentos":
          path = `propriedades/Matrice/abastecimentos/${id}`
          break
        case "percursos":
          path = `propriedades/Matrice/percursos/${id}`
          break
        case "abastecimentoVeiculos":
          path = `propriedades/Matrice/abastecimentoVeiculos/${id}`
          break
        default:
          throw new Error("Tipo inválido")
      }

      const itemRef = ref(database, path)
      await update(itemRef, dataToSave)

      setSelectedItem(editedItem)
      setIsEditing(false)
      setEditedItem(null)
      setShowSaveConfirmation(false)

      showNotification("Alterações salvas com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao salvar alterações:", error)
      showNotification("Erro ao salvar alterações. Tente novamente.", "error")
    }
  }

  const handleInputChange = (key, value, operacaoIndex = null) => {
    if (operacaoIndex !== null) {
      // Editando operação mecanizada
      const newOperacoes = [...(editedItem.operacoesMecanizadas || [])]
      newOperacoes[operacaoIndex] = {
        ...newOperacoes[operacaoIndex],
        [key]: value,
      }
      setEditedItem({
        ...editedItem,
        operacoesMecanizadas: newOperacoes,
      })
    } else {
      // Editando campo principal
      setEditedItem({
        ...editedItem,
        [key]: value,
      })
    }
  }

  // Renderizar tela de categorias
  const renderCategories = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div
          className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 hover:border-green-200"
          onClick={() => selectCategory("maquinas")}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
            Máquinas
          </h2>
          <p className="text-slate-600 leading-relaxed">Apontamentos e abastecimentos de máquinas agrícolas</p>
          <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>

        <div
          className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 hover:border-green-200"
          onClick={() => selectCategory("veiculos")}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
            Veículos
          </h2>
          <p className="text-slate-600 leading-relaxed">Percursos e abastecimentos de veículos</p>
          <div className="mt-6 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>
      </div>
    </div>
  )

  // Renderizar tela de tipos
  const renderTypes = () => (
    <div className="max-w-4xl mx-auto">
      <button
        className="flex items-center gap-3 mb-8 px-4 py-2 text-slate-600 hover:text-green-600 transition-colors duration-300 group"
        onClick={backToCategories}
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
                  selectedType === "apontamentos"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => selectType("apontamentos")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Apontamentos
                </h3>
              </div>

              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  selectedType === "abastecimentos"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => selectType("abastecimentos")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Fuel className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Abastecimentos
                </h3>
              </div>
            </>
          ) : (
            <>
              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  selectedType === "percursos"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => selectType("percursos")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Route className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Percursos
                </h3>
              </div>

              <div
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  selectedType === "abastecimentoVeiculos"
                    ? "border-green-500 bg-green-50/50 shadow-green-500/20"
                    : "border-white/20 hover:border-green-200"
                }`}
                onClick={() => selectType("abastecimentoVeiculos")}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Fuel className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">
                  Abastecimentos
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Renderizar item da lista
  const renderListItem = (item, index) => {
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
      const details = [
        { icon: <Calendar className="w-4 h-4" />, label: "Data", value: item.data || item.dataHora || item.timestamp || "N/A" },
      ];

      if (item.userId) {
        details.push({ icon: <UserPlus className="w-4 h-4" />, label: "Responsável", value: usuarios[item.userId]?.nome || "Usuário não identificado" });
      }

      switch (selectedType) {
        case "apontamentos":
          details.push(
            { icon: <Settings className="w-4 h-4" />, label: "Cultura", value: item.cultura || "N/A" },
          );
          break;
        case "abastecimentos":
          details.push(
            { icon: <Fuel className="w-4 h-4" />, label: "Produto", value: item.produto || "N/A" },
            { icon: <Settings className="w-4 h-4" />, label: "Quantidade", value: `${item.quantidade || 0}L` },
          );
          break;
        case "percursos":
          details.push(
            { icon: <MapPin className="w-4 h-4" />, label: "Objetivo", value: item.objetivo || "N/A" },
          );
          break;
        case "abastecimentoVeiculos":
          details.push(
            { icon: <Fuel className="w-4 h-4" />, label: "Produto", value: item.produto || "N/A" },
            { icon: <Settings className="w-4 h-4" />, label: "Quantidade", value: `${item.quantidade || 0}L` },
          );
          break;
        default:
          break;
      }
      return details;
    }


    return (
      <div
        key={item.id}
        className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-green-200"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4 group-hover:text-green-600 transition-colors duration-300">
              {getItemTitle()}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getItemDetails().map((detail, detailIndex) => (
                <div key={detailIndex} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    {detail.icon}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">{detail.label}:</span>
                    <span className="ml-2 text-slate-800">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
            {selectedStatus === "pending" && (
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
                onClick={() => validarItem(selectedType, item.id)}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validar</span>
              </button>
            )}
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-xl font-medium hover:bg-green-500 hover:text-white transition-all duration-300"
              onClick={() => openModal(item)}
            >
              <Eye className="w-4 h-4" />
              <span>Detalhes</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar tela de itens
  const renderItems = () => {
    const { pending, validated } = getStatusCounts()
    const filteredData = getFilteredData()

    return (
      <div className="max-w-6xl mx-auto">
        <button
          className="flex items-center gap-3 mb-8 px-4 py-2 text-slate-600 hover:text-green-600 transition-colors duration-300 group"
          onClick={() => setCurrentStep("types")}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Voltar para tipos</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedStatus === "pending"
                  ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25"
                  : "bg-white/80 border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setSelectedStatus("pending")}
            >
              <Clock className="w-5 h-5" />
              <span>Para Validar</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-bold">{pending}</span>
            </button>
            <button
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedStatus === "validated"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                  : "bg-white/80 border-2 border-green-200 text-green-600 hover:bg-green-50"
              }`}
              onClick={() => setSelectedStatus("validated")}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Validados</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-bold">{validated}</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-white/20 rounded-xl text-slate-600 hover:text-green-600 hover:border-green-200 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-white/20 p-6 z-50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtros</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                      placeholder="Buscar por equipamento, cultura, etc..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Data inicial</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Data final</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setFilters({ dateFrom: "", dateTo: "", searchTerm: "" })}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum item encontrado</h3>
              <p className="text-slate-500">Não há registros para esta categoria no momento.</p>
            </div>
          ) : (
            filteredData.map((item, index) => renderListItem(item, index))
          )}
        </div>
      </div>
    )
  }

  // Renderizar modal
  const renderModal = () => {
    if (!selectedItem || !showModal) return null

    // Função para obter o nome do responsável baseado no userId
    const getResponsavelName = (userId) => {
      if (!userId || !usuarios[userId]) {
        return "Usuário não identificado"
      }
      return usuarios[userId].nome || "Nome não disponível"
    }

    // Separar informações principais das operações mecanizadas
    const currentItem = isEditing ? editedItem : selectedItem
    const mainInfo = {}
    const operacoesMecanizadas = currentItem.operacoesMecanizadas || []

    // Filtrar campos principais (excluir userId, timestamp e operacoesMecanizadas)
    Object.entries(currentItem)
      .filter(([key]) => !["id", "type", "userId", "timestamp", "operacoesMecanizadas"].includes(key))
      .forEach(([key, value]) => {
        mainInfo[key] = value
      })

    // Adicionar responsável se userId existir
    if (currentItem.userId) {
      mainInfo.responsavel = getResponsavelName(currentItem.userId)
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditing ? "Editando Registro" : "Detalhes do Registro"}
            </h2>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-slate-500 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors duration-200"
                  >
                    Salvar
                  </button>
                </div>
              )}
               <button
                onClick={() => confirmDelete(selectedItem)}
                className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl flex items-center justify-center transition-all duration-300"
                title="Excluir item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Informações Principais */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Informações Principais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mainInfo).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm font-medium text-slate-600 mb-2 capitalize">
                      {key === "responsavel" ? "Responsável" : key}:
                    </div>
                    {isEditing && key !== "responsavel" ? (
                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <div className="text-slate-800 font-medium">
                        {typeof value === "object" ? JSON.stringify(value) : value || "N/A"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Operações Mecanizadas */}
            {operacoesMecanizadas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operações Mecanizadas
                </h3>
                <div className="space-y-4">
                  {operacoesMecanizadas.map((operacao, index) => (
                    <div key={index} className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-green-800 text-lg">Operação {index + 1}</h4>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(operacao).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3 border border-green-100">
                            <div className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">{key}</div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={value || ""}
                                onChange={(e) => handleInputChange(key, e.target.value, index)}
                                className="w-full px-2 py-1 text-sm border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                              />
                            ) : (
                              <div className="text-sm text-green-800 font-medium">
                                {typeof value === "object" ? JSON.stringify(value) : value || "N/A"}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmação de Salvamento */}
        {showSaveConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Alterações</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Tem certeza que deseja salvar as alterações feitas neste registro?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSaveConfirmation(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveChanges}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Carregando registros</h3>
          <p className="text-slate-500">Aguarde enquanto buscamos os dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "categories" && renderCategories()}
        {currentStep === "types" && renderTypes()}
        {currentStep === "items" && renderItems()}
      </main>

      {/* Modal */}
      {renderModal()}

      {/* Sistema de Notificações */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border max-w-md ${
              notification.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : notification.type === "error"
                  ? "bg-red-50/90 border-red-200 text-red-800"
                  : "bg-amber-50/90 border-amber-200 text-amber-800"
            }`}
          >
            {notification.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            {notification.type === "error" && <XCircle className="w-5 h-5 text-red-600" />}
            {notification.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}

            <div className="flex-1">
              <p className="font-medium text-sm leading-relaxed">{notification.message}</p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">{deleteConfirmation.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{deleteConfirmation.message}</p>
              <p className="text-sm text-red-600 mb-6">Esta ação não pode ser desfeita.</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(selectedItem.type, deleteConfirmation.item.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Apontamentos