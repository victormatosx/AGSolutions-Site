// apontamentos.js - Página de apontamentos
import { setupSidebar, setupHeaderButtons, setupAuth, getUserName, database, ref, get } from "./common.js"
import { update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando página de apontamentos...")
  setupSidebar()
  setupHeaderButtons()
  setupAuth((user, propriedadeNome) => {
    fetchAllData(propriedadeNome)
  })
})

async function fetchAllData(userPropriedade) {
  const dataContainer = document.getElementById("data-container")

  try {
    // Inicializa a estrutura da página
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-clipboard-check"></i> Registros</h2>
        
        <!-- Tabs principais para Máquinas e Veículos -->
        <div class="main-tabs">
          <button class="main-tab-button active" data-tab="maquinas">
            <i class="fas fa-tractor"></i> Máquinas
          </button>
          <button class="main-tab-button" data-tab="veiculos">
            <i class="fas fa-truck"></i> Veículos
          </button>
        </div>
        
        <!-- Conteúdo para Máquinas -->
        <div class="main-tab-content" id="maquinas-content">
          <div class="apontamentos-tabs">
            <button class="tab-button active" data-tab="apontamentos">
              <i class="fas fa-clock"></i> Apontamentos
            </button>
            <button class="tab-button" data-tab="abastecimentos">
              <i class="fas fa-gas-pump"></i> Abastecimentos
            </button>
          </div>
          
          <!-- Container para apontamentos de máquinas -->
          <div class="apontamentos-container" id="apontamentos-container">
            <!-- Status tabs para apontamentos -->
            <div class="status-tabs">
              <button class="status-tab-button active" data-status="pendentes" data-container="apontamentos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-tab-button" data-status="validados" data-container="apontamentos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <!-- Conteúdo dos apontamentos pendentes -->
            <div class="status-content active" id="apontamentos-pendentes-content">
              <div id="apontamentos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando apontamentos...
                </div>
              </div>
            </div>
            
            <!-- Conteúdo dos apontamentos validados -->
            <div class="status-content" id="apontamentos-validados-content">
              <div id="apontamentos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando apontamentos...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Container para abastecimentos de máquinas -->
          <div class="apontamentos-container" id="abastecimentos-container" style="display: none;">
            <!-- Status tabs para abastecimentos -->
            <div class="status-tabs">
              <button class="status-tab-button active" data-status="pendentes" data-container="abastecimentos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-tab-button" data-status="validados" data-container="abastecimentos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <!-- Conteúdo dos abastecimentos pendentes -->
            <div class="status-content active" id="abastecimentos-pendentes-content">
              <div id="abastecimentos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos...
                </div>
              </div>
            </div>
            
            <!-- Conteúdo dos abastecimentos validados -->
            <div class="status-content" id="abastecimentos-validados-content">
              <div id="abastecimentos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos...
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo para Veículos -->
        <div class="main-tab-content" id="veiculos-content" style="display: none;">
          <div class="apontamentos-tabs">
            <button class="tab-button active" data-tab="percursos">
              <i class="fas fa-route"></i> Percursos
            </button>
            <button class="tab-button" data-tab="abastecimentosVeiculos">
              <i class="fas fa-gas-pump"></i> Abastecimentos
            </button>
          </div>
          
          <!-- Container para percursos de veículos -->
          <div class="apontamentos-container" id="percursos-container">
            <!-- Status tabs para percursos -->
            <div class="status-tabs">
              <button class="status-tab-button active" data-status="pendentes" data-container="percursos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-tab-button" data-status="validados" data-container="percursos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <!-- Conteúdo dos percursos pendentes -->
            <div class="status-content active" id="percursos-pendentes-content">
              <div id="percursos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando percursos...
                </div>
              </div>
            </div>
            
            <!-- Conteúdo dos percursos validados -->
            <div class="status-content" id="percursos-validados-content">
              <div id="percursos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando percursos...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Container para abastecimentos de veículos -->
          <div class="apontamentos-container" id="abastecimentosVeiculos-container" style="display: none;">
            <!-- Status tabs para abastecimentos de veículos -->
            <div class="status-tabs">
              <button class="status-tab-button active" data-status="pendentes" data-container="abastecimentosVeiculos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-tab-button" data-status="validados" data-container="abastecimentosVeiculos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <!-- Conteúdo dos abastecimentos de veículos pendentes -->
            <div class="status-content active" id="abastecimentosVeiculos-pendentes-content">
              <div id="abastecimentosVeiculos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos de veículos...
                </div>
              </div>
            </div>
            
            <!-- Conteúdo dos abastecimentos de veículos validados -->
            <div class="status-content" id="abastecimentosVeiculos-validados-content">
              <div id="abastecimentosVeiculos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos de veículos...
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal de confirmação -->
        <div id="confirmationModal" class="confirmation-modal">
          <div class="confirmation-content">
            <h3><i class="fas fa-exclamation-circle"></i> Confirmar Validação</h3>
            <p>Tem certeza que deseja validar este registro?</p>
            <div class="confirmation-buttons">
              <button id="confirmValidation" class="confirm-button">Sim, Validar</button>
              <button id="cancelValidation" class="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `

    // Configurar as tabs principais
    setupMainTabs()

    // Configurar as subtabs para máquinas
    setupSubTabs("maquinas-content")

    // Configurar as subtabs para veículos
    setupSubTabs("veiculos-content")

    // Configurar as tabs de status
    setupStatusTabs()

    // Buscar todos os tipos de dados
    await Promise.all([
      fetchApontamentos(userPropriedade),
      fetchAbastecimentos(userPropriedade),
      fetchPercursos(userPropriedade),
      fetchAbastecimentosVeiculos(userPropriedade),
    ])
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar os dados: ${error.message}
        </p>
      </div>
    `
  }
}

function setupMainTabs() {
  document.querySelectorAll(".main-tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tabType = e.target.closest(".main-tab-button").dataset.tab

      // Atualiza classes ativas nas tabs principais
      document.querySelectorAll(".main-tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".main-tab-button").classList.add("active")

      // Mostra/esconde conteúdo das tabs principais
      document.querySelectorAll(".main-tab-content").forEach((content) => {
        content.style.display = content.id === `${tabType}-content` ? "block" : "none"
      })
    })
  })
}

function setupSubTabs(containerId) {
  const container = document.getElementById(containerId)

  container.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab

      // Atualiza classes ativas nas subtabs
      container.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".tab-button").classList.add("active")

      // Mostra/esconde conteúdo das subtabs
      container.querySelectorAll(".apontamentos-container").forEach((content) => {
        content.style.display = content.id === `${tabType}-container` ? "block" : "none"
      })
    })
  })
}

function setupStatusTabs() {
  document.querySelectorAll(".status-tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const statusType = e.target.closest(".status-tab-button").dataset.status
      const containerType = e.target.closest(".status-tab-button").dataset.container
      const container = e.target.closest(".apontamentos-container")

      // Atualiza classes ativas nas tabs de status
      container.querySelectorAll(".status-tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".status-tab-button").classList.add("active")

      // Mostra/esconde conteúdo das tabs de status
      container.querySelectorAll(".status-content").forEach((content) => {
        content.style.display = content.id === `${containerType}-${statusType}-content` ? "block" : "none"
        content.classList.toggle("active", content.id === `${containerType}-${statusType}-content`)
      })
    })
  })
}

async function fetchApontamentos(userPropriedade) {
  const apontamentosPendentesContainer = document.getElementById("apontamentos-pendentes")
  const apontamentosValidadosContainer = document.getElementById("apontamentos-validados")
  const apontamentosRef = ref(database, `propriedades/${userPropriedade}/apontamentos`)

  try {
    const snapshot = await get(apontamentosRef)

    if (snapshot.exists()) {
      const apontamentosPendentesPromises = []
      const apontamentosValidadosPromises = []

      snapshot.forEach((apontamentoSnapshot) => {
        const apontamentoData = apontamentoSnapshot.val()
        const isValidado = apontamentoData.validado || false

        const apontamentoPromise = getUserName(apontamentoData.userId, userPropriedade).then((userName) => {
          // Processar operações mecanizadas
          const operacoesMecanizadas = apontamentoData.operacoesMecanizadas || {}
          let operacoesHtml = ""

          // Converter objeto de operações em array para iterar
          const operacoes = []
          for (const key in operacoesMecanizadas) {
            if (operacoesMecanizadas.hasOwnProperty(key)) {
              operacoes.push(operacoesMecanizadas[key])
            }
          }

          if (operacoes.length > 0) {
            operacoesHtml = `
              <div class="apontamento-detalhes-section">
                <h4><i class="fas fa-tractor"></i> Operações Mecanizadas</h4>
                <div class="apontamento-detalhes-grid">
                  ${operacoes
                    .map(
                      (op) => `
                    <div class="operacao-mecanizada">
                      <p><i class="fas fa-truck-monster"></i><strong>Equipamento:</strong> ${op.bem || "N/A"}</p>
                      <p><i class="fas fa-tools"></i><strong>Implemento:</strong> ${op.implemento || "N/A"}</p>
                      <p><i class="fas fa-clock"></i><strong>Hora Inicial:</strong> ${op.horaInicial || "N/A"}</p>
                      <p><i class="fas fa-clock"></i><strong>Hora Final:</strong> ${op.horaFinal || "N/A"}</p>
                      <p><i class="fas fa-hourglass-half"></i><strong>Total Horas:</strong> ${op.totalHoras || "N/A"}</p>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `
          }

          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${apontamentoSnapshot.key}" data-type="apontamento">
              <div class="apontamento-info-left">
                <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${apontamentoData.fichaControle || "N/A"}</p>
                <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${apontamentoData.cultura || "N/A"}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${apontamentoData.data || new Date(apontamentoData.timestamp).toLocaleDateString()}</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${apontamentoSnapshot.key}" data-type="apontamento">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-apontamento-${apontamentoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${apontamentoSnapshot.key}" data-type="apontamento">&times;</button>
                <h3><i class="fas fa-clipboard-list"></i> Detalhes do Apontamento</h3>
                <div class="apontamento-detalhes-grid">
                  <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${apontamentoData.fichaControle || "N/A"}</p>
                  <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
                  <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${apontamentoData.data || new Date(apontamentoData.timestamp).toLocaleDateString()}</p>
                  <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${apontamentoData.cultura || "N/A"}</p>
                  <p><i class="fas fa-tractor"></i><strong>Atividade:</strong> ${apontamentoData.atividade || "N/A"}</p>
                  <p><i class="fas fa-compass"></i><strong>Direcionador:</strong> ${apontamentoData.direcionador || "N/A"}</p>
                  <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${apontamentoData.propriedade || userPropriedade}</p>
                  <p><i class="fas fa-tag"></i><strong>Status:</strong> ${apontamentoData.status || (isValidado ? "Validado" : "Pendente")}</p>
                </div>
                ${
                  apontamentoData.observacao
                    ? `
                <div class="apontamento-detalhes-observacao">
                  <p><i class="fas fa-comment"></i><strong>Observação:</strong> ${apontamentoData.observacao}</p>
                </div>
                `
                    : ""
                }
                ${operacoesHtml}
              </div>
            </div>
          `
        })

        // Adicionar à lista apropriada com base no status de validação
        if (isValidado) {
          apontamentosValidadosPromises.push(apontamentoPromise)
        } else {
          apontamentosPendentesPromises.push(apontamentoPromise)
        }
      })

      // Processar apontamentos pendentes
      const apontamentosPendentesHtml = await Promise.all(apontamentosPendentesPromises)
      if (apontamentosPendentesHtml.length > 0) {
        apontamentosPendentesContainer.innerHTML = apontamentosPendentesHtml.join("")
      } else {
        apontamentosPendentesContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum apontamento pendente encontrado
          </div>
        `
      }

      // Processar apontamentos validados
      const apontamentosValidadosHtml = await Promise.all(apontamentosValidadosPromises)
      if (apontamentosValidadosHtml.length > 0) {
        apontamentosValidadosContainer.innerHTML = apontamentosValidadosHtml.join("")
      } else {
        apontamentosValidadosContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum apontamento validado encontrado
          </div>
        `
      }

      setupApontamentoClicks("apontamento")
      setupValidationButtons("apontamento")
    } else {
      apontamentosPendentesContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum apontamento pendente encontrado
        </div>
      `
      apontamentosValidadosContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum apontamento validado encontrado
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar apontamentos:", error)
    apontamentosPendentesContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar apontamentos: ${error.message}
      </div>
    `
    apontamentosValidadosContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar apontamentos: ${error.message}
      </div>
    `
  }
}

async function fetchAbastecimentos(userPropriedade) {
  const abastecimentosPendentesContainer = document.getElementById("abastecimentos-pendentes")
  const abastecimentosValidadosContainer = document.getElementById("abastecimentos-validados")
  const abastecimentosRef = ref(database, `propriedades/${userPropriedade}/abastecimentos`)

  try {
    const snapshot = await get(abastecimentosRef)

    if (snapshot.exists()) {
      const abastecimentosPendentesPromises = []
      const abastecimentosValidadosPromises = []

      snapshot.forEach((abastecimentoSnapshot) => {
        const abastecimentoData = abastecimentoSnapshot.val()
        const isValidado = abastecimentoData.validado || false

        const abastecimentoPromise = getUserName(abastecimentoData.userId, userPropriedade).then((userName) => {
          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${abastecimentoSnapshot.key}" data-type="abastecimento">
              <div class="apontamento-info-left">
                <p><i class="fas fa-truck-monster"></i><strong>Equipamento:</strong> ${abastecimentoData.bem || "N/A"}</p>
                <p><i class="fas fa-gas-pump"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimento">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-abastecimento-${abastecimentoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimento">&times;</button>
                <h3><i class="fas fa-gas-pump"></i> Detalhes do Abastecimento</h3>
                <div class="apontamento-detalhes-grid">
                  <p><i class="fas fa-truck-monster"></i><strong>Equipamento:</strong> ${abastecimentoData.bem || "N/A"}</p>
                  <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
                  <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
                  <p><i class="fas fa-gas-pump"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                  <p><i class="fas fa-tachometer-alt"></i><strong>Horímetro:</strong> ${abastecimentoData.horimetro || "N/A"}</p>
                  <p><i class="fas fa-gas-pump"></i><strong>Tanque:</strong> ${abastecimentoData.tanqueDiesel || "N/A"}</p>
                  <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${abastecimentoData.propriedade || userPropriedade}</p>
                  <p><i class="fas fa-tag"></i><strong>Status:</strong> ${abastecimentoData.status || (isValidado ? "Validado" : "Pendente")}</p>
                </div>
                ${
                  abastecimentoData.observacao
                    ? `
                <div class="apontamento-detalhes-observacao">
                  <p><i class="fas fa-comment"></i><strong>Observação:</strong> ${abastecimentoData.observacao}</p>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          `
        })

        // Adicionar à lista apropriada com base no status de validação
        if (isValidado) {
          abastecimentosValidadosPromises.push(abastecimentoPromise)
        } else {
          abastecimentosPendentesPromises.push(abastecimentoPromise)
        }
      })

      // Processar abastecimentos pendentes
      const abastecimentosPendentesHtml = await Promise.all(abastecimentosPendentesPromises)
      if (abastecimentosPendentesHtml.length > 0) {
        abastecimentosPendentesContainer.innerHTML = abastecimentosPendentesHtml.join("")
      } else {
        abastecimentosPendentesContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum abastecimento pendente encontrado
          </div>
        `
      }

      // Processar abastecimentos validados
      const abastecimentosValidadosHtml = await Promise.all(abastecimentosValidadosPromises)
      if (abastecimentosValidadosHtml.length > 0) {
        abastecimentosValidadosContainer.innerHTML = abastecimentosValidadosHtml.join("")
      } else {
        abastecimentosValidadosContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum abastecimento validado encontrado
          </div>
        `
      }

      setupApontamentoClicks("abastecimento")
      setupValidationButtons("abastecimento")
    } else {
      abastecimentosPendentesContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento pendente encontrado
        </div>
      `
      abastecimentosValidadosContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento validado encontrado
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar abastecimentos:", error)
    abastecimentosPendentesContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos: ${error.message}
      </div>
    `
    abastecimentosValidadosContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos: ${error.message}
      </div>
    `
  }
}

async function fetchPercursos(userPropriedade) {
  const percursosPendentesContainer = document.getElementById("percursos-pendentes")
  const percursosValidadosContainer = document.getElementById("percursos-validados")
  const percursosRef = ref(database, `propriedades/${userPropriedade}/percursos`)

  try {
    const snapshot = await get(percursosRef)

    if (snapshot.exists()) {
      const percursosPendentesPromises = []
      const percursosValidadosPromises = []

      snapshot.forEach((percursoSnapshot) => {
        const percursoData = percursoSnapshot.val()
        const isValidado = percursoData.validado || false

        const percursoPromise = getUserName(percursoData.userId, userPropriedade).then((userName) => {
          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${percursoSnapshot.key}" data-type="percurso">
              <div class="apontamento-info-left">
                <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${percursoData.veiculo || "N/A"}</p>
                <p><i class="fas fa-map-marker-alt"></i><strong>Objetivo:</strong> ${percursoData.objetivo || "N/A"}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${percursoData.data || new Date(percursoData.timestamp).toLocaleDateString()}</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${percursoSnapshot.key}" data-type="percurso">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-percurso-${percursoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${percursoSnapshot.key}" data-type="percurso">&times;</button>
                <h3><i class="fas fa-route"></i> Detalhes do Percurso</h3>
                <div class="apontamento-detalhes-grid">
                  <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${percursoData.veiculo || "N/A"}</p>
                  <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
                  <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${percursoData.data || new Date(percursoData.timestamp).toLocaleDateString()}</p>
                  <p><i class="fas fa-map-marker-alt"></i><strong>Objetivo:</strong> ${percursoData.objetivo || "N/A"}</p>
                  <p><i class="fas fa-id-card"></i><strong>Placa:</strong> ${percursoData.placa || "N/A"}</p>
                  <p><i class="fas fa-road"></i><strong>Km Atual:</strong> ${percursoData.kmAtual || "N/A"}</p>
                  <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${percursoData.propriedade || userPropriedade}</p>
                  <p><i class="fas fa-tag"></i><strong>Status:</strong> ${percursoData.status || (isValidado ? "Validado" : "Pendente")}</p>
                </div>
              </div>
            </div>
          `
        })

        // Adicionar à lista apropriada com base no status de validação
        if (isValidado) {
          percursosValidadosPromises.push(percursoPromise)
        } else {
          percursosPendentesPromises.push(percursoPromise)
        }
      })

      // Processar percursos pendentes
      const percursosPendentesHtml = await Promise.all(percursosPendentesPromises)
      if (percursosPendentesHtml.length > 0) {
        percursosPendentesContainer.innerHTML = percursosPendentesHtml.join("")
      } else {
        percursosPendentesContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum percurso pendente encontrado
          </div>
        `
      }

      // Processar percursos validados
      const percursosValidadosHtml = await Promise.all(percursosValidadosPromises)
      if (percursosValidadosHtml.length > 0) {
        percursosValidadosContainer.innerHTML = percursosValidadosHtml.join("")
      } else {
        percursosValidadosContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum percurso validado encontrado
          </div>
        `
      }

      setupApontamentoClicks("percurso")
      setupValidationButtons("percurso")
    } else {
      percursosPendentesContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum percurso pendente encontrado
        </div>
      `
      percursosValidadosContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum percurso validado encontrado
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar percursos:", error)
    percursosPendentesContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar percursos: ${error.message}
      </div>
    `
    percursosValidadosContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar percursos: ${error.message}
      </div>
    `
  }
}

async function fetchAbastecimentosVeiculos(userPropriedade) {
  const abastecimentosVeiculosPendentesContainer = document.getElementById("abastecimentosVeiculos-pendentes")
  const abastecimentosVeiculosValidadosContainer = document.getElementById("abastecimentosVeiculos-validados")
  const abastecimentosVeiculosRef = ref(database, `propriedades/${userPropriedade}/abastecimentoVeiculos`)

  try {
    const snapshot = await get(abastecimentosVeiculosRef)

    if (snapshot.exists()) {
      const abastecimentosVeiculosPendentesPromises = []
      const abastecimentosVeiculosValidadosPromises = []

      snapshot.forEach((abastecimentoSnapshot) => {
        const abastecimentoData = abastecimentoSnapshot.val()
        const isValidado = abastecimentoData.validado || false

        const abastecimentoPromise = getUserName(abastecimentoData.userId, userPropriedade).then((userName) => {
          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">
              <div class="apontamento-info-left">
                <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${abastecimentoData.veiculo || "N/A"}</p>
                <p><i class="fas fa-gas-pump"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-abastecimentoVeiculo-${abastecimentoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">&times;</button>
                <h3><i class="fas fa-gas-pump"></i> Detalhes do Abastecimento de Veículo</h3>
                <div class="apontamento-detalhes-grid">
                  <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${abastecimentoData.veiculo || "N/A"}</p>
                  <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
                  <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
                  <p><i class="fas fa-gas-pump"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                  <p><i class="fas fa-id-card"></i><strong>Placa:</strong> ${abastecimentoData.placa || "N/A"}</p>
                  <p><i class="fas fa-tachometer-alt"></i><strong>Horímetro:</strong> ${abastecimentoData.horimetro || "N/A"}</p>
                  <p><i class="fas fa-gas-pump"></i><strong>Posto:</strong> ${abastecimentoData.tanqueDiesel || "N/A"}</p>
                  <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${abastecimentoData.propriedade || userPropriedade}</p>
                  <p><i class="fas fa-tag"></i><strong>Status:</strong> ${abastecimentoData.status || (isValidado ? "Validado" : "Pendente")}</p>
                </div>
                ${
                  abastecimentoData.observacao
                    ? `
                <div class="apontamento-detalhes-observacao">
                  <p><i class="fas fa-comment"></i><strong>Observação:</strong> ${abastecimentoData.observacao}</p>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          `
        })

        // Adicionar à lista apropriada com base no status de validação
        if (isValidado) {
          abastecimentosVeiculosValidadosPromises.push(abastecimentoPromise)
        } else {
          abastecimentosVeiculosPendentesPromises.push(abastecimentoPromise)
        }
      })

      // Processar abastecimentos de veículos pendentes
      const abastecimentosVeiculosPendentesHtml = await Promise.all(abastecimentosVeiculosPendentesPromises)
      if (abastecimentosVeiculosPendentesHtml.length > 0) {
        abastecimentosVeiculosPendentesContainer.innerHTML = abastecimentosVeiculosPendentesHtml.join("")
      } else {
        abastecimentosVeiculosPendentesContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo pendente encontrado
          </div>
        `
      }

      // Processar abastecimentos de veículos validados
      const abastecimentosVeiculosValidadosHtml = await Promise.all(abastecimentosVeiculosValidadosPromises)
      if (abastecimentosVeiculosValidadosHtml.length > 0) {
        abastecimentosVeiculosValidadosContainer.innerHTML = abastecimentosVeiculosValidadosHtml.join("")
      } else {
        abastecimentosVeiculosValidadosContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo validado encontrado
          </div>
        `
      }

      setupApontamentoClicks("abastecimentoVeiculo")
      setupValidationButtons("abastecimentoVeiculo")
    } else {
      abastecimentosVeiculosPendentesContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo pendente encontrado
        </div>
      `
      abastecimentosVeiculosValidadosContainer.innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo validado encontrado
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar abastecimentos de veículos:", error)
    abastecimentosVeiculosPendentesContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos de veículos: ${error.message}
      </div>
    `
    abastecimentosVeiculosValidadosContainer.innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos de veículos: ${error.message}
      </div>
    `
  }
}

