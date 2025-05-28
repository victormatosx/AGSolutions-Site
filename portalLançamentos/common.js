// common.js - Funções compartilhadas entre todas as páginas
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8C_yucprravGbaJSrRjKJDz2Vv80fMc4",
  authDomain: "app-hora-maquina.firebaseapp.com",
  databaseURL: "https://app-hora-maquina-default-rtdb.firebaseio.com",
  projectId: "app-hora-maquina",
  storageBucket: "app-hora-maquina.firebasestorage.app",
  messagingSenderId: "51002260602",
  appId: "1:51002260602:web:0dd4cd491dbefe432acfc3",
}

// Initialize Firebase services once
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

// Cache for user data to reduce database queries
const userCache = new Map()
const propertyCache = new Map()
const atividadesCache = new Map() // Novo cache para atividades

// Sidebar functionality with performance optimizations
export function setupSidebar() {
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.querySelector(".main-content")
  const toggleButton = document.getElementById("toggleSidebar")

  if (!sidebar || !mainContent || !toggleButton) return

  // Use a single event listener with debouncing for resize events
  let resizeTimeout

  function toggleSidebar() {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")

    // Use requestAnimationFrame for smoother transitions
    if (sidebar.classList.contains("collapsed")) {
      requestAnimationFrame(() => {
        mainContent.style.marginLeft = "0"
      })
    } else {
      mainContent.style.marginLeft = ""
    }
  }

  // Optimize mobile view handling
  function handleMobileView() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("collapsed")
      sidebar.classList.add("mobile-open")
      mainContent.classList.remove("expanded")
    } else {
      sidebar.classList.remove("mobile-open")
    }
  }

  // Debounce resize event for better performance
  function debouncedResize() {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(handleMobileView, 100)
  }

  // Set up event listeners
  toggleButton.addEventListener("click", toggleSidebar)
  window.addEventListener("resize", debouncedResize)

  // Initial setup
  if (sidebar.classList.contains("collapsed")) {
    mainContent.classList.add("expanded")
    mainContent.style.marginLeft = "0"
  }

  // Initial mobile check
  handleMobileView()
}

// Optimize header buttons setup
export function setupHeaderButtons() {
  const buttons = document.querySelectorAll("#notificationButton, #emailButton")

  function showComingSoonMessage() {
    alert("Funcionalidade Disponível em Breve")
  }

  // Use event delegation instead of multiple listeners
  buttons.forEach((button) => {
    button.addEventListener("click", showComingSoonMessage)
  })
}

// Optimize user property retrieval with caching
export async function getUserPropriedade(uid) {
  // Check cache first
  if (propertyCache.has(uid)) {
    return propertyCache.get(uid)
  }

  try {
    const propriedadesRef = ref(database, "propriedades")
    const snapshot = await get(propriedadesRef)

    if (snapshot.exists()) {
      for (const [propriedadeNome, propriedadeData] of Object.entries(snapshot.val())) {
        if (propriedadeData.users && propriedadeData.users[uid]) {
          // Cache the result
          propertyCache.set(uid, propriedadeNome)
          return propriedadeNome
        }
      }
    }

    // Cache negative result
    propertyCache.set(uid, null)
    return null
  } catch (error) {
    console.error("Error fetching user property:", error)
    return null
  }
}

// Optimize user name retrieval with caching
export async function getUserName(uid, propriedadeNome) {
  // Generate cache key
  const cacheKey = `${uid}-${propriedadeNome}`

  // Check cache first
  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey)
  }

  try {
    const userRef = ref(database, `propriedades/${propriedadeNome}/users/${uid}`)
    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      const userName = snapshot.val().nome || "Nome não encontrado"
      // Cache the result
      userCache.set(cacheKey, userName)
      return userName
    }

    // Cache negative result
    userCache.set(cacheKey, "Nome não encontrado")
    return "Nome não encontrado"
  } catch (error) {
    console.error("Error fetching user name:", error)
    return "Nome não encontrado"
  }
}

// Nova função para obter atividades com cache
export async function getAtividades(propriedadeNome) {
  // Check cache first
  if (atividadesCache.has(propriedadeNome)) {
    return atividadesCache.get(propriedadeNome)
  }

  try {
    const atividadesRef = ref(database, `propriedades/${propriedadeNome}/atividades`)
    const snapshot = await get(atividadesRef)

    if (snapshot.exists()) {
      const atividades = []
      snapshot.forEach((childSnapshot) => {
        atividades.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        })
      })

      // Cache the result
      atividadesCache.set(propriedadeNome, atividades)
      return atividades
    }

    // Cache empty result
    atividadesCache.set(propriedadeNome, [])
    return []
  } catch (error) {
    console.error("Error fetching atividades:", error)
    return []
  }
}

// Optimize auth setup with lazy loading and performance improvements
export function setupAuth(callback) {
  const authStatus = document.getElementById("auth-status")
  const loginButton = document.getElementById("login-button")
  const propriedadeNomeElement = document.getElementById("propriedade-nome")
  const dataContainer = document.getElementById("data-container")

  if (!authStatus || !loginButton) return

  // Prepare error and loading templates once
  const errorTemplate = `
    <div class="propriedade">
      <h2><i class="fas fa-exclamation-circle"></i> Acesso Negado</h2>
      <p class="error-state">
        <i class="fas fa-user-slash"></i>
        Você não está associado a nenhuma propriedade.
      </p>
    </div>
  `

  const loginRequiredTemplate = `
    <div class="propriedade">
      <h2><i class="fas fa-sign-in-alt"></i> Login Necessário</h2>
      <p class="info-state">
        <i class="fas fa-info-circle"></i>
        Faça login para visualizar o conteúdo.
      </p>
    </div>
  `

  // Optimize Google login
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Login bem-sucedido:", result.user.email)
      })
      .catch((error) => {
        console.error("Erro no login:", error.message)
      })
  }

  // Set up login button
  loginButton.addEventListener("click", loginWithGoogle)

  // Use a more efficient auth state change handler
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in
      authStatus.innerHTML = `<span><i class="fas fa-user-circle"></i> ${user.email}</span>`
      loginButton.style.display = "none"

      try {
        // Get user property with caching
        const userPropriedade = await getUserPropriedade(user.uid)

        if (userPropriedade) {
          if (propriedadeNomeElement) {
            propriedadeNomeElement.textContent = `Fazenda ${userPropriedade}`
          }

          // Execute callback if provided
          if (callback && typeof callback === "function") {
            callback(user, userPropriedade)
          }
        } else {
          // No property associated
          if (propriedadeNomeElement) {
            propriedadeNomeElement.textContent = "J.R. AgroSolutions"
          }

          if (dataContainer) {
            dataContainer.innerHTML = errorTemplate
          }
        }
      } catch (error) {
        console.error("Error in auth setup:", error)
        if (dataContainer) {
          dataContainer.innerHTML = errorTemplate
        }
      }
    } else {
      // User is not logged in
      authStatus.innerHTML = `<span><i class="fas fa-user-slash"></i> Não logado</span>`
      loginButton.style.display = "block"

      if (propriedadeNomeElement) {
        propriedadeNomeElement.textContent = "J.R. AgroSolutions"
      }

      if (dataContainer) {
        dataContainer.innerHTML = loginRequiredTemplate
      }
    }
  })
}

// Clear caches when needed
export function clearUserCache() {
  userCache.clear()
  propertyCache.clear()
  atividadesCache.clear() // Limpar também o cache de atividades
}

// Função para formatar data
export function formatDate(dateString) {
  if (!dateString) return "Data não disponível"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Data inválida"

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Export Firebase services
export { auth, database, ref, get }
