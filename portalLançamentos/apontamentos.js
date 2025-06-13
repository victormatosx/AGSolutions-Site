// apontamentos.js - Página de apontamentos
import { setupSidebar, setupHeaderButtons, setupAuth, getUserName, database, ref, get } from "./common.js"
import { update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"

// Variáveis para armazenar os dados brutos para filtragem
let allApontamentos = []
let allAbastecimentos = []
let allPercursos = []
let allAbastecimentosVeiculos = []

// Variáveis para armazenar as opções de filtro do banco de dados
let filterOptions = {
  responsaveis: [],
  atividades: [],
  direcionadores: [],
  culturas: [], // Será populado dos apontamentos
  maquinarios: [],
  implementos: [],
  veiculos: [],
  tanques: [],
  produtos: [], // Será populado dos abastecimentos
}

let userPropriedadeGlobal = null; // Para armazenar o nome da propriedade

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando página de apontamentos...")
  setupSidebar()
  setupHeaderButtons()
  setupAuth(async (user, propriedadeNome) => {
    userPropriedadeGlobal = propriedadeNome; // Armazena o nome da propriedade
    await fetchAllData(propriedadeNome)
    // Adicionar listeners para o ícone do filtro APÓS a estrutura HTML ser carregada
    document.getElementById("filter-header").addEventListener("click", toggleFilter)
    // Adicionar listeners para os botões de filtro APÓS a estrutura HTML ser carregada
    document.getElementById("apply-filter-button").addEventListener("click", applyFilter)
    document.getElementById("clear-filter-button").addEventListener("click", clearFilter)
  })
})

async function fetchAllData(userPropriedade) {
  const dataContainer = document.getElementById("data-container")

  try {
    // Inicializa a estrutura da página com um layout mais intuitivo e o filtro
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-clipboard-check"></i> Registros</h2>

        <!-- Contêiner do Filtro -->
        <div class="filter-container">
          <div class="filter-header" id="filter-header">
            <h4><i class="fas fa-filter"></i> Filtro</h4>
            <i class="fas fa-chevron-down filter-icon" id="filter-toggle-icon"></i>
          </div>
          <div class="filter-content" id="filter-content">
            <!-- Campos de filtro serão injetados aqui -->
            <div id="filter-fields-container"></div>
            <div class="filter-actions">
              <button class="apply-filter-button" id="apply-filter-button"><i class="fas fa-search"></i> Aplicar Filtro</button>
              <button class="clear-filter-button" id="clear-filter-button"><i class="fas fa-times"></i> Limpar Filtro</button>
            </div>
          </div>
        </div>

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

    // Buscar opções de filtro do banco de dados
    await fetchFilterOptions(userPropriedade);

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

    // Inicializar campos de filtro para a subcategoria ativa (Apontamentos por padrão)
    updateFilterFields("apontamentos")

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

// Função para buscar as opções de filtro do Firebase
async function fetchFilterOptions(userPropriedade) {
  try {
    const optionsRef = ref(database, `propriedades/${userPropriedade}`);
    const snapshot = await get(optionsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      // Popula as opções de filtro
      // Filtrar usuários com role "user"
      filterOptions.responsaveis = data.users ? Object.values(data.users).filter(user => user.role === 'user').map(user => user.nome).filter(Boolean) : [];
      filterOptions.atividades = data.atividades ? Object.values(data.atividades).map(ativ => ativ.atividade).filter(Boolean) : []; // Puxa a chave 'atividade'
      filterOptions.direcionadores = data.direcionadores ? Object.values(data.direcionadores).map(dir => dir.direcionador).filter(Boolean) : []; // Puxa a chave 'direcionador'
      // Culturas e Produtos serão populados dos registros de apontamentos e abastecimentos
      filterOptions.maquinarios = data.maquinarios ? Object.values(data.maquinarios).map(maq => maq.nome).filter(Boolean) : [];
      filterOptions.implementos = data.implementos ? Object.values(data.implementos).map(imp => imp.nome).filter(Boolean) : [];
      filterOptions.veiculos = data.veiculos ? Object.values(data.veiculos).map(veic => `${veic.modelo} - ${veic.placa}`).filter(Boolean) : []; // Puxa 'modelo - placa'
      filterOptions.tanques = data.tanques ? Object.values(data.tanques).map(tanq => tanq.nome).filter(Boolean) : []; // Puxa a chave 'nome'

      console.log("Opções de filtro carregadas:", filterOptions);

    } else {
      console.log("Nenhum dado de opções de filtro encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar opções de filtro:", error);
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

      // Atualizar campos de filtro para a primeira subcategoria da categoria selecionada
      const firstSubcategoryCard = document.querySelector(`#${category}-content .subcategory-card.active`)
      if (firstSubcategoryCard) {
        updateFilterFields(firstSubcategoryCard.dataset.subcategory)
      }
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

      // Limpar campos de filtro ao voltar para as categorias principais
      updateFilterFields(null)
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

      // Atualizar campos de filtro com base na subcategoria selecionada
      updateFilterFields(subcategory)
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

      // Aplicar filtro após mudar o status
      applyFilter()
    })
  })
}

