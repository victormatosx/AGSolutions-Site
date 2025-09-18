import React, { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, database } from "../firebase/firebase"
import { ref, get, update, onValue } from "firebase/database"
import HeaderMecanico from "./HeaderMecanico"
import {
  Wrench,
  Clock,
  CheckCircle,
  Calendar,
  User,
  FileText,
  Settings,
  Loader2,
  X,
  Save,
  Search,
  BarChart3,
  TrendingUp,
  Activity,
  Filter,
  Eye,
  Building,
  AlertCircle,
  Zap,
  ChevronRight
} from "lucide-react"

const MecanicoComponent = () => {
  const [user, loading] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [ordensServico, setOrdensServico] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState("aberto")
  const [showConcluirModal, setShowConcluirModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedOS, setSelectedOS] = useState(null)
  const [descricaoResolucao, setDescricaoResolucao] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("recentes")
  const [usersCache, setUsersCache] = useState({})

  // Função para buscar o nome do usuário pelo ID
  const fetchUserName = async (userId, propriedadeId) => {
    if (!userId || !propriedadeId) return "Operador Desconhecido"

    // Verifica se já temos o usuário em cache
    if (usersCache[userId]) return usersCache[userId]

    try {
      const userRef = ref(database, `propriedades/${propriedadeId}/users/${userId}/nome`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const userName = userSnapshot.val()
        // Atualiza o cache
        setUsersCache(prev => ({
          ...prev,
          [userId]: userName
        }))
        return userName
      }
      return "Operador Desconhecido"
    } catch (error) {
      console.error("Erro ao buscar nome do usuário:", error)
      return "Operador Desconhecido"
    }
  }

  // Buscar dados do usuário e configurar listeners em tempo real
  useEffect(() => {
    if (!user) return

    let propriedadeAtual = null
    let ordensRef = null

    const setupRealtimeUpdates = async () => {
      try {
        const propriedadesRef = ref(database, "propriedades")
        const propriedadesSnapshot = await get(propriedadesRef)

        if (propriedadesSnapshot.exists()) {
          const propriedades = propriedadesSnapshot.val()
          let foundUserData = null

          // Encontra a propriedade do usuário
          for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
            if (propriedadeData.users && propriedadeData.users[user.uid]) {
              // Obtém os dados da propriedade
              const propriedadeInfo = await get(ref(database, `propriedades/${propriedadeName}/info`))
              const nomePropriedade = propriedadeInfo.exists() ? propriedadeInfo.val().nome : propriedadeName

              foundUserData = {
                ...propriedadeData.users[user.uid],
                propriedade: nomePropriedade,
                idPropriedade: propriedadeName
              }
              propriedadeAtual = propriedadeName
              break
            }
          }

          if (foundUserData && propriedadeAtual) {
            setUserData(foundUserData)

            // Configura o listener em tempo real para as ordens de serviço
            ordensRef = ref(database, `propriedades/${propriedadeAtual}/ordemServico`)

            const onOrdensChange = async (snapshot) => {
              if (snapshot.exists()) {
                const ordensData = snapshot.val()

                // Mapeia as ordens e busca os nomes dos operadores
                const ordensPromises = Object.entries(ordensData).map(async ([id, ordem]) => {
                  const operadorNome = ordem.userId
                    ? await fetchUserName(ordem.userId, propriedadeAtual)
                    : ordem.operador || "Operador Desconhecido"

                  return {
                    id,
                    ...ordem,
                    operador: operadorNome,
                    propriedade: foundUserData.propriedade,
                    idPropriedade: propriedadeAtual
                  }
                })

                const ordensArray = await Promise.all(ordensPromises)
                setOrdensServico(ordensArray)
              } else {
                setOrdensServico([])
              }
              setIsLoadingData(false)
            }

            // Configura o listener em tempo real
            const unsubscribe = onValue(ordensRef, onOrdensChange)

            // Retorna a função de limpeza para remover o listener quando o componente for desmontado
            return () => {
              if (unsubscribe) unsubscribe()
            }
          }
        }
      } catch (error) {
        console.error("Erro ao configurar atualizações em tempo real:", error)
        setIsLoadingData(false)
      }
    }

    setupRealtimeUpdates()

    // Função de limpeza para o caso do componente ser desmontado durante o setup
    return () => {
      // O listener será removido automaticamente quando o componente for desmontado
    }
  }, [user, loading])

  // Atualizar nomes dos operadores quando o cache mudar
  useEffect(() => {
    const updateOperators = async () => {
      if (ordensServico.length === 0) return

      const updatedOrdens = await Promise.all(ordensServico.map(async (ordem) => {
        if (ordem.userId && !usersCache[ordem.userId]) {
          const userName = await fetchUserName(ordem.userId, ordem.idPropriedade || userData?.idPropriedade)
          return {
            ...ordem,
            operador: userName
          }
        }
        return ordem
      }))

      // Atualiza o estado apenas se houver mudanças
      if (JSON.stringify(updatedOrdens) !== JSON.stringify(ordensServico)) {
        setOrdensServico(updatedOrdens)
      }
    }

    updateOperators()
  }, [usersCache])

  // Filtrar e ordenar ordens
  const filteredOrdens = ordensServico
    .filter(ordem => {
      const matchesTab = ordem.status === activeTab
      const matchesSearch =
        ordem.equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.descricaoProblema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.operador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ordem.id.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesTab && matchesSearch
    })
    .sort((a, b) => {
      // Função auxiliar para converter a data para um objeto Date
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);

        // Tenta converter de DD/MM/YYYY para Date
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day);
        }

        // Tenta converter de YYYY-MM-DD para Date
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        }

        // Tenta converter diretamente
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date(0) : date;
      };

      const dateA = parseDate(a.data);
      const dateB = parseDate(b.data);

      // Ordenar por data
      return sortOrder === 'recentes'
        ? dateB - dateA  // Mais recentes primeiro
        : dateA - dateB; // Mais antigas primeiro
    })

  const ordensAbertas = ordensServico.filter(ordem => ordem.status === "aberto")
  const ordensFechadas = ordensServico.filter(ordem => ordem.status === "fechado")

  // Função para concluir ordem de serviço
  const handleConcluirOS = async () => {
    if (!selectedOS || !descricaoResolucao.trim()) return

    setIsSubmitting(true)
    try {
      // Usa o ID da propriedade em vez do nome para garantir a referência correta
      const osRef = ref(database, `propriedades/${selectedOS.idPropriedade || userData.idPropriedade}/ordemServico/${selectedOS.id}`)
      
      const currentDate = new Date()
      const userName = userData.name || user.email?.split("@")[0] || "Mecânico"

      const conclusaoData = {
        dataFechamento: currentDate.toISOString(),
        descricaoServico: descricaoResolucao.trim(),
        fechadoPor: userName,
        userIdFechamento: user.uid
      }

      const updateData = {
        status: "fechado",
        conclusao: conclusaoData,
        data: selectedOS.data || "",
        equipamento: selectedOS.equipamento || "",
        descricaoProblema: selectedOS.descricaoProblema || ""
      }

      await update(osRef, updateData)

      setOrdensServico(prev =>
        prev.map(ordem =>
          ordem.id === selectedOS.id
            ? { ...ordem, ...updateData }
            : ordem
        )
      )

      setShowConcluirModal(false)
      setSelectedOS(null)
      setDescricaoResolucao("")

    } catch (error) {
      console.error("Erro ao concluir OS:", error)
      alert("Erro ao concluir ordem de serviço. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Não informado"

    // Se a data já está no formato brasileiro, retorna como está
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString
    }

    // Handle Firebase timestamp format
    if (dateString && typeof dateString === 'object' && dateString.seconds) {
      return new Date(dateString.seconds * 1000).toLocaleDateString('pt-BR')
    }

    // Handle ISO string format (YYYY-MM-DDTHH:MM:SS...)
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR')
    }

    // Handle date string in format YYYY-MM-DD
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('pt-BR')
    }

    // Tenta converter qualquer outro formato
    try {
      if (typeof dateString === 'number') {
        return new Date(dateString).toLocaleDateString('pt-BR')
      }

      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return date.toLocaleDateString('pt-BR')
    } catch (e) {
      return 'Data inválida'
    }
  }

  // Componente de estatísticas melhorado
  const StatsCard = ({ title, value, icon: Icon, gradient, textColor = "text-white" }) => (
    <div className={`${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  )

  // Card compacto da ordem de serviço
  const OrdemServicoCardCompact = ({ ordem }) => {
    const isAberta = ordem.status === "aberto"
    const prioridade = ordem.prioridade || 'media'

    const getPrioridadeColor = (prioridade) => {
      switch (prioridade) {
        case 'alta': return 'bg-red-100 text-red-700 border-red-200'
        case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        case 'baixa': return 'bg-green-100 text-green-700 border-green-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
      }
    }

    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
        onClick={() => {
          setSelectedOS(ordem)
          setShowDetalhesModal(true)
        }}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 w-1 h-full ${isAberta ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`} />
        
        {/* Ícone de seta indicativo */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-300 group-hover:text-gray-400 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-lg ${isAberta ? 'bg-green-50' : 'bg-red-50'}`}>
              {isAberta ? (
                <Clock className="w-5 h-5 text-green-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">OS #{ordem.id.slice(-6)}</h3>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isAberta
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                {isAberta ? 'Em Andamento' : 'Concluída'}
              </span>
            </div>
          </div>

          <div className="w-4"></div>
        </div>

        {/* Informações principais */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Settings className="w-4 h-4 mr-3 text-gray-400" />
            <span className="font-medium text-gray-900">{ordem.equipamento || 'Equipamento não informado'}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <span>{formatDate(ordem.data)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-3 text-gray-400" />
            <span>{ordem.operador || 'Não informado'}</span>
          </div>
        </div>

        {/* Action button for open orders */}
        {isAberta && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedOS(ordem)
              setShowConcluirModal(true)
            }}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 flex items-center space-x-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Concluir</span>
          </button>
        )}
      </div>
    )
  }

  // Estado para armazenar o nome do usuário que fechou a OS
  const [fechadoPorNome, setFechadoPorNome] = useState('')

  // Efeito para buscar o nome quando o modal é aberto
  useEffect(() => {
    const loadUserName = async () => {
      if (selectedOS?.conclusao?.userIdFechamento && selectedOS?.idPropriedade) {
        const nome = await fetchUserName(selectedOS.conclusao.userIdFechamento, selectedOS.idPropriedade)
        setFechadoPorNome(nome || `ID: ${selectedOS.conclusao.userIdFechamento}`)
      } else if (selectedOS?.conclusao?.userIdFechamento) {
        setFechadoPorNome(`ID: ${selectedOS.conclusao.userIdFechamento}`)
      } else {
        setFechadoPorNome('Usuário não identificado')
      }
    }

    if (selectedOS) {
      loadUserName()
    }
  }, [selectedOS, usersCache])

  // Modal de detalhes
  const DetalhesModal = () => {
    if (!selectedOS) return null
    const isAberta = selectedOS.status === "aberto"

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`${isAberta ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {isAberta ? (
                    <Clock className="w-6 h-6" />
                  ) : (
                    <CheckCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">OS #{selectedOS.id.slice(-6)}</h2>
                  <p className="text-white/90">{isAberta ? 'Em Andamento' : 'Concluída'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetalhesModal(false)
                  setSelectedOS(null)
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Data</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatDate(selectedOS.data)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Equipamento</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedOS.equipamento || 'Não informado'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Operador</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedOS.operador || 'Não informado'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Propriedade</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedOS.propriedade || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Descrição do problema */}
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Descrição do Problema</h3>
                </div>
                <p className="text-red-800">{selectedOS.descricaoProblema || 'Não informado'}</p>
              </div>
            </div>

            {/* Resolução (apenas para ordens fechadas) */}
            {!isAberta && selectedOS.conclusao && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Resolução</h3>
                </div>
                <p className="text-green-800 mb-3 whitespace-pre-line">
                  {selectedOS.conclusao.descricaoServico || selectedOS.conclusao.descricaoResolucao || 'Nenhuma descrição fornecida'}
                </p>
                <div className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                  Concluído em {formatDate(selectedOS.conclusao.dataFechamento)} por {fechadoPorNome}
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {isAberta && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <button
                onClick={() => {
                  setShowDetalhesModal(false)
                  setShowConcluirModal(true)
                }}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Concluir Ordem de Serviço</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderMecanico activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12">
        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-bold text-green-700 mb-3 pt-4">
            Ordens de Serviço
          </h1>
          <p className="text-gray-600 text-lg">
            Olá, <span className="font-semibold text-green-700">
              {userData?.nome || userData?.name || user?.email?.split("@")[0]}
            </span>! Gerencie suas ordens de serviço
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard
            title="Ordens Abertas"
            value={ordensAbertas.length}
            icon={Clock}
            gradient="bg-green-500"
          />
          <StatsCard
            title="Ordens Concluídas"
            value={ordensFechadas.length}
            icon={CheckCircle}
            gradient="bg-red-500"
          />
          <StatsCard
            title="Total de Ordens"
            value={ordensServico.length}
            icon={BarChart3}
            gradient="bg-orange-400"
          />
          <StatsCard
            title="Taxa de Conclusão"
            value={ordensServico.length > 0 ? `${Math.round((ordensFechadas.length / ordensServico.length) * 100)}%` : "0%"}
            icon={TrendingUp}
            gradient="bg-purple-500"
          />
        </div>

        {/* Filtros - Em Aberto/Concluídas */}
        <div className="w-full mb-6">
          <div className="flex w-full bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab("aberto")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-bold rounded-full transition-all ${activeTab === "aberto"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Em Aberto ({ordensAbertas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("fechado")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-bold rounded-full transition-all ${activeTab === "fechado"
                  ? "bg-red-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluídas ({ordensFechadas.length})</span>
            </button>
          </div>
        </div>

        {/* Barra de busca e ordenação lado a lado */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-4">
          {/* Barra de busca */}
          <div className="relative w-full md:w-3/4 lg:w-4/5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por equipamento, problema ou operador..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Ordenação */}
          <div className="w-full md:w-auto flex items-center justify-end space-x-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Ordenar:</span>
            <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => setSortOrder('recentes')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${sortOrder === 'recentes'
                    ? activeTab === 'fechado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Recentes
              </button>
              <button
                onClick={() => setSortOrder('antigas')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${sortOrder === 'antigas'
                    ? activeTab === 'fechado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Antigas
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredOrdens.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            {searchTerm ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 mb-6">Não encontramos ordens que correspondam à sua busca.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Limpar busca
                </button>
              </>
            ) : activeTab === "aberto" ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma ordem em aberto</h3>
                <p className="text-gray-600">Todas as ordens de serviço foram concluídas.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma ordem concluída</h3>
                <p className="text-gray-600">As ordens finalizadas aparecerão aqui.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrdens.map((ordem) => (
              <OrdemServicoCardCompact key={ordem.id} ordem={ordem} />
            ))}
          </div>
        )}
      </main>

      {/* Modal de detalhes */}
      {showDetalhesModal && <DetalhesModal />}

      {/* Modal para concluir OS */}
      {showConcluirModal && selectedOS && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Concluir OS #{selectedOS.id.slice(-6)}</h3>
                    <p className="text-green-100">Finalize esta ordem de serviço</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowConcluirModal(false)
                    setSelectedOS(null)
                    setDescricaoResolucao("")
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Equipamento:</span>
                    <span className="text-gray-900 ml-2">{selectedOS.equipamento}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Problema:</span>
                    <span className="text-gray-900 ml-2">{selectedOS.descricaoProblema}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="resolucao" className="block text-sm font-semibold text-gray-700 mb-3">
                  Como o problema foi resolvido? *
                </label>
                <textarea
                  id="resolucao"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Descreva detalhadamente a solução aplicada, peças substituídas, ajustes realizados..."
                  value={descricaoResolucao}
                  onChange={(e) => setDescricaoResolucao(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Esta informação será importante para futuras consultas e manutenções.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConcluirModal(false)
                    setSelectedOS(null)
                    setDescricaoResolucao("")
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleConcluirOS}
                  disabled={!descricaoResolucao.trim() || isSubmitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finalizando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Save className="w-4 h-4 mr-2" />
                      Concluir Ordem
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MecanicoComponent