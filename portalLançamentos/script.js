// script.js - Página principal (Dashboard)
import { setupSidebar, setupHeaderButtons, setupAuth, database, ref, get } from "./common.js"

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando dashboard...")
  setupSidebar()
  setupHeaderButtons()
  setupAuth((user, propriedadeNome) => {
    showWeeklyCalendar(propriedadeNome)
  })
})

// Variável global para armazenar a data de referência atual
let currentReferenceDate = new Date()
// Variável global para armazenar o nome da propriedade atual
let currentPropriedadeNome = ""

// Função para obter os dias da semana com base em uma data de referência
function getWeekDays(referenceDate) {
  const days = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"]
  const currentDay = referenceDate.getDay() // 0 = Domingo, 1 = Segunda, etc.

  // Encontrar o domingo desta semana (início da semana)
  const sunday = new Date(referenceDate)
  sunday.setDate(referenceDate.getDate() - currentDay)

  // Criar array com os 7 dias da semana
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + i)

    // Formatar a data no padrão brasileiro (DD/MM)
    const formattedDate = `${day.getDate().toString().padStart(2, "0")}/${(day.getMonth() + 1).toString().padStart(2, "0")}`

    weekDays.push({
      name: days[i],
      date: day,
      formattedDate: formattedDate,
    })
  }

  return weekDays
}

