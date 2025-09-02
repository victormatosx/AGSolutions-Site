"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, database } from "../firebase/firebase"
import { ref, get, push, set, onValue, update, off } from "firebase/database"
import {
  Calendar,
  Users,
  Tractor,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  CheckCircle,
  AlertCircle,
  Activity,
  Clock,
  FileText,
  Loader2,
  Bell,
  BellRing,
} from "lucide-react"
import jsPDF from "jspdf"

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

  // Estados para notificações
  const [notification, setNotification] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [alertas, setAlertas] = useState([])

  // Função para mostrar notificação
  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Verificar se usuário está autenticado antes de carregar dados
  useEffect(() => {
    if (loading) return // Ainda carregando estado de auth

    if (!user) {
      setIsLoading(false)
      return // ProtectedRoute vai lidar com o redirecionamento
    }

    // Usuário autenticado, carregar dados
    const loadData = async () => {
      const propriedadeNome = await getPropriedadeNome(user)
      if (propriedadeNome) {
        setCurrentPropriedadeNome(propriedadeNome)
        const data = await fetchAllData(propriedadeNome, currentViewMode)
        setCurrentCalendarData(data)
      }
      setIsLoading(false)
    }

    loadData()
  }, [user, loading, currentViewMode])

  useEffect(() => {
    if (user) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        checkHourAlerts()
      }, 500)

      return () => {
        clearTimeout(timeoutId)
        // Clean up Firebase listeners on unmount
        const apontamentosRef = ref(database, "propriedades/Matrice/apontamentos")
        off(apontamentosRef)
      }
    }
  }, [user])

  const checkHourAlerts = useCallback(() => {
    if (!user) return

    try {
      const apontamentosRef = ref(database, "propriedades/Matrice/apontamentos")

      // Use off() to remove any existing listeners before adding a new one
      off(apontamentosRef)

      onValue(apontamentosRef, (snapshot) => {
        const apontamentosData = snapshot.val()
        if (!apontamentosData) return

        const alertasEncontrados = []
        const existingAlertIds = new Set()

        // First, collect all existing alert IDs to prevent duplicates
        alertas.forEach((alert) => existingAlertIds.add(alert.id))

        Object.keys(apontamentosData).forEach((key) => {
          const apontamento = apontamentosData[key]

          // Skip if alert is already marked as sent
          if (apontamento.alertaEnviado === true) return

          // Check if any operation has more than 10 hours
          if (apontamento.operacoesMecanizadas) {
            apontamento.operacoesMecanizadas.forEach((operacao, index) => {
              const alertId = `${key}-${index}`
              const totalHoras = Number.parseFloat(operacao.totalHoras) || 0

              if (totalHoras > 10.0) {
                // Skip if we already have this alert
                if (existingAlertIds.has(alertId)) return

                const newAlert = {
                  id: alertId,
                  apontamentoId: key,
                  operacaoIndex: index,
                  totalHoras: totalHoras,
                  bem: operacao.bem || "Não informado",
                  data: apontamento.data || "Data não informada",
                  responsavel: getUserName(apontamento.userId),
                  timestamp: Date.now(),
                }

                alertasEncontrados.push(newAlert)
                existingAlertIds.add(alertId)

                // Mark as waiting to prevent duplicate processing
                if (!apontamento.alertaEnviado) {
                  const apontamentoRef = ref(database, `propriedades/Matrice/apontamentos/${key}`)
                  update(apontamentoRef, { alertaEnviado: "waiting" })
                }
              }
            })
          }
        })

        // Only update state if we have new alerts
        if (alertasEncontrados.length > 0) {
          setAlertas((prev) => {
            // Double-check for duplicates before adding
            const newAlerts = alertasEncontrados.filter(
              (newAlert) => !prev.some((existingAlert) => existingAlert.id === newAlert.id),
            )
            return [...prev, ...newAlerts]
          })
        }
      })
    } catch (error) {
      console.error("Erro ao verificar alertas de horas:", error)
    }
  }, [user, alertas]) // Enhanced useCallback with dependencies to prevent unnecessary re-executions

  // Função para gerar PDF com layout profissional
  const generatePDF = async () => {
    if (!user) {
      showNotification("error", "Você precisa estar logado para gerar relatórios")
      return
    }

    try {
      setIsGeneratingPDF(true)

      // Verificar se há dados para gerar o relatório
      if (!currentCalendarData.entities || currentCalendarData.entities.length === 0) {
        showNotification("error", "Não há dados disponíveis para gerar o relatório")
        return
      }

      // Criar documento PDF em formato paisagem
      const doc = new jsPDF("landscape", "mm", "a4")
      const weekDays = getWeekDays(currentReferenceDate)
      const startDate = weekDays[0].formattedDate
      const endDate = weekDays[6].formattedDate

      // Configurar fonte
      doc.setFont("helvetica")

      // === CABEÇALHO PRINCIPAL ===
      doc.setFontSize(18)
      doc.setTextColor(46, 54, 49) // Verde escuro
      const title = `Relatório de Atividades Semanais - ${currentViewMode === "operadores" ? "Operadores" : "Máquinas"}`
      doc.text(title, 148, 20, { align: "center" })

      // Subtítulos
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Período: ${startDate} a ${endDate}`, 148, 30, { align: "center" })
      doc.text(`Propriedade: ${currentPropriedadeNome}`, 148, 38, { align: "center" })
      doc.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        148,
        46,
        { align: "center" },
      )

      // Linha separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 52, 277, 52)

      // === LEGENDA ===
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text("Legenda:", 20, 62)

      const legendY = 68

      // Círculos da legenda com cores
      doc.setFillColor(16, 185, 129) // Verde
      doc.circle(25, legendY, 2, "F")
      doc.text("Apontamento Realizado", 30, legendY + 1)

      doc.setFillColor(59, 130, 246) // Azul
      doc.circle(85, legendY, 2, "F")
      doc.text("Justificado", 90, legendY + 1)

      doc.setFillColor(239, 68, 68) // Vermelho
      doc.circle(125, legendY, 2, "F")
      doc.text("Sem Apontamento", 130, legendY + 1)

      doc.setFillColor(148, 163, 184) // Cinza
      doc.circle(185, legendY, 2, "F")
      doc.text("Data Futura", 190, legendY + 1)

      // === TABELA ===
      let currentY = 80
      const rowHeight = 8
      const colWidths = [60, 31, 31, 31, 31, 31, 31, 31] // Larguras das colunas
      let colX = 20

      // Cabeçalho da tabela
      doc.setFillColor(248, 250, 252)
      doc.rect(20, currentY, 257, rowHeight, "F")

      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      doc.setFont("helvetica", "bold")

      // Nome da coluna principal
      doc.text(currentViewMode === "operadores" ? "OPERADOR" : "MÁQUINA", 22, currentY + 5)
      colX = 80

      // Cabeçalhos dos dias
      weekDays.forEach((day) => {
        doc.text(day.name.substring(0, 3), colX + 2, currentY + 2)
        doc.text(day.formattedDate, colX + 2, currentY + 6)
        colX += 31
      })

      currentY += rowHeight

      // === DADOS DA TABELA ===
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)

      const today = new Date()
      let totalActivities = 0
      let totalJustificativas = 0
      let totalMissing = 0
      let totalPossibleActivities = 0

      currentCalendarData.entities.forEach((entity, index) => {
        // Alternar cor de fundo das linhas
        if (index % 2 === 0) {
          doc.setFillColor(255, 255, 255)
        } else {
          doc.setFillColor(248, 250, 252)
        }
        doc.rect(20, currentY, 257, rowHeight, "F")

        // Nome da entidade
        doc.setTextColor(30, 41, 59)
        const entityName = entity.nome.length > 25 ? entity.nome.substring(0, 22) + "..." : entity.nome
        doc.text(entityName, 22, currentY + 5)

        // Status para cada dia
        colX = 80
        weekDays.forEach((day) => {
          const dateKey = formatDateKey(day.date)
          const isFutureDate = day.date > today
          const hasActivity =
            currentCalendarData.activities[entity.id] && currentCalendarData.activities[entity.id][dateKey]
          const hasJustificativa =
            currentCalendarData.justificativas[entity.id] && currentCalendarData.justificativas[entity.id][dateKey]

          const centerX = colX + 15.5
          const centerY = currentY + 4

          if (isFutureDate) {
            // Data futura (cinza)
            doc.setFillColor(148, 163, 184)
            doc.circle(centerX, centerY, 3, "F")
            doc.setTextColor(255, 255, 255)
            doc.text("-", centerX - 1, centerY + 1)
          } else {
            totalPossibleActivities++
            if (hasActivity) {
              // Atividade realizada (verde)
              doc.setFillColor(16, 185, 129)
              doc.circle(centerX, centerY, 3, "F")
              doc.setTextColor(255, 255, 255)
              doc.text("✓", centerX - 1.5, centerY + 1)
              totalActivities++
            } else if (hasJustificativa) {
              // Justificado (azul)
              doc.setFillColor(59, 130, 246)
              doc.circle(centerX, centerY, 3, "F")
              doc.setTextColor(255, 255, 255)
              doc.text("J", centerX - 1, centerY + 1)
              totalJustificativas++
            } else {
              // Sem apontamento (vermelho)
              doc.setFillColor(239, 68, 68)
              doc.circle(centerX, centerY, 3, "F")
              doc.setTextColor(255, 255, 255)
              doc.text("✗", centerX - 1.5, centerY + 1)
              totalMissing++
            }
          }

          colX += 31
        })

        currentY += rowHeight

        // Verificar se precisa de nova página
        if (currentY > 180) {
          doc.addPage()
          currentY = 20

          // Repetir cabeçalho na nova página
          doc.setFillColor(248, 250, 252)
          doc.rect(20, currentY, 257, rowHeight, "F")

          doc.setFontSize(9)
          doc.setTextColor(30, 41, 59)
          doc.setFont("helvetica", "bold")

          doc.text(currentViewMode === "operadores" ? "OPERADOR" : "MÁQUINA", 22, currentY + 5)
          colX = 80

          weekDays.forEach((day) => {
            doc.text(day.name.substring(0, 3), colX + 2, currentY + 2)
            doc.text(day.formattedDate, colX + 2, currentY + 6)
            colX += 31
          })

          currentY += rowHeight
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
        }
      })

      // === RESUMO ESTATÍSTICO ===
      currentY += 10
      if (currentY > 170) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(46, 54, 49)
      doc.text("Resumo Estatístico", 20, currentY)

      currentY += 10
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(80, 80, 80)

      // Calcular percentuais
      const totalEntities = currentCalendarData.entities.length
      const totalDays = weekDays.filter((day) => day.date <= today).length
      const activityPercentage =
        totalPossibleActivities > 0 ? ((totalActivities / totalPossibleActivities) * 100).toFixed(1) : 0
      const justifiedPercentage =
        totalPossibleActivities > 0 ? ((totalJustificativas / totalPossibleActivities) * 100).toFixed(1) : 0
      const missingPercentage =
        totalPossibleActivities > 0 ? ((totalMissing / totalPossibleActivities) * 100).toFixed(1) : 0

      // Estatísticas detalhadas
      doc.text(`Total de ${currentViewMode}: ${totalEntities}`, 20, currentY)
      currentY += 6
      doc.text(`Dias analisados: ${totalDays}`, 20, currentY)
      currentY += 6
      doc.text(`Total de atividades possíveis: ${totalPossibleActivities}`, 20, currentY)
      currentY += 8
      doc.text(`Apontamentos realizados: ${totalActivities} (${activityPercentage}%)`, 20, currentY)
      currentY += 6
      doc.text(`Justificativas: ${totalJustificativas} (${justifiedPercentage}%)`, 20, currentY)
      currentY += 6
      doc.text(`Sem apontamento: ${totalMissing} (${missingPercentage}%)`, 20, currentY)

      // === ANÁLISE DE PERFORMANCE ===
      currentY += 15
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(46, 54, 49)
      doc.text("Análise de Performance", 20, currentY)

      currentY += 10
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(80, 80, 80)

      const performanceScore =
        totalPossibleActivities > 0 ? ((totalActivities + totalJustificativas) / totalPossibleActivities) * 100 : 0
      let performanceStatus = ""
      let performanceColor = [0, 0, 0]

      if (performanceScore >= 90) {
        performanceStatus = "Excelente"
        performanceColor = [16, 185, 129]
      } else if (performanceScore >= 75) {
        performanceStatus = "Bom"
        performanceColor = [59, 130, 246]
      } else if (performanceScore >= 60) {
        performanceStatus = "Regular"
        performanceColor = [245, 158, 11]
      } else {
        performanceStatus = "Necessita Atenção"
        performanceColor = [239, 68, 68]
      }

      doc.setTextColor(...performanceColor)
      doc.text(`Score de Performance: ${performanceScore.toFixed(1)}% - ${performanceStatus}`, 20, currentY)

      // === RODAPÉ ===
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Relatório gerado automaticamente pelo sistema em ${new Date().toLocaleString("pt-BR")}`,
        20,
        pageHeight - 10,
      )
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, 260, pageHeight - 10)

      // Salvar PDF
      const fileName = `relatorio_atividades_${currentViewMode}_${startDate.replace(/\//g, "-")}_a_${endDate.replace(/\//g, "-")}.pdf`
      doc.save(fileName)

      showNotification("success", "Relatório PDF gerado com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      showNotification("error", "Erro ao gerar o relatório PDF. Tente novamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
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

  // Função para alternar modo de visualização
  const switchViewMode = async (newMode) => {
    if (newMode === currentViewMode || !user) return

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
    if (!user) return

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
    if (!user) return

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
    if (!user) {
      showNotification("error", "Você precisa estar logado para realizar esta ação.")
      return
    }

    if (!justificativaText.trim()) {
      showNotification("error", "Por favor, digite uma justificativa.")
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
      showNotification("success", "Justificativa salva com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar justificativa:", error)
      showNotification("error", `Erro ao salvar justificativa: ${error.message}`)
    }
  }

  const getUserName = (userId) => {
    // This would need to be implemented based on your user data structure
    return "Usuário"
  }

  const clearAlert = (alertId) => {
    setAlertas((prev) => {
      const updatedAlerts = prev.filter((alert) => {
        if (alert.id === alertId) {
          // Update the alert status in Firebase when dismissed
          const apontamentoRef = ref(database, `propriedades/Matrice/apontamentos/${alert.apontamentoId}`)
          update(apontamentoRef, { alertaEnviado: true })
          return false
        }
        return true
      })
      return updatedAlerts
    })
  }

  const clearAllAlerts = () => {
    // Update all alerts in Firebase when clearing all
    alertas.forEach((alert) => {
      const apontamentoRef = ref(database, `propriedades/Matrice/apontamentos/${alert.apontamentoId}`)
      update(apontamentoRef, { alertaEnviado: true })
    })
    setAlertas([])
  }

  // Renderizar calendário
  const renderCalendar = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Carregando dados do calendário</h3>
            <p className="text-slate-500">Aguarde enquanto buscamos as informações...</p>
          </div>
        </div>
      )
    }

    if (currentCalendarData.entities.length === 0) {
      const entityType = currentViewMode === "operadores" ? "usuários operacionais" : "máquinas"

      return (
        <div className="calendar-empty">
          <div className="empty-illustration">
            {currentViewMode === "operadores" ? (
              <Users size={64} className="empty-icon" />
            ) : (
              <Tractor size={64} className="empty-icon" />
            )}
          </div>
          <div className="empty-content">
            <h3>Nenhum {entityType} encontrado</h3>
            <p>
              Não há {entityType}{" "}
              {currentViewMode === "operadores" ? "cadastrados no sistema" : "registrados no sistema"} para exibir no
              calendário.
            </p>
          </div>
        </div>
      )
    }

    const weekDays = getWeekDays(currentReferenceDate)
    const today = new Date()
    const todayFormatted = formatDateKey(today)

    return (
      <div className="calendar-body">
        <div className="calendar-table-container">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="entity-column">
                  <div className="th-content">
                    <div className="entity-header-icon">
                      {currentViewMode === "operadores" ? <Users size={20} /> : <Tractor size={20} />}
                    </div>
                    <span className="entity-header-text">
                      {currentViewMode === "operadores" ? "OPERADORES" : "MÁQUINAS"}
                    </span>
                  </div>
                </th>
                {weekDays.map((day, index) => {
                  const isToday = formatDateKey(day.date) === todayFormatted
                  return (
                    <th key={index} className={`day-column ${isToday ? "today-column" : ""}`}>
                      <div className={`day-header ${isToday ? "today" : ""}`}>
                        <span className="day-name">{day.name}</span>
                        <span className="day-date">{day.formattedDate}</span>
                        {isToday && <div className="today-indicator"></div>}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {currentCalendarData.entities.map((entity, entityIndex) => (
                <tr key={entity.id} className="entity-row">
                  <td className="entity-name">
                    <div className="entity-info">
                      <div className="entity-avatar">
                        {currentViewMode === "operadores" ? <Users size={18} /> : <Tractor size={18} />}
                      </div>
                      <div className="entity-details">
                        <span className="entity-name-text">{entity.nome}</span>
                        <span className="entity-type">{entity.type}</span>
                      </div>
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
                      <td key={dayIndex} className={`activity-cell ${isToday ? "today-cell" : ""}`}>
                        {isFutureDate ? (
                          <div className="activity-indicator future" title="Data Futura">
                            <Clock size={16} />
                            <span className="indicator-label">Futuro</span>
                          </div>
                        ) : hasActivity ? (
                          <div className="activity-indicator active" title="Apontamento Realizado">
                            <Check size={16} />
                            <span className="indicator-label">Realizado</span>
                          </div>
                        ) : hasJustificativa ? (
                          <div className="activity-indicator justified" title={`Justificado: ${justificativaText}`}>
                            <FileText size={16} />
                            <span className="indicator-label">Justificado</span>
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
                            <span className="indicator-label">Sem Registro</span>
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
      </div>
    )
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Carregando Dashboard</h3>
          <p className="text-slate-500">Aguarde enquanto preparamos tudo para você...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="dashboard-unauthorized">
        <div className="unauthorized-content">
          <div className="unauthorized-icon">
            <Activity size={64} />
          </div>
          <h3>Acesso Restrito</h3>
          <p>Faça login para acessar o dashboard de atividades</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Sistema de Notificações */}
      {notification && (
        <div className={`notification ${notification.type} notification-enter`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="notification-text">
              <span>{notification.message}</span>
            </div>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="dashboard-wrapper">
        <div className="dashboard-content">
          {/* Header Principal */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-title">
                <div className="title-icon">
                  <Calendar size={32} />
                </div>
                <div className="title-text">
                  <h1>Dashboard de Atividades</h1>
                  <p>Acompanhe o desempenho semanal da sua equipe</p>
                </div>
              </div>
              <div className="header-actions">
                <div className="stats-summary">
                  <div className="stat-item">
                    <Activity size={16} />
                    <span>
                      {currentCalendarData.entities.length} {currentViewMode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: alertas.length > 0 ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "#f1f5f9",
                    border: alertas.length > 0 ? "1px solid #dc2626" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    color: alertas.length > 0 ? "white" : "#64748b",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: alertas.length > 0 ? "0 0 20px rgba(239, 68, 68, 0.3)" : "none",
                    animation: alertas.length > 0 ? "pulse 2s infinite" : "none",
                  }}
                  title="Ver Notificações"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {alertas.length > 0 ? <BellRing size={16} /> : <Bell size={16} />}
                    <span>Alertas</span>
                    {alertas.length > 0 && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          color: "#dc2626",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          minWidth: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {alertas.length}
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={generatePDF}
                  className={`pdf-button ${isGeneratingPDF ? "generating" : ""}`}
                  disabled={isGeneratingPDF}
                  title="Gerar Relatório PDF"
                >
                  <div className="button-content">
                    {isGeneratingPDF ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span>{isGeneratingPDF ? "Gerando..." : "Gerar PDF"}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="legend-container">
            <div className="legend-content">
              <h3>Legenda</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-dot active"></div>
                  <span>Apontamento Realizado</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot justified"></div>
                  <span>Justificado</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot inactive"></div>
                  <span>Sem Apontamento</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot future"></div>
                  <span>Data Futura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de Visualização */}
          <div className="view-mode-container">
            <div className="view-mode-tabs">
              <button
                className={`view-mode-tab ${currentViewMode === "operadores" ? "active" : ""}`}
                onClick={() => switchViewMode("operadores")}
              >
                <Users size={20} />
                <span>Operadores</span>
                <div className="tab-indicator"></div>
              </button>
              <button
                className={`view-mode-tab ${currentViewMode === "maquinas" ? "active" : ""}`}
                onClick={() => switchViewMode("maquinas")}
              >
                <Tractor size={20} />
                <span>Máquinas</span>
                <div className="tab-indicator"></div>
              </button>
            </div>
          </div>

          {/* Navegação do Calendário */}
          <div className="calendar-navigation">
            <button className="nav-button prev" onClick={() => navigateToWeek(-1)}>
              <ChevronLeft size={18} />
              <span>Semana Anterior</span>
            </button>
            <button className="nav-button current" onClick={navigateToCurrentWeek}>
              <CalendarDays size={18} />
              <span>Semana Atual</span>
            </button>
            <button className="nav-button next" onClick={() => navigateToWeek(1)}>
              <span>Próxima Semana</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendário */}
          <div className="calendar-container">{renderCalendar()}</div>
        </div>
      </div>

      {showNotifications && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNotifications(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                Alertas de Horas Excedidas
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {alertas.length > 0 && (
                  <button
                    onClick={clearAllAlerts}
                    style={{
                      padding: "6px 12px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Limpar Todos
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{
                    padding: "6px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div
              style={{
                maxHeight: "calc(80vh - 80px)",
                overflowY: "auto",
              }}
            >
              {alertas.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 24px",
                    color: "#64748b",
                  }}
                >
                  <Bell size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <p>Nenhum alerta de horas excedidas</p>
                </div>
              ) : (
                <div style={{ padding: "16px" }}>
                  {alertas
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map((alerta) => (
                      <div
                        key={alerta.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "16px",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ flexShrink: 0, marginTop: "2px" }}>
                          <AlertCircle size={20} style={{ color: "#dc2626" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#dc2626",
                              marginBottom: "8px",
                              fontSize: "14px",
                            }}
                          >
                            Horas Excedidas: {alerta.totalHoras}h
                          </div>
                          <div
                            style={{
                              color: "#374151",
                              fontSize: "13px",
                              lineHeight: "1.4",
                            }}
                          >
                            <p style={{ margin: "4px 0" }}>
                              <strong>Bem:</strong> {alerta.bem}
                            </p>
                            <p style={{ margin: "4px 0" }}>
                              <strong>Data:</strong> {alerta.data}
                            </p>
                            <p style={{ margin: "4px 0" }}>
                              <strong>Responsável:</strong> {alerta.responsavel}
                            </p>
                          </div>
                          {alerta.timestamp && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                marginTop: "8px",
                                fontStyle: "italic",
                              }}
                            >
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => clearAlert(alerta.id)}
                          style={{
                            flexShrink: 0,
                            padding: "4px",
                            background: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#6b7280",
                          }}
                          title="Remover alerta"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
