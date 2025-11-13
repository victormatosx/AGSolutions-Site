"use client"

import { useState, useEffect } from "react"
import { database } from "../firebase/firebase"
import { ref, set, onValue, off, remove, update } from "firebase/database"
import {
  Search,
  Plus,
  X,
  Users,
  Settings,
  Wrench,
  Star,
  Car,
  FileText,
  Database,
  UserPlus,
  Trash2,
  AlertTriangle,
  Octagon,
  CheckCircle,
  XCircle,
} from "lucide-react"

const Cadastro = () => {
  // Estados para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState("usuarios")

  // Estados para os dados
  const [usuarios, setUsuarios] = useState([])
  const [maquinarios, setMaquinarios] = useState([])
  const [implementos, setImplementos] = useState([])
  const [direcionadores, setDirecionadores] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [atividades, setAtividades] = useState([])
  const [tanques, setTanques] = useState([])

  // Estados para os formulários modais
  const [showUserForm, setShowUserForm] = useState(false)
  const [showMachineForm, setShowMachineForm] = useState(false)
  const [showImplementForm, setShowImplementForm] = useState(false)
  const [showDirecionadorForm, setShowDirecionadorForm] = useState(false)
  const [showVeiculoForm, setShowVeiculoForm] = useState(false)
  const [showAtividadeForm, setShowAtividadeForm] = useState(false)
  const [showTanqueForm, setShowTanqueForm] = useState(false)

  // Estados para busca
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para os dados dos formulários
  const [userData, setUserData] = useState({
    email: "",
    nome: "",
    propriedade: "",
    role: "user",
  })

  const [machineData, setMachineData] = useState({
    id: "",
    nome: "",
  })

  const [implementData, setImplementData] = useState({
    id: "",
    nome: "",
  })

  const [direcionadorData, setDirecionadorData] = useState({
    id: "",
    direcionador: "",
    culturaAssociada: "",
  })

  const [veiculoData, setVeiculoData] = useState({
    id: "",
    placa: "",
    modelo: "",
  })

  const [atividadeData, setAtividadeData] = useState({
    id: "",
    atividade: "",
  })

  const [tanqueData, setTanqueData] = useState({
    id: "",
    nome: "",
  })

  // Estados para notificações e confirmação
  const [notification, setNotification] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [deactivateConfirmation, setDeactivateConfirmation] = useState(null)

  const sortDirecionadores = (items) => {
    return [...items].sort((a, b) => {
      const aInactive = a.status === "desativado"
      const bInactive = b.status === "desativado"
      if (aInactive !== bInactive) {
        return aInactive ? 1 : -1
      }
      const nameA = (a.direcionador || a.nome || "").toLowerCase()
      const nameB = (b.direcionador || b.nome || "").toLowerCase()
      if (nameA && nameB) {
        return nameA.localeCompare(nameB)
      }
      return 0
    })
  }

  // Lista de culturas disponíveis
  const culturas = [
    "Cebola",
    "Cenoura",
    "Alho",
    "Sorgo",
    "Soja",
    "Milho",
    "Feijão",
    "Arroz",
    "Trigo",
    "Algodão",
    "Cana-de-açúcar",
    "Café",
    "Tomate",
    "Batata",
    "Mandioca",
    "Abóbora",
    "Abobrinha",
    "Brócolis",
    "Couve-flor",
    "Repolho",
    "Alface",
    "Espinafre",
    "Rúcula",
    "Pepino",
    "Pimentão",
    "Berinjela",
    "Quiabo",
    "Girassol",
    "Amendoim",
    "Eucalipto",
  ]

  // Configuração das seções
  const sections = {
    usuarios: {
      title: "Usuários",
      icon: Users,
      color: "emerald",
      data: usuarios,
      searchPlaceholder: "Pesquisar usuários...",
    },
    maquinarios: {
      title: "Máquinas",
      icon: Settings,
      color: "blue",
      data: maquinarios,
      searchPlaceholder: "Pesquisar máquinas...",
    },
    implementos: {
      title: "Implementos",
      icon: Wrench,
      color: "purple",
      data: implementos,
      searchPlaceholder: "Pesquisar implementos...",
    },
    direcionadores: {
      title: "Direcionadores",
      icon: Star,
      color: "orange",
      data: direcionadores,
      searchPlaceholder: "Pesquisar direcionadores...",
    },
    veiculos: {
      title: "Veículos",
      icon: Car,
      color: "indigo",
      data: veiculos,
      searchPlaceholder: "Pesquisar veículos...",
    },
    atividades: {
      title: "Atividades",
      icon: FileText,
      color: "green",
      data: atividades,
      searchPlaceholder: "Pesquisar atividades...",
    },
    tanques: {
      title: "Tanques",
      icon: Database,
      color: "cyan",
      data: tanques,
      searchPlaceholder: "Pesquisar tanques...",
    },
  }

  // Carregar dados do Firebase
  useEffect(() => {
    const usersRef = ref(database, "propriedades/Matrice/users")
    const machinesRef = ref(database, "propriedades/Matrice/maquinarios")
    const implementsRef = ref(database, "propriedades/Matrice/implementos")
    const direcionadoresRef = ref(database, "propriedades/Matrice/direcionadores")
    const veiculosRef = ref(database, "propriedades/Matrice/veiculos")
    const atividadesRef = ref(database, "propriedades/Matrice/atividades")
    const tanquesRef = ref(database, "propriedades/Matrice/tanques")

    // Listeners
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setUsuarios(usersList)
      }
    })

    onValue(machinesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const machinesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setMaquinarios(machinesList)
      }
    })

    onValue(implementsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const implementsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setImplementos(implementsList)
      }
    })

    onValue(direcionadoresRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const direcionadoresList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setDirecionadores(sortDirecionadores(direcionadoresList))
      } else {
        setDirecionadores([])
      }
    })

    onValue(veiculosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const veiculosList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setVeiculos(veiculosList)
      }
    })

    onValue(atividadesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const atividadesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setAtividades(atividadesList)
      }
    })

    onValue(tanquesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const tanquesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setTanques(tanquesList)
      }
    })

    // Cleanup listeners
    return () => {
      off(usersRef)
      off(machinesRef)
      off(implementsRef)
      off(direcionadoresRef)
      off(veiculosRef)
      off(atividadesRef)
      off(tanquesRef)
    }
  }, [])

  // Funções para adicionar dados
  const handleAddUser = async (e) => {
    e.preventDefault()
    // Removido o código de adição de usuário para exibir o alerta
  }

  const handleAddMachine = async (e) => {
    e.preventDefault()
    try {
      const machinesRef = ref(database, `propriedades/Matrice/maquinarios/${machineData.id}`)
      await set(machinesRef, {
        id: machineData.id,
        nome: machineData.nome,
        status: "Operacional",
      })
      setMachineData({ id: "", nome: "" })
      setShowMachineForm(false)
      showNotification("Máquina cadastrada com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar máquina:", error)
      showNotification("Erro ao cadastrar máquina", "error")
    }
  }

  const handleAddImplement = async (e) => {
    e.preventDefault()
    try {
      const implementsRef = ref(database, `propriedades/Matrice/implementos/${implementData.id}`)
      await set(implementsRef, {
        id: implementData.id,
        nome: implementData.nome,
        status: "Operacional",
      })
      setImplementData({ id: "", nome: "" })
      setShowImplementForm(false)
      showNotification("Implemento cadastrado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar implemento:", error)
      showNotification("Erro ao cadastrar implemento", "error")
    }
  }

  const handleAddDirecionador = async (e) => {
    e.preventDefault()
    try {
      const direcionadoresRef = ref(database, `propriedades/Matrice/direcionadores/${direcionadorData.id}`)
      await set(direcionadoresRef, {
        id: direcionadorData.id,
        direcionador: direcionadorData.direcionador,
        culturaAssociada: direcionadorData.culturaAssociada,
        status: "ativo",
        dataCadastro: new Date().toISOString(),
      })
      setDirecionadorData({ id: "", direcionador: "", culturaAssociada: "" })
      setShowDirecionadorForm(false)
      showNotification("Direcionador cadastrado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar direcionador:", error)
      showNotification("Erro ao cadastrar direcionador", "error")
    }
  }

  const handleDeactivateDirecionador = async (direcionador) => {
    if (!direcionador?.id) return
    if (direcionador.status === "desativado") {
      showNotification("Esse direcionador já está desativado.", "warning")
      return
    }

    try {
      const direcionadorRef = ref(database, `propriedades/Matrice/direcionadores/${direcionador.id}`)
      await update(direcionadorRef, { status: "desativado" })
      showNotification("Direcionador desativado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao desativar direcionador:", error)
      showNotification("Erro ao desativar direcionador", "error")
    }
  }

  const handleAddVeiculo = async (e) => {
    e.preventDefault()
    try {
      const veiculosRef = ref(database, `propriedades/Matrice/veiculos/${veiculoData.id}`)
      await set(veiculosRef, {
        id: veiculoData.id,
        placa: veiculoData.placa,
        modelo: veiculoData.modelo,
        dataCadastro: new Date().toISOString(),
      })
      setVeiculoData({ id: "", placa: "", modelo: "" })
      setShowVeiculoForm(false)
      showNotification("Veículo cadastrado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error)
      showNotification("Erro ao cadastrar veículo", "error")
    }
  }

  const handleAddAtividade = async (e) => {
    e.preventDefault()
    try {
      const atividadesRef = ref(database, `propriedades/Matrice/atividades/${atividadeData.id}`)
      await set(atividadesRef, {
        id: atividadeData.id,
        atividade: atividadeData.atividade,
        dataCadastro: new Date().toISOString(),
      })
      setAtividadeData({ id: "", atividade: "" })
      setShowAtividadeForm(false)
      showNotification("Atividade cadastrada com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar atividade:", error)
      showNotification("Erro ao cadastrar atividade", "error")
    }
  }

  const handleAddTanque = async (e) => {
    e.preventDefault()
    try {
      const tanquesRef = ref(database, `propriedades/Matrice/tanques/${tanqueData.id}`)
      await set(tanquesRef, {
        id: tanqueData.id,
        nome: tanqueData.nome,
        dataCadastro: new Date().toISOString(),
      })
      setTanqueData({ id: "", nome: "" })
      setShowTanqueForm(false)
      showNotification("Tanque cadastrado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao cadastrar tanque:", error)
      showNotification("Erro ao cadastrar tanque", "error")
    }
  }

  // Funções para excluir dados
  const handleDeleteItem = async (section, itemId) => {
    try {
      const itemRef = ref(database, `propriedades/Matrice/${section}/${itemId}`)
      await remove(itemRef)
      setDeleteConfirmation(null)
      showNotification("Item excluído com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao excluir item:", error)
      showNotification("Erro ao excluir item", "error")
    }
  }

  const confirmDelete = (section, item) => {
    setDeleteConfirmation({
      section,
      item,
      title: `Excluir ${sections[section].title.slice(0, -1)}`,
      message: `Tem certeza que deseja excluir "${item.nome || item.direcionador || item.atividade || item.modelo}"?`,
    })
  }

  const confirmDeactivateDirecionador = (item) => {
    if (!item || item.status === "desativado") return
    setDeactivateConfirmation({
      item,
      title: "Desativar Direcionador",
      message: `Tem certeza que deseja desativar "${item.direcionador || item.nome}"?`,
    })
  }

  // Sistema de notificações
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Função para filtrar itens baseado na busca
  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items
    return items.filter(
      (item) =>
        item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toString().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.direcionador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.atividade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.placa?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const handleShowUserForm = () => {
    showNotification(
      "Você não tem permissão para criar novos usuários. Entre em contato pelo WhatsApp (34) 9 9653-2577 ou pelo E-mail victor@jragrosolutions.com.br para cadastrar novos usuários.",
      "warning",
    )
  }

  const currentSection = sections[activeSection]
  const Icon = currentSection.icon

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Sistema de Cadastro</h1>
              <p className="text-slate-600">Gerencie todos os recursos da sua propriedade</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-200"></div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {Object.entries(sections).map(([key, section]) => {
              const TabIcon = section.icon
              return (
                <button
                  key={key}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeSection === key
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 transform scale-105"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80 hover:scale-105"
                  }`}
                  onClick={() => setActiveSection(key)}
                >
                  <TabIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{section.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Section Header */}
          <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{currentSection.title}</h2>
                  <p className="text-slate-600">
                    {currentSection.data.length} {currentSection.data.length === 1 ? "item" : "itens"} cadastrados
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  if (activeSection === "usuarios") {
                    handleShowUserForm()
                  } else {
                    const setters = {
                      maquinarios: setShowMachineForm,
                      implementos: setShowImplementForm,
                      direcionadores: setShowDirecionadorForm,
                      veiculos: setShowVeiculoForm,
                      atividades: setShowAtividadeForm,
                      tanques: setShowTanqueForm,
                    }
                    setters[activeSection]?.(true)
                  }
                }}
              >
                <Plus className="w-5 h-5" />
                <span>Cadastrar Novo</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-8 pb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={currentSection.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-8 pt-4">
            {filterItems(currentSection.data, searchTerm).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  {searchTerm
                    ? "Nenhum resultado encontrado"
                    : `Nenhum ${currentSection.title.toLowerCase()} cadastrado`}
                </h3>
                <p className="text-slate-500">
                  {searchTerm
                    ? "Tente ajustar sua pesquisa"
                    : `Clique em "Cadastrar Novo" para adicionar o primeiro item`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterItems(currentSection.data, searchTerm).map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {activeSection === "direcionadores" && (
                          <button
                            type="button"
                            onClick={() => confirmDeactivateDirecionador(item)}
                            disabled={item.status === "desativado"}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 ${
                              item.status === "desativado"
                                ? "border-slate-100 text-slate-300 cursor-not-allowed"
                                : "border-amber-200 text-amber-600 hover:bg-amber-50"
                            }`}
                            title={
                              item.status === "desativado" ? "Direcionador já desativado" : "Desativar direcionador"
                            }
                          >
                            <Octagon className="w-4 h-4" />
                            <span className="sr-only">
                              {item.status === "desativado" ? "Direcionador desativado" : "Desativar direcionador"}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => confirmDelete(activeSection, item)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          title="Excluir item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors duration-300">
                        {item.nome || item.direcionador || item.atividade || item.modelo || "Sem nome"}
                      </h3>

                      {activeSection === "direcionadores" && (
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "desativado"
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {item.status === "desativado" ? "Desativado" : "Ativo"}
                        </span>
                      )}

                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          ID: {item.id}
                        </p>

                        {item.email && (
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            {item.email}
                          </p>
                        )}

                        {item.propriedade && (
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            {item.propriedade}
                          </p>
                        )}

                        {item.culturaAssociada && (
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            Cultura: {item.culturaAssociada}
                          </p>
                        )}

                        {item.placa && (
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            Placa: {item.placa}
                          </p>
                        )}

                        {item.role && (
                          <p className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            Função: {item.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modais */}
        {showMachineForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Nova Máquina</h3>
                  <button
                    onClick={() => setShowMachineForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMachine} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID da Máquina</label>
                  <input
                    type="text"
                    value={machineData.id}
                    onChange={(e) => setMachineData({ ...machineData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome da Máquina</label>
                  <input
                    type="text"
                    value={machineData.nome}
                    onChange={(e) => setMachineData({ ...machineData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMachineForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showImplementForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Novo Implemento</h3>
                  <button
                    onClick={() => setShowImplementForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddImplement} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID do Implemento</label>
                  <input
                    type="text"
                    value={implementData.id}
                    onChange={(e) => setImplementData({ ...implementData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome do Implemento</label>
                  <input
                    type="text"
                    value={implementData.nome}
                    onChange={(e) => setImplementData({ ...implementData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowImplementForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDirecionadorForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Novo Direcionador</h3>
                  <button
                    onClick={() => setShowDirecionadorForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddDirecionador} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID do Direcionador</label>
                  <input
                    type="text"
                    value={direcionadorData.id}
                    onChange={(e) => setDirecionadorData({ ...direcionadorData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome do Direcionador</label>
                  <input
                    type="text"
                    value={direcionadorData.direcionador}
                    onChange={(e) => setDirecionadorData({ ...direcionadorData, direcionador: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Cultura Associada</label>
                  <select
                    value={direcionadorData.culturaAssociada}
                    onChange={(e) => setDirecionadorData({ ...direcionadorData, culturaAssociada: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  >
                    <option value="">Selecione uma cultura</option>
                    {culturas.map((cultura) => (
                      <option key={cultura} value={cultura}>
                        {cultura}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDirecionadorForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showVeiculoForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Novo Veículo</h3>
                  <button
                    onClick={() => setShowVeiculoForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddVeiculo} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID do Veículo</label>
                  <input
                    type="text"
                    value={veiculoData.id}
                    onChange={(e) => setVeiculoData({ ...veiculoData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Placa do Veículo</label>
                  <input
                    type="text"
                    value={veiculoData.placa}
                    onChange={(e) => setVeiculoData({ ...veiculoData, placa: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Modelo do Veículo</label>
                  <input
                    type="text"
                    value={veiculoData.modelo}
                    onChange={(e) => setVeiculoData({ ...veiculoData, modelo: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVeiculoForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAtividadeForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Nova Atividade</h3>
                  <button
                    onClick={() => setShowAtividadeForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddAtividade} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID da Atividade</label>
                  <input
                    type="text"
                    value={atividadeData.id}
                    onChange={(e) => setAtividadeData({ ...atividadeData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome da Atividade</label>
                  <input
                    type="text"
                    value={atividadeData.atividade}
                    onChange={(e) => setAtividadeData({ ...atividadeData, atividade: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAtividadeForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTanqueForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Cadastrar Novo Tanque</h3>
                  <button
                    onClick={() => setShowTanqueForm(false)}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddTanque} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">ID do Tanque</label>
                  <input
                    type="text"
                    value={tanqueData.id}
                    onChange={(e) => setTanqueData({ ...tanqueData, id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Nome do Tanque</label>
                  <input
                    type="text"
                    value={tanqueData.nome}
                    onChange={(e) => setTanqueData({ ...tanqueData, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTanqueForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {deactivateConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Octagon className="w-8 h-8 text-amber-600" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{deactivateConfirmation.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{deactivateConfirmation.message}</p>
                <p className="text-sm text-amber-600 mb-6">Esta ação pode ser revertida editando o status diretamente no banco.</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeactivateConfirmation(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleDeactivateDirecionador(deactivateConfirmation.item)
                      setDeactivateConfirmation(null)
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
                  >
                    Desativar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    onClick={() => setDeleteConfirmation(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteItem(deleteConfirmation.section, deleteConfirmation.item.id)}
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
    </div>
  )
}

export default Cadastro
