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
    // Inicializa a estrutura da página com um layout mais intuitivo
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-clipboard-check"></i> Registros</h2>
        
        <!-- Seletor de categoria principal -->
        <div class="category-selector">
          <div class="category-card" data-category="maquinas">
            <div class="category-icon">
              <i class="fas fa-tractor"></i>
            </div>
            <h3>Máquinas</h3>
            <p>Apontamentos e abastecimentos de máquinas agrícolas</p>
          </div>
          
          <div class="category-card" data-category="veiculos">
            <div class="category-icon">
              <i class="fas fa-truck"></i>
            </div>
            <h3>Veículos</h3>
            <p>Percursos e abastecimentos de veículos</p>
          </div>
        </div>
        
        <!-- Container para conteúdo de máquinas -->
        <div class="category-content" id="maquinas-content" style="display: none;">
          <div class="back-button" data-target="category-selector">
            <i class="fas fa-arrow-left"></i> Voltar para categorias
          </div>
          
          <div class="subcategory-selector">
            <div class="subcategory-card active" data-subcategory="apontamentos" data-parent="maquinas">
              <div class="subcategory-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h4>Apontamentos</h4>
            </div>
            
            <div class="subcategory-card" data-subcategory="abastecimentos" data-parent="maquinas">
              <div class="subcategory-icon">
                <i class="fas fa-gas-pump"></i>
              </div>
              <h4>Abastecimentos</h4>
            </div>
          </div>
          
          <!-- Container para apontamentos de máquinas -->
          <div class="subcategory-content active" id="apontamentos-container">
            <div class="status-filter">
              <button class="status-filter-button active" data-status="pendentes" data-container="apontamentos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-filter-button" data-status="validados" data-container="apontamentos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <div class="records-container active" id="apontamentos-pendentes-content">
              <div id="apontamentos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando apontamentos...
                </div>
              </div>
            </div>
            
            <div class="records-container" id="apontamentos-validados-content">
              <div id="apontamentos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando apontamentos...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Container para abastecimentos de máquinas -->
          <div class="subcategory-content" id="abastecimentos-container">
            <div class="status-filter">
              <button class="status-filter-button active" data-status="pendentes" data-container="abastecimentos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-filter-button" data-status="validados" data-container="abastecimentos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <div class="records-container active" id="abastecimentos-pendentes-content">
              <div id="abastecimentos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos...
                </div>
              </div>
            </div>
            
            <div class="records-container" id="abastecimentos-validados-content">
              <div id="abastecimentos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos...
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Container para conteúdo de veículos -->
        <div class="category-content" id="veiculos-content" style="display: none;">
          <div class="back-button" data-target="category-selector">
            <i class="fas fa-arrow-left"></i> Voltar para categorias
          </div>
          
          <div class="subcategory-selector">
            <div class="subcategory-card active" data-subcategory="percursos" data-parent="veiculos">
              <div class="subcategory-icon">
                <i class="fas fa-route"></i>
              </div>
              <h4>Percursos</h4>
            </div>
            
            <div class="subcategory-card" data-subcategory="abastecimentosVeiculos" data-parent="veiculos">
              <div class="subcategory-icon">
                <i class="fas fa-gas-pump"></i>
              </div>
              <h4>Abastecimentos</h4>
            </div>
          </div>
          
          <!-- Container para percursos de veículos -->
          <div class="subcategory-content active" id="percursos-container">
            <div class="status-filter">
              <button class="status-filter-button active" data-status="pendentes" data-container="percursos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-filter-button" data-status="validados" data-container="percursos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <div class="records-container active" id="percursos-pendentes-content">
              <div id="percursos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando percursos...
                </div>
              </div>
            </div>
            
            <div class="records-container" id="percursos-validados-content">
              <div id="percursos-validados">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando percursos...
                </div>
              </div>
            </div>
          </div>
          
          <!-- Container para abastecimentos de veículos -->
          <div class="subcategory-content" id="abastecimentosVeiculos-container">
            <div class="status-filter">
              <button class="status-filter-button active" data-status="pendentes" data-container="abastecimentosVeiculos">
                <i class="fas fa-hourglass-half"></i> Para Validar
              </button>
              <button class="status-filter-button" data-status="validados" data-container="abastecimentosVeiculos">
                <i class="fas fa-check-circle"></i> Validados
              </button>
            </div>
            
            <div class="records-container active" id="abastecimentosVeiculos-pendentes-content">
              <div id="abastecimentosVeiculos-pendentes">
                <div class="empty-apontamentos-message empty-state">
                  <i class="fas fa-spinner fa-spin"></i> Carregando abastecimentos de veículos...
                </div>
              </div>
            </div>
            
            <div class="records-container" id="abastecimentosVeiculos-validados-content">
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

    // Configurar navegação entre categorias
    setupCategoryNavigation()

    // Configurar navegação entre subcategorias
    setupSubcategoryNavigation()

    // Configurar filtros de status
    setupStatusFilters()

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