// Função para alternar a visibilidade do contêiner do filtro
function toggleFilter() {
  const filterContent = document.getElementById("filter-content")
  const filterIcon = document.getElementById("filter-toggle-icon")

  filterContent.classList.toggle("visible")
  filterIcon.classList.toggle("rotated")
}

// Função para atualizar os campos de filtro com base na subcategoria ativa
function updateFilterFields(subcategory) {
  const filterFieldsContainer = document.getElementById("filter-fields-container")
  filterFieldsContainer.innerHTML = "" // Limpa os campos existentes

  let fields = []
  let optionsData = {}

  switch (subcategory) {
    case "apontamentos":
      fields = [
        { id: "responsavel", label: "Responsável", type: "select", options: filterOptions.responsaveis },
        { id: "data", label: "Data", type: "date" },
        { id: "fichaControle", label: "Ficha de Controle", type: "text" },
        { id: "direcionador", label: "Direcionador", type: "select", options: filterOptions.direcionadores },
        { id: "cultura", label: "Cultura", type: "select", options: filterOptions.culturas },
        { id: "atividade", label: "Atividade", type: "select", options: filterOptions.atividades },
        { id: "maquinario", label: "Maquinário", type: "select", options: filterOptions.maquinarios },
        { id: "implemento", label: "Implemento", type: "select", options: filterOptions.implementos },
      ]
      break
    case "abastecimentos":
      fields = [
        { id: "responsavel", label: "Responsável", type: "select", options: filterOptions.responsaveis },
        { id: "data", label: "Data", type: "date" },
        { id: "produto", label: "Produto", type: "select", options: filterOptions.produtos },
        { id: "tanqueDiesel", label: "Tanque", type: "select", options: filterOptions.tanques }, // Corrigido para tanqueDiesel
        { id: "bem", label: "Maquinário", type: "select", options: filterOptions.maquinarios }, // Corrigido para bem (nome do maquinário)
      ]
      break
    case "percursos":
      fields = [
        { id: "responsavel", label: "Responsável", type: "select", options: filterOptions.responsaveis },
        { id: "data", label: "Data", type: "date" },
        { id: "veiculo", label: "Veículo", type: "select", options: filterOptions.veiculos },
      ]
      break
    case "abastecimentosVeiculos":
      fields = [
        { id: "responsavel", label: "Responsável", type: "select", options: filterOptions.responsaveis },
        { id: "data", label: "Data", type: "date" },
        { id: "produto", label: "Produto", type: "select", options: filterOptions.produtos },
        { id: "tanqueDiesel", label: "Tanque", type: "select", options: filterOptions.tanques }, // Pode ser "Posto" também, usando tanqueDiesel
        { id: "veiculo", label: "Veículo", type: "select", options: filterOptions.veiculos },
      ]
      break
    default:
      // Nenhum campo de filtro para as categorias principais
      filterFieldsContainer.innerHTML = `
        <div class="empty-filter-message">
          Selecione uma subcategoria para ver as opções de filtro.
        </div>
      `
      return
  }

  const filterGrid = document.createElement("div")
  filterGrid.className = "filter-grid"

  fields.forEach(field => {
    const fieldDiv = document.createElement("div")
    fieldDiv.className = "filter-field"

    const label = document.createElement("label")
    label.setAttribute("for", `filter-${subcategory}-${field.id}`)
    label.textContent = field.label

    let inputElement
    if (field.type === "select") {
      inputElement = document.createElement("select")
      inputElement.id = `filter-${subcategory}-${field.id}`
      inputElement.name = `filter-${subcategory}-${field.id}`
      inputElement.setAttribute("data-filter-key", field.id); // Adiciona data attribute para a chave do filtro

      // Adicionar opção padrão "Todos"
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Todos ${field.label}`;
      inputElement.appendChild(defaultOption);

      // Adicionar opções do banco de dados
      if (field.options && Array.isArray(field.options)) {
        // Ordenar as opções alfabeticamente
        const sortedOptions = [...field.options].sort((a, b) => {
            // Garantir que os valores sejam strings antes de chamar toLowerCase
            const valA = String(a || '').toLowerCase();
            const valB = String(b || '').toLowerCase();
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        sortedOptions.forEach(optionValue => {
            // Verifica se optionValue é válido antes de criar a opção
            if (optionValue !== null && optionValue !== undefined && optionValue !== '') {
                const option = document.createElement("option");
                option.value = String(optionValue); // Garante que o valor é string
                option.textContent = String(optionValue); // Garante que o texto é string
                inputElement.appendChild(option);
            }
        });
      }

    } else {
      inputElement = document.createElement("input")
      inputElement.type = field.type
      inputElement.id = `filter-${subcategory}-${field.id}`
      inputElement.name = `filter-${subcategory}-${field.id}`
      inputElement.setAttribute("data-filter-key", field.id); // Adiciona data attribute para a chave do filtro
    }


    fieldDiv.appendChild(label)
    fieldDiv.appendChild(inputElement)
    filterGrid.appendChild(fieldDiv)
  })

  filterFieldsContainer.appendChild(filterGrid)

  // Adicionar listeners aos novos campos de filtro
  filterFieldsContainer.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("input", applyFilter);
    input.addEventListener("change", applyFilter); // Para input[type="date"] e select
  });
}

// Função para obter os valores atuais dos campos de filtro
function getFilterValues() {
  const activeSubcategoryCard = document.querySelector(".subcategory-card.active")
  if (!activeSubcategoryCard) return {}

  const subcategory = activeSubcategoryCard.dataset.subcategory
  const values = {}
  const filterFieldsContainer = document.getElementById("filter-fields-container")

  filterFieldsContainer.querySelectorAll("input, select").forEach(input => {
    const key = input.dataset.filterKey;
    const value = input.value.trim(); // Não converte para lowercase aqui
    if (value) {
      values[key] = value;
    }
  });
  return values
}

// Função para aplicar o filtro
async function applyFilter() {
  const activeSubcategoryCard = document.querySelector(".subcategory-card.active")
  if (!activeSubcategoryCard) return

  const subcategory = activeSubcategoryCard.dataset.subcategory
  const filterValues = getFilterValues()

  // Obter o status ativo (pendentes ou validados)
  const activeStatusButton = document.querySelector(`#${subcategory}-container .status-filter-button.active`)
  const status = activeStatusButton ? activeStatusButton.dataset.status : "pendentes" // Padrão para pendentes

  let dataToFilter = []
  let containerId = ""
  let recordType = subcategory; // Usar subcategory como recordType para renderização

  switch (subcategory) {
    case "apontamentos":
      dataToFilter = allApontamentos
      containerId = `apontamentos-${status}-content` // Corrigido ID
      recordType = "apontamento"; // Tipo para renderização
      break
    case "abastecimentos":
      dataToFilter = allAbastecimentos
      containerId = `abastecimentos-${status}-content` // Corrigido
      recordType = "abastecimento"; // Tipo para renderização
      break
    case "percursos":
      dataToFilter = allPercursos
      containerId = `percursos-${status}-content` // Corrigido
      recordType = "percurso"; // Tipo para renderização
      break
    case "abastecimentosVeiculos":
      dataToFilter = allAbastecimentosVeiculos
      containerId = `abastecimentosVeiculos-${status}-content` // Corrigido
      recordType = "abastecimentoVeiculo"; // Tipo para renderização
      break
    default:
      return
  }

  const filteredData = dataToFilter.filter(record => {
    // Filtrar por status primeiro
    const isValidado = record.validado || false
    if (status === "pendentes" && isValidado) return false
    if (status === "validados" && !isValidado) return false

    // Aplicar outros filtros
    for (const key in filterValues) {
      if (filterValues.hasOwnProperty(key)) {
        const filterValue = filterValues[key].toLowerCase(); // Converte o valor do filtro para lowercase

        let recordValue;

        // Mapear chaves de filtro para chaves de dados, se necessário
        let dataKey = key;
        if (subcategory === "abastecimentos" && key === "maquinario") {
            dataKey = "bem"; // No abastecimento, o maquinário é 'bem'
        } else if ((subcategory === "abastecimentos" || subcategory === "abastecimentosVeiculos") && key === "tanque") {
             dataKey = "tanqueDiesel"; // No abastecimento, o tanque é 'tanqueDiesel'
        } else if (subcategory === "apontamentos" && (key === "maquinario" || key === "implemento")) {
             // Lidar com campos aninhados em operacoesMecanizadas
             const operacoes = record.operacoesMecanizadas || {};
             let matchFound = false;
             for (const opKey in operacoes) {
                 if (operacoes.hasOwnProperty(opKey)) {
                     const operacao = operacoes[opKey];
                     if (key === "maquinario" && operacao.bem && String(operacao.bem).toLowerCase().includes(filterValue)) {
                         matchFound = true;
                         break;
                     }
                     if (key === "implemento" && operacao.implemento && String(operacao.implemento).toLowerCase().includes(filterValue)) {
                         matchFound = true;
                         break;
                     }
                 }
             }
             if (!matchFound) return false;
             continue; // Ir para o próximo filtro
        } else if (subcategory === "percursos" && key === "veiculo") {
             // Para percursos, o filtro de veículo deve comparar com "modelo - placa"
             const veiculoDisplay = record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || '';
             if (!String(veiculoDisplay).toLowerCase().includes(filterValue)) {
                 return false;
             }
             continue; // Ir para o próximo filtro
        } else if (subcategory === "abastecimentosVeiculos" && key === "veiculo") {
             // Para abastecimentos de veículos, o filtro de veículo deve comparar com "modelo - placa"
             const veiculoDisplay = record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || '';
             if (!String(veiculoDisplay).toLowerCase().includes(filterValue)) {
                 return false;
             }
             continue; // Ir para o próximo filtro
        } else if (subcategory === "apontamentos" && key === "atividade") {
             // Para apontamentos, o filtro de atividade deve comparar com a chave 'atividade'
             if (!String(record.atividade).toLowerCase().includes(filterValue)) {
                 return false;
             }
             continue; // Ir para o próximo filtro
        } else if (subcategory === "apontamentos" && key === "direcionador") {
             // Para apontamentos, o filtro de direcionador deve comparar com a chave 'direcionador'
             if (!String(record.direcionador).toLowerCase().includes(filterValue)) {
                 return false;
             }
             continue; // Ir para o próximo filtro
        }


        recordValue = record[dataKey];


        // Lidar com a data
        if (key === "data") {
          // Converte a data do registro para o formato YYYY-MM-DD para comparação
          let recordDateFormatted = '';
          if (record.data) {
              // Assume formato DD/MM/YYYY e converte
              const parts = record.data.split('/');
              if (parts.length === 3) {
                  recordDateFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
          } else if (record.timestamp) {
              // Se for timestamp, converte para YYYY-MM-DD
              recordDateFormatted = new Date(record.timestamp).toISOString().split('T')[0];
          }

          if (recordDateFormatted && recordDateFormatted !== filterValue) {
            return false;
          }
          continue; // Ir para o próximo filtro
        }

        // Lidar com o responsável (comparar userId com o nome selecionado)
        if (key === "responsavel") {
            // Encontrar o userId correspondente ao nome selecionado
            const selectedUserName = filterValues[key];
            // Isso requer uma busca reversa ou pré-mapeamento de nome para userId
            // Por enquanto, vamos assumir que o campo 'responsavel' no registro já contém o nome
            // ou que podemos comparar o userId com o nome buscado.
            // Uma solução mais robusta seria pré-mapear userId para nome.
            // Para simplificar, vamos comparar o nome buscado com o nome do usuário obtido.
            // Se o nome do usuário não estiver disponível no registro, pulamos este filtro para este registro.
            if (record.userId) {
                 // Precisamos obter o nome do usuário para comparar
                 // Isso é ineficiente dentro do loop de filtro.
                 // Uma abordagem melhor é pré-carregar os nomes dos usuários e adicioná-los aos registros.
                 // Por enquanto, vamos pular a filtragem por responsável aqui e assumir que o nome
                 // será comparado na função de renderização ou que o campo 'responsavel' já existe.
                 // Se o campo 'responsavel' existir no registro, usamos ele.
                 const recordResponsavel = record.responsavel || '';
                 if (!recordResponsavel.toLowerCase().includes(filterValue)) {
                     return false;
                 }
            } else {
                // Se não tem userId nem responsavel no registro, não pode corresponder ao filtro de responsável
                return false;
            }
            continue; // Ir para o próximo filtro
        }


        // Filtragem geral de texto/seleção
        // Verifica se o valor do registro existe e se, convertido para string e lowercase, inclui o valor do filtro
        if (recordValue === undefined || recordValue === null || !String(recordValue).toLowerCase().includes(filterValue)) {
          return false;
        }
      }
    }
    return true;
  });

  // Renderizar os dados filtrados
  renderRecords(filteredData, containerId, recordType);
}


// Função para limpar os campos de filtro
function clearFilter() {
  const activeSubcategoryCard = document.querySelector(".subcategory-card.active")
  if (!activeSubcategoryCard) return

  const subcategory = activeSubcategoryCard.dataset.subcategory
  const filterFieldsContainer = document.getElementById("filter-fields-container")

  filterFieldsContainer.querySelectorAll("input, select").forEach(input => {
    if (input.type === "select") {
      input.value = ""; // Seleciona a opção padrão (Todos)
    } else {
      input.value = ""; // Limpa campos de texto/data
    }
  })

  // Reaplicar o filtro para mostrar todos os registros (sem filtro)
  applyFilter()
}


// Função genérica para renderizar registros em um contêiner específico
async function renderRecords(records, containerId, recordType) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = "" // Limpa o conteúdo atual

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-apontamentos-message empty-state">
        <i class="fas fa-info-circle"></i> Nenhum registro encontrado com os filtros aplicados.
      </div>
    `
    return
  }

  const recordPromises = records.map(async (record) => {
    // Obter o nome do usuário para exibição
    const userName = record.userId ? await getUserName(record.userId, userPropriedadeGlobal) : "N/A"; // Usar userPropriedadeGlobal
    const isValidado = record.validado || false;

    let recordHtml = "";
    let modalHtml = "";
    let recordTitle = "";
    let recordInfoHtml = "";
    let modalDetailsHtml = "";
    let modalTitle = "";
    let iconClass = "";

    switch (recordType) {
      case "apontamento":
        iconClass = "fas fa-tasks";
        recordTitle = `Ficha de Controle: ${record.fichaControle || "N/A"}`;
        recordInfoHtml = `
          <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${record.cultura || "N/A"}</p>
          <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${record.data || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : "N/A")}</p>
        `;
        modalTitle = "Detalhes do Apontamento";
        let operacoesHtml = "";
        const operacoesMecanizadas = record.operacoesMecanizadas || {};
        const operacoes = Object.values(operacoesMecanizadas); // Convert object to array
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
          `;
        }
        modalDetailsHtml = `
          <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${record.fichaControle || "N/A"}</p>
          <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
          <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${record.data || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : "N/A")}</p>
          <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${record.cultura || "N/A"}</p>
          <p><i class="fas fa-tractor"></i><strong>Atividade:</strong> ${record.atividade || "N/A"}</p>
          <p><i class="fas fa-compass"></i><strong>Direcionador:</strong> ${record.direcionador || "N/A"}</p>
          <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${record.propriedade || "N/A"}</p>
          <p><i class="fas fa-tag"></i><strong>Status:</strong> ${record.status || (isValidado ? "Validado" : "Pendente")}</p>
          ${record.observacao ? `<div class="apontamento-detalhes-observacao"><p><i class="fas fa-comment"></i><strong>Observação:</strong> ${record.observacao}</p></div>` : ""}
          ${operacoesHtml}
        `;
        break;
      case "abastecimento":
        iconClass = "fas fa-gas-pump";
        recordTitle = `Abastecimento: ${record.bem || "N/A"}`;
        recordInfoHtml = `
          <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${record.produto || "N/A"}</p>
          <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${record.quantidade || "0"} L</p>
        `;
        modalTitle = "Detalhes do Abastecimento";
        modalDetailsHtml = `
          <p><i class="fas fa-truck-monster"></i><strong>Equipamento:</strong> ${record.bem || "N/A"}</p>
          <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
          <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${record.produto || "N/A"}</p>
          <p><i class="fas fa-gas-pump"></i><strong>Quantidade:</strong> ${record.quantidade || "0"} L</p>
          <p><i class="fas fa-tachometer-alt"></i><strong>Horímetro:</strong> ${record.horimetro || "N/A"}</p>
          <p><i class="fas fa-gas-pump"></i><strong>Tanque:</strong> ${record.tanqueDiesel || "N/A"}</p>
          <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${record.propriedade || "N/A"}</p>
          <p><i class="fas fa-tag"></i><strong>Status:</strong> ${record.status || (isValidado ? "Validado" : "Pendente")}</p>
          ${record.observacao ? `<div class="apontamento-detalhes-observacao"><p><i class="fas fa-comment"></i><strong>Observação:</strong> ${record.observacao}</p></div>` : ""}
        `;
        break;
      case "percurso":
        iconClass = "fas fa-route";
        recordTitle = `Percurso: ${record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || "N/A"}`; // Exibe modelo - placa
        recordInfoHtml = `
          <p><i class="fas fa-map-marker-alt"></i><strong>Objetivo:</strong> ${record.objetivo || "N/A"}</p>
          <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${record.data || (record.timestamp ? new Date(record.timestamp).toLocaleDateString() : "N/A")}</p>
        `;
        modalTitle = "Detalhes do Percurso";
        modalDetailsHtml = `
          <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || "N/A"}</p>
          <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
          <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${record.data || new Date(record.timestamp).toLocaleDateString()}</p>
          <p><i class="fas fa-map-marker-alt"></i><strong>Objetivo:</strong> ${record.objetivo || "N/A"}</p>
          <p><i class="fas fa-id-card"></i><strong>Placa:</strong> ${record.placa || "N/A"}</p>
          <p><i class="fas fa-road"></i><strong>Km Atual:</strong> ${record.kmAtual || "N/A"}</p>
          <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${record.propriedade || "N/A"}</p>
          <p><i class="fas fa-tag"></i><strong>Status:</strong> ${record.status || (isValidado ? "Validado" : "Pendente")}</p>
        `;
        break;
      case "abastecimentoVeiculo":
        iconClass = "fas fa-gas-pump";
        recordTitle = `Abastecimento: ${record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || "N/A"}`; // Exibe modelo - placa
        recordInfoHtml = `
          <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${record.produto || "N/A"}</p>
          <p><i class="fas fa-tint"></i><strong>Quantidade:</strong> ${record.quantidade || "0"} L</p>
        `;
        modalTitle = "Detalhes do Abastecimento de Veículo";
        modalDetailsHtml = `
          <p><i class="fas fa-truck"></i><strong>Veículo:</strong> ${record.modelo && record.placa ? `${record.modelo} - ${record.placa}` : record.veiculo || "N/A"}</p>
          <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
          <p><i class="fas fa-tint"></i><strong>Produto:</strong> ${record.produto || "N/A"}</p>
          <p><i class="fas fa-gas-pump"></i><strong>Quantidade:</strong> ${record.quantidade || "0"} L</p>
          <p><i class="fas fa-id-card"></i><strong>Placa:</strong> ${record.placa || "N/A"}</p>
          <p><i class="fas fa-tachometer-alt"></i><strong>Horímetro:</strong> ${record.horimetro || "N/A"}</p>
          <p><i class="fas fa-gas-pump"></i><strong>Posto:</strong> ${record.tanqueDiesel || "N/A"}</p>
          <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${record.propriedade || "N/A"}</p>
          <p><i class="fas fa-tag"></i><strong>Status:</strong> ${record.status || (isValidado ? "Validado" : "Pendente")}</p>
          ${record.observacao ? `<div class="apontamento-detalhes-observacao"><p><i class="fas fa-comment"></i><strong>Observação:</strong> ${record.observacao}</p></div>` : ""}
        `;
        break;
      default:
        return ""; // Retorna string vazia para tipos desconhecidos
    }

    recordHtml = `
      <div class="record-card ${isValidado ? "validado" : "em-andamento"}" data-id="${record.key}" data-type="${recordType}">
        <div class="record-header">
          <div class="record-title">
            <i class="${iconClass}"></i>
            <h4>${recordTitle}</h4>
          </div>
          <div class="record-status">
            ${
              !isValidado
                ? `
              <button class="validar-button" data-propriedade="${record.propriedade}" data-apontamento="${record.key}" data-type="${recordType}">
                <i class="fas fa-check"></i> Validar
              </button>`
                : `<span class="status-badge validado"><i class="fas fa-check-circle"></i> Validado</span>`
            }
          </div>
        </div>
        <div class="record-body">
          <div class="record-info">
            ${recordInfoHtml}
          </div>
          <div class="record-action">
            <button class="view-details-button" data-id="${record.key}" data-type="${recordType}">
              <i class="fas fa-eye"></i> Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `;

    modalHtml = `
      <div class="modal-overlay" id="modal-${recordType}-${record.key}">
        <div class="apontamento-detalhes">
          <button class="close-modal" data-apontamento="${record.key}" data-type="${recordType}">&times;</button>
          <h3><i class="${iconClass}"></i> ${modalTitle}</h3>
          <div class="apontamento-detalhes-grid">
            ${modalDetailsHtml}
          </div>
        </div>
      </div>
    `;

    return recordHtml + modalHtml;
  });

  const recordsHtml = await Promise.all(recordPromises);
  container.innerHTML = recordsHtml.join("");

  // Reconfigurar listeners para os novos elementos renderizados
  setupRecordDetails(recordType);
  setupValidationButtons(recordType);
}


