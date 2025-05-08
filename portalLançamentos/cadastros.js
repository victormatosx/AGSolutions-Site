// cadastros.js - Página de cadastros
import { setupSidebar, setupHeaderButtons, setupAuth, database, ref, get, auth } from "./common.js"
import { set, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando página de cadastros...")
  setupSidebar()
  setupHeaderButtons()
  setupAuth((user, propriedadeNome) => {
    fetchUsers(propriedadeNome)
  })
})

// Função para buscar e exibir usuários com botão para cadastro
async function fetchUsers(propriedadeNome) {
  const dataContainer = document.getElementById("data-container")
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
          <button class="tab-button" data-tab="implementos">
            <i class="fas fa-tools"></i> Implementos
          </button>
          <button class="tab-button" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
          <button class="tab-button" data-tab="veiculos">
            <i class="fas fa-car"></i> Veículos
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
    setupCadastroTabs(propriedadeNome)

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
function setupCadastroTabs(propriedadeNome) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab
      const propriedadeElement = e.target.closest(".propriedade")

      propriedadeElement.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      e.target.closest(".tab-button").classList.add("active")

      // Implementar a lógica para mostrar o conteúdo de cada aba
      if (tabType === "maquinas") {
        showMaquinasCadastro(propriedadeNome)
      } else if (tabType === "implementos") {
        showImplementosCadastro(propriedadeNome)
      } else if (tabType === "direcionadores") {
        showDirecionadoresCadastro(propriedadeNome)
      } else if (tabType === "usuarios") {
        fetchUsers(propriedadeNome)
      } else if (tabType === "veiculos") {
        showVeiculosCadastro(propriedadeNome)
      }
    })
  })
}