function setupApontamentoClicks(type) {
  document.querySelectorAll(`.apontamento[data-type="${type}"]`).forEach((apontamento) => {
    apontamento.addEventListener("click", function (e) {
      // Não expandir se o clique foi no botão de validar
      if (e.target.closest(".validar-button")) {
        return
      }

      const apontamentoId = this.dataset.id
      const modalOverlay = document.getElementById(`modal-${type}-${apontamentoId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "flex"
      }
    })
  })

  document.querySelectorAll(`.close-modal[data-type="${type}"]`).forEach((closeButton) => {
    closeButton.addEventListener("click", function (e) {
      e.stopPropagation()
      const apontamentoId = this.dataset.apontamento
      const modalOverlay = document.getElementById(`modal-${type}-${apontamentoId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "none"
      }
    })
  })

  document.querySelectorAll(`.modal-overlay[id^="modal-${type}-"]`).forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none"
      }
    })
  })
}

function setupValidationButtons(type) {
  document.querySelectorAll(`.validar-button[data-type="${type}"]`).forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation() // Impedir que o clique se propague para o apontamento

      const propriedadeNome = e.target.dataset.propriedade || e.target.closest(".validar-button").dataset.propriedade
      const apontamentoKey = e.target.dataset.apontamento || e.target.closest(".validar-button").dataset.apontamento
      const recordType = e.target.dataset.type || e.target.closest(".validar-button").dataset.type

      // Mostrar o modal de confirmação
      showConfirmationModal(propriedadeNome, apontamentoKey, recordType)
    })
  })
}

