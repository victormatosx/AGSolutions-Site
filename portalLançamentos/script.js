import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"
import { maquinarios, implementos } from "./maquinasData.js"

const firebaseConfig = {
  apiKey: "AIzaSyC8C_yucprravGbaJSrRjKJDz2Vv80fMc4",
  authDomain: "app-hora-maquina.firebaseapp.com",
  databaseURL: "https://app-hora-maquina-default-rtdb.firebaseio.com",
  projectId: "app-hora-maquina",
  storageBucket: "app-hora-maquina.firebasestorage.app",
  messagingSenderId: "51002260602",
  appId: "1:51002260602:web:0dd4cd491dbefe432acfc3",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

// Funcionalidade da Sidebar
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.querySelector(".main-content")
  const toggleButton = document.getElementById("toggleSidebar")

  function toggleSidebar() {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")

    // Adicione um pequeno atraso para garantir que a transição seja suave
    if (sidebar.classList.contains("collapsed")) {
      setTimeout(() => {
        mainContent.style.marginLeft = "0"
      }, 300)
    } else {
      mainContent.style.marginLeft = ""
    }
  }

  toggleButton.addEventListener("click", toggleSidebar)

  // Ajusta o conteúdo principal quando a página carrega com a sidebar fechada
  if (sidebar.classList.contains("collapsed")) {
    mainContent.classList.add("expanded")
    mainContent.style.marginLeft = "0"
  }

  const sidebarLinks = document.querySelectorAll(".sidebar-link")
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", async function (e) {
      e.preventDefault()
      sidebarLinks.forEach((l) => l.classList.remove("active"))
      this.classList.add("active")

      const linkText = this.querySelector("span").textContent

      // Atualiza o breadcrumb
      const breadcrumb = document.querySelector(".breadcrumb")
      breadcrumb.innerHTML = `
        <i class="fas fa-home"></i>
        <span class="separator">/</span>
        <span>${linkText}</span>
      `

      // Handle different sidebar links
      const user = auth.currentUser
      if (user) {
        const userPropriedade = await getUserPropriedade(user.uid)
        if (userPropriedade) {
          if (linkText === "Usuários") {
            fetchUsers(userPropriedade)
          } else if (linkText === "Apontamentos" || linkText === "Dashboard") {
            fetchApontamentos(userPropriedade)
          } else if (linkText === "Máquinas") {
            fetchMaquinas(userPropriedade)
          }
        }
      }

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("mobile-open")
      }
    })
  })

  function handleMobileView() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("collapsed")
      sidebar.classList.add("mobile-open")
      mainContent.classList.remove("expanded")
    } else {
      sidebar.classList.remove("mobile-open")
    }
  }

  window.addEventListener("resize", handleMobileView)
})

const authStatus = document.getElementById("auth-status")
const loginButton = document.getElementById("login-button")
const dataContainer = document.getElementById("data-container")
const propriedadeNomeElement = document.getElementById("propriedade-nome")

function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Login bem-sucedido:", result.user)
    })
    .catch((error) => {
      console.error("Erro no login:", error)
    })
}

async function getUserPropriedade(uid) {
  const propriedadesRef = ref(database, "propriedades")
  const snapshot = await get(propriedadesRef)

  if (snapshot.exists()) {
    for (const [propriedadeNome, propriedadeData] of Object.entries(snapshot.val())) {
      if (propriedadeData.users && propriedadeData.users[uid]) {
        return propriedadeNome
      }
    }
  }
  return null
}