// Função para converter data no formato DD/MM/YYYY para objeto Date
function parseBrazilianDate(dateString) {
  if (!dateString) return null

  try {
    // Formato DD/MM/YYYY
    const parts = dateString.split("/")
    if (parts.length === 3) {
      const day = Number.parseInt(parts[0], 10)
      const month = Number.parseInt(parts[1], 10) - 1 // Mês em JS começa em 0
      const year = Number.parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return null
  } catch (error) {
    console.error("Erro ao converter data:", error, dateString)
    return null
  }
}

// Função para formatar data como YYYY-MM-DD (para usar como chave)
function formatDateKey(date) {
  if (!date) return null
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
}

// Função para buscar e processar todos os dados
async function fetchAllData(propriedadeNome) {
  try {
    console.log(`Buscando dados para a propriedade: ${propriedadeNome}`)

    // Buscar todos os usuários
    const usersRef = ref(database, `propriedades/${propriedadeNome}/users`)
    const usersSnapshot = await get(usersRef)

    if (!usersSnapshot.exists()) {
      console.log("Nenhum usuário encontrado")
      return { users: [], activities: {}, justificativas: {} }
    }

    // Filtrar apenas usuários com role "user"
    const users = []
    const usersData = usersSnapshot.val()

    for (const userId in usersData) {
      const userData = usersData[userId]
      if (userData.role === "user") {
        users.push({
          id: userId,
          nome: userData.nome || "Sem nome",
        })
      }
    }

    console.log(`Encontrados ${users.length} usuários operacionais`)

    // Mapa para armazenar as atividades por usuário e data
    const activities = {}
    // Mapa para armazenar as justificativas por usuário e data
    const justificativas = {}

    // Inicializar os mapas para todos os usuários
    users.forEach((user) => {
      activities[user.id] = {}
      justificativas[user.id] = {}
    })

    // 1. Processar apontamentos
    console.log("Buscando apontamentos...")
    const apontamentosRef = ref(database, `propriedades/${propriedadeNome}/apontamentos`)
    const apontamentosSnapshot = await get(apontamentosRef)

    if (apontamentosSnapshot.exists()) {
      const apontamentos = apontamentosSnapshot.val()
      console.log(`Encontrados ${Object.keys(apontamentos).length} apontamentos`)

      for (const apontamentoId in apontamentos) {
        const apontamento = apontamentos[apontamentoId]

        // Extrair userId diretamente do campo userId
        const userId = apontamento.userId

        if (!userId) {
          console.log(`Apontamento ${apontamentoId} não tem userId`)
          continue
        }

        // Verificar se o usuário existe no nosso mapa
        if (!activities[userId]) {
          console.log(`Usuário ${userId} não está na lista de usuários operacionais`)
          continue
        }

        // Extrair data do campo data (formato DD/MM/YYYY)
        const itemDate = parseBrazilianDate(apontamento.data)

        if (!itemDate) {
          console.log(`Apontamento ${apontamentoId} não tem data válida: ${apontamento.data}`)
          continue
        }

        // Formatar a data como YYYY-MM-DD para usar como chave
        const dateKey = formatDateKey(itemDate)

        // Marcar que há atividade nesta data
        activities[userId][dateKey] = true

        console.log(`Apontamento registrado: Usuário ${userId}, Data ${dateKey}`)
      }
    } else {
      console.log("Nenhum apontamento encontrado")
    }

    // 2. Processar percursos
    console.log("Buscando percursos...")
    const percursosRef = ref(database, `propriedades/${propriedadeNome}/percursos`)
    const percursosSnapshot = await get(percursosRef)

    if (percursosSnapshot.exists()) {
      const percursos = percursosSnapshot.val()
      console.log(`Encontrados ${Object.keys(percursos).length} percursos`)

      for (const percursoId in percursos) {
        const percurso = percursos[percursoId]

        // Extrair userId diretamente do campo userId
        const userId = percurso.userId

        if (!userId) {
          console.log(`Percurso ${percursoId} não tem userId`)
          continue
        }

        // Verificar se o usuário existe no nosso mapa
        if (!activities[userId]) {
          console.log(`Usuário ${userId} não está na lista de usuários operacionais`)
          continue
        }

        // Extrair data do campo data (formato DD/MM/YYYY)
        const itemDate = parseBrazilianDate(percurso.data)

        if (!itemDate) {
          console.log(`Percurso ${percursoId} não tem data válida: ${percurso.data}`)
          continue
        }

        // Formatar a data como YYYY-MM-DD para usar como chave
        const dateKey = formatDateKey(itemDate)

        // Marcar que há atividade nesta data
        activities[userId][dateKey] = true

        console.log(`Percurso registrado: Usuário ${userId}, Data ${dateKey}`)
      }
    } else {
      console.log("Nenhum percurso encontrado")
    }

    // 3. Processar abastecimentos
    console.log("Buscando abastecimentos...")
    const abastecimentosRef = ref(database, `propriedades/${propriedadeNome}/abastecimentos`)
    const abastecimentosSnapshot = await get(abastecimentosRef)

    if (abastecimentosSnapshot.exists()) {
      const abastecimentos = abastecimentosSnapshot.val()
      console.log(`Encontrados ${Object.keys(abastecimentos).length} abastecimentos`)

      for (const abastecimentoId in abastecimentos) {
        const abastecimento = abastecimentos[abastecimentoId]

        // Extrair userId - pode estar em diferentes campos
        let userId = abastecimento.userId || abastecimento.operadorId

        if (!userId && abastecimento.operador) {
          userId = typeof abastecimento.operador === "object" ? abastecimento.operador.id : abastecimento.operador
        }

        if (!userId) {
          console.log(`Abastecimento ${abastecimentoId} não tem userId`)
          continue
        }

        // Verificar se o usuário existe no nosso mapa
        if (!activities[userId]) {
          console.log(`Usuário ${userId} não está na lista de usuários operacionais`)
          continue
        }

        // Extrair data - pode estar em diferentes campos
        let itemDate = null

        if (abastecimento.data) {
          itemDate = parseBrazilianDate(abastecimento.data)
        } else if (abastecimento.dataAbastecimento) {
          itemDate = parseBrazilianDate(abastecimento.dataAbastecimento)
        }

        if (!itemDate && abastecimento.timestamp) {
          itemDate = new Date(abastecimento.timestamp)
        }

        if (!itemDate) {
          console.log(`Abastecimento ${abastecimentoId} não tem data válida`)
          continue
        }

        // Formatar a data como YYYY-MM-DD para usar como chave
        const dateKey = formatDateKey(itemDate)

        // Marcar que há atividade nesta data
        activities[userId][dateKey] = true

        console.log(`Abastecimento registrado: Usuário ${userId}, Data ${dateKey}`)
      }
    } else {
      console.log("Nenhum abastecimento encontrado")
    }

    // 4. Processar abastecimentoVeiculos
    console.log("Buscando abastecimentos de veículos...")
    const abastecimentoVeiculosRef = ref(database, `propriedades/${propriedadeNome}/abastecimentoVeiculos`)
    const abastecimentoVeiculosSnapshot = await get(abastecimentoVeiculosRef)

    if (abastecimentoVeiculosSnapshot.exists()) {
      const abastecimentoVeiculos = abastecimentoVeiculosSnapshot.val()
      console.log(`Encontrados ${Object.keys(abastecimentoVeiculos).length} abastecimentos de veículos`)

      for (const abastecimentoId in abastecimentoVeiculos) {
        const abastecimento = abastecimentoVeiculos[abastecimentoId]

        // Extrair userId - pode estar em diferentes campos
        let userId = abastecimento.userId || abastecimento.motorista

        if (!userId && abastecimento.condutor) {
          userId = typeof abastecimento.condutor === "object" ? abastecimento.condutor.id : abastecimento.condutor
        }

        if (!userId) {
          console.log(`Abastecimento de veículo ${abastecimentoId} não tem userId`)
          continue
        }

        // Verificar se o usuário existe no nosso mapa
        if (!activities[userId]) {
          console.log(`Usuário ${userId} não está na lista de usuários operacionais`)
          continue
        }

        // Extrair data - pode estar em diferentes campos
        let itemDate = null

        if (abastecimento.data) {
          itemDate = parseBrazilianDate(abastecimento.data)
        } else if (abastecimento.dataAbastecimento) {
          itemDate = parseBrazilianDate(abastecimento.dataAbastecimento)
        }

        if (!itemDate && abastecimento.timestamp) {
          itemDate = new Date(abastecimento.timestamp)
        }

        if (!itemDate) {
          console.log(`Abastecimento de veículo ${abastecimentoId} não tem data válida`)
          continue
        }

        // Formatar a data como YYYY-MM-DD para usar como chave
        const dateKey = formatDateKey(itemDate)

        // Marcar que há atividade nesta data
        activities[userId][dateKey] = true

        console.log(`Abastecimento de veículo registrado: Usuário ${userId}, Data ${dateKey}`)
      }
    } else {
      console.log("Nenhum abastecimento de veículo encontrado")
    }

    // 5. Processar justificativas
    console.log("Buscando justificativas...")
    const justificativasRef = ref(database, `propriedades/${propriedadeNome}/justificativas`)
    const justificativasSnapshot = await get(justificativasRef)

    if (justificativasSnapshot.exists()) {
      const justificativasData = justificativasSnapshot.val()
      console.log(`Encontradas ${Object.keys(justificativasData).length} justificativas`)

      for (const justificativaId in justificativasData) {
        const justificativa = justificativasData[justificativaId]

        // Extrair userId
        const userId = justificativa.userId

        if (!userId) {
          console.log(`Justificativa ${justificativaId} não tem userId`)
          continue
        }

        // Verificar se o usuário existe no nosso mapa
        if (!justificativas[userId]) {
          console.log(`Usuário ${userId} não está na lista de usuários operacionais`)
          continue
        }

        // Extrair data do campo data (formato DD/MM/YYYY)
        const itemDate = parseBrazilianDate(justificativa.data)

        if (!itemDate) {
          console.log(`Justificativa ${justificativaId} não tem data válida: ${justificativa.data}`)
          continue
        }

        // Formatar a data como YYYY-MM-DD para usar como chave
        const dateKey = formatDateKey(itemDate)

        // Marcar que há justificativa nesta data e armazenar o texto
        justificativas[userId][dateKey] = justificativa.justificativa

        console.log(`Justificativa registrada: Usuário ${userId}, Data ${dateKey}`)
      }
    } else {
      console.log("Nenhuma justificativa encontrada")
    }

    return { users, activities, justificativas }
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    return { users: [], activities: {}, justificativas: {} }
  }
}

// Função para renderizar o calendário com base na data de referência
async function renderCalendar(propriedadeNome, referenceDate) {
  try {
    // Armazenar o nome da propriedade atual na variável global
    currentPropriedadeNome = propriedadeNome

    // Obter os dias da semana com base na data de referência
    const weekDays = getWeekDays(referenceDate)
    console.log("Dias da semana:", weekDays)

    // Buscar todos os dados
    const { users, activities, justificativas } = await fetchAllData(propriedadeNome)

    if (users.length === 0) {
      document.getElementById("data-container").innerHTML = `
        <div class="propriedade calendar-modern">
          <div class="calendar-empty">
            <div class="empty-icon">
              <i class="fas fa-users-slash"></i>
            </div>
            <h3>Nenhum usuário operacional encontrado</h3>
            <p>Não há operadores cadastrados no sistema para exibir no calendário.</p>
          </div>
        </div>
      `
      return
    }

    // Identificar o dia atual para destacá-lo
    const today = new Date()
    const todayFormatted = formatDateKey(today)

    // Construir a tabela do calendário
    let tableHTML = `
      <div class="propriedade calendar-modern">
        <div class="calendar-header-modern">
          <div class="calendar-title">
            <i class="fas fa-calendar-alt"></i>
            <h2>Calendário Semanal de Atividades</h2>
          </div>
          <div class="calendar-actions">
            <div class="calendar-legend">
              <div class="legend-item">
                <span class="legend-dot active"></span>
                <span>Apontamento Realizado</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot justified"></span>
                <span>Justificado</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot inactive"></span>
                <span>Sem Apontamento</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot future"></span>
                <span>Data Futura</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="calendar-navigation">
          <button id="prev-week" class="nav-button">
            <i class="fas fa-chevron-left"></i>
            <span>Semana Anterior</span>
          </button>
          <button id="current-week" class="nav-button current">
            <i class="fas fa-calendar-day"></i>
            <span>Semana Atual</span>
          </button>
          <button id="next-week" class="nav-button">
            <span>Próxima Semana</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="calendar-body">
          <table class="calendar-table">
            <thead>
              <tr>
                <th class="operator-column">
                  <div class="th-content">
                    <i class="fas fa-users"></i>
                    <span>OPERADORES</span>
                  </div>
                </th>
    `

    // Adicionar cabeçalhos dos dias da semana com as datas
    weekDays.forEach((day) => {
      const isToday = formatDateKey(day.date) === todayFormatted
      tableHTML += `
        <th class="${isToday ? "today-column" : ""}">
          <div class="day-header ${isToday ? "today" : ""}">
            <span class="day-name">${day.name}</span>
            <span class="day-date">${day.formattedDate}</span>
          </div>
        </th>
      `
    })

    tableHTML += `
              </tr>
            </thead>
            <tbody>
    `

    // Para cada usuário, verificar atividades em cada dia da semana
    for (const user of users) {
      tableHTML += `
        <tr>
          <td class="operator-name">
            <div class="operator-info">
              <div class="operator-avatar">
                <i class="fas fa-user"></i>
              </div>
              <span>${user.nome}</span>
            </div>
          </td>
      `

      // Para cada dia da semana, verificar se o usuário fez alguma atividade
      for (const day of weekDays) {
        // Formatar a data como YYYY-MM-DD para verificar no mapa de atividades
        const dateKey = formatDateKey(day.date)
        const isToday = dateKey === todayFormatted

        // Verificar se a data é futura
        const isFutureDate = day.date > today

        // Verificar se há atividade para este usuário nesta data
        const hasActivity = activities[user.id] && activities[user.id][dateKey]

        // Verificar se há justificativa para este usuário nesta data
        const hasJustificativa = justificativas[user.id] && justificativas[user.id][dateKey]
        const justificativaText = hasJustificativa ? justificativas[user.id][dateKey] : ""

        if (isFutureDate) {
          tableHTML += `
            <td class="${isToday ? "today-cell" : ""}">
              <div class="activity-indicator future" title="Data Futura">
                <span>-</span>
              </div>
            </td>
          `
        } else if (hasActivity) {
          tableHTML += `
            <td class="${isToday ? "today-cell" : ""}">
              <div class="activity-indicator active" title="Apontamento Realizado">
                <i class="fas fa-check"></i>
              </div>
            </td>
          `
        } else if (hasJustificativa) {
          tableHTML += `
            <td class="${isToday ? "today-cell" : ""}">
              <div class="activity-indicator justified" title="Justificado: ${justificativaText}">
                <i class="fas fa-check"></i>
              </div>
            </td>
          `
        } else {
          tableHTML += `
            <td class="${isToday ? "today-cell" : ""}">
              <div class="activity-indicator inactive" data-user-id="${user.id}" data-date="${dateKey}" onclick="showJustificativaModal(this)" title="Sem Apontamento - Clique para justificar">
                <i class="fas fa-times"></i>
              </div>
            </td>
          `
        }
      }

      tableHTML += `</tr>`
    }

    tableHTML += `
            </tbody>
          </table>
        </div>
      </div>
    `

    // Renderizar a tabela
    document.getElementById("data-container").innerHTML = tableHTML
    console.log("Calendário semanal renderizado com sucesso")

    // Adicionar event listeners para os botões de navegação
    document.getElementById("prev-week").addEventListener("click", () => {
      navigateToWeek(propriedadeNome, -1)
    })

    document.getElementById("next-week").addEventListener("click", () => {
      navigateToWeek(propriedadeNome, 1)
    })

    document.getElementById("current-week").addEventListener("click", () => {
      navigateToCurrentWeek(propriedadeNome)
    })
  } catch (error) {
    console.error("Erro ao renderizar calendário:", error)
    document.getElementById("data-container").innerHTML = `
      <div class="propriedade calendar-modern">
        <div class="calendar-error">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Erro ao carregar o calendário</h3>
          <p>${error.message}</p>
        </div>
      </div>
    `
  }
}

// Função para navegar para a semana anterior ou próxima
function navigateToWeek(propriedadeNome, direction) {
  // Mostrar indicador de carregamento
  document.getElementById("data-container").innerHTML = `
    <div class="propriedade calendar-modern">
      <div class="calendar-loading">
        <div class="pulse-loader"></div>
        <p>Carregando dados do calendário...</p>
      </div>
    </div>
  `

  // Calcular a nova data de referência
  const newDate = new Date(currentReferenceDate)
  newDate.setDate(currentReferenceDate.getDate() + direction * 7)
  currentReferenceDate = newDate

  // Renderizar o calendário com a nova data
  renderCalendar(propriedadeNome, currentReferenceDate)
}

// Função para navegar para a semana atual
function navigateToCurrentWeek(propriedadeNome) {
  // Mostrar indicador de carregamento
  document.getElementById("data-container").innerHTML = `
    <div class="propriedade calendar-modern">
      <div class="calendar-loading">
        <div class="pulse-loader"></div>
        <p>Carregando dados do calendário...</p>
      </div>
    </div>
  `

  // Resetar para a data atual
  currentReferenceDate = new Date()

  // Renderizar o calendário com a data atual
  renderCalendar(propriedadeNome, currentReferenceDate)
}

// Função para exibir o calendário semanal
async function showWeeklyCalendar(propriedadeNome) {
  try {
    // Adicionar fonte do Google
    const fontLink = document.createElement("link")
    fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
    fontLink.rel = "stylesheet"
    document.head.appendChild(fontLink)

    // Mostrar animação de carregamento
    document.getElementById("data-container").innerHTML = `
      <div class="propriedade calendar-modern">
        <div class="calendar-loading">
          <div class="pulse-loader"></div>
          <p>Carregando dados do calendário...</p>
        </div>
      </div>
    `

    console.log("Iniciando carregamento do calendário semanal")

    // Resetar a data de referência para a data atual
    currentReferenceDate = new Date()

    // Renderizar o calendário
    await renderCalendar(propriedadeNome, currentReferenceDate)

    // Adicionar estilos CSS para o calendário e animação de carregamento
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      /* Estilos modernos para o calendário com cor neutra */
      .calendar-modern {
        font-family: 'Poppins', sans-serif;
        background-color: #f5f7fa;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        padding: 0;
        color: #333;
        margin-bottom: 30px;
      }
      
      .calendar-header-modern {
        padding: 25px 30px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        background-color: #fff;
        border-bottom: 1px solid #eaedf2;
      }
      
      .calendar-title {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .calendar-title i {
        font-size: 2rem;
        color: #2E3631;
      }
      
      .calendar-title h2 {
        margin: 0;
        padding: 0;
        border: none;
        color: #1e293b;
        font-size: 1.8rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .calendar-actions {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      
      .calendar-legend {
        display: flex;
        gap: 20px;
        align-items: center;
        background-color: #f1f5f9;
        padding: 10px 20px;
        border-radius: 50px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #64748b;
      }
      
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }
      
      .legend-dot.active {
        background-color: #10b981;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
      }
      
      .legend-dot.justified {
        background-color: #3b82f6;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
      }
      
      .legend-dot.inactive {
        background-color: #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
      }

      .legend-dot.future {
        background-color: #94a3b8;
        box-shadow: 0 0 10px rgba(148, 163, 184, 0.3);
      }
      
      /* Navegação do calendário */
      .calendar-navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 25px;
        background-color: #fff;
        border-bottom: 1px solid #eaedf2;
      }
      
      .nav-button {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #f1f5f9;
        border: none;
        border-radius: 8px;
        padding: 10px 15px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .nav-button:hover {
        background-color: #e2e8f0;
        color: #334155;
      }
      
      .nav-button.current {
        background-color: #2E3631;
        color: #fff;
      }
      
      .nav-button.current:hover {
        background-color: #3a4540;
      }
      
      .nav-button i {
        font-size: 0.9rem;
      }
      
      /* Centralizar o botão de semana atual */
      .calendar-navigation {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 15px;
      }
      
      #prev-week {
        justify-self: start;
      }
      
      #current-week {
        grid-column: 2;
        justify-self: center;
      }
      
      #next-week {
        justify-self: end;
      }
      
      .calendar-body {
        padding: 20px;
        background-color: #f5f7fa;
      }
      
      .calendar-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background-color: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }
      
      .calendar-table th, 
      .calendar-table td {
        padding: 0;
        text-align: center;
        border: none;
      }
      
      .calendar-table th {
        font-weight: 500;
        color: #1e293b;
        position: relative;
      }
      
      .th-content {
        padding: 15px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      
      .th-content i {
        font-size: 1.2rem;
        color: #2E3631;
      }
      
      .operator-column {
        background-color: #f8fafc;
        position: sticky;
        left: 0;
        z-index: 10;
        min-width: 200px;
      }
      
      .day-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 10px;
        background-color: #f8fafc;
        transition: all 0.3s ease;
      }
      
      .day-header.today {
        background-color: #e0f2fe;
      }
      
      .day-name {
        font-weight: 600;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
        color: #334155;
      }
      
      .day-date {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 5px;
      }
      
      .operator-name {
        background-color: #f8fafc;
        position: sticky;
        left: 0;
        z-index: 10;
      }
      
      .operator-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 15px;
        text-align: left;
      }
      
      .operator-avatar {
        width: 36px;
        height: 36px;
        background-color: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .operator-avatar i {
        color: #2E3631;
        font-size: 1rem;
      }
      
      .activity-indicator {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px auto;
        transition: all 0.3s ease;
        cursor: default;
      }
      
      .activity-indicator.active {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
      }
      
      .activity-indicator.justified {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
      }
      
      .activity-indicator.active i,
      .activity-indicator.justified i {
        font-size: 1.2rem;
      }
      
      .activity-indicator.inactive {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        cursor: pointer;
      }

      .activity-indicator.future {
        background-color: rgba(148, 163, 184, 0.1);
        color: #94a3b8;
      }
      
      .activity-indicator.future span {
        font-size: 1.5rem;
        font-weight: 500;
        line-height: 1;
      }
      
      .activity-indicator:hover {
        transform: scale(1.15);
      }
      
      .today-column {
        background-color: rgba(59, 130, 246, 0.05);
      }
      
      .today-cell {
        background-color: rgba(59, 130, 246, 0.03);
      }
      
      .calendar-table tr:hover td:not(.operator-name) {
        background-color: rgba(226, 232, 240, 0.5);
      }
      
      /* Animação de carregamento */
      .calendar-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 0;
        background-color: #f5f7fa;
      }
      
      .pulse-loader {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.1);
        box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
        animation: pulse 1.5s infinite;
        margin-bottom: 20px;
        position: relative;
      }
      
      .pulse-loader:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border-radius: 50%;
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        70% {
          box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
      
      .calendar-loading p {
        color: #334155;
        font-size: 1.1rem;
        font-weight: 300;
        letter-spacing: 0.5px;
      }
      
      /* Estado vazio */
      .calendar-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 30px;
        text-align: center;
        background-color: #f5f7fa;
      }
      
      .empty-icon {
        width: 80px;
        height: 80px;
        background-color: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .empty-icon i {
        font-size: 2rem;
        color: #94a3b8;
      }
      
      .calendar-empty h3 {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
        font-weight: 500;
        color: #334155;
      }
      
      .calendar-empty p {
        color: #64748b;
        font-size: 1rem;
        max-width: 500px;
      }
      
      /* Responsividade */
      @media (max-width: 768px) {
        .calendar-title h2 {
          font-size: 1.5rem;
        }
        
        .calendar-legend {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
        }
        
        .operator-column,
        .operator-name {
          min-width: 150px;
        }
        
        .day-name {
          font-size: 0.7rem;
        }
        
        .day-date {
          font-size: 0.7rem;
        }
        
        .activity-indicator {
          width: 32px;
          height: 32px;
        }
        
        .nav-button span {
          display: none;
        }
        
        .nav-button i {
          font-size: 1.2rem;
        }
      }
      
      @media (max-width: 576px) {
        .calendar-title {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .operator-column,
        .operator-name {
          min-width: 120px;
        }
        
        .operator-info {
          padding: 10px;
          gap: 8px;
        }
        
        .operator-avatar {
          width: 30px;
          height: 30px;
        }
        
        .activity-indicator {
          width: 28px;
          height: 28px;
          margin: 8px auto;
        }
        
        .activity-indicator i {
          font-size: 0.8rem;
        }
      }
    `
    document.head.appendChild(styleElement)
  } catch (error) {
    console.error("Erro ao carregar calendário semanal:", error)
    document.getElementById("data-container").innerHTML = `
      <div class="propriedade calendar-modern">
        <div class="calendar-error">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Erro ao carregar o calendário</h3>
          <p>${error.message}</p>
        </div>
      </div>
    `

    // Adicionar estilos para o erro
    const errorStyleElement = document.createElement("style")
    errorStyleElement.textContent = `
      .calendar-modern {
        font-family: 'Poppins', sans-serif;
        background-color: #f5f7fa;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        padding: 0;
        color: #333;
      }
      
      .calendar-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 30px;
        text-align: center;
        background-color: #f5f7fa;
      }
      
      .error-icon {
        width: 80px;
        height: 80px;
        background-color: rgba(239, 68, 68, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .error-icon i {
        font-size: 2rem;
        color: #ef4444;
      }
      
      .calendar-error h3 {
        margin: 0 0 10px 0;
        font-size: 1.5rem;
        font-weight: 500;
        color: #334155;
      }
      
      .calendar-error p {
        color: #64748b;
        font-size: 1rem;
        max-width: 500px;
      }
    `
    document.head.appendChild(errorStyleElement)
  }
}

// Função para mostrar o modal de justificativa
function showJustificativaModal(element) {
  // Obter os dados do elemento clicado
  const userId = element.getAttribute("data-user-id")
  const dateKey = element.getAttribute("data-date")

  // Criar o modal
  const modalOverlay = document.createElement("div")
  modalOverlay.className = "modal-overlay"

  const modalContent = document.createElement("div")
  modalContent.className = "modal-content"

  modalContent.innerHTML = `
    <div class="modal-header">
      <h3>Adicionar Justificativa</h3>
      <button class="close-modal" onclick="closeJustificativaModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>Informe a justificativa para a ausência de atividade nesta data:</p>
      <textarea id="justificativa-text" rows="4" placeholder="Digite a justificativa aqui..."></textarea>
    </div>
    <div class="modal-footer">
      <button class="cancel-button" onclick="closeJustificativaModal()">Cancelar</button>
      <button class="save-button" onclick="salvarJustificativa('${userId}', '${dateKey}')">Salvar</button>
    </div>
  `

  modalOverlay.appendChild(modalContent)
  document.body.appendChild(modalOverlay)

  // Adicionar estilos para o modal se ainda não existirem
  if (!document.getElementById("modal-styles")) {
    const styleElement = document.createElement("style")
    styleElement.id = "modal-styles"
    styleElement.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .modal-content {
        background-color: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eaedf2;
      }
      
      .modal-header h3 {
        margin: 0;
        color: #1e293b;
        font-size: 1.2rem;
        font-weight: 600;
      }
      
      .close-modal {
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        font-size: 1.2rem;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .modal-body p {
        margin-top: 0;
        margin-bottom: 15px;
        color: #334155;
      }
      
      #justificativa-text {
        width: 100%;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        resize: vertical;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 15px 20px;
        border-top: 1px solid #eaedf2;
      }
      
      .cancel-button, .save-button {
        padding: 10px 20px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .cancel-button {
        background-color: #f1f5f9;
        border: none;
        color: #64748b;
      }
      
      .cancel-button:hover {
        background-color: #e2e8f0;
        color: #334155;
      }
      
      .save-button {
        background-color: #2E3631;
        border: none;
        color: white;
      }
      
      .save-button:hover {
        background-color: #3a4540;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(styleElement)
  }

  // Focar no textarea
  document.getElementById("justificativa-text").focus()
}

// Função para fechar o modal
function closeJustificativaModal() {
  const modalOverlay = document.querySelector(".modal-overlay")
  if (modalOverlay) {
    document.body.removeChild(modalOverlay)
  }
}

// Função para salvar a justificativa
async function salvarJustificativa(userId, dateKey) {
  try {
    const justificativaText = document.getElementById("justificativa-text").value.trim()

    if (!justificativaText) {
      alert("Por favor, digite uma justificativa.")
      return
    }

    // Mostrar indicador de carregamento no botão
    const saveButton = document.querySelector(".save-button")
    const originalButtonText = saveButton.innerHTML
    saveButton.innerHTML = '<span class="loading-spinner"></span> Salvando...'
    saveButton.disabled = true

    // Usar a propriedade atual que está armazenada na variável global
    if (!currentPropriedadeNome) {
      throw new Error("Nome da propriedade não encontrado")
    }

    console.log(`Salvando justificativa para a propriedade: ${currentPropriedadeNome}`)

    // Extrair a data do dateKey (formato YYYY-MM-DD)
    const [year, month, day] = dateKey.split("-")
    const dataFormatada = `${day}/${month}/${year}`

    // Criar um novo nó para a justificativa
    const justificativaData = {
      userId: userId,
      data: dataFormatada,
      justificativa: justificativaText,
      timestamp: Date.now(),
      status: "justificado",
    }

    // Referência para o nó de justificativas
    const justificativasRef = ref(database, `propriedades/${currentPropriedadeNome}/justificativas`)
    const newJustificativaRef = push(justificativasRef)

    // Salvar a justificativa
    await set(newJustificativaRef, justificativaData)

    // Atualizar o elemento visual para mostrar que foi justificado
    const elementoClicado = document.querySelector(
      `.activity-indicator[data-user-id="${userId}"][data-date="${dateKey}"]`,
    )

    if (elementoClicado) {
      elementoClicado.classList.remove("inactive")
      elementoClicado.classList.add("justified")
      elementoClicado.innerHTML = '<i class="fas fa-check"></i>'
      elementoClicado.removeAttribute("onclick")
      elementoClicado.title = "Justificado: " + justificativaText
    }

    // Fechar o modal
    closeJustificativaModal()

    // Mostrar mensagem de sucesso
    const toastElement = document.createElement("div")
    toastElement.className = "toast-notification"
    toastElement.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="toast-message">Justificativa salva com sucesso!</div>
    `

    document.body.appendChild(toastElement)

    // Adicionar estilos para o toast se ainda não existirem
    if (!document.getElementById("toast-styles")) {
      const toastStyleElement = document.createElement("style")
      toastStyleElement.id = "toast-styles"
      toastStyleElement.textContent = `
        .toast-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #10b981;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-out 3s forwards;
        }
        
        .toast-icon {
          font-size: 1.2rem;
        }
        
        .toast-message {
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
      `
      document.head.appendChild(toastStyleElement)
    }

    // Remover o toast após 3.5 segundos
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement)
      }
    }, 3500)
  } catch (error) {
    console.error("Erro ao salvar justificativa:", error)
    alert(`Erro ao salvar justificativa: ${error.message}`)

    // Restaurar o botão
    const saveButton = document.querySelector(".save-button")
    if (saveButton) {
      saveButton.innerHTML = "Salvar"
      saveButton.disabled = false
    }
  }
}

// Adicionar as funções ao escopo global para que possam ser chamadas pelo onclick
window.showJustificativaModal = showJustificativaModal
window.closeJustificativaModal = closeJustificativaModal
window.salvarJustificativa = salvarJustificativa
import { push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"