// Função para mostrar o cadastro de máquinas
async function showMaquinasCadastro(propriedadeNome) {
  const dataContainer = document.getElementById("data-container")
  try {
    // Buscar maquinários do Firebase
    const maquinariosRef = ref(database, `propriedades/${propriedadeNome}/maquinarios`)
    const maquinariosSnapshot = await get(maquinariosRef)

    let maquinariosHtml = ""

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
            <h4>${maquina.nome || `Máquina ${maquina.id}`}</h4>
            <div class="maquina-details">
              <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${maquina.id}</p>
            </div>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      // Se não houver dados no Firebase, mostrar mensagem de nenhum maquinário cadastrado
      console.log("Nenhum maquinário encontrado no banco de dados.")
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
          <button class="tab-button" data-tab="implementos">
            <i class="fas fa-tools"></i> Implementos
          </button>
          <button class="tab-button" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
          <button class="tab-button" data-tab="veiculos">
            <i class="fas fa-car"></i> Veículos
          </button>
        </div>
        
        <!-- Botões de ação para máquinas -->
        <div class="action-buttons">
          <button id="openMaquinaModal" class="action-button">
            <i class="fas fa-plus-circle"></i> Cadastrar Nova Máquina
          </button>
        </div>
        
        <!-- Seção de máquinas com estilo melhorado -->
        <div class="equipment-section maquinas-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-tractor"></i>
            </div>
            <h3>Máquinas</h3>
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
            ${maquinariosHtml || '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhuma máquina cadastrada.</p>'}
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
                <label for="maquinaNome"><i class="fas fa-font"></i> Nome</label>
                <input type="text" id="maquinaNome" name="maquinaNome" required class="form-input" placeholder="Nome da máquina">
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
      
      .maquina-card, .implemento-card, .direcionador-card, .veiculo-card {
        background-color: white;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .maquina-card:hover, .implemento-card:hover, .direcionador-card:hover, .veiculo-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .maquina-card {
        border-left: 4px solid #4CAF50;
      }
      
      .implemento-card {
        border-left: 4px solid #2196F3;
      }
      
      .direcionador-card {
        border-left: 4px solid #9C27B0;
      }
      
      .veiculo-card {
        border-left: 4px solid #FF9800;
      }
      
      .maquina-icon, .implemento-icon, .direcionador-icon, .veiculo-icon {
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
      
      .direcionador-icon {
        background-color: rgba(156, 39, 176, 0.1);
        color: #9C27B0;
      }
      
      .veiculo-icon {
        background-color: rgba(255, 152, 0, 0.1);
        color: #FF9800;
      }
      
      .maquina-info, .implemento-info, .direcionador-info, .veiculo-info {
        flex: 1;
      }
      
      .maquina-info h4, .implemento-info h4, .direcionador-info h4, .veiculo-info h4 {
        margin: 0 0 10px 0;
        font-size: 1.1rem;
        color: #333;
      }
      
      .maquina-details, .implemento-details, .direcionador-details, .veiculo-details {
        font-size: 0.9rem;
      }
      
      .maquina-details p, .implemento-details p, .direcionador-details p, .veiculo-details p {
        margin: 5px 0;
        color: #666;
      }
      
      .maquina-details i, .implemento-details i, .direcionador-details i, .veiculo-details i {
        width: 20px;
        text-align: center;
        margin-right: 5px;
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
      
      .direcionadores-section .search-input:focus {
        border-color: #9C27B0;
        box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.2);
      }
      
      .veiculos-section .search-input:focus {
        border-color: #FF9800;
        box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
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
    setupCadastroTabs(propriedadeNome)

    // Configurar o modal de cadastro de máquina
    setupMaquinaModal(propriedadeNome)

    // Configurar a pesquisa de máquinas
    setupMaquinaSearch()
  } catch (error) {
    console.error("Erro ao carregar maquinários:", error)
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

// Função para mostrar o cadastro de implementos
async function showImplementosCadastro(propriedadeNome) {
  const dataContainer = document.getElementById("data-container")
  try {
    // Buscar implementos do Firebase
    const implementosRef = ref(database, `propriedades/${propriedadeNome}/implementos`)
    const implementosSnapshot = await get(implementosRef)

    let implementosHtml = ""

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
            <h4>${implemento.nome || `Implemento ${implemento.id}`}</h4>
            <div class="implemento-details">
              <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${implemento.id}</p>
            </div>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      // Se não houver dados no Firebase, mostrar mensagem de nenhum implemento cadastrado
      console.log("Nenhum implemento encontrado no banco de dados.")
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
          <button class="tab-button active" data-tab="implementos">
            <i class="fas fa-tools"></i> Implementos
          </button>
          <button class="tab-button" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
          <button class="tab-button" data-tab="veiculos">
            <i class="fas fa-car"></i> Veículos
          </button>
        </div>
        
        <!-- Botões de ação para implementos -->
        <div class="action-buttons">
          <button id="openImplementoModal" class="action-button">
            <i class="fas fa-plus-circle"></i> Cadastrar Novo Implemento
          </button>
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
                <label for="implementoNome"><i class="fas fa-font"></i> Nome</label>
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

    // Configurar as abas de cadastro novamente
    setupCadastroTabs(propriedadeNome)

    // Configurar o modal de cadastro de implemento
    setupImplementoModal(propriedadeNome)

    // Configurar a pesquisa de implementos
    setupImplementoSearch()
  } catch (error) {
    console.error("Erro ao carregar implementos:", error)
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

// Função para mostrar o cadastro de direcionadores
async function showDirecionadoresCadastro(propriedadeNome) {
  const dataContainer = document.getElementById("data-container")
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
            <h4>${direcionador.direcionador || direcionador.nome || `Direcionador ${direcionador.id}`}</h4>
            <div class="direcionador-details">
              <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${direcionador.id}</p>
              <p><i class="fas fa-compass"></i><strong>Direcionador:</strong> ${direcionador.direcionador || "N/A"}</p>
              <p><i class="fas fa-seedling"></i><strong>Cultura Associada:</strong> ${direcionador.culturaAssociada || "N/A"}</p>
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
          <button class="tab-button" data-tab="implementos">
            <i class="fas fa-tools"></i> Implementos
          </button>
          <button class="tab-button active" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
          <button class="tab-button" data-tab="veiculos">
            <i class="fas fa-car"></i> Veículos
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
                <label for="direcionadorNome"><i class="fas fa-compass"></i> Direcionador</label>
                <input type="text" id="direcionadorNome" name="direcionadorNome" required class="form-input" placeholder="Nome do direcionador">
              </div>
              <div class="form-group">
                <label for="culturaAssociada"><i class="fas fa-seedling"></i> Cultura Associada</label>
                <input type="text" id="culturaAssociada" name="culturaAssociada" required class="form-input" placeholder="Cultura associada">
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
    `
    document.head.appendChild(styleElement)

    // Configurar as abas de cadastro novamente
    setupCadastroTabs(propriedadeNome)

    // Configurar o modal de cadastro de direcionador
    setupDirecionadorModal(propriedadeNome)

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

// Função para mostrar o cadastro de veículos
async function showVeiculosCadastro(propriedadeNome) {
  const dataContainer = document.getElementById("data-container")
  try {
    // Buscar veículos do Firebase
    const veiculosRef = ref(database, `propriedades/${propriedadeNome}/veiculos`)
    const veiculosSnapshot = await get(veiculosRef)

    let veiculosHtml = ""

    // Processar veículos
    if (veiculosSnapshot.exists()) {
      // Converter os dados do Firebase em um array para facilitar a manipulação
      const veiculosArray = []
      veiculosSnapshot.forEach((veiculoSnapshot) => {
        veiculosArray.push({
          id: veiculoSnapshot.key,
          ...veiculoSnapshot.val(),
        })
      })

      // Gerar o HTML para cada veículo
      veiculosHtml = veiculosArray
        .map(
          (veiculo) => `
        <div class="veiculo-card">
          <div class="veiculo-icon">
            <i class="fas fa-car"></i>
          </div>
          <div class="veiculo-info">
            <h4>${veiculo.modelo || `Veículo ${veiculo.id}`}</h4>
            <div class="veiculo-details">
              <p><i class="fas fa-hashtag"></i><strong>ID:</strong> ${veiculo.id}</p>
              <p><i class="fas fa-id-card"></i><strong>Placa:</strong> ${veiculo.placa || "N/A"}</p>
              <p><i class="fas fa-car"></i><strong>Modelo:</strong> ${veiculo.modelo || "N/A"}</p>
            </div>
          </div>
        </div>
      `,
        )
        .join("")
    } else {
      // Se não houver dados no Firebase, mostrar mensagem de nenhum veículo cadastrado
      console.log("Nenhum veículo encontrado no banco de dados.")
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
          <button class="tab-button" data-tab="implementos">
            <i class="fas fa-tools"></i> Implementos
          </button>
          <button class="tab-button" data-tab="direcionadores">
            <i class="fas fa-compass"></i> Direcionadores
          </button>
          <button class="tab-button active" data-tab="veiculos">
            <i class="fas fa-car"></i> Veículos
          </button>
        </div>
        
        <!-- Botões de ação para veículos -->
        <div class="action-buttons">
          <button id="openVeiculoModal" class="action-button">
            <i class="fas fa-plus-circle"></i> Cadastrar Novo Veículo
          </button>
        </div>
        
        <!-- Seção de veículos com estilo melhorado -->
        <div class="equipment-section veiculos-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-car"></i>
            </div>
            <h3>Veículos</h3>
          </div>
          
          <!-- Pesquisa de veículos -->
          <div class="search-container">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input type="text" id="searchVeiculos" class="search-input" placeholder="Pesquisar veículos...">
            </div>
          </div>
          
          <!-- Lista de veículos -->
          <div class="equipment-grid veiculos-list">
            ${veiculosHtml || '<p class="empty-state"><i class="fas fa-info-circle"></i> Nenhum veículo cadastrado.</p>'}
          </div>
        </div>
        
        <!-- Modal de cadastro de veículo -->
        <div id="veiculoModal" class="modal">
          <div class="modal-content">
            <span class="close-button">&times;</span>
            <form id="veiculoForm" class="cadastro-form">
              <h3><i class="fas fa-car"></i> Cadastrar Novo Veículo</h3>
              <div class="form-group">
                <label for="veiculoId"><i class="fas fa-hashtag"></i> ID</label>
                <input type="text" id="veiculoId" name="veiculoId" required class="form-input" placeholder="ID do veículo">
              </div>
              <div class="form-group">
                <label for="veiculoPlaca"><i class="fas fa-id-card"></i> Placa</label>
                <input type="text" id="veiculoPlaca" name="veiculoPlaca" required class="form-input" placeholder="Placa do veículo">
              </div>
              <div class="form-group">
                <label for="veiculoModelo"><i class="fas fa-car"></i> Modelo</label>
                <input type="text" id="veiculoModelo" name="veiculoModelo" required class="form-input" placeholder="Modelo do veículo">
              </div>
              <div class="form-group">
                <button type="submit" class="cadastrar-button">
                  <i class="fas fa-save"></i> Cadastrar Veículo
                </button>
              </div>
            </form>
            <div id="veiculoCadastroMessage" class="cadastro-message" style="display: none;"></div>
          </div>
        </div>
      </div>
    `

    // Adicionar estilos CSS para o novo layout
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      /* Estilos para a seção de veículos */
      .veiculos-section {
        border-left: 5px solid #FF9800;
      }
      
      .veiculos-section .section-icon {
        background-color: #FF9800;
        color: white;
      }
    `
    document.head.appendChild(styleElement)

    // Configurar as abas de cadastro novamente
    setupCadastroTabs(propriedadeNome)

    // Configurar o modal de cadastro de veículo
    setupVeiculoModal(propriedadeNome)

    // Configurar a pesquisa de veículos
    setupVeiculoSearch()
  } catch (error) {
    console.error("Erro ao carregar veículos:", error)
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

// Função para configurar o modal de cadastro de máquina
function setupMaquinaModal(propriedadeNome) {
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
    const maquinaNome = document.getElementById("maquinaNome").value.trim()

    try {
      // Criar o objeto de máquina
      const maquinaData = {
        id: maquinaId,
        nome: maquinaNome,
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
        showMaquinasCadastro(propriedadeNome)
      }, 2000)
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
function setupImplementoModal(propriedadeNome) {
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
        showImplementosCadastro(propriedadeNome)
      }, 2000)
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

// Função para configurar o modal de cadastro de direcionador
function setupDirecionadorModal(propriedadeNome) {
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
    const culturaAssociada = document.getElementById("culturaAssociada").value.trim()

    try {
      // Criar o objeto de direcionador
      const direcionadorData = {
        id: direcionadorId,
        direcionador: direcionadorNome,
        culturaAssociada: culturaAssociada,
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
        showDirecionadoresCadastro(propriedadeNome)
      }, 2000)
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

// Função para configurar o modal de cadastro de veículo
function setupVeiculoModal(propriedadeNome) {
  const modal = document.getElementById("veiculoModal")
  const openModalBtn = document.getElementById("openVeiculoModal")
  const closeBtn = document.querySelector("#veiculoModal .close-button")
  const veiculoForm = document.getElementById("veiculoForm")
  const cadastroMessage = document.getElementById("veiculoCadastroMessage")

  // Abrir o modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex"
  })

  // Fechar o modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none"
    veiculoForm.reset()
    cadastroMessage.style.display = "none"
  })

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      veiculoForm.reset()
      cadastroMessage.style.display = "none"
    }
  })

  // Configurar o formulário de cadastro
  veiculoForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Obter os valores do formulário
    const veiculoId = document.getElementById("veiculoId").value.trim()
    const veiculoPlaca = document.getElementById("veiculoPlaca").value.trim()
    const veiculoModelo = document.getElementById("veiculoModelo").value.trim()

    try {
      // Criar o objeto de veículo
      const veiculoData = {
        id: veiculoId,
        placa: veiculoPlaca,
        modelo: veiculoModelo,
        dataCadastro: new Date().toISOString(),
      }

      // Salvar os dados do veículo no Firebase
      await set(ref(database, `propriedades/${propriedadeNome}/veiculos/${veiculoId}`), veiculoData)

      // Exibir mensagem de sucesso
      cadastroMessage.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i> Veículo cadastrado com sucesso!
        </div>
      `
      cadastroMessage.style.display = "block"

      // Limpar o formulário
      veiculoForm.reset()

      // Atualizar a lista de veículos
      setTimeout(() => {
        modal.style.display = "none"
        showVeiculosCadastro(propriedadeNome)
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error)

      // Exibir mensagem de erro
      cadastroMessage.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i> Erro ao cadastrar veículo: ${error.message}
        </div>
      `
      cadastroMessage.style.display = "block"
    }
  })
}

// Função para configurar a pesquisa de máquinas
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

// Função para configurar a pesquisa de implementos
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

// Função para configurar a pesquisa de veículos
function setupVeiculoSearch() {
  const searchInput = document.getElementById("searchVeiculos")
  const veiculoItems = document.querySelectorAll(".veiculos-list .veiculo-card")

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()
    let visibleCount = 0

    veiculoItems.forEach((item) => {
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
    const emptyMessage = document.querySelector(".veiculos-list .empty-state")
    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? "block" : "none"
    } else if (visibleCount === 0) {
      const noResultsMessage = document.createElement("p")
      noResultsMessage.className = "empty-state"
      noResultsMessage.innerHTML = '<i class="fas fa-search"></i> Nenhum resultado encontrado para a pesquisa.'
      document.querySelector(".veiculos-list").appendChild(noResultsMessage)
    }
  })
}