function setupCategoryNavigation() {
  // Configurar cliques nos cards de categoria
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category

      // Esconder o seletor de categorias
      document.querySelector(".category-selector").style.display = "none"

      // Mostrar o conteúdo da categoria selecionada
      document.querySelectorAll(".category-content").forEach((content) => {
        content.style.display = content.id === `${category}-content` ? "block" : "none"
      })
    })
  })

  // Configurar botões de voltar
  document.querySelectorAll(".back-button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target

      // Esconder todos os conteúdos de categoria
      document.querySelectorAll(".category-content").forEach((content) => {
        content.style.display = "none"
      })

      // Mostrar o alvo (seletor de categorias)
      document.querySelector(`.${target}`).style.display = "flex"
    })
  })
}

function setupSubcategoryNavigation() {
  document.querySelectorAll(".subcategory-card").forEach((card) => {
    card.addEventListener("click", () => {
      const subcategory = card.dataset.subcategory
      const parent = card.dataset.parent

      // Atualizar classes ativas nas subcategorias
      document.querySelectorAll(`.subcategory-card[data-parent="${parent}"]`).forEach((c) => {
        c.classList.remove("active")
      })
      card.classList.add("active")

      // Mostrar/esconder conteúdo das subcategorias
      document.querySelectorAll(`.subcategory-content`).forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${subcategory}-container`) {
          content.classList.add("active")
        }
      })
    })
  })
}

function setupStatusFilters() {
  document.querySelectorAll(".status-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.dataset.status
      const container = button.dataset.container

      // Atualizar classes ativas nos botões de filtro
      const filterContainer = button.closest(".status-filter")
      filterContainer.querySelectorAll(".status-filter-button").forEach((btn) => {
        btn.classList.remove("active")
      })
      button.classList.add("active")

      // Mostrar/esconder conteúdo dos status
      const parentContainer = button.closest(".subcategory-content")
      parentContainer.querySelectorAll(".records-container").forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${container}-${status}-content`) {
          content.classList.add("active")
        }
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
            <div class="record-card ${isValidado ? "validado" : "em-andamento"}" data-id="${apontamentoSnapshot.key}" data-type="apontamento">
              <div class="record-header">
                <div class="record-title">
                  <i class="fas fa-tasks"></i>
                  <h4>Ficha de Controle: ${apontamentoData.fichaControle || "N/A"}</h4>
                </div>
                <div class="record-status">
                  ${
                    !isValidado
                      ? `
                    <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${apontamentoSnapshot.key}" data-type="apontamento">
                      <i class="fas fa-check"></i> Validar
                    </button>`
                      : `<span class="status-badge validado"><i class="fas fa-check-circle"></i> Validado</span>`
                  }
                </div>
              </div>
              <div class="record-body">
                <div class="record-info">
                  <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${apontamentoData.cultura || "N/A"}</p>
                  <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${apontamentoData.data || new Date(apontamentoData.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="record-action">
                  <button class="view-details-button" data-id="${apontamentoSnapshot.key}" data-type="apontamento">
                    <i class="fas fa-eye"></i> Ver Detalhes
                  </button>
                </div>
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

      setupRecordDetails("apontamento")
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
            <div class="record-card ${isValidado ? "validado" : "em-andamento"}" data-id="${abastecimentoSnapshot.key}" data-type="abastecimento">
              <div class="record-header">
                <div class="record-title">
                  <i class="fas fa-gas-pump"></i>
                  <h4>Abastecimento: ${abastecimentoData.bem || "N/A"}</h4>
                </div>
                <div class="record-status">
                  ${
                    !isValidado
                      ? `
                    <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimento">
                      <i class="fas fa-check"></i> Validar
                    </button>`
                      : `<span class="status-badge validado"><i class="fas fa-check-circle"></i> Validado</span>`
                  }
                </div>
              </div>
              <div class="record-body">
                <div class="record-info">
                  <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
                  <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                </div>
                <div class="record-action">
                  <button class="view-details-button" data-id="${abastecimentoSnapshot.key}" data-type="abastecimento">
                    <i class="fas fa-eye"></i> Ver Detalhes
                  </button>
                </div>
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

      setupRecordDetails("abastecimento")
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
            <div class="record-card ${isValidado ? "validado" : "em-andamento"}" data-id="${percursoSnapshot.key}" data-type="percurso">
              <div class="record-header">
                <div class="record-title">
                  <i class="fas fa-route"></i>
                  <h4>Percurso: ${percursoData.veiculo || "N/A"}</h4>
                </div>
                <div class="record-status">
                  ${
                    !isValidado
                      ? `
                    <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${percursoSnapshot.key}" data-type="percurso">
                      <i class="fas fa-check"></i> Validar
                    </button>`
                      : `<span class="status-badge validado"><i class="fas fa-check-circle"></i> Validado</span>`
                  }
                </div>
              </div>
              <div class="record-body">
                <div class="record-info">
                  <p><i class="fas fa-map-marker-alt"></i><strong>Objetivo:</strong> ${percursoData.objetivo || "N/A"}</p>
                  <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${percursoData.data || new Date(percursoData.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="record-action">
                  <button class="view-details-button" data-id="${percursoSnapshot.key}" data-type="percurso">
                    <i class="fas fa-eye"></i> Ver Detalhes
                  </button>
                </div>
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

      setupRecordDetails("percurso")
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
            <div class="record-card ${isValidado ? "validado" : "em-andamento"}" data-id="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">
              <div class="record-header">
                <div class="record-title">
                  <i class="fas fa-gas-pump"></i>
                  <h4>Abastecimento: ${abastecimentoData.veiculo || "N/A"}</h4>
                </div>
                <div class="record-status">
                  ${
                    !isValidado
                      ? `
                    <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">
                      <i class="fas fa-check"></i> Validar
                    </button>`
                      : `<span class="status-badge validado"><i class="fas fa-check-circle"></i> Validado</span>`
                  }
                </div>
              </div>
              <div class="record-body">
                <div class="record-info">
                  <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${abastecimentoData.produto || "N/A"}</p>
                  <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${abastecimentoData.quantidade || "0"} L</p>
                </div>
                <div class="record-action">
                  <button class="view-details-button" data-id="${abastecimentoSnapshot.key}" data-type="abastecimentoVeiculo">
                    <i class="fas fa-eye"></i> Ver Detalhes
                  </button>
                </div>
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

      setupRecordDetails("abastecimentoVeiculo")
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

function setupRecordDetails(type) {
  // Configurar botões de visualização de detalhes
  document.querySelectorAll(`.view-details-button[data-type="${type}"]`).forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      const recordId = button.dataset.id
      const modalOverlay = document.getElementById(`modal-${type}-${recordId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "flex"
      }
    })
  })

  // Configurar botões de fechar modal
  document.querySelectorAll(`.close-modal[data-type="${type}"]`).forEach((closeButton) => {
    closeButton.addEventListener("click", function (e) {
      e.stopPropagation()
      const recordId = this.dataset.apontamento
      const modalOverlay = document.getElementById(`modal-${type}-${recordId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "none"
      }
    })
  })

  // Configurar fechamento de modal ao clicar fora
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
    const recordElement = document.querySelector(`.record-card[data-id="${recordKey}"][data-type="${recordType}"]`)

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
      const statusElement = document.createElement("span")
      statusElement.className = "status-badge validado"
      statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Validado'
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