async function getUserName(uid, propriedadeNome) {
  const userRef = ref(database, `propriedades/${propriedadeNome}/users/${uid}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    return snapshot.val().nome || "Nome não encontrado"
  }
  return "Nome não encontrado"
}

async function fetchApontamentos(userPropriedade) {
  const propriedadeRef = ref(database, `propriedades/${userPropriedade}/apontamentos`)
  try {
    const snapshot = await get(propriedadeRef)
    if (snapshot.exists()) {
      const apontamentosPromises = []

      snapshot.forEach((apontamentoSnapshot) => {
        const apontamentoData = apontamentoSnapshot.val()
        const apontamentoPromise = getUserName(apontamentoData.userId, userPropriedade).then((userName) => {
          const isValidado = apontamentoData.validado || false
          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}">
              <p><i class="fas fa-tasks"></i><strong>Ordem de Serviço:</strong> ${apontamentoData.ordemServico || "N/A"}</p>
              <p><i class="fas fa-user"></i><strong>Usuário:</strong> ${userName}</p>
              <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${new Date(apontamentoData.timestamp).toLocaleString()}</p>
              <p><i class="fas fa-gas-pump"></i><strong>Abastecimento:</strong> ${apontamentoData.abastecimento || "N/A"}</p>
              <p><i class="fas fa-tractor"></i><strong>Operação Mecanizada:</strong> ${apontamentoData.operacaoMecanizada || "N/A"}</p>
              ${
                !isValidado
                  ? `
                <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${apontamentoSnapshot.key}">
                  <i class="fas fa-check"></i> Validar
                </button>`
                  : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
              }
            </div>
          `
        })
        apontamentosPromises.push(apontamentoPromise)
      })

      const apontamentosHtml = await Promise.all(apontamentosPromises)
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-clipboard-check"></i> Apontamentos</h2>
          <div class="apontamentos-tabs">
            <button class="tab-button active" data-tab="em-andamento">
              <i class="fas fa-clock"></i> Em Andamento
            </button>
            <button class="tab-button" data-tab="validados">
              <i class="fas fa-check-double"></i> Validados
            </button>
          </div>
          <div class="apontamentos-container">
            ${apontamentosHtml.join("")}
            <div class="empty-apontamentos-message empty-state" style="display: none;">
              <i class="fas fa-info-circle"></i> Nenhum apontamento no momento
            </div>
          </div>
        </div>
      `

      setupTabsAndValidationButtons()

      // Ativa a aba "Em Andamento" por padrão para verificar se há apontamentos
      const emAndamentoTab = document.querySelector('.tab-button[data-tab="em-andamento"]')
      if (emAndamentoTab) {
        emAndamentoTab.click()
      }
    } else {
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-clipboard-check"></i> Apontamentos</h2>
          <p class="empty-state">
            <i class="fas fa-info-circle"></i>
            Nenhum apontamento encontrado.
          </p>
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar apontamentos:", error)
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

// Função para exibir maquinários e implementos
function fetchMaquinas(userPropriedade) {
  try {
    // Montar o HTML completo com as duas listas e o campo de pesquisa
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-tractor"></i> Maquinários e Implementos</h2>
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Pesquisar por ID ou nome..." class="search-input">
        </div>
        <div class="apontamentos-tabs">
          <button class="tab-button active" data-tab="maquinarios">
            <i class="fas fa-tractor"></i> Maquinários
          </button>
          <button class="tab-button" data-tab="implementos">
            <i class="fas fa-cogs"></i> Implementos
          </button>
        </div>
        <div class="maquinas-container">
          <div class="maquinarios-list"></div>
          <div class="implementos-list" style="display: none;"></div>
          <div class="empty-maquinas-message empty-state" style="display: none;">
            <i class="fas fa-info-circle"></i> Nenhum item encontrado
          </div>
        </div>
      </div>
    `

    const maquinariosLista = document.querySelector(".maquinarios-list")
    const implementosLista = document.querySelector(".implementos-list")

    // Renderizar listas iniciais
    renderMaquinariosList(maquinarios, maquinariosLista)
    renderMaquinariosList(implementos, implementosLista)

    // Configurar as abas e a pesquisa
    setupMaquinasTabs()
    setupSearch()
  } catch (error) {
    console.error("Erro ao carregar maquinários:", error)
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar os maquinários: ${error.message}
        </p>
      </div>
    `
  }
}

// Função para renderizar a lista de maquinários ou implementos
function renderMaquinariosList(items, container) {
  const html = items
    .map((item) => {
      const statusClass = item.status === "Operacional" ? "operacional" : "em-manutencao"
      const statusIcon = item.status === "Operacional" ? "fa-check-circle" : "fa-tools"
      const itemIcon = container.classList.contains("maquinarios-list") ? "fa-tractor" : "fa-cog"

      return `
        <div class="apontamento ${statusClass}">
          <p><i class="fas ${itemIcon}"></i><strong>ID:</strong> ${item.id}</p>
          <p><i class="fas fa-tag"></i><strong>Nome:</strong> ${item.nome}</p>
          <p><i class="fas ${statusIcon}"></i><strong>Status:</strong> ${item.status}</p>
        </div>
      `
    })
    .join("")

  container.innerHTML = html
}

// Função para configurar a pesquisa
function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  searchInput.addEventListener("input", handleSearch)
}

// Função para lidar com a pesquisa
function handleSearch() {
  const searchTerm = this.value.toLowerCase()
  const activeTab = document.querySelector(".tab-button.active").dataset.tab
  const items = activeTab === "maquinarios" ? maquinarios : implementos
  const container = document.querySelector(`.${activeTab}-list`)

  const filteredItems = items.filter(
    (item) => item.id.toLowerCase().includes(searchTerm) || item.nome.toLowerCase().includes(searchTerm),
  )

  renderMaquinariosList(filteredItems, container)

  const emptyMessage = document.querySelector(".empty-maquinas-message")
  emptyMessage.style.display = filteredItems.length === 0 ? "flex" : "none"
}

// Função para configurar as abas de maquinários e implementos
function setupMaquinasTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab
      const propriedadeElement = e.target.closest(".propriedade")

      propriedadeElement.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".tab-button").classList.add("active")

      const maquinariosLista = propriedadeElement.querySelector(".maquinarios-list")
      const implementosLista = propriedadeElement.querySelector(".implementos-list")
      const searchInput = document.getElementById("searchInput")

      if (tabType === "maquinarios") {
        maquinariosLista.style.display = "block"
        implementosLista.style.display = "none"
      } else {
        maquinariosLista.style.display = "none"
        implementosLista.style.display = "block"
      }

      // Limpar a pesquisa ao trocar de aba
      searchInput.value = ""
      handleSearch.call(searchInput)
    })
  })
}

function setupTabsAndValidationButtons() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab
      const propriedadeElement = e.target.closest(".propriedade")

      propriedadeElement.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".tab-button").classList.add("active")

      let visibleCount = 0
      propriedadeElement.querySelectorAll(".apontamento").forEach((apontamento) => {
        if (tabType === "em-andamento") {
          const isVisible = apontamento.classList.contains("em-andamento")
          apontamento.style.display = isVisible ? "block" : "none"
          if (isVisible) visibleCount++
        } else {
          const isVisible = apontamento.classList.contains("validado")
          apontamento.style.display = isVisible ? "block" : "none"
          if (isVisible) visibleCount++
        }
      })

      // Controla a visibilidade da mensagem de estado vazio
      const emptyMessage = propriedadeElement.querySelector(".empty-apontamentos-message")
      if (emptyMessage) {
        emptyMessage.style.display = visibleCount === 0 ? "flex" : "none"
      }
    })
  })

  document.querySelectorAll(".validar-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const propriedadeNome = e.target.dataset.propriedade || e.target.closest(".validar-button").dataset.propriedade
      const apontamentoKey = e.target.dataset.apontamento || e.target.closest(".validar-button").dataset.apontamento

      try {
        await update(ref(database, `propriedades/${propriedadeNome}/apontamentos/${apontamentoKey}`), {
          validado: true,
        })

        const apontamentoElement = e.target.closest(".apontamento")
        apontamentoElement.classList.remove("em-andamento")
        apontamentoElement.classList.add("validado")
        e.target.closest(".validar-button").remove()

        // Adiciona o status validado
        const statusElement = document.createElement("p")
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i><strong>Status:</strong> Validado'
        apontamentoElement.appendChild(statusElement)

        const propriedadeElement = apontamentoElement.closest(".propriedade")
        const validadosTab = propriedadeElement.querySelector('.tab-button[data-tab="validados"]')
        validadosTab.click()

        // Verifica se ainda existem apontamentos em andamento
        const emAndamentoTab = propriedadeElement.querySelector('.tab-button[data-tab="em-andamento"]')
        emAndamentoTab.click()
        validadosTab.click()
      } catch (error) {
        console.error("Erro ao validar apontamento:", error)
        alert("Erro ao validar o apontamento. Por favor, tente novamente.")
      }
    })
  })
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authStatus.innerHTML = `
      <span><i class="fas fa-user-circle"></i> ${user.email}</span>
    `
    loginButton.style.display = "none"

    const userPropriedade = await getUserPropriedade(user.uid)
    if (userPropriedade) {
      propriedadeNomeElement.innerHTML = `Fazenda ${userPropriedade}`
      fetchApontamentos(userPropriedade)
    } else {
      propriedadeNomeElement.textContent = "Dashboard de Apontamentos"
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-exclamation-circle"></i> Acesso Negado</h2>
          <p class="error-state">
            <i class="fas fa-user-slash"></i>
            Você não está associado a nenhuma propriedade.
          </p>
        </div>
      `
    }
  } else {
    authStatus.innerHTML = `
      <span><i class="fas fa-user-slash"></i> Não logado</span>
    `
    loginButton.style.display = "block"
    propriedadeNomeElement.textContent = "Dashboard de Apontamentos"
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-sign-in-alt"></i> Login Necessário</h2>
        <p class="info-state">
          <i class="fas fa-info-circle"></i>
          Faça login para visualizar os apontamentos.
        </p>
      </div>
    `
  }
})

loginButton.addEventListener("click", loginWithGoogle)

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando autenticação...")
  setupHeaderButtons()
})

function setupHeaderButtons() {
  const notificationButton = document.getElementById("notificationButton")
  const emailButton = document.getElementById("emailButton")

  function showComingSoonMessage() {
    alert("Funcionalidade Disponível em Breve")
  }

  notificationButton.addEventListener("click", showComingSoonMessage)
  emailButton.addEventListener("click", showComingSoonMessage)
}

// Add this function to fetch and display users
async function fetchUsers(propriedadeNome) {
  const usersRef = ref(database, `propriedades/${propriedadeNome}/users`)
  try {
    const snapshot = await get(usersRef)
    if (snapshot.exists()) {
      const usersHtml = []

      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val()
        usersHtml.push(`
          <div class="apontamento">
            <p><i class="fas fa-user"></i><strong>Nome:</strong> ${userData.nome || "N/A"}</p>
            <p><i class="fas fa-envelope"></i><strong>Email:</strong> ${userData.email || "N/A"}</p>
            <p><i class="fas fa-user-tag"></i><strong>Role:</strong> ${userData.role || "N/A"}</p>
          </div>
        `)
      })

      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-users"></i> Usuários</h2>
          <div class="users-container">
            ${usersHtml.join("")}
          </div>
        </div>
      `
    } else {
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-users"></i> Usuários</h2>
          <p class="empty-state">
            <i class="fas fa-info-circle"></i>
            Nenhum usuário encontrado.
          </p>
        </div>
      `
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar os usuários: ${error.message}
        </p>
      </div>
    `
  }
}

