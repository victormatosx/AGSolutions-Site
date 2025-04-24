import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"

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
          if (linkText === "Dashboard") {
            showDashboard(userPropriedade)
          } else if (linkText === "Cadastro") {
            fetchUsers(userPropriedade)
          } else if (linkText === "Apontamentos") {
            fetchApontamentos(userPropriedade)
          } else if (linkText === "Configurações") {
            showConfigurationsPage()
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

          // Processar operações mecanizadas
          const operacoesMecanizadas = apontamentoData.operacoesMecanizadas || {}
          let operacoesHtml = ""

          // Converter objeto de operações em array para iterar
          const operacoes = Object.entries(operacoesMecanizadas).map(([key, value]) => value)

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
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${apontamentoSnapshot.key}">
              <div class="apontamento-info-left">
                <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${apontamentoData.fichaControle || "N/A"}</p>
                <p><i class="fas fa-user"></i><strong>Usuário:</strong> ${userName}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${new Date(apontamentoData.timestamp).toLocaleString()}</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${apontamentoSnapshot.key}">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-${apontamentoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${apontamentoSnapshot.key}">&times;</button>
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
          <div id="confirmationModal" class="confirmation-modal">
            <div class="confirmation-content">
              <h3><i class="fas fa-exclamation-circle"></i> Confirmar Validação</h3>
              <p>Tem certeza que deseja validar este apontamento?</p>
              <div class="confirmation-buttons">
                <button id="confirmValidation" class="confirm-button">Sim, Validar</button>
                <button id="cancelValidation" class="cancel-button">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      `

      setupTabsAndValidationButtons()
      setupApontamentoClicks()

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

// Função para exibir a página de configurações
function showConfigurationsPage() {
  dataContainer.innerHTML = `
    <div class="propriedade">
      <h2><i class="fas fa-cog"></i> Configurações</h2>
      <div class="configuracoes-container">
        <div class="apontamento">
          <p><i class="fas fa-user-cog"></i><strong>Perfil:</strong> Configurações de perfil e conta</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-bell"></i><strong>Notificações:</strong> Gerenciar preferências de notificações</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-palette"></i><strong>Aparência:</strong> Personalizar a interface do sistema</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-shield-alt"></i><strong>Segurança:</strong> Configurações de segurança e acesso</p>
        </div>
      </div>
    </div>
  `
}

// Função para buscar e exibir usuários com botão para cadastro
async function fetchUsers(propriedadeNome) {
  const usersRef = ref(database, `propriedades/${propriedadeNome}/users`)
  try {
    const snapshot = await get(usersRef)
    const usersHtml = []

    if (snapshot.exists()) {
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
    }

    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-user-plus"></i> Cadastro</h2>
        <div class="apontamentos-tabs">
          <button class="tab-button active" data-tab="usuarios">
            <i class="fas fa-users"></i> Usuários
          </button>
          <button class="tab-button" data-tab="maquinas">
            <i class="fas fa-tractor"></i> Máquinas
          </button>
          <button class="tab-button" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
        </div>
        
        <!-- Botão para abrir o modal de cadastro -->
        <div class="action-buttons">
          <button id="openCadastroModal" class="action-button">
            <i class="fas fa-user-plus"></i> Cadastrar Novo Usuário
          </button>
        </div>
        
        <!-- Lista de usuários -->
        <div class="users-list">
          <h3><i class="fas fa-users"></i> Usuários Cadastrados</h3>
          ${usersHtml.length > 0 ? usersHtml.join("") : '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhum usuário cadastrado.</p>'}
        </div>
        
        <!-- Modal de cadastro de usuário -->
        <div id="cadastroModal" class="modal">
          <div class="modal-content">
            <span class="close-button">&times;</span>
            <form id="userForm" class="cadastro-form">
              <h3><i class="fas fa-user-plus"></i> Cadastrar Novo Usuário</h3>
              <div class="form-group">
                <label for="nome"><i class="fas fa-user"></i> Nome</label>
                <input type="text" id="nome" name="nome" required class="form-input" placeholder="Nome completo">
              </div>
              <div class="form-group">
                <label for="email"><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="email" name="email" required class="form-input" placeholder="email@exemplo.com">
              </div>
              <div class="form-group">
                <label for="senha"><i class="fas fa-lock"></i> Senha</label>
                <input type="password" id="senha" name="senha" required class="form-input" placeholder="Senha">
              </div>
              <div class="form-group">
                <label for="role"><i class="fas fa-user-tag"></i> Função</label>
                <select id="role" name="role" required class="form-input">
                  <option value="">Selecione uma função</option>
                  <option value="Gestor">Gestor</option>
                  <option value="Operacional">Operacional</option>
                </select>
              </div>
              <div class="form-group">
                <button type="submit" class="cadastrar-button">
                  <i class="fas fa-save"></i> Cadastrar Usuário
                </button>
              </div>
            </form>
            <div id="cadastroMessage" class="cadastro-message" style="display: none;"></div>
          </div>
        </div>
      </div>
    `

    // Configurar as abas de cadastro
    setupCadastroTabs()

    // Configurar o modal de cadastro
    setupCadastroModal(propriedadeNome)
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

// Função para configurar o modal de cadastro
function setupCadastroModal(propriedadeNome) {
  const modal = document.getElementById("cadastroModal")
  const openModalBtn = document.getElementById("openCadastroModal")
  const closeBtn = document.querySelector(".close-button")
  const userForm = document.getElementById("userForm")
  const cadastroMessage = document.getElementById("cadastroMessage")

  // Abrir o modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex"
  })

  // Fechar o modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
    userForm.reset()
    cadastroMessage.style.display = "none"
  })

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      userForm.reset()
      cadastroMessage.style.display = "none"
    }
  })

  // Configurar o formulário de cadastro
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const nome = document.getElementById("nome").value.trim()
    const email = document.getElementById("email").value.trim()
    const senha = document.getElementById("senha").value.trim()
    const role = document.getElementById("role").value

    try {
      // Criar o usuário com email e senha usando Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Criar o objeto de usuário
      const userData = {
        nome,
        email,
        role,
        propriedade: propriedadeNome,
        dataCadastro: new Date().toISOString(),
      }

      // Salvar os dados do usuário na estrutura users/${user.uid}
      await set(ref(database, `users/${user.uid}`), {
        ...userData,
        propriedade_escolhida: propriedadeNome,
      })

      // Salvar os dados do usuário também na propriedade
      await set(ref(database, `propriedades/${propriedadeNome}/users/${user.uid}`), userData)

      // Remover qualquer nó desnecessário no nível raiz
      await remove(ref(database, `${user.uid}`))

      // Exibir mensagem de sucesso
      cadastroMessage.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i> Usuário cadastrado com sucesso!
        </div>
      `
      cadastroMessage.style.display = "block"

      // Limpar o formulário
      userForm.reset()

      // Atualizar a lista de usuários
      setTimeout(() => {
        modal.style.display = "none"
        fetchUsers(propriedadeNome)
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error)

      // Exibir mensagem de erro específica para email já em uso
      let errorMessage = error.message
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já foi cadastrado. Por favor, use outro e-mail."
      }

      // Exibir mensagem de erro
      cadastroMessage.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> Erro ao cadastrar usuário: ${errorMessage}
        </div>
      `
      cadastroMessage.style.display = "block"
    }
  })
}