async function fetchApontamentos(userPropriedade) {
  const apontamentosRef = ref(database, `propriedades/${userPropriedade}/apontamentos`)

  try {
    const snapshot = await get(apontamentosRef)

    if (snapshot.exists()) {
      // Armazenar os dados brutos
      allApontamentos = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value, propriedade: userPropriedade }));

      // Extrair culturas únicas para o filtro
      const culturasUnicas = [...new Set(allApontamentos.map(ap => ap.cultura).filter(Boolean))];
      filterOptions.culturas = culturasUnicas;

      // Renderizar os apontamentos pendentes e validados inicialmente
      const apontamentosPendentes = allApontamentos.filter(ap => !ap.validado);
      const apontamentosValidados = allApontamentos.filter(ap => ap.validado);

      renderRecords(apontamentosPendentes, "apontamentos-pendentes-content", "apontamento"); // Corrigido ID
      renderRecords(apontamentosValidados, "apontamentos-validados-content", "apontamento"); // Corrigido ID

    } else {
      allApontamentos = []; // Limpa os dados se não houver nada
      document.getElementById("apontamentos-pendentes-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum apontamento pendente encontrado
        </div>
      `;
      document.getElementById("apontamentos-validados-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum apontamento validado encontrado
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao buscar apontamentos:", error)
    document.getElementById("apontamentos-pendentes-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar apontamentos: ${error.message}
      </div>
    `;
    document.getElementById("apontamentos-validados-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar apontamentos: ${error.message}
      </div>
    `;
  }
}

async function fetchAbastecimentos(userPropriedade) {
  const abastecimentosRef = ref(database, `propriedades/${userPropriedade}/abastecimentos`)

  try {
    const snapshot = await get(abastecimentosRef)

    if (snapshot.exists()) {
      // Armazenar os dados brutos
      allAbastecimentos = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value, propriedade: userPropriedade }));

      // Extrair produtos únicos para o filtro
      const produtosUnicos = [...new Set(allAbastecimentos.map(ab => ab.produto).filter(Boolean))];
      filterOptions.produtos = produtosUnicos;


      // Renderizar os abastecimentos pendentes e validados inicialmente
      const abastecimentosPendentes = allAbastecimentos.filter(ab => !ab.validado);
      const abastecimentosValidados = allAbastecimentos.filter(ab => ab.validado);

      renderRecords(abastecimentosPendentes, "abastecimentos-pendentes-content", "abastecimento"); // Corrigido ID
      renderRecords(abastecimentosValidados, "abastecimentos-validados-content", "abastecimento"); // Corrigido ID

    } else {
      allAbastecimentos = [];
      document.getElementById("abastecimentos-pendentes-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento pendente encontrado
        </div>
      `;
      document.getElementById("abastecimentos-validados-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento validado encontrado
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao buscar abastecimentos:", error)
    document.getElementById("abastecimentos-pendentes-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos: ${error.message}
      </div>
    `;
    document.getElementById("abastecimentos-validados-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos: ${error.message}
      </div>
    `;
  }
}

async function fetchPercursos(userPropriedade) {
  const percursosRef = ref(database, `propriedades/${userPropriedade}/percursos`)

  try {
    const snapshot = await get(percursosRef)

    if (snapshot.exists()) {
      // Armazenar os dados brutos
      allPercursos = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value, propriedade: userPropriedade }));

      // Renderizar os percursos pendentes e validados inicialmente
      const percursosPendentes = allPercursos.filter(p => !p.validado);
      const percursosValidados = allPercursos.filter(p => p.validado);

      renderRecords(percursosPendentes, "percursos-pendentes-content", "percurso"); // Corrigido ID
      renderRecords(percursosValidados, "percursos-validados-content", "percurso"); // Corrigido ID

    } else {
      allPercursos = []; // Limpa os dados se não houver nada
      document.getElementById("percursos-pendentes-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum percurso pendente encontrado
        </div>
      `;
      document.getElementById("percursos-validados-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum percurso validado encontrado
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao buscar percursos:", error)
    document.getElementById("percursos-pendentes-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar percursos: ${error.message}
      </div>
    `;
    document.getElementById("percursos-validados-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar percursos: ${error.message}
      </div>
    `;
  }
}

async function fetchAbastecimentosVeiculos(userPropriedade) {
  const abastecimentosVeiculosRef = ref(database, `propriedades/${userPropriedade}/abastecimentoVeiculos`)

  try {
    const snapshot = await get(abastecimentosVeiculosRef)

    if (snapshot.exists()) {
      // Armazenar os dados brutos
      allAbastecimentosVeiculos = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value, propriedade: userPropriedade }));

      // Renderizar os abastecimentos de veículos pendentes e validados inicialmente
      const abastecimentosVeiculosPendentes = allAbastecimentosVeiculos.filter(av => !av.validado);
      const abastecimentosVeiculosValidados = allAbastecimentosVeiculos.filter(av => av.validado);

      renderRecords(abastecimentosVeiculosPendentes, "abastecimentosVeiculos-pendentes-content", "abastecimentoVeiculo"); // Corrigido ID
      renderRecords(abastecimentosVeiculosValidados, "abastecimentosVeiculos-validados-content", "abastecimentoVeiculo"); // Corrigido ID

    } else {
      allAbastecimentosVeiculos = []; // Limpa os dados se não houver nada
      document.getElementById("abastecimentosVeiculos-pendentes-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo pendente encontrado
        </div>
      `;
      document.getElementById("abastecimentosVeiculos-validados-content").innerHTML = `
        <div class="empty-apontamentos-message empty-state">
          <i class="fas fa-info-circle"></i> Nenhum abastecimento de veículo validado encontrado
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao buscar abastecimentos de veículos:", error)
    document.getElementById("abastecimentosVeiculos-pendentes-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos de veículos: ${error.message}
      </div>
    `;
    document.getElementById("abastecimentosVeiculos-validados-content").innerHTML = `
      <div class="empty-apontamentos-message error-state">
        <i class="fas fa-exclamation-circle"></i> Erro ao carregar abastecimentos de veículos: ${error.message}
      </div>
    `;
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
    let allRecordsArray; // Referência ao array de dados brutos

    switch (recordType) {
      case "apontamento":
        dbPath = `propriedades/${propriedadeNome}/apontamentos/${recordKey}`
        allRecordsArray = allApontamentos;
        break
      case "abastecimento":
        dbPath = `propriedades/${propriedadeNome}/abastecimentos/${recordKey}`
        allRecordsArray = allAbastecimentos;
        break
      case "percurso":
        dbPath = `propriedades/${propriedadeNome}/percursos/${recordKey}`
        allRecordsArray = allPercursos;
        break
      case "abastecimentoVeiculo":
        dbPath = `propriedades/${propriedadeNome}/abastecimentoVeiculos/${recordKey}`
        allRecordsArray = allAbastecimentosVeiculos;
        break
      default:
        throw new Error("Tipo de registro desconhecido")
    }

    await update(ref(database, dbPath), {
      validado: true,
      status: "validado",
    })

    // Atualizar o status no array de dados brutos
    const recordIndex = allRecordsArray.findIndex(record => record.key === recordKey);
    if (recordIndex !== -1) {
        allRecordsArray[recordIndex].validado = true;
        allRecordsArray[recordIndex].status = "validado";
    }


    // Reaplicar o filtro para atualizar a exibição
    applyFilter();

  } catch (error) {
    console.error(`Erro ao validar ${recordType}:`, error)
    alert(`Erro ao validar o registro. Por favor, tente novamente. (${error.message})`)
  }
}