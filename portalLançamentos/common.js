// common.js - Funções compartilhadas entre todas as páginas
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"

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
export function setupSidebar() {
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
}

export function setupHeaderButtons() {
  const notificationButton = document.getElementById("notificationButton")
  const emailButton = document.getElementById("emailButton")

  function showComingSoonMessage() {
    alert("Funcionalidade Disponível em Breve")
  }

  notificationButton.addEventListener("click", showComingSoonMessage)
  emailButton.addEventListener("click", showComingSoonMessage)
}

export async function getUserPropriedade(uid) {
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

export async function getUserName(uid, propriedadeNome) {
  const userRef = ref(database, `propriedades/${propriedadeNome}/users/${uid}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    return snapshot.val().nome || "Nome não encontrado"
  }
  return "Nome não encontrado"
}

export function setupAuth(callback) {
  const authStatus = document.getElementById("auth-status")
  const loginButton = document.getElementById("login-button")
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

  loginButton.addEventListener("click", loginWithGoogle)

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authStatus.innerHTML = `
        <span><i class="fas fa-user-circle"></i> ${user.email}</span>
      `
      loginButton.style.display = "none"

      const userPropriedade = await getUserPropriedade(user.uid)
      if (userPropriedade) {
        const pageName = document.title
        propriedadeNomeElement.innerHTML = `${pageName} - Fazenda ${userPropriedade}`

        if (callback) {
          callback(user, userPropriedade)
        }
      } else {
        propriedadeNomeElement.textContent = document.title
        document.getElementById("data-container").innerHTML = `
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
      propriedadeNomeElement.textContent = document.title
      document.getElementById("data-container").innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-sign-in-alt"></i> Login Necessário</h2>
          <p class="info-state">
            <i class="fas fa-info-circle"></i>
            Faça login para visualizar o conteúdo.
          </p>
        </div>
      `
    }
  })
}

export { auth, database, ref, get }