// Função para configurar as abas de cadastro
function setupCadastroTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab
      const propriedadeElement = e.target.closest(".propriedade")

      propriedadeElement.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".tab-button").classList.add("active")

      // Implementar a lógica para mostrar o conteúdo de cada aba
      if (tabType === "maquinas") {
        showMaquinasCadastro()
      } else if (tabType === "direcionadores") {
        showDirecionadoresCadastro()
      } else if (tabType === "usuarios") {
        // Obter a propriedade atual do usuário logado
        const user = auth.currentUser
        if (user) {
          const userPropriedade = await getUserPropriedade(user.uid)
          if (userPropriedade) {
            fetchUsers(userPropriedade)
          }
        }
      }
    })
  })
}

// Função para mostrar o cadastro de máquinas
function showMaquinasCadastro() {
  // Obter a propriedade atual do usuário logado
  const user = auth.currentUser
  if (user) {
    getUserPropriedade(user.uid).then(async (propriedadeNome) => {
      if (propriedadeNome) {
        try {
          // Buscar maquinários do Firebase
          const maquinariosRef = ref(database, `propriedades/${propriedadeNome}/maquinarios`)
          const implementosRef = ref(database, `propriedades/${propriedadeNome}/implementos`)

          const [maquinariosSnapshot, implementosSnapshot] = await Promise.all([
            get(maquinariosRef),
            get(implementosRef),
          ])

          let maquinariosHtml = ""
          let implementosHtml = ""

          // Processar maquinários
          if (maquinariosSnapshot.exists()) {
            // Converter os dados do Firebase em um array para facilitar a manipulação
            const maquinariosArray = []
            maquinariosSnapshot.forEach((maquinaSnapshot) => {
              maquinariosArray.push({
                id: maquinaSnapshot.key,
                ...maquinaSnapshot.val(),
              })
            })

            // Gerar o HTML para cada máquina
            maquinariosHtml = maquinariosArray
              .map(
                (maquina) => `
              <div class="maquina-card ${maquina.status?.toLowerCase() === "operacional" ? "operacional" : "em-manutencao"}">
                <div class="maquina-icon">
                  <i class="fas fa-tractor"></i>
                </div>
                <div class="maquina-info">
                  <h4>${maquina.nome || `${maquina.marca || ""} ${maquina.modelo || ""}`}</h4>
                  <div class="maquina-details">
                    <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${maquina.id}</p>
                    ${maquina.marca ? `<p><i class="fas fa-industry"></i><strong>Marca:</strong> ${maquina.marca}</p>` : ""}
                    ${maquina.modelo ? `<p><i class="fas fa-cogs"></i><strong>Modelo:</strong> ${maquina.modelo}</p>` : ""}
                    <p class="status-badge ${maquina.status?.toLowerCase() === "operacional" ? "status-operacional" : "status-manutencao"}">
                      <i class="fas ${maquina.status?.toLowerCase() === "operacional" ? "fa-check-circle" : "fa-tools"}"></i>
                      ${maquina.status || "Operacional"}
                    </p>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")
          } else {
            // Se não houver dados no Firebase, carregar do arquivo local como fallback
            console.log("Nenhum maquinário encontrado no banco de dados, carregando dados locais...")

            // Importar os dados de maquinários do arquivo local
            const { maquinarios } = await import("./maquinasData.js")

            maquinariosHtml = maquinarios
              .map(
                (maquina) => `
              <div class="maquina-card ${maquina.status.toLowerCase() === "operacional" ? "operacional" : "em-manutencao"}">
                <div class="maquina-icon">
                  <i class="fas fa-tractor"></i>
                </div>
                <div class="maquina-info">
                  <h4>${maquina.nome}</h4>
                  <div class="maquina-details">
                    <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${maquina.id}</p>
                    <p class="status-badge ${maquina.status.toLowerCase() === "operacional" ? "status-operacional" : "status-manutencao"}">
                      <i class="fas ${maquina.status.toLowerCase() === "operacional" ? "fa-check-circle" : "fa-tools"}"></i>
                      ${maquina.status}
                    </p>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")
          }

          // Processar implementos
          if (implementosSnapshot.exists()) {
            // Converter os dados do Firebase em um array para facilitar a manipulação
            const implementosArray = []
            implementosSnapshot.forEach((implementoSnapshot) => {
              implementosArray.push({
                id: implementoSnapshot.key,
                ...implementoSnapshot.val(),
              })
            })

            // Gerar o HTML para cada implemento
            implementosHtml = implementosArray
              .map(
                (implemento) => `
              <div class="implemento-card ${implemento.status?.toLowerCase() === "operacional" ? "operacional" : "em-manutencao"}">
                <div class="implemento-icon">
                  <i class="fas fa-tools"></i>
                </div>
                <div class="implemento-info">
                  <h4>${implemento.nome}</h4>
                  <div class="implemento-details">
                    <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${implemento.id}</p>
                    <p class="status-badge ${implemento.status?.toLowerCase() === "operacional" ? "status-operacional" : "status-manutencao"}">
                      <i class="fas ${implemento.status?.toLowerCase() === "operacional" ? "fa-check-circle" : "fa-tools"}"></i>
                      ${implemento.status || "Operacional"}
                    </p>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")
          } else {
            // Se não houver dados no Firebase, carregar do arquivo local como fallback
            console.log("Nenhum implemento encontrado no banco de dados, carregando dados locais...")

            // Importar os dados de implementos do arquivo local
            const { implementos } = await import("./maquinasData.js")

            implementosHtml = implementos
              .map(
                (implemento) => `
              <div class="implemento-card ${implemento.status.toLowerCase() === "operacional" ? "operacional" : "em-manutencao"}">
                <div class="implemento-icon">
                  <i class="fas fa-tools"></i>
                </div>
                <div class="implemento-info">
                  <h4>${implemento.nome}</h4>
                  <div class="implemento-details">
                    <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${implemento.id}</p>
                    <p class="status-badge ${implemento.status.toLowerCase() === "operacional" ? "status-operacional" : "status-manutencao"}">
                      <i class="fas ${implemento.status.toLowerCase() === "operacional" ? "fa-check-circle" : "fa-tools"}"></i>
                      ${implemento.status}
                    </p>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")
          }

          // Renderizar a interface com os dados obtidos
          dataContainer.innerHTML = `
            <div class="propriedade">
              <h2><i class="fas fa-user-plus"></i> Cadastro</h2>
              <div class="apontamentos-tabs">
                <button class="tab-button" data-tab="usuarios">
                  <i class="fas fa-users"></i> Usuários
                </button>
                <button class="tab-button active" data-tab="maquinas">
                  <i class="fas fa-tractor"></i> Máquinas
                </button>
                <button class="tab-button" data-tab="direcionadores">
                  <i class="fas fa-compass"></i> Direcionadores
                </button>
              </div>
              
              <!-- Botões de ação para máquinas e implementos -->
              <div class="action-buttons">
                <button id="openMaquinaModal" class="action-button">
                  <i class="fas fa-plus-circle"></i> Cadastrar Nova Máquina
                </button>
                <button id="openImplementoModal" class="action-button">
                  <i class="fas fa-plus-circle"></i> Cadastrar Novo Implemento
                </button>
              </div>
              
              <!-- Seção de máquinas com estilo melhorado -->
              <div class="equipment-section maquinas-section">
                <div class="section-header">
                  <div class="section-icon">
                    <i class="fas fa-tractor"></i>
                  </div>
                  <h3>Maquinários</h3>
                </div>
                
                <!-- Pesquisa de máquinas -->
                <div class="search-container">
                  <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchMaquinas" class="search-input" placeholder="Pesquisar máquinas...">
                  </div>
                </div>
                
                <!-- Lista de maquinários -->
                <div class="equipment-grid maquinarios-list">
                  ${maquinariosHtml || '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhum maquinário cadastrado.</p>'}
                </div>
              </div>
              
              <!-- Separador visual -->
              <div class="section-divider">
                <div class="divider-line"></div>
                <div class="divider-icon"><i class="fas fa-link"></i></div>
                <div class="divider-line"></div>
              </div>
              
              <!-- Seção de implementos com estilo melhorado -->
              <div class="equipment-section implementos-section">
                <div class="section-header">
                  <div class="section-icon">
                    <i class="fas fa-tools"></i>
                  </div>
                  <h3>Implementos</h3>
                </div>
                
                <!-- Pesquisa de implementos -->
                <div class="search-container">
                  <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchImplementos" class="search-input" placeholder="Pesquisar implementos...">
                  </div>
                </div>
                
                <!-- Lista de implementos -->
                <div class="equipment-grid implementos-list">
                  ${implementosHtml || '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhum implemento cadastrado.</p>'}
                </div>
              </div>
              
              <!-- Modal de cadastro de máquina -->
              <div id="maquinaModal" class="modal">
                <div class="modal-content">
                  <span class="close-button">&times;</span>
                  <form id="maquinaForm" class="cadastro-form">
                    <h3><i class="fas fa-tractor"></i> Cadastrar Nova Máquina</h3>
                    <div class="form-group">
                      <label for="maquinaId"><i class="fas fa-hashtag"></i> ID</label>
                      <input type="text" id="maquinaId" name="maquinaId" required class="form-input" placeholder="ID da máquina">
                    </div>
                    <div class="form-group">
                      <label for="maquinaMarca"><i class="fas fa-industry"></i> Marca</label>
                      <input type="text" id="maquinaMarca" name="maquinaMarca" required class="form-input" placeholder="Marca da máquina">
                    </div>
                    <div class="form-group">
                      <label for="maquinaModelo"><i class="fas fa-cogs"></i> Modelo</label>
                      <input type="text" id="maquinaModelo" name="maquinaModelo" required class="form-input" placeholder="Modelo da máquina">
                    </div>
                    <div class="form-group">
                      <button type="submit" class="cadastrar-button">
                        <i class="fas fa-save"></i> Cadastrar Máquina
                      </button>
                    </div>
                  </form>
                  <div id="maquinaCadastroMessage" class="cadastro-message" style="display: none;"></div>
                </div>
              </div>
              
              <!-- Modal de cadastro de implemento -->
              <div id="implementoModal" class="modal">
                <div class="modal-content">
                  <span class="close-button">&times;</span>
                  <form id="implementoForm" class="cadastro-form">
                    <h3><i class="fas fa-tools"></i> Cadastrar Novo Implemento</h3>
                    <div class="form-group">
                      <label for="implementoId"><i class="fas fa-hashtag"></i> ID</label>
                      <input type="text" id="implementoId" name="implementoId" required class="form-input" placeholder="ID do implemento">
                    </div>
                    <div class="form-group">
                      <label for="implementoNome"><i class="fas fa-tools"></i> Nome</label>
                      <input type="text" id="implementoNome" name="implementoNome" required class="form-input" placeholder="Nome do implemento">
                    </div>
                    <div class="form-group">
                      <button type="submit" class="cadastrar-button">
                        <i class="fas fa-save"></i> Cadastrar Implemento
                      </button>
                    </div>
                  </form>
                  <div id="implementoCadastroMessage" class="cadastro-message" style="display: none;"></div>
                </div>
              </div>
            </div>
          `

          // Adicionar estilos CSS para o novo layout
          const styleElement = document.createElement("style")
          styleElement.textContent = `
            /* Estilos para as seções de equipamentos */
            .equipment-section {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .maquinas-section {
              border-left: 5px solid #4CAF50;
            }
            
            .implementos-section {
              border-left: 5px solid #2196F3;
            }
            
            .section-header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 10px;
            }
            
            .section-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-size: 18px;
            }
            
            .maquinas-section .section-icon {
              background-color: #4CAF50;
              color: white;
            }
            
            .implementos-section .section-icon {
              background-color: #2196F3;
              color: white;
            }
            
            .section-header h3 {
              margin: 0;
              font-size: 1.5rem;
              color: #333;
            }
            
            /* Estilos para o separador visual */
            .section-divider {
              display: flex;
              align-items: center;
              margin: 30px 0;
            }
            
            .divider-line {
              flex-grow: 1;
              height: 1px;
              background-color: #e0e0e0;
            }
            
            .divider-icon {
              margin: 0 15px;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #FF9800;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* Estilos para os cards de equipamentos */
            .equipment-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            
            .maquina-card, .implemento-card {
              background-color: white;
              border-radius: 8px;
              padding: 15px;
              display: flex;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .maquina-card:hover, .implemento-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .maquina-card {
              border-left: 4px solid #4CAF50;
            }
            
            .implemento-card {
              border-left: 4px solid #2196F3;
            }
            
            .maquina-icon, .implemento-icon {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-size: 20px;
            }
            
            .maquina-icon {
              background-color: rgba(76, 175, 80, 0.1);
              color: #4CAF50;
            }
            
            .implemento-icon {
              background-color: rgba(33, 150, 243, 0.1);
              color: #2196F3;
            }
            
            .maquina-info, .implemento-info {
              flex: 1;
            }
            
            .maquina-info h4, .implemento-info h4 {
              margin: 0 0 10px 0;
              font-size: 1.1rem;
              color: #333;
            }
            
            .maquina-details, .implemento-details {
              font-size: 0.9rem;
            }
            
            .maquina-details p, .implemento-details p {
              margin: 5px 0;
              color: #666;
            }
            
            .maquina-details i, .implemento-details i {
              width: 20px;
              text-align: center;
              margin-right: 5px;
            }
            
            /* Estilos para os badges de status */
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 0.8rem;
              margin-top: 8px;
            }
            
            .status-operacional {
              background-color: rgba(76, 175, 80, 0.1);
              color: #4CAF50;
              border: 1px solid rgba(76, 175, 80, 0.3);
            }
            
            .status-manutencao {
              background-color: rgba(255, 152, 0, 0.1);
              color: #FF9800;
              border: 1px solid rgba(255, 152, 0, 0.3);
            }
            
            /* Estilos para a barra de pesquisa */
            .search-container {
              margin-bottom: 15px;
            }
            
            .search-wrapper {
              position: relative;
              max-width: 500px;
            }
            
            .search-icon {
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #999;
            }
            
            .search-input {
              width: 100%;
              padding: 10px 10px 10px 40px;
              border: 1px solid #ddd;
              border-radius: 20px;
              font-size: 0.9rem;
              transition: border-color 0.3s, box-shadow 0.3s;
            }
            
            .search-input:focus {
              outline: none;
              border-color: #4CAF50;
              box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
            }
            
            .implementos-section .search-input:focus {
              border-color: #2196F3;
              box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
            }
            
            /* Estilos para os botões de ação */
            .action-button {
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              padding: 10px 15px;
              cursor: pointer;
              display: flex;
              align-items: center;
              transition: background-color 0.2s, transform 0.2s;
              font-weight: 500;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .action-button:hover {
              background-color: #45a049;
              transform: translateY(-2px);
            }
            
            /* Estilos para os botões de cadastro */
            .cadastrar-button {
              background-color: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              padding: 10px 15px;
              cursor: pointer;
              font-weight: 500;
              width: 100%;
              transition: background-color 0.2s;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .cadastrar-button:hover {
              background-color: #45a049;
            }
            
            /* Estilos responsivos */
            @media (max-width: 768px) {
              .equipment-grid {
                grid-template-columns: 1fr;
              }
              
              .section-header {
                flex-direction: column;
                text-align: center;
              }
              
              .section-icon {
                margin-right: 0;
                margin-bottom: 10px;
              }
            }
          `
          document.head.appendChild(styleElement)

          // Configurar as abas de cadastro novamente
          setupCadastroTabs()

          // Configurar o modal de cadastro de máquina
          setupMaquinaModal()

          // Configurar o modal de cadastro de implemento
          setupImplementoModal()

          // Configurar a pesquisa de máquinas
          setupMaquinaSearch()

          // Configurar a pesquisa de implementos
          setupImplementoSearch()
        } catch (error) {
          console.error("Erro ao carregar maquinários e implementos:", error)
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
    })
  } else {
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-user-slash"></i>
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    `
  }
}

// Função para mostrar o cadastro de direcionadores
function showDirecionadoresCadastro() {
  // Obter a propriedade atual do usuário logado
  const user = auth.currentUser
  if (user) {
    getUserPropriedade(user.uid).then(async (propriedadeNome) => {
      if (propriedadeNome) {
        try {
          // Buscar direcionadores do Firebase
          const direcionadoresRef = ref(database, `propriedades/${propriedadeNome}/direcionadores`)
          const direcionadoresSnapshot = await get(direcionadoresRef)

          let direcionadoresHtml = ""

          // Processar direcionadores
          if (direcionadoresSnapshot.exists()) {
            // Converter os dados do Firebase em um array para facilitar a manipulação
            const direcionadoresArray = []
            direcionadoresSnapshot.forEach((direcionadorSnapshot) => {
              direcionadoresArray.push({
                id: direcionadorSnapshot.key,
                ...direcionadorSnapshot.val(),
              })
            })

            // Gerar o HTML para cada direcionador
            direcionadoresHtml = direcionadoresArray
              .map(
                (direcionador) => `
              <div class="direcionador-card">
                <div class="direcionador-icon">
                  <i class="fas fa-compass"></i>
                </div>
                <div class="direcionador-info">
                  <h4>${direcionador.nome}</h4>
                  <div class="direcionador-details">
                    <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${direcionador.id}</p>
                  </div>
                </div>
              </div>
            `,
              )
              .join("")
          } else {
            // Se não houver dados no Firebase, mostrar mensagem de nenhum direcionador cadastrado
            console.log("Nenhum direcionador encontrado no banco de dados.")
          }

          // Renderizar a interface com os dados obtidos
          dataContainer.innerHTML = `
            <div class="propriedade">
              <h2><i class="fas fa-user-plus"></i> Cadastro</h2>
              <div class="apontamentos-tabs">
                <button class="tab-button" data-tab="usuarios">
                  <i class="fas fa-users"></i> Usuários
                </button>
                <button class="tab-button" data-tab="maquinas">
                  <i class="fas fa-tractor"></i> Máquinas
                </button>
                <button class="tab-button active" data-tab="direcionadores">
                  <i class="fas fa-compass"></i> Direcionadores
                </button>
              </div>
              
              <!-- Botões de ação para direcionadores -->
              <div class="action-buttons">
                <button id="openDirecionadorModal" class="action-button">
                  <i class="fas fa-plus-circle"></i> Cadastrar Novo Direcionador
                </button>
              </div>
              
              <!-- Seção de direcionadores com estilo melhorado -->
              <div class="equipment-section direcionadores-section">
                <div class="section-header">
                  <div class="section-icon">
                    <i class="fas fa-compass"></i>
                  </div>
                  <h3>Direcionadores</h3>
                </div>
                
                <!-- Pesquisa de direcionadores -->
                <div class="search-container">
                  <div class="search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="searchDirecionadores" class="search-input" placeholder="Pesquisar direcionadores...">
                  </div>
                </div>
                
                <!-- Lista de direcionadores -->
                <div class="equipment-grid direcionadores-list">
                  ${direcionadoresHtml || '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhum direcionador cadastrado.</p>'}
                </div>
              </div>
              
              <!-- Modal de cadastro de direcionador -->
              <div id="direcionadorModal" class="modal">
                <div class="modal-content">
                  <span class="close-button">&times;</span>
                  <form id="direcionadorForm" class="cadastro-form">
                    <h3><i class="fas fa-compass"></i> Cadastrar Novo Direcionador</h3>
                    <div class="form-group">
                      <label for="direcionadorId"><i class="fas fa-hashtag"></i> ID</label>
                      <input type="text" id="direcionadorId" name="direcionadorId" required class="form-input" placeholder="ID do direcionador">
                    </div>
                    <div class="form-group">
                      <label for="direcionadorNome"><i class="fas fa-compass"></i> Nome</label>
                      <input type="text" id="direcionadorNome" name="direcionadorNome" required class="form-input" placeholder="Nome do direcionador">
                    </div>
                    <div class="form-group">
                      <button type="submit" class="cadastrar-button">
                        <i class="fas fa-save"></i> Cadastrar Direcionador
                      </button>
                    </div>
                  </form>
                  <div id="direcionadorCadastroMessage" class="cadastro-message" style="display: none;"></div>
                </div>
              </div>
            </div>
          `

          // Adicionar estilos CSS para o novo layout
          const styleElement = document.createElement("style")
          styleElement.textContent = `
            /* Estilos para a seção de direcionadores */
            .direcionadores-section {
              border-left: 5px solid #9C27B0;
            }
            
            .direcionadores-section .section-icon {
              background-color: #9C27B0;
              color: white;
            }
            
            .direcionador-card {
              background-color: white;
              border-radius: 8px;
              padding: 15px;
              display: flex;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s, box-shadow 0.2s;
              border-left: 4px solid #9C27B0;
            }
            
            .direcionador-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .direcionador-icon {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-size: 20px;
              background-color: rgba(156, 39, 176, 0.1);
              color: #9C27B0;
            }
            
            .direcionador-info {
              flex: 1;
            }
            
            .direcionador-info h4 {
              margin: 0 0 10px 0;
              font-size: 1.1rem;
              color: #333;
            }
            
            .direcionador-details {
              font-size: 0.9rem;
            }
            
            .direcionador-details p {
              margin: 5px 0;
              color: #666;
            }
            
            .direcionador-details i {
              width: 20px;
              text-align: center;
              margin-right: 5px;
            }
            
            .direcionadores-section .search-input:focus {
              border-color: #9C27B0;
              box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.2);
            }
          `
          document.head.appendChild(styleElement)

          // Configurar as abas de cadastro novamente
          setupCadastroTabs()

          // Configurar o modal de cadastro de direcionador
          setupDirecionadorModal()

          // Configurar a pesquisa de direcionadores
          setupDirecionadorSearch()
        } catch (error) {
          console.error("Erro ao carregar direcionadores:", error)
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
    })
  } else {
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-user-slash"></i>
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    `
  }
}

// Função para configurar o modal de cadastro de direcionador
function setupDirecionadorModal() {
  const modal = document.getElementById("direcionadorModal")
  const openModalBtn = document.getElementById("openDirecionadorModal")
  const closeBtn = document.querySelector("#direcionadorModal .close-button")
  const direcionadorForm = document.getElementById("direcionadorForm")
  const cadastroMessage = document.getElementById("direcionadorCadastroMessage")

  // Abrir o modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex"
  })

  // Fechar o modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
    direcionadorForm.reset()
    cadastroMessage.style.display = "none"
  })

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      direcionadorForm.reset()
      cadastroMessage.style.display = "none"
    }
  })

  // Configurar o formulário de cadastro
  direcionadorForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const direcionadorId = document.getElementById("direcionadorId").value.trim()
    const direcionadorNome = document.getElementById("direcionadorNome").value.trim()

    try {
      // Obter a propriedade atual do usuário logado
      const user = auth.currentUser
      if (user) {
        const propriedadeNome = await getUserPropriedade(user.uid)
        if (propriedadeNome) {
          // Criar o objeto de direcionador
          const direcionadorData = {
            id: direcionadorId,
            nome: direcionadorNome,
            dataCadastro: new Date().toISOString(),
          }

          // Salvar os dados do direcionador no Firebase
          await set(ref(database, `propriedades/${propriedadeNome}/direcionadores/${direcionadorId}`), direcionadorData)

          // Exibir mensagem de sucesso
          cadastroMessage.innerHTML = `
            <div class="success-message">
              <i class="fas fa-check-circle"></i> Direcionador cadastrado com sucesso!
            </div>
          `
          cadastroMessage.style.display = "block"

          // Limpar o formulário
          direcionadorForm.reset()

          // Atualizar a lista de direcionadores
          setTimeout(() => {
            modal.style.display = "none"
            showDirecionadoresCadastro()
          }, 2000)
        } else {
          console.error("Usuário não associado a nenhuma propriedade.")
          cadastroMessage.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> Erro: Usuário não associado a nenhuma propriedade.
            </div>
          `
          cadastroMessage.style.display = "block"
        }
      } else {
        console.error("Usuário não autenticado.")
        cadastroMessage.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Erro: Usuário não autenticado.
          </div>
        `
        cadastroMessage.style.display = "block"
      }
    } catch (error) {
      console.error("Erro ao cadastrar direcionador:", error)

      // Exibir mensagem de erro
      cadastroMessage.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> Erro ao cadastrar direcionador: ${error.message}
        </div>
      `
      cadastroMessage.style.display = "block"
    }
  })
}

// Função para configurar a pesquisa de direcionadores
function setupDirecionadorSearch() {
  const searchInput = document.getElementById("searchDirecionadores")
  const direcionadorItems = document.querySelectorAll(".direcionadores-list .direcionador-card")

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    let visibleCount = 0

    direcionadorItems.forEach((item) => {
      // Buscar em todos os campos de texto dentro do item
      const itemText = item.textContent.toLowerCase()

      if (itemText.includes(searchTerm)) {
        item.style.display = "flex"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Mostrar mensagem se nenhum item for encontrado
    const emptyMessage = document.querySelector(".direcionadores-list .empty-state")
    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? "block" : "none"
    } else if (visibleCount === 0) {
      const noResultsMessage = document.createElement("p")
      noResultsMessage.className = "empty-state"
      noResultsMessage.innerHTML = '<i class="fas fa-search"></i> Nenhum resultado encontrado para a pesquisa.'
      document.querySelector(".direcionadores-list").appendChild(noResultsMessage)
    }
  })
}

// Modificar a função setupMaquinaSearch para trabalhar com o novo layout
function setupMaquinaSearch() {
  const searchInput = document.getElementById("searchMaquinas")
  const maquinaItems = document.querySelectorAll(".maquinarios-list .maquina-card")

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    let visibleCount = 0

    maquinaItems.forEach((item) => {
      // Buscar em todos os campos de texto dentro do item
      const itemText = item.textContent.toLowerCase()

      if (itemText.includes(searchTerm)) {
        item.style.display = "flex"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Mostrar mensagem se nenhum item for encontrado
    const emptyMessage = document.querySelector(".maquinarios-list .empty-state")
    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? "block" : "none"
    } else if (visibleCount === 0) {
      const noResultsMessage = document.createElement("p")
      noResultsMessage.className = "empty-state"
      noResultsMessage.innerHTML = '<i class="fas fa-search"></i> Nenhum resultado encontrado para a pesquisa.'
      document.querySelector(".maquinarios-list").appendChild(noResultsMessage)
    }
  })
}

// Modificar a função setupImplementoSearch para trabalhar com o novo layout
function setupImplementoSearch() {
  const searchInput = document.getElementById("searchImplementos")
  const implementoItems = document.querySelectorAll(".implementos-list .implemento-card")

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    let visibleCount = 0

    implementoItems.forEach((item) => {
      // Buscar em todos os campos de texto dentro do item
      const itemText = item.textContent.toLowerCase()

      if (itemText.includes(searchTerm)) {
        item.style.display = "flex"
        visibleCount++
      } else {
        item.style.display = "none"
      }
    })

    // Mostrar mensagem se nenhum item for encontrado
    const emptyMessage = document.querySelector(".implementos-list .empty-state")
    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? "block" : "none"
    } else if (visibleCount === 0) {
      const noResultsMessage = document.createElement("p")
      noResultsMessage.className = "empty-state"
      noResultsMessage.innerHTML = '<i class="fas fa-search"></i> Nenhum resultado encontrado para a pesquisa.'
      document.querySelector(".implementos-list").appendChild(noResultsMessage)
    }
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
        const apontamentoId = apontamento.dataset.id
        const detalhesElement = document.getElementById(`modal-${apontamentoId}`)

        if (tabType === "em-andamento") {
          const isVisible = apontamento.classList.contains("em-andamento")
          apontamento.style.display = isVisible ? "flex" : "none"
          if (detalhesElement) {
            detalhesElement.style.display = isVisible && apontamento.classList.contains("active") ? "block" : "none"
          }
          if (isVisible) visibleCount++
        } else {
          const isVisible = apontamento.classList.contains("validado")
          apontamento.style.display = isVisible ? "flex" : "none"
          if (detalhesElement) {
            detalhesElement.style.display = isVisible && apontamento.classList.contains("active") ? "block" : "none"
          }
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
      e.stopPropagation() // Impedir que o clique se propague para o apontamento

      const propriedadeNome = e.target.dataset.propriedade || e.target.closest(".validar-button").dataset.propriedade
      const apontamentoKey = e.target.dataset.apontamento || e.target.closest(".validar-button").dataset.apontamento

      // Mostrar o modal de confirmação
      showConfirmationModal(propriedadeNome, apontamentoKey)
    })
  })
}

function showConfirmationModal(propriedadeNome, apontamentoKey) {
  const modal = document.getElementById("confirmationModal")
  const confirmButton = document.getElementById("confirmValidation")
  const cancelButton = document.getElementById("cancelValidation")

  modal.style.display = "flex"

  confirmButton.onclick = async () => {
    modal.style.display = "none"
    await validateApontamento(propriedadeNome, apontamentoKey)
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

async function validateApontamento(propriedadeNome, apontamentoKey) {
  try {
    await update(ref(database, `propriedades/${propriedadeNome}/apontamentos/${apontamentoKey}`), {
      validado: true,
    })

    const apontamentoElement = document.querySelector(`.apontamento[data-id="${apontamentoKey}"]`)
    apontamentoElement.classList.remove("em-andamento")
    apontamentoElement.classList.add("validado")
    apontamentoElement.querySelector(".validar-button").remove()

    // Adiciona o status validado
    const statusElement = document.createElement("p")
    statusElement.innerHTML = '<i class="fas fa-check-circle"></i><strong>Status:</strong> Validado'
    apontamentoElement.querySelector(".apontamento-info-right").appendChild(statusElement)

    // Atualizar o status nos detalhes também
    const detalhesElement = document.getElementById(`modal-${apontamentoKey}`)
    if (detalhesElement) {
      const statusDetalhe = detalhesElement.querySelector('p:has(strong:contains("Status"))')
      if (statusDetalhe) {
        statusDetalhe.innerHTML = '<i class="fas fa-tag"></i><strong>Status:</strong> Validado'
      }
    }

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
}

// Modificar a função que é chamada quando o usuário faz login para mostrar um dashboard em vez de apontamentos
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authStatus.innerHTML = `
      <span><i class="fas fa-user-circle"></i> ${user.email}</span>
    `
    loginButton.style.display = "none"

    const userPropriedade = await getUserPropriedade(user.uid)
    if (userPropriedade) {
      propriedadeNomeElement.innerHTML = `Fazenda ${userPropriedade}`
      showDashboard(userPropriedade) // Mostrar dashboard em vez de apontamentos
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
          Faça login para visualizar o dashboard.
        </p>
      </div>
    `
  }
})