function showConfirmationModal(propriedadeNome, apontamentoKey, recordType) {
  const modal = document.getElementById("confirmationModal")
  const confirmButton = document.getElementById("confirmValidation")
  const cancelButton = document.getElementById("cancelValidation")

  modal.style.display = "flex"

  confirmButton.onclick = async () => {
    modal.style.display = "none"
    await validateRecord(propriedadeNome, apontamentoKey, recordType)
  }

  cancelButton.onclick = () => {
    modal.style.display = "none"
  }

  // Fechar o modal se clicar fora dele
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  }
}

async function validateRecord(propriedadeNome, recordKey, recordType) {
  try {
    // Determinar o caminho correto no banco de dados com base no tipo de registro
    let dbPath
    let pendingContainerId
    let validatedContainerId

    switch (recordType) {
      case "apontamento":
        dbPath = `propriedades/${propriedadeNome}/apontamentos/${recordKey}`
        pendingContainerId = "apontamentos-pendentes"
        validatedContainerId = "apontamentos-validados"
        break
      case "abastecimento":
        dbPath = `propriedades/${propriedadeNome}/abastecimentos/${recordKey}`
        pendingContainerId = "abastecimentos-pendentes"
        validatedContainerId = "abastecimentos-validados"
        break
      case "percurso":
        dbPath = `propriedades/${propriedadeNome}/percursos/${recordKey}`
        pendingContainerId = "percursos-pendentes"
        validatedContainerId = "percursos-validados"
        break
      case "abastecimentoVeiculo":
        dbPath = `propriedades/${propriedadeNome}/abastecimentoVeiculos/${recordKey}`
        pendingContainerId = "abastecimentosVeiculos-pendentes"
        validatedContainerId = "abastecimentosVeiculos-validados"
        break
      default:
        throw new Error("Tipo de registro desconhecido")
    }

    await update(ref(database, dbPath), {
      validado: true,
      status: "validado",
    })

    // Obter o elemento do registro
    const recordElement = document.querySelector(`.apontamento[data-id="${recordKey}"][data-type="${recordType}"]`)

    // Obter o elemento modal associado
    const modalElement = document.getElementById(`modal-${recordType}-${recordKey}`)

    // Mover o registro da seção pendente para a seção validada
    const pendingContainer = document.getElementById(pendingContainerId)
    const validatedContainer = document.getElementById(validatedContainerId)

    // Atualizar a classe e remover o botão de validação
    recordElement.classList.remove("em-andamento")
    recordElement.classList.add("validado")
    const validarButton = recordElement.querySelector(".validar-button")
    if (validarButton) {
      // Adiciona o status validado
      const statusElement = document.createElement("p")
      statusElement.innerHTML = '<i class="fas fa-check-circle"></i><strong>Status:</strong> Validado'
      validarButton.parentNode.appendChild(statusElement)
      validarButton.remove()
    }

    // Mover o elemento para a seção de validados
    if (pendingContainer && validatedContainer) {
      pendingContainer.removeChild(recordElement)
      validatedContainer.appendChild(recordElement)

      // Se o modal existe, mova-o também
      if (modalElement) {
        document.body.appendChild(modalElement)
      }

      // Verificar se a seção pendente está vazia
      if (pendingContainer.children.length === 0) {
        pendingContainer.innerHTML = `
          <div class="empty-apontamentos-message empty-state">
            <i class="fas fa-info-circle"></i> Nenhum registro pendente encontrado
          </div>
        `
      }
    }

    // Atualizar o status nos detalhes também
    if (modalElement) {
      const statusDetalhe = modalElement.querySelector('p:contains("Status")')
      if (statusDetalhe) {
        statusDetalhe.innerHTML = '<i class="fas fa-tag"></i><strong>Status:</strong> Validado'
      }
    }
  } catch (error) {
    console.error(`Erro ao validar ${recordType}:`, error)
    alert(`Erro ao validar o registro. Por favor, tente novamente. (${error.message})`)
  }
}
