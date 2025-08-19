"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, database } from "../firebase/firebase"
import { ref, onValue, set, push, remove } from "firebase/database"
import {
  Settings,
  Clock,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react"

const Horimetro = () => {
  const [user, loading, error] = useAuthState(auth)
  const [maquinarios, setMaquinarios] = useState([])
  const [horimetros, setHorimetros] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("name") // "name", "horimetro", "newest"
  const [notification, setNotification] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMaquinario, setNewMaquinario] = useState({ nome: "", horimetro: 0 })

  // Carregar dados do Firebase
  useEffect(() => {
    if (!user) return

    const maquinariosRef = ref(database, "propriedades/Matrice/maquinarios")
    const horimetrosRef = ref(database, "propriedades/Matrice/horimetros")

    // Listener para maquinários
    const unsubscribeMaquinarios = onValue(maquinariosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const maquinariosArray = Object.entries(data).map(([id, maquinario]) => ({
          id,
          ...maquinario,
        }))
        setMaquinarios(maquinariosArray)
      } else {
        setMaquinarios([])
      }
    })

    // Listener para horímetros
    const unsubscribeHorimetros = onValue(horimetrosRef, (snapshot) => {
      const data = snapshot.val()
      // A estrutura no BD é: { "13": "0", "21": "5962.6", "24": "10485.3", etc }
      // Onde a chave é o ID do maquinário e o valor é o horímetro
      setHorimetros(data || {})
      setIsLoading(false)
    })

    return () => {
      unsubscribeMaquinarios()
      unsubscribeHorimetros()
    }
  }, [user])

  // Função para mostrar notificação
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Função para iniciar edição
  const startEditing = (maquinarioId, currentValue) => {
    setEditingId(maquinarioId)
    // Agora o valor é diretamente o horímetro (string ou número)
    setEditValue(currentValue?.toString() || "0")
  }

  // Função para cancelar edição
  const cancelEditing = () => {
    setEditingId(null)
    setEditValue("")
  }

  // Função para salvar horímetro
  const saveHorimetro = async (maquinarioId) => {
    if (!user) {
      showNotification("Você precisa estar logado para realizar esta ação.", "error")
      return
    }

    try {
      const numericValue = Number.parseFloat(editValue)
      if (isNaN(numericValue) || numericValue < 0) {
        showNotification("Por favor, insira um valor válido para o horímetro.", "error")
        return
      }

      // Salvando diretamente o valor do horímetro na estrutura simples
      const horimetroRef = ref(database, `propriedades/Matrice/horimetros/${maquinarioId}`)
      await set(horimetroRef, numericValue.toString())

      setEditingId(null)
      setEditValue("")
      showNotification("Horímetro atualizado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao salvar horímetro:", error)
      showNotification("Erro ao salvar horímetro. Tente novamente.", "error")
    }
  }

  // Função para adicionar novo maquinário
  const addMaquinario = async () => {
    if (!user) {
      showNotification("Você precisa estar logado para realizar esta ação.", "error")
      return
    }

    if (!newMaquinario.nome.trim()) {
      showNotification("Por favor, insira o nome do maquinário.", "error")
      return
    }

    try {
      const maquinariosRef = ref(database, "propriedades/Matrice/maquinarios")
      const newMaquinarioRef = await push(maquinariosRef, {
        nome: newMaquinario.nome.trim(),
        criadoEm: Date.now(),
        criadoPor: user.email,
      })

      // Criar horímetro inicial com estrutura simples
      const horimetroRef = ref(database, `propriedades/Matrice/horimetros/${newMaquinarioRef.key}`)
      const horimetroValue = Number.parseFloat(newMaquinario.horimetro) || 0
      await set(horimetroRef, horimetroValue.toString())

      setShowAddModal(false)
      setNewMaquinario({ nome: "", horimetro: 0 })
      showNotification("Maquinário adicionado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao adicionar maquinário:", error)
      showNotification("Erro ao adicionar maquinário. Tente novamente.", "error")
    }
  }

  // Função para remover maquinário
  const removeMaquinario = async (maquinarioId, nome) => {
    if (!user) {
      showNotification("Você precisa estar logado para realizar esta ação.", "error")
      return
    }

    if (!confirm(`Tem certeza que deseja remover o maquinário "${nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const maquinarioRef = ref(database, `propriedades/Matrice/maquinarios/${maquinarioId}`)
      const horimetroRef = ref(database, `propriedades/Matrice/horimetros/${maquinarioId}`)

      await remove(maquinarioRef)
      await remove(horimetroRef)

      showNotification("Maquinário removido com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao remover maquinário:", error)
      showNotification("Erro ao remover maquinário. Tente novamente.", "error")
    }
  }

  // Função para filtrar e ordenar maquinários
  const getFilteredAndSortedMaquinarios = () => {
    const filtered = maquinarios.filter((maquinario) =>
      maquinario.nome.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "name":
          return a.nome.localeCompare(b.nome)
        case "horimetro":
          // Agora o horímetro é diretamente o valor (string), convertemos para número
          const horimetroA = Number.parseFloat(horimetros[a.id]) || 0
          const horimetroB = Number.parseFloat(horimetros[b.id]) || 0
          return horimetroB - horimetroA
        case "newest":
          return (b.criadoEm || 0) - (a.criadoEm || 0)
        default:
          return 0
      }
    })
  }

  // Função para formatar data
  const formatDate = (timestamp) => {
    if (!timestamp) return "Não informado"
    return new Date(timestamp).toLocaleString("pt-BR")
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-slate-600">Carregando horímetros...</p>
        </div>
      </div>
    )
  }

  const filteredMaquinarios = getFilteredAndSortedMaquinarios()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 pt-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Horímetros</h1>
              <p className="text-slate-600">Gerencie os horímetros dos maquinários da fazenda</p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar maquinário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Ordenação */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-sm"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="horimetro">Ordenar por Horímetro</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Maquinários */}
        {filteredMaquinarios.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {searchTerm ? "Nenhum maquinário encontrado" : "Nenhum maquinário cadastrado"}
            </h3>
            <p className="text-slate-500">
              {searchTerm ? "Tente ajustar os termos de busca" : "Adicione o primeiro maquinário para começar"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaquinarios.map((maquinario) => {
              const horimetroValue = horimetros[maquinario.id]
              const isEditing = editingId === maquinario.id

              return (
                <div
                  key={maquinario.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{maquinario.nome}</h3>
                      <p className="text-sm text-slate-500">ID: {maquinario.id}</p>
                    </div>
                    <button
                      onClick={() => removeMaquinario(maquinario.id, maquinario.nome)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg flex items-center justify-center transition-all duration-300"
                      title="Remover maquinário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Horímetro Atual:</span>
                      {!isEditing && (
                        <button
                          onClick={() => startEditing(maquinario.id, horimetroValue)}
                          className="w-6 h-6 bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300"
                          title="Editar horímetro"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        <button
                          onClick={() => saveHorimetro(maquinario.id)}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Salvar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="w-8 h-8 bg-slate-500 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-slate-800">
                        {horimetroValue ? Number.parseFloat(horimetroValue).toLocaleString("pt-BR") : "0"} h
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* Modal Adicionar Maquinário */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Adicionar Maquinário</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Maquinário *</label>
                  <input
                    type="text"
                    value={newMaquinario.nome}
                    onChange={(e) => setNewMaquinario({ ...newMaquinario, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="Ex: Trator John Deere 6110J"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Horímetro Inicial</label>
                  <input
                    type="number"
                    value={newMaquinario.horimetro}
                    onChange={(e) => setNewMaquinario({ ...newMaquinario, horimetro: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-500 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addMaquinario}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notificação */}
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm ${
                notification.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Horimetro