// Adicionar a função para exibir o dashboard
async function showDashboard(propriedadeNome) {
  try {
    // Buscar dados resumidos para o dashboard
    const [maquinariosSnapshot, implementosSnapshot, direcionadoresSnapshot, usersSnapshot] = await Promise.all([
      get(ref(database, `propriedades/${propriedadeNome}/maquinarios`)),
      get(ref(database, `propriedades/${propriedadeNome}/implementos`)),
      get(ref(database, `propriedades/${propriedadeNome}/direcionadores`)),
      get(ref(database, `propriedades/${propriedadeNome}/users`)),
    ])

    // Contar itens
    const maquinariosCount = maquinariosSnapshot.exists() ? Object.keys(maquinariosSnapshot.val()).length : 0
    const implementosCount = implementosSnapshot.exists() ? Object.keys(implementosSnapshot.val()).length : 0
    const direcionadoresCount = direcionadoresSnapshot.exists() ? Object.keys(direcionadoresSnapshot.val()).length : 0
    const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0

    // Renderizar o dashboard
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
        
        <div class="dashboard-welcome">
          <div class="welcome-icon">
            <i class="fas fa-farm"></i>
          </div>
          <div class="welcome-text">
            <h3>Bem-vindo à Fazenda ${propriedadeNome}</h3>
            <p>Visualize o resumo das suas operações e recursos abaixo.</p>
          </div>
        </div>
        
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-tractor"></i>
            </div>
            <div class="card-content">
              <h3>${maquinariosCount}</h3>
              <p>Maquinários</p>
            </div>
            <div class="card-action">
              <button class="card-button" data-action="view-maquinas">
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-tools"></i>
            </div>
            <div class="card-content">
              <h3>${implementosCount}</h3>
              <p>Implementos</p>
            </div>
            <div class="card-action">
              <button class="card-button" data-action="view-implementos">
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-compass"></i>
            </div>
            <div class="card-content">
              <h3>${direcionadoresCount}</h3>
              <p>Direcionadores</p>
            </div>
            <div class="card-action">
              <button class="card-button" data-action="view-direcionadores">
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <h3>${usersCount}</h3>
              <p>Usuários</p>
            </div>
            <div class="card-action">
              <button class="card-button" data-action="view-users">
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
        </div>
        
        <div class="dashboard-actions">
          <div class="action-section">
            <h3><i class="fas fa-clipboard-list"></i> Ações Rápidas</h3>
            <div class="action-buttons">
              <button class="action-button" data-action="new-apontamento">
                <i class="fas fa-plus-circle"></i> Novo Apontamento
              </button>
              <button class="action-button" data-action="new-maquina">
                <i class="fas fa-plus-circle"></i> Nova Máquina
              </button>
              <button class="action-button" data-action="new-implemento">
                <i class="fas fa-plus-circle"></i> Novo Implemento
              </button>
              <button class="action-button" data-action="new-direcionador">
                <i class="fas fa-plus-circle"></i> Novo Direcionador
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Adicionar estilos CSS para o dashboard
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      .dashboard-welcome {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 30px;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #4CAF50;
      }
      
      .welcome-icon {
        font-size: 2.5rem;
        margin-right: 20px;
        color: #4CAF50;
      }
      
      .welcome-text h3 {
        margin: 0 0 10px 0;
        color: #333;
      }
      
      .welcome-text p {
        margin: 0;
        color: #666;
      }
      
      .dashboard-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .dashboard-card {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .dashboard-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      }
      
      .dashboard-card:nth-child(1) {
        border-top: 4px solid #4CAF50;
      }
      
      .dashboard-card:nth-child(2) {
        border-top: 4px solid #2196F3;
      }
      
      .dashboard-card:nth-child(3) {
        border-top: 4px solid #9C27B0;
      }
      
      .dashboard-card:nth-child(4) {
        border-top: 4px solid #FF9800;
      }
      
      .card-icon {
        font-size: 2rem;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .dashboard-card:nth-child(1) .card-icon {
        color: #4CAF50;
      }
      
      .dashboard-card:nth-child(2) .card-icon {
        color: #2196F3;
      }
      
      .dashboard-card:nth-child(3) .card-icon {
        color: #9C27B0;
      }
      
      .dashboard-card:nth-child(4) .card-icon {
        color: #FF9800;
      }
      
      .card-content {
        text-align: center;
        flex-grow: 1;
      }
      
      .card-content h3 {
        font-size: 2.5rem;
        margin: 0 0 5px 0;
        color: #333;
      }
      
      .card-content p {
        margin: 0;
        color: #666;
        font-size: 1rem;
      }
      
      .card-action {
        margin-top: 15px;
        text-align: center;
      }
      
      .card-button {
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 15px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s, transform 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .card-button:hover {
        background-color: #1976D2;
        transform: translateY(-2px);
      }
      
      .dashboard-actions {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .action-section h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
        display: flex;
        align-items: center;
      }
      
      .action-section h3 i {
        margin-right: 10px;
        color: #4CAF50;
      }
      
      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .action-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.2s, transform 0.2s;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .action-button:hover {
        background-color: #45a049;
        transform: translateY(-2px);
      }
      
      .action-button i {
        margin-right: 8px;
      }
      
      @media (max-width: 768px) {
        .dashboard-cards {
          grid-template-columns: 1fr;
        }
        
        .action-buttons {
          flex-direction: column;
        }
      }
    `
    document.head.appendChild(styleElement)

    // Configurar os botões de ação do dashboard
    setupDashboardButtons(propriedadeNome)
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error)
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar o dashboard: ${error.message}
        </p>
      </div>
    `
  }
}

// Função para configurar os botões do dashboard
function setupDashboardButtons(propriedadeNome) {
  // Botões dos cards
  document.querySelectorAll(".card-button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action

      switch (action) {
        case "view-maquinas":
          showMaquinasCadastro()
          break
        case "view-implementos":
          showMaquinasCadastro()
          break
        case "view-direcionadores":
          showDirecionadoresCadastro()
          break
        case "view-users":
          fetchUsers(propriedadeNome)
          break
      }
    })
  })

  // Botões de ação rápida
  document.querySelectorAll(".action-button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action

      switch (action) {
        case "new-apontamento":
          fetchApontamentos(propriedadeNome)
          break
        case "new-maquina":
          showMaquinasCadastro()
          const openMaquinaModalBtn = document.getElementById("openMaquinaModal")
          if (openMaquinaModalBtn) {
            setTimeout(() => openMaquinaModalBtn.click(), 500)
          }
          break
        case "new-implemento":
          showMaquinasCadastro()
          const openImplementoModalBtn = document.getElementById("openImplementoModal")
          if (openImplementoModalBtn) {
            setTimeout(() => openImplementoModalBtn.click(), 500)
          }
          break
        case "new-direcionador":
          showDirecionadoresCadastro()
          const openDirecionadorModalBtn = document.getElementById("openDirecionadorModal")
          if (openDirecionadorModalBtn) {
            setTimeout(() => openDirecionadorModalBtn.click(), 500)
          }
          break
      }
    })
  })
}

