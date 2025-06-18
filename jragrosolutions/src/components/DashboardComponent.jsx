"use client"

import { useState, useEffect } from "react"
import { database } from "../firebase/firebase"
import { ref, get, push, set } from "firebase/database"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { Calendar, Users, Tractor, Check, X, ChevronLeft, ChevronRight, CalendarDays, Download } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

const Dashboard = () => {
  // Estados principais
  const [user, loading, error] = useAuthState(auth)
  const [currentReferenceDate, setCurrentReferenceDate] = useState(new Date())
  const [currentPropriedadeNome, setCurrentPropriedadeNome] = useState("")
  const [currentViewMode, setCurrentViewMode] = useState("operadores")
  const [currentCalendarData, setCurrentCalendarData] = useState({ entities: [], activities: {}, justificativas: {} })
  const [isLoading, setIsLoading] = useState(true)
  const [showJustificativaModal, setShowJustificativaModal] = useState(false)
  const [selectedJustificativa, setSelectedJustificativa] = useState(null)
  const [justificativaText, setJustificativaText] = useState("")

  // Função para gerar PDF
  const generatePDF = () => {
    const doc = new jsPDF()
    const weekDays = getWeekDays(currentReferenceDate)

    // Título
    doc.setFontSize(16)
    doc.text("Relatório Semanal de Atividades", 20, 20)

    // Informações do período
    doc.setFontSize(12)
    const startDate = weekDays[0].formattedDate
    const endDate = weekDays[6].formattedDate
    doc.text(`Período: ${startDate} a ${endDate}`, 20, 35)
    doc.text(`Modo de visualização: ${currentViewMode === "operadores" ? "Operadores" : "Máquinas"}`, 20, 45)

    // Preparar dados para a tabela
    const tableData = []
    const headers = ["Nome", ...weekDays.map((day) => day.name.substring(0, 3))]

    currentCalendarData.entities.forEach((entity) => {
      const row = [entity.nome]
      weekDays.forEach((day) => {
        const dateKey = formatDateKey(day.date)
        const hasActivity =
          currentCalendarData.activities[entity.id] && currentCalendarData.activities[entity.id][dateKey]
        const hasJustificativa =
          currentCalendarData.justificativas[entity.id] && currentCalendarData.justificativas[entity.id][dateKey]
        const isFutureDate = day.date > new Date()

        if (isFutureDate) {
          row.push("-")
        } else if (hasActivity) {
          row.push("✓")
        } else if (hasJustificativa) {
          row.push("J")
        } else {
          row.push("✗")
        }
      })
      tableData.push(row)
    })

    // Adicionar tabela
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 54, 49] },
    })

    // Legenda
    const finalY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(10)
    doc.text("Legenda:", 20, finalY)
    doc.text("✓ - Apontamento Realizado", 20, finalY + 10)
    doc.text("J - Justificado", 20, finalY + 20)
    doc.text("✗ - Sem Apontamento", 20, finalY + 30)
    doc.text("- - Data Futura", 20, finalY + 40)

    // Salvar PDF
    const fileName = `relatorio_${currentViewMode}_${startDate.replace(/\//g, "-")}_${endDate.replace(/\//g, "-")}.pdf`
    doc.save(fileName)
  }

  // Função para obter os dias da semana
  const getWeekDays = (referenceDate) => {
    const days = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"]
    const currentDay = referenceDate.getDay()
    const sunday = new Date(referenceDate)
    sunday.setDate(referenceDate.getDate() - currentDay)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      const formattedDate = `${day.getDate().toString().padStart(2, "0")}/${(day.getMonth() + 1).toString().padStart(2, "0")}`

      weekDays.push({
        name: days[i],
        date: day,
        formattedDate: formattedDate,
      })
    }
    return weekDays
  }

  // Função para converter data brasileira
  const parseBrazilianDate = (dateString) => {
    if (!dateString) return null
    try {
      const parts = dateString.split("/")
      if (parts.length === 3) {
        const day = Number.parseInt(parts[0], 10)
        const month = Number.parseInt(parts[1], 10) - 1
        const year = Number.parseInt(parts[2], 10)
        return new Date(year, month, day)
      }
      return null
    } catch (error) {
      console.error("Erro ao converter data:", error, dateString)
      return null
    }
  }

  // Função para formatar data como chave
  const formatDateKey = (date) => {
    if (!date) return null
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
  }

  // Função para buscar todas as máquinas
  const fetchAllMaquinas = async (propriedadeNome) => {
    try {
      const maquinas = []
      const maquinasSet = new Set()

      // Buscar máquinas dos apontamentos
      const apontamentosRef = ref(database, `propriedades/${propriedadeNome}/apontamentos`)
      const apontamentosSnapshot = await get(apontamentosRef)

      if (apontamentosSnapshot.exists()) {
        const apontamentos = apontamentosSnapshot.val()
        for (const apontamentoId in apontamentos) {
          const apontamento = apontamentos[apontamentoId]
          if (apontamento.operacoesMecanizadas) {
            for (const operacaoId in apontamento.operacoesMecanizadas) {
              const operacao = apontamento.operacoesMecanizadas[operacaoId]
              if (operacao.bem) {
                maquinasSet.add(operacao.bem)
              }
            }
          }
        }
      }

      // Buscar máquinas cadastradas
      const maquinariosRef = ref(database, `propriedades/${propriedadeNome}/maquinarios`)
      const maquinariosSnapshot = await get(maquinariosRef)

      if (maquinariosSnapshot.exists()) {
        const maquinariosData = maquinariosSnapshot.val()
        for (const maquinaId in maquinariosData) {
          const maquina = maquinariosData[maquinaId]
          const nomeMaquina = maquina.nome || `Máquina ${maquinaId}`
          maquinas.push({
            id: maquinaId,
            nome: nomeMaquina,
            bemAttachment: nomeMaquina,
          })
          maquinasSet.add(nomeMaquina)
        }
      }

      // Adicionar máquinas dos apontamentos não cadastradas
      const maquinasFromApontamentos = Array.from(maquinasSet)
        .filter((maquinaNome) => !maquinas.some((m) => m.bemAttachment === maquinaNome))
        .map((maquinaNome, index) => ({
          id: `maquina_apontamento_${index}`,
          nome: maquinaNome,
          bemAttachment: maquinaNome,
        }))

      maquinas.push(...maquinasFromApontamentos)
      return maquinas
    } catch (error) {
      console.error("Erro ao buscar máquinas:", error)
      return []
    }
  }

  // Função para buscar todos os dados
  const fetchAllData = async (propriedadeNome, viewMode = "operadores") => {
    try {
      let entities = []
      const activities = {}
      const justificativas = {}

      if (viewMode === "operadores") {
        const usersRef = ref(database, `propriedades/${propriedadeNome}/users`)
        const usersSnapshot = await get(usersRef)

        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val()
          for (const userId in usersData) {
            const userData = usersData[userId]
            if (userData.role === "user") {
              entities.push({
                id: userId,
                nome: userData.nome || "Sem nome",
                type: "operador",
              })
            }
          }
        }
      } else {
        entities = await fetchAllMaquinas(propriedadeNome)
        entities.forEach((maquina) => {
          maquina.type = "maquina"
        })
      }

      entities.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))

      entities.forEach((entity) => {
        activities[entity.id] = {}
        justificativas[entity.id] = {}
      })

      // Processar apontamentos
      const apontamentosRef = ref(database, `propriedades/${propriedadeNome}/apontamentos`)
      const apontamentosSnapshot = await get(apontamentosRef)

      if (apontamentosSnapshot.exists()) {
        const apontamentos = apontamentosSnapshot.val()
        for (const apontamentoId in apontamentos) {
          const apontamento = apontamentos[apontamentoId]
          const itemDate = parseBrazilianDate(apontamento.data)
          if (!itemDate) continue

          const dateKey = formatDateKey(itemDate)

          if (viewMode === "operadores") {
            const userId = apontamento.userId
            if (userId && activities[userId]) {
              activities[userId][dateKey] = true
            }
          } else {
            if (apontamento.operacoesMecanizadas) {
              for (const operacaoId in apontamento.operacoesMecanizadas) {
                const operacao = apontamento.operacoesMecanizadas[operacaoId]
                if (operacao.bem) {
                  const maquina = entities.find((m) => m.bemAttachment === operacao.bem)
                  if (maquina && activities[maquina.id]) {
                    activities[maquina.id][dateKey] = true
                  }
                }
              }
            }
          }
        }
      }

      // Processar outros tipos de dados apenas para operadores
      if (viewMode === "operadores") {
        // Percursos
        const percursosRef = ref(database, `propriedades/${propriedadeNome}/percursos`)
        const percursosSnapshot = await get(percursosRef)
        if (percursosSnapshot.exists()) {
          const percursos = percursosSnapshot.val()
          for (const percursoId in percursos) {
            const percurso = percursos[percursoId]
            const userId = percurso.userId
            if (!userId || !activities[userId]) continue
            const itemDate = parseBrazilianDate(percurso.data)
            if (!itemDate) continue
            const dateKey = formatDateKey(itemDate)
            activities[userId][dateKey] = true
          }
        }

        // Abastecimentos
        const abastecimentosRef = ref(database, `propriedades/${propriedadeNome}/abastecimentos`)
        const abastecimentosSnapshot = await get(abastecimentosRef)
        if (abastecimentosSnapshot.exists()) {
          const abastecimentos = abastecimentosSnapshot.val()
          for (const abastecimentoId in abastecimentos) {
            const abastecimento = abastecimentos[abastecimentoId]
            let userId = abastecimento.userId || abastecimento.operadorId
            if (!userId && abastecimento.operador) {
              userId = typeof abastecimento.operador === "object" ? abastecimento.operador.id : abastecimento.operador
            }
            if (!userId || !activities[userId]) continue

            let itemDate = null
            if (abastecimento.data) {
              itemDate = parseBrazilianDate(abastecimento.data)
            } else if (abastecimento.dataAbastecimento) {
              itemDate = parseBrazilianDate(abastecimento.dataAbastecimento)
            } else if (abastecimento.timestamp) {
              itemDate = new Date(abastecimento.timestamp)
            }
            if (!itemDate) continue

            const dateKey = formatDateKey(itemDate)
            activities[userId][dateKey] = true
          }
        }

        // Abastecimento de veículos
        const abastecimentoVeiculosRef = ref(database, `propriedades/${propriedadeNome}/abastecimentoVeiculos`)
        const abastecimentoVeiculosSnapshot = await get(abastecimentoVeiculosRef)
        if (abastecimentoVeiculosSnapshot.exists()) {
          const abastecimentoVeiculos = abastecimentoVeiculosSnapshot.val()
          for (const abastecimentoId in abastecimentoVeiculos) {
            const abastecimento = abastecimentoVeiculos[abastecimentoId]
            let userId = abastecimento.userId || abastecimento.motorista
            if (!userId && abastecimento.condutor) {
              userId = typeof abastecimento.condutor === "object" ? abastecimento.condutor.id : abastecimento.condutor
            }
            if (!userId || !activities[userId]) continue

            let itemDate = null
            if (abastecimento.data) {
              itemDate = parseBrazilianDate(abastecimento.data)
            } else if (abastecimento.dataAbastecimento) {
              itemDate = parseBrazilianDate(abastecimento.dataAbastecimento)
            } else if (abastecimento.timestamp) {
              itemDate = new Date(abastecimento.timestamp)
            }
            if (!itemDate) continue

            const dateKey = formatDateKey(itemDate)
            activities[userId][dateKey] = true
          }
        }
      }

      // Processar justificativas
      const justificativasRef = ref(database, `propriedades/${propriedadeNome}/justificativas`)
      const justificativasSnapshot = await get(justificativasRef)
      if (justificativasSnapshot.exists()) {
        const justificativasData = justificativasSnapshot.val()
        for (const justificativaId in justificativasData) {
          const justificativa = justificativasData[justificativaId]

          if (justificativa.userId && viewMode === "operadores") {
            const userId = justificativa.userId
            if (!userId || !justificativas[userId]) continue
            const itemDate = parseBrazilianDate(justificativa.data)
            if (!itemDate) continue
            const dateKey = formatDateKey(itemDate)
            justificativas[userId][dateKey] = justificativa.justificativa
          } else if (justificativa.maquinaId && viewMode === "maquinas") {
            const maquinaId = justificativa.maquinaId
            if (!maquinaId || !justificativas[maquinaId]) continue
            const itemDate = parseBrazilianDate(justificativa.data)
            if (!itemDate) continue
            const dateKey = formatDateKey(itemDate)
            justificativas[maquinaId][dateKey] = justificativa.justificativa
          }
        }
      }

      return { entities, activities, justificativas }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      return { entities: [], activities: {}, justificativas: {} }
    }
  }

  // Função para obter nome da propriedade do usuário
  const getPropriedadeNome = async (user) => {
    try {
      if (!user?.email) return null

      const propriedadesRef = ref(database, "propriedades")
      const snapshot = await get(propriedadesRef)

      if (snapshot.exists()) {
        const propriedades = snapshot.val()
        for (const propriedadeNome in propriedades) {
          const propriedade = propriedades[propriedadeNome]
          if (propriedade.users) {
            for (const userId in propriedade.users) {
              const userData = propriedade.users[userId]
              if (userData.email === user.email) {
                return propriedadeNome
              }
            }
          }
        }
      }
      return null
    } catch (error) {
      console.error("Erro ao buscar propriedade:", error)
      return null
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const propriedadeNome = await getPropriedadeNome(user)
        if (propriedadeNome) {
          setCurrentPropriedadeNome(propriedadeNome)
          const data = await fetchAllData(propriedadeNome, currentViewMode)
          setCurrentCalendarData(data)
        }
      }
      setIsLoading(false)
    }

    if (!loading) {
      loadData()
    }
  }, [user, loading, currentViewMode])

  // Função para alternar modo de visualização
  const switchViewMode = async (newMode) => {
    if (newMode === currentViewMode) return

    setIsLoading(true)
    setCurrentViewMode(newMode)

    if (currentPropriedadeNome) {
      const data = await fetchAllData(currentPropriedadeNome, newMode)
      setCurrentCalendarData(data)
    }
    setIsLoading(false)
  }

  // Função para navegar entre semanas
  const navigateToWeek = async (direction) => {
    setIsLoading(true)
    const newDate = new Date(currentReferenceDate)
    newDate.setDate(currentReferenceDate.getDate() + direction * 7)
    setCurrentReferenceDate(newDate)

    if (currentPropriedadeNome) {
      const data = await fetchAllData(currentPropriedadeNome, currentViewMode)
      setCurrentCalendarData(data)
    }
    setIsLoading(false)
  }

  // Função para ir para semana atual
  const navigateToCurrentWeek = async () => {
    setIsLoading(true)
    setCurrentReferenceDate(new Date())

    if (currentPropriedadeNome) {
      const data = await fetchAllData(currentPropriedadeNome, currentViewMode)
      setCurrentCalendarData(data)
    }
    setIsLoading(false)
  }

  // Função para abrir modal de justificativa
  const openJustificativaModal = (entityId, dateKey, entityType) => {
    setSelectedJustificativa({ entityId, dateKey, entityType })
    setJustificativaText("")
    setShowJustificativaModal(true)
  }

  // Função para salvar justificativa
  const salvarJustificativa = async () => {
    if (!justificativaText.trim()) {
      alert("Por favor, digite uma justificativa.")
      return
    }

    try {
      const { entityId, dateKey, entityType } = selectedJustificativa
      const [year, month, day] = dateKey.split("-")
      const dataFormatada = `${day}/${month}/${year}`

      const justificativaData = {
        data: dataFormatada,
        justificativa: justificativaText,
        timestamp: Date.now(),
        status: "justificado",
      }

      if (entityType === "userId") {
        justificativaData.userId = entityId
        justificativaData.tipo = "operador"
      } else {
        justificativaData.maquinaId = entityId
        justificativaData.tipo = "maquina"
      }

      const justificativasRef = ref(database, `propriedades/${currentPropriedadeNome}/justificativas`)
      const newJustificativaRef = push(justificativasRef)
      await set(newJustificativaRef, justificativaData)

      // Atualizar dados locais
      const updatedData = { ...currentCalendarData }
      updatedData.justificativas[entityId][dateKey] = justificativaText
      setCurrentCalendarData(updatedData)

      setShowJustificativaModal(false)
      alert("Justificativa salva com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar justificativa:", error)
      alert(`Erro ao salvar justificativa: ${error.message}`)
    }
  }

  // Renderizar calendário
  const renderCalendar = () => {
    if (isLoading) {
      return (
        <div className="calendar-loading">
          <div className="pulse-loader"></div>
          <p>Carregando dados do calendário...</p>
        </div>
      )
    }

    if (currentCalendarData.entities.length === 0) {
      const entityType = currentViewMode === "operadores" ? "usuários operacionais" : "máquinas"

      return (
        <div className="calendar-empty">
          <div className="empty-icon">
            {currentViewMode === "operadores" ? <Users size={32} /> : <Tractor size={32} />}
          </div>
          <h3>Nenhum {entityType} encontrado</h3>
          <p>
            Não há {entityType} {currentViewMode === "operadores" ? "cadastrados no sistema" : "registrados no sistema"}{" "}
            para exibir no calendário.
          </p>
        </div>
      )
    }

    const weekDays = getWeekDays(currentReferenceDate)
    const today = new Date()
    const todayFormatted = formatDateKey(today)

    return (
      <div className="calendar-body">
        <table className="calendar-table">
          <thead>
            <tr>
              <th className="operator-column">
                <div className="th-content">
                  {currentViewMode === "operadores" ? <Users size={24} /> : <Tractor size={24} />}
                  <span>{currentViewMode === "operadores" ? "OPERADORES" : "MÁQUINAS"}</span>
                </div>
              </th>
              {weekDays.map((day, index) => {
                const isToday = formatDateKey(day.date) === todayFormatted
                return (
                  <th key={index} className={isToday ? "today-column" : ""}>
                    <div className={`day-header ${isToday ? "today" : ""}`}>
                      <span className="day-name">{day.name}</span>
                      <span className="day-date">{day.formattedDate}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {currentCalendarData.entities.map((entity) => (
              <tr key={entity.id}>
                <td className="operator-name">
                  <div className="operator-info">
                    <div className="operator-avatar">
                      {currentViewMode === "operadores" ? <Users size={16} /> : <Tractor size={16} />}
                    </div>
                    <span>{entity.nome}</span>
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => {
                  const dateKey = formatDateKey(day.date)
                  const isToday = dateKey === todayFormatted
                  const isFutureDate = day.date > today
                  const hasActivity =
                    currentCalendarData.activities[entity.id] && currentCalendarData.activities[entity.id][dateKey]
                  const hasJustificativa =
                    currentCalendarData.justificativas[entity.id] &&
                    currentCalendarData.justificativas[entity.id][dateKey]
                  const justificativaText = hasJustificativa
                    ? currentCalendarData.justificativas[entity.id][dateKey]
                    : ""

                  return (
                    <td key={dayIndex} className={isToday ? "today-cell" : ""}>
                      {isFutureDate ? (
                        <div className="activity-indicator future" title="Data Futura">
                          <span>-</span>
                        </div>
                      ) : hasActivity ? (
                        <div className="activity-indicator active" title="Apontamento Realizado">
                          <Check size={16} />
                        </div>
                      ) : hasJustificativa ? (
                        <div className="activity-indicator justified" title={`Justificado: ${justificativaText}`}>
                          <Check size={16} />
                        </div>
                      ) : (
                        <div
                          className="activity-indicator inactive"
                          onClick={() =>
                            openJustificativaModal(
                              entity.id,
                              dateKey,
                              currentViewMode === "operadores" ? "userId" : "maquinaId",
                            )
                          }
                          title="Sem Apontamento - Clique para justificar"
                        >
                          <X size={16} />
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="pulse-loader"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="calendar-empty">
        <h3>Faça login para acessar o dashboard</h3>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="calendar-wrapper">
        <div className="propriedade calendar-modern">
          <div className="calendar-header-modern">
            <div className="calendar-title">
              <Calendar size={32} />
              <h2>Calendário Semanal de Atividades</h2>
            </div>
            <div className="calendar-actions">
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot active"></span>
                  <span>Apontamento Realizado</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot justified"></span>
                  <span>Justificado</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot inactive"></span>
                  <span>Sem Apontamento</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot future"></span>
                  <span>Data Futura</span>
                </div>
              </div>
              <button onClick={generatePDF} className="pdf-button" title="Gerar Relatório PDF">
                <Download size={16} />
                <span>Gerar PDF</span>
              </button>
            </div>
          </div>

          <div className="view-mode-tabs">
            <button
              className={`view-mode-tab ${currentViewMode === "operadores" ? "active" : ""}`}
              onClick={() => switchViewMode("operadores")}
            >
              <Users size={20} />
              <span>Operadores</span>
            </button>
            <button
              className={`view-mode-tab ${currentViewMode === "maquinas" ? "active" : ""}`}
              onClick={() => switchViewMode("maquinas")}
            >
              <Tractor size={20} />
              <span>Máquinas</span>
            </button>
          </div>

          <div className="calendar-navigation">
            <button className="nav-button" onClick={() => navigateToWeek(-1)}>
              <ChevronLeft size={16} />
              <span>Semana Anterior</span>
            </button>
            <button className="nav-button current" onClick={navigateToCurrentWeek}>
              <CalendarDays size={16} />
              <span>Semana Atual</span>
            </button>
            <button className="nav-button" onClick={() => navigateToWeek(1)}>
              <span>Próxima Semana</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {renderCalendar()}
        </div>
      </div>

      {/* Modal de Justificativa */}
      {showJustificativaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {currentViewMode === "operadores"
                  ? "Adicionar Justificativa para Operador"
                  : "Adicionar Justificativa para Máquina"}
              </h3>
              <button className="close-modal" onClick={() => setShowJustificativaModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Informe a justificativa para a ausência de atividade nesta data:</p>
              <textarea
                value={justificativaText}
                onChange={(e) => setJustificativaText(e.target.value)}
                rows="4"
                placeholder="Digite a justificativa aqui..."
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowJustificativaModal(false)}>
                Cancelar
              </button>
              <button className="save-button" onClick={salvarJustificativa}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