// Modificar a função para configurar os links da sidebar
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
        if (linkText === "Dashboard") {
          showDashboard(userPropriedade)
        } else if (linkText === "Cadastro") {
          fetchUsers(userPropriedade)
        } else if (linkText === "Apontamentos") {
          fetchApontamentos(userPropriedade)
        } else if (linkText === "Configurações") {
          showConfigurationsPage()
        }
      }
    }

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("mobile-open")
    }
  })
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

function setupApontamentoClicks() {
  document.querySelectorAll(".apontamento").forEach((apontamento) => {
    apontamento.addEventListener("click", function (e) {
      // Não expandir se o clique foi no botão de validar
      if (e.target.closest(".validar-button")) {
        return
      }

      const apontamentoId = this.dataset.id
      const modalOverlay = document.getElementById(`modal-${apontamentoId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "flex"
      }
    })
  })

  document.querySelectorAll(".close-modal").forEach((closeButton) => {
    closeButton.addEventListener("click", function (e) {
      e.stopPropagation()
      const apontamentoId = this.dataset.apontamento
      const modalOverlay = document.getElementById(`modal-${apontamentoId}`)

      if (modalOverlay) {
        modalOverlay.style.display = "none"
      }
    })
  })

  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none"
      }
    })
  })
}

// Função para configurar o modal de cadastro de máquina
function setupMaquinaModal() {
  const modal = document.getElementById("maquinaModal")
  const openModalBtn = document.getElementById("openMaquinaModal")
  const closeBtn = document.querySelector("#maquinaModal .close-button")
  const maquinaForm = document.getElementById("maquinaForm")
  const cadastroMessage = document.getElementById("maquinaCadastroMessage")

  // Abrir o modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex"
  })

  // Fechar o modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
    maquinaForm.reset()
    cadastroMessage.style.display = "none"
  })

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      maquinaForm.reset()
      cadastroMessage.style.display = "none"
    }
  })

  // Configurar o formulário de cadastro
  maquinaForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const maquinaId = document.getElementById("maquinaId").value.trim()
    const maquinaMarca = document.getElementById("maquinaMarca").value.trim()
    const maquinaModelo = document.getElementById("maquinaModelo").value.trim()

    try {
      // Obter a propriedade atual do usuário logado
      const user = auth.currentUser
      if (user) {
        const propriedadeNome = await getUserPropriedade(user.uid)
        if (propriedadeNome) {
          // Criar o objeto de máquina
          const maquinaData = {
            id: maquinaId,
            marca: maquinaMarca,
            modelo: maquinaModelo,
            nome: `${maquinaMarca} ${maquinaModelo}`,
            status: "Operacional", // Defina um status padrão
          }

          // Salvar os dados da máquina no Firebase
          await set(ref(database, `propriedades/${propriedadeNome}/maquinarios/${maquinaId}`), maquinaData)

          // Exibir mensagem de sucesso
          cadastroMessage.innerHTML = `
            <div class="success-message">
              <i class="fas fa-check-circle"></i> Máquina cadastrada com sucesso!
            </div>
          `
          cadastroMessage.style.display = "block"

          // Limpar o formulário
          maquinaForm.reset()

          // Atualizar a lista de máquinas
          setTimeout(() => {
            modal.style.display = "none"
            showMaquinasCadastro()
          }, 2000)
        } else {
          console.error("Usuário não associado a nenhuma propriedade.")
          cadastroMessage.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> Erro: Usuário não associado a nenhuma propriedade.
            </div>
          `
          cadastroMessage.style.display = "block"
        }
      } else {
        console.error("Usuário não autenticado.")
        cadastroMessage.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Erro: Usuário não autenticado.
          </div>
        `
        cadastroMessage.style.display = "block"
      }
    } catch (error) {
      console.error("Erro ao cadastrar máquina:", error)

      // Exibir mensagem de erro
      cadastroMessage.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> Erro ao cadastrar máquina: ${error.message}
        </div>
      `
      cadastroMessage.style.display = "block"
    }
  })
}

// Função para configurar o modal de cadastro de implemento
function setupImplementoModal() {
  const modal = document.getElementById("implementoModal")
  const openModalBtn = document.getElementById("openImplementoModal")
  const closeBtn = document.querySelector("#implementoModal .close-button")
  const implementoForm = document.getElementById("implementoForm")
  const cadastroMessage = document.getElementById("implementoCadastroMessage")

  // Abrir o modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex"
  })

  // Fechar o modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
    implementoForm.reset()
    cadastroMessage.style.display = "none"
  })

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      implementoForm.reset()
      cadastroMessage.style.display = "none"
    }
  })

  // Configurar o formulário de cadastro
  implementoForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const implementoId = document.getElementById("implementoId").value.trim()
    const implementoNome = document.getElementById("implementoNome").value.trim()

    try {
      // Obter a propriedade atual do usuário logado
      const user = auth.currentUser
      if (user) {
        const propriedadeNome = await getUserPropriedade(user.uid)
        if (propriedadeNome) {
          // Criar o objeto de implemento
          const implementoData = {
            id: implementoId,
            nome: implementoNome,
            status: "Operacional", // Defina um status padrão
          }

          // Salvar os dados do implemento no Firebase
          await set(ref(database, `propriedades/${propriedadeNome}/implementos/${implementoId}`), implementoData)

          // Exibir mensagem de sucesso
          cadastroMessage.innerHTML = `
            <div class="success-message">
              <i class="fas fa-check-circle"></i> Implemento cadastrado com sucesso!
            </div>
          `
          cadastroMessage.style.display = "block"

          // Limpar o formulário
          implementoForm.reset()

          // Atualizar a lista de implementos
          setTimeout(() => {
            modal.style.display = "none"
            showMaquinasCadastro()
          }, 2000)
        } else {
          console.error("Usuário não associado a nenhuma propriedade.")
          cadastroMessage.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> Erro: Usuário não associado a nenhuma propriedade.
            </div>
          `
          cadastroMessage.style.display = "block"
        }
      } else {
        console.error("Usuário não autenticado.")
        cadastroMessage.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> Erro: Usuário não autenticado.
          </div>
        `
        cadastroMessage.style.display = "block"
      }
    } catch (error) {
      console.error("Erro ao cadastrar implemento:", error)

      // Exibir mensagem de erro
      cadastroMessage.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> Erro ao cadastrar implemento: ${error.message}
        </div>
      `
      cadastroMessage.style.display = "block"
    }
  })
}
