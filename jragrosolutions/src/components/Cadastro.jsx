"use client"

import { useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { getDatabase, ref, get, set, remove } from "firebase/database"
import "../../styles/cadastro.css"

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

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

const Cadastro = () => {
  const [activeTab, setActiveTab] = useState("usuarios")
  const [users, setUsers] = useState([])
  const [machines, setMachines] = useState([])
  const [implementsList, setImplementsList] = useState([])
  const [directors, setDirectors] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [activities, setActivities] = useState([])
  const [tanks, setTanks] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [propriedadeNome, setPropriedadeNome] = useState("default")
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showMachineModal, setShowMachineModal] = useState(false)
  const [showImplementModal, setShowImplementModal] = useState(false)
  const [showDirectorModal, setShowDirectorModal] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showTankModal, setShowTankModal] = useState(false)

  // Form states
  const [userForm, setUserForm] = useState({ nome: "", email: "", senha: "", role: "" })
  const [machineForm, setMachineForm] = useState({ id: "", nome: "" })
  const [implementForm, setImplementForm] = useState({ id: "", nome: "" })
  const [directorForm, setDirectorForm] = useState({ id: "", nome: "", culturaAssociada: "" })
  const [vehicleForm, setVehicleForm] = useState({ id: "", placa: "", modelo: "" })
  const [activityForm, setActivityForm] = useState({ id: "", nome: "" })
  const [tankForm, setTankForm] = useState({ id: "", nome: "" })

  // Message states
  const [message, setMessage] = useState({ type: "", text: "" })
  const [searchTerms, setSearchTerms] = useState({
    usuarios: "",
    maquinas: "",
    implementos: "",
    direcionadores: "",
    veiculos: "",
    atividades: "",
    tanques: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        // In a real app, you'd get the propriedade from user data
        setPropriedadeNome("default")
        fetchAllData("default")
      } else {
        setCurrentUser(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchAllData = async (propriedade) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchUsers(propriedade),
        fetchMachines(propriedade),
        fetchImplements(propriedade),
        fetchDirectors(propriedade),
        fetchVehicles(propriedade),
        fetchActivities(propriedade),
        fetchTanks(propriedade),
      ])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      showMessage("error", "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (propriedade) => {
    try {
      const usersRef = ref(database, `propriedades/${propriedade}/users`)
      const snapshot = await get(usersRef)
      if (snapshot.exists()) {
        const usersData = []
        snapshot.forEach((userSnapshot) => {
          usersData.push({ id: userSnapshot.key, ...userSnapshot.val() })
        })
        setUsers(usersData)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    }
  }

  const fetchMachines = async (propriedade) => {
    try {
      const machinesRef = ref(database, `propriedades/${propriedade}/maquinarios`)
      const snapshot = await get(machinesRef)
      if (snapshot.exists()) {
        const machinesData = []
        snapshot.forEach((machineSnapshot) => {
          machinesData.push({ id: machineSnapshot.key, ...machineSnapshot.val() })
        })
        setMachines(machinesData)
      } else {
        setMachines([])
      }
    } catch (error) {
      console.error("Erro ao buscar máquinas:", error)
    }
  }

  const fetchImplements = async (propriedade) => {
    try {
      const implementsRef = ref(database, `propriedades/${propriedade}/implementos`)
      const snapshot = await get(implementsRef)
      if (snapshot.exists()) {
        const implementsData = []
        snapshot.forEach((implementSnapshot) => {
          implementsData.push({ id: implementSnapshot.key, ...implementSnapshot.val() })
        })
        setImplementsList(implementsData)
      } else {
        setImplementsList([])
      }
    } catch (error) {
      console.error("Erro ao buscar implementos:", error)
    }
  }

  const fetchDirectors = async (propriedade) => {
    try {
      const directorsRef = ref(database, `propriedades/${propriedade}/direcionadores`)
      const snapshot = await get(directorsRef)
      if (snapshot.exists()) {
        const directorsData = []
        snapshot.forEach((directorSnapshot) => {
          directorsData.push({ id: directorSnapshot.key, ...directorSnapshot.val() })
        })
        setDirectors(directorsData)
      } else {
        setDirectors([])
      }
    } catch (error) {
      console.error("Erro ao buscar direcionadores:", error)
    }
  }

  const fetchVehicles = async (propriedade) => {
    try {
      const vehiclesRef = ref(database, `propriedades/${propriedade}/veiculos`)
      const snapshot = await get(vehiclesRef)
      if (snapshot.exists()) {
        const vehiclesData = []
        snapshot.forEach((vehicleSnapshot) => {
          vehiclesData.push({ id: vehicleSnapshot.key, ...vehicleSnapshot.val() })
        })
        setVehicles(vehiclesData)
      } else {
        setVehicles([])
      }
    } catch (error) {
      console.error("Erro ao buscar veículos:", error)
    }
  }

  const fetchActivities = async (propriedade) => {
    try {
      const activitiesRef = ref(database, `propriedades/${propriedade}/atividades`)
      const snapshot = await get(activitiesRef)
      if (snapshot.exists()) {
        const activitiesData = []
        snapshot.forEach((activitySnapshot) => {
          activitiesData.push({ id: activitySnapshot.key, ...activitySnapshot.val() })
        })
        setActivities(activitiesData)
      } else {
        setActivities([])
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error)
    }
  }

  const fetchTanks = async (propriedade) => {
    try {
      const tanksRef = ref(database, `propriedades/${propriedade}/tanques`)
      const snapshot = await get(tanksRef)
      if (snapshot.exists()) {
        const tanksData = []
        snapshot.forEach((tankSnapshot) => {
          tanksData.push({ id: tankSnapshot.key, ...tankSnapshot.val() })
        })
        setTanks(tanksData)
      } else {
        setTanks([])
      }
    } catch (error) {
      console.error("Erro ao buscar tanques:", error)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: "", text: "" }), 5000)
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userForm.email, userForm.senha)
      const user = userCredential.user

      const userData = {
        nome: userForm.nome,
        email: userForm.email,
        role: userForm.role,
        propriedade: propriedadeNome,
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `users/${user.uid}`), {
        ...userData,
        propriedade_escolhida: propriedadeNome,
      })

      await set(ref(database, `propriedades/${propriedadeNome}/users/${user.uid}`), userData)
      await remove(ref(database, `${user.uid}`))

      showMessage("success", "Usuário cadastrado com sucesso!")
      setUserForm({ nome: "", email: "", senha: "", role: "" })
      setShowUserModal(false)
      fetchUsers(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error)
      let errorMessage = error.message
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já foi cadastrado. Por favor, use outro e-mail."
      }
      showMessage("error", `Erro ao cadastrar usuário: ${errorMessage}`)
    }
  }

  const handleMachineSubmit = async (e) => {
    e.preventDefault()
    try {
      const machineData = {
        id: machineForm.id,
        nome: machineForm.nome,
        status: "Operacional",
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/maquinarios/${machineForm.id}`), machineData)
      showMessage("success", "Máquina cadastrada com sucesso!")
      setMachineForm({ id: "", nome: "" })
      setShowMachineModal(false)
      fetchMachines(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar máquina:", error)
      showMessage("error", `Erro ao cadastrar máquina: ${error.message}`)
    }
  }

  const handleImplementSubmit = async (e) => {
    e.preventDefault()
    try {
      const implementData = {
        id: implementForm.id,
        nome: implementForm.nome,
        status: "Operacional",
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/implementos/${implementForm.id}`), implementData)
      showMessage("success", "Implemento cadastrado com sucesso!")
      setImplementForm({ id: "", nome: "" })
      setShowImplementModal(false)
      fetchImplements(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar implemento:", error)
      showMessage("error", `Erro ao cadastrar implemento: ${error.message}`)
    }
  }

  const handleDirectorSubmit = async (e) => {
    e.preventDefault()
    try {
      const directorData = {
        id: directorForm.id,
        direcionador: directorForm.nome,
        culturaAssociada: directorForm.culturaAssociada,
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/direcionadores/${directorForm.id}`), directorData)
      showMessage("success", "Direcionador cadastrado com sucesso!")
      setDirectorForm({ id: "", nome: "", culturaAssociada: "" })
      setShowDirectorModal(false)
      fetchDirectors(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar direcionador:", error)
      showMessage("error", `Erro ao cadastrar direcionador: ${error.message}`)
    }
  }

  const handleVehicleSubmit = async (e) => {
    e.preventDefault()
    try {
      const vehicleData = {
        id: vehicleForm.id,
        placa: vehicleForm.placa,
        modelo: vehicleForm.modelo,
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/veiculos/${vehicleForm.id}`), vehicleData)
      showMessage("success", "Veículo cadastrado com sucesso!")
      setVehicleForm({ id: "", placa: "", modelo: "" })
      setShowVehicleModal(false)
      fetchVehicles(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error)
      showMessage("error", `Erro ao cadastrar veículo: ${error.message}`)
    }
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      const activityData = {
        id: activityForm.id,
        atividade: activityForm.nome,
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/atividades/${activityForm.id}`), activityData)
      showMessage("success", "Atividade cadastrada com sucesso!")
      setActivityForm({ id: "", nome: "" })
      setShowActivityModal(false)
      fetchActivities(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar atividade:", error)
      showMessage("error", `Erro ao cadastrar atividade: ${error.message}`)
    }
  }

  const handleTankSubmit = async (e) => {
    e.preventDefault()
    try {
      const tankData = {
        id: tankForm.id,
        nome: tankForm.nome,
        dataCadastro: new Date().toISOString(),
      }

      await set(ref(database, `propriedades/${propriedadeNome}/tanques/${tankForm.id}`), tankData)
      showMessage("success", "Tanque cadastrado com sucesso!")
      setTankForm({ id: "", nome: "" })
      setShowTankModal(false)
      fetchTanks(propriedadeNome)
    } catch (error) {
      console.error("Erro ao cadastrar tanque:", error)
      showMessage("error", `Erro ao cadastrar tanque: ${error.message}`)
    }
  }

  const filterItems = (items, searchTerm, searchFields) => {
    if (!searchTerm) return items
    return items.filter((item) =>
      searchFields.some((field) => item[field]?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  const renderUsersList = () => {
    const filteredUsers = filterItems(users, searchTerms.usuarios, ["nome", "email", "role"])

    return (
      <div className="users-list">
        <h3>
          <i className="fas fa-users"></i> Usuários Cadastrados
        </h3>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar usuários..."
              value={searchTerms.usuarios}
              onChange={(e) => setSearchTerms({ ...searchTerms, usuarios: e.target.value })}
            />
          </div>
        </div>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="apontamento">
              <p>
                <i className="fas fa-user"></i>
                <strong>Nome:</strong> {user.nome || "N/A"}
              </p>
              <p>
                <i className="fas fa-envelope"></i>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
              <p>
                <i className="fas fa-user-tag"></i>
                <strong>Role:</strong> {user.role || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <p className="empty-state">
            <i className="fas fa-info-circle"></i> Nenhum usuário encontrado.
          </p>
        )}
      </div>
    )
  }

  const renderMachinesList = () => {
    const filteredMachines = filterItems(machines, searchTerms.maquinas, ["id", "nome"])

    return (
      <div className="equipment-section maquinas-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-tractor"></i>
          </div>
          <h3>Máquinas</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar máquinas..."
              value={searchTerms.maquinas}
              onChange={(e) => setSearchTerms({ ...searchTerms, maquinas: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => (
              <div key={machine.id} className="maquina-card">
                <div className="maquina-icon">
                  <i className="fas fa-tractor"></i>
                </div>
                <div className="maquina-info">
                  <h4>{machine.nome || `Máquina ${machine.id}`}</h4>
                  <div className="maquina-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {machine.id}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhuma máquina encontrada.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderImplementsList = () => {
    const filteredImplements = filterItems(implementsList, searchTerms.implementos, ["id", "nome"])

    return (
      <div className="equipment-section implementos-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-tools"></i>
          </div>
          <h3>Implementos</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar implementos..."
              value={searchTerms.implementos}
              onChange={(e) => setSearchTerms({ ...searchTerms, implementos: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredImplements.length > 0 ? (
            filteredImplements.map((implement) => (
              <div key={implement.id} className="implemento-card">
                <div className="implemento-icon">
                  <i className="fas fa-tools"></i>
                </div>
                <div className="implemento-info">
                  <h4>{implement.nome || `Implemento ${implement.id}`}</h4>
                  <div className="implemento-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {implement.id}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhum implemento encontrado.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderDirectorsList = () => {
    const filteredDirectors = filterItems(directors, searchTerms.direcionadores, [
      "id",
      "direcionador",
      "culturaAssociada",
    ])

    return (
      <div className="equipment-section direcionadores-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-compass"></i>
          </div>
          <h3>Direcionadores</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar direcionadores..."
              value={searchTerms.direcionadores}
              onChange={(e) => setSearchTerms({ ...searchTerms, direcionadores: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredDirectors.length > 0 ? (
            filteredDirectors.map((director) => (
              <div key={director.id} className="direcionador-card">
                <div className="direcionador-icon">
                  <i className="fas fa-compass"></i>
                </div>
                <div className="direcionador-info">
                  <h4>{director.direcionador || director.nome || `Direcionador ${director.id}`}</h4>
                  <div className="direcionador-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {director.id}
                    </p>
                    <p>
                      <i className="fas fa-compass"></i>
                      <strong>Direcionador:</strong> {director.direcionador || "N/A"}
                    </p>
                    <p>
                      <i className="fas fa-seedling"></i>
                      <strong>Cultura Associada:</strong> {director.culturaAssociada || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhum direcionador encontrado.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderVehiclesList = () => {
    const filteredVehicles = filterItems(vehicles, searchTerms.veiculos, ["id", "placa", "modelo"])

    return (
      <div className="equipment-section veiculos-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-car"></i>
          </div>
          <h3>Veículos</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar veículos..."
              value={searchTerms.veiculos}
              onChange={(e) => setSearchTerms({ ...searchTerms, veiculos: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="veiculo-card">
                <div className="veiculo-icon">
                  <i className="fas fa-car"></i>
                </div>
                <div className="veiculo-info">
                  <h4>{vehicle.modelo || `Veículo ${vehicle.id}`}</h4>
                  <div className="veiculo-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {vehicle.id}
                    </p>
                    <p>
                      <i className="fas fa-id-card"></i>
                      <strong>Placa:</strong> {vehicle.placa || "N/A"}
                    </p>
                    <p>
                      <i className="fas fa-car"></i>
                      <strong>Modelo:</strong> {vehicle.modelo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhum veículo encontrado.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderActivitiesList = () => {
    const filteredActivities = filterItems(activities, searchTerms.atividades, ["id", "atividade"])

    return (
      <div className="equipment-section atividades-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <h3>Atividades</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar atividades..."
              value={searchTerms.atividades}
              onChange={(e) => setSearchTerms({ ...searchTerms, atividades: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="atividade-card">
                <div className="atividade-icon">
                  <i className="fas fa-tasks"></i>
                </div>
                <div className="atividade-info">
                  <h4>{activity.atividade || `Atividade ${activity.id}`}</h4>
                  <div className="atividade-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {activity.id}
                    </p>
                    <p>
                      <i className="fas fa-tasks"></i>
                      <strong>Atividade:</strong> {activity.atividade || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhuma atividade encontrada.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderTanksList = () => {
    const filteredTanks = filterItems(tanks, searchTerms.tanques, ["id", "nome"])

    return (
      <div className="equipment-section tanques-section">
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-water"></i>
          </div>
          <h3>Tanques</h3>
        </div>
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar tanques..."
              value={searchTerms.tanques}
              onChange={(e) => setSearchTerms({ ...searchTerms, tanques: e.target.value })}
            />
          </div>
        </div>
        <div className="equipment-grid">
          {filteredTanks.length > 0 ? (
            filteredTanks.map((tank) => (
              <div key={tank.id} className="tanque-card">
                <div className="tanque-icon">
                  <i className="fas fa-water"></i>
                </div>
                <div className="tanque-info">
                  <h4>{tank.nome || `Tanque ${tank.id}`}</h4>
                  <div className="tanque-details">
                    <p>
                      <i className="fas fa-hashtag"></i>
                      <strong>ID:</strong> {tank.id}
                    </p>
                    <p>
                      <i className="fas fa-font"></i>
                      <strong>Nome:</strong> {tank.nome || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">
              <i className="fas fa-info-circle"></i> Nenhum tanque encontrado.
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderModal = (show, onClose, title, children) => {
    if (!show) return null

    return (
      <div className="modal" style={{ display: "flex" }}>
        <div className="modal-content">
          <span className="close-button" onClick={onClose}>
            &times;
          </span>
          <h3>
            <i className="fas fa-plus-circle"></i> {title}
          </h3>
          {children}
          {message.text && (
            <div className={`cadastro-message ${message.type}-message`}>
              <i className={`fas ${message.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
              {message.text}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cadastro-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cadastro-container">
      <div className="breadcrumb">
        <i className="fas fa-home"></i>
        <span className="separator">/</span>
        <span>Cadastros</span>
      </div>

      <div className="propriedade">
        <h2>
          <i className="fas fa-user-plus"></i> Cadastro
        </h2>

        <div className="apontamentos-tabs">
          <button
            className={`tab-button ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            <i className="fas fa-users"></i> Usuários
          </button>
          <button
            className={`tab-button ${activeTab === "maquinas" ? "active" : ""}`}
            onClick={() => setActiveTab("maquinas")}
          >
            <i className="fas fa-tractor"></i> Máquinas
          </button>
          <button
            className={`tab-button ${activeTab === "implementos" ? "active" : ""}`}
            onClick={() => setActiveTab("implementos")}
          >
            <i className="fas fa-tools"></i> Implementos
          </button>
          <button
            className={`tab-button ${activeTab === "direcionadores" ? "active" : ""}`}
            onClick={() => setActiveTab("direcionadores")}
          >
            <i className="fas fa-compass"></i> Direcionadores
          </button>
          <button
            className={`tab-button ${activeTab === "veiculos" ? "active" : ""}`}
            onClick={() => setActiveTab("veiculos")}
          >
            <i className="fas fa-car"></i> Veículos
          </button>
          <button
            className={`tab-button ${activeTab === "atividades" ? "active" : ""}`}
            onClick={() => setActiveTab("atividades")}
          >
            <i className="fas fa-tasks"></i> Atividades
          </button>
          <button
            className={`tab-button ${activeTab === "tanques" ? "active" : ""}`}
            onClick={() => setActiveTab("tanques")}
          >
            <i className="fas fa-water"></i> Tanques
          </button>
        </div>

        <div className="action-buttons">
          {activeTab === "usuarios" && (
            <button className="action-button" onClick={() => setShowUserModal(true)}>
              <i className="fas fa-user-plus"></i> Cadastrar Novo Usuário
            </button>
          )}
          {activeTab === "maquinas" && (
            <button className="action-button" onClick={() => setShowMachineModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Nova Máquina
            </button>
          )}
          {activeTab === "implementos" && (
            <button className="action-button" onClick={() => setShowImplementModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Novo Implemento
            </button>
          )}
          {activeTab === "direcionadores" && (
            <button className="action-button" onClick={() => setShowDirectorModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Novo Direcionador
            </button>
          )}
          {activeTab === "veiculos" && (
            <button className="action-button" onClick={() => setShowVehicleModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Novo Veículo
            </button>
          )}
          {activeTab === "atividades" && (
            <button className="action-button" onClick={() => setShowActivityModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Nova Atividade
            </button>
          )}
          {activeTab === "tanques" && (
            <button className="action-button" onClick={() => setShowTankModal(true)}>
              <i className="fas fa-plus-circle"></i> Cadastrar Novo Tanque
            </button>
          )}
        </div>

        {activeTab === "usuarios" && renderUsersList()}
        {activeTab === "maquinas" && renderMachinesList()}
        {activeTab === "implementos" && renderImplementsList()}
        {activeTab === "direcionadores" && renderDirectorsList()}
        {activeTab === "veiculos" && renderVehiclesList()}
        {activeTab === "atividades" && renderActivitiesList()}
        {activeTab === "tanques" && renderTanksList()}
      </div>

      {/* User Modal */}
      {renderModal(
        showUserModal,
        () => setShowUserModal(false),
        "Cadastrar Novo Usuário",
        <form className="cadastro-form" onSubmit={handleUserSubmit}>
          <div className="form-group">
            <label htmlFor="nome">
              <i className="fas fa-user"></i> Nome
            </label>
            <input
              type="text"
              id="nome"
              className="form-input"
              placeholder="Nome completo"
              value={userForm.nome}
              onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="email@exemplo.com"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">
              <i className="fas fa-lock"></i> Senha
            </label>
            <input
              type="password"
              id="senha"
              className="form-input"
              placeholder="Senha"
              value={userForm.senha}
              onChange={(e) => setUserForm({ ...userForm, senha: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">
              <i className="fas fa-user-tag"></i> Função
            </label>
            <select
              id="role"
              className="form-input"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              required
            >
              <option value="">Selecione uma função</option>
              <option value="Gestor">Gestor</option>
              <option value="Operacional">Operacional</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Usuário
            </button>
          </div>
        </form>,
      )}

      {/* Machine Modal */}
      {renderModal(
        showMachineModal,
        () => setShowMachineModal(false),
        "Cadastrar Nova Máquina",
        <form className="cadastro-form" onSubmit={handleMachineSubmit}>
          <div className="form-group">
            <label htmlFor="maquinaId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="maquinaId"
              className="form-input"
              placeholder="ID da máquina"
              value={machineForm.id}
              onChange={(e) => setMachineForm({ ...machineForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="maquinaNome">
              <i className="fas fa-font"></i> Nome
            </label>
            <input
              type="text"
              id="maquinaNome"
              className="form-input"
              placeholder="Nome da máquina"
              value={machineForm.nome}
              onChange={(e) => setMachineForm({ ...machineForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Máquina
            </button>
          </div>
        </form>,
      )}

      {/* Implement Modal */}
      {renderModal(
        showImplementModal,
        () => setShowImplementModal(false),
        "Cadastrar Novo Implemento",
        <form className="cadastro-form" onSubmit={handleImplementSubmit}>
          <div className="form-group">
            <label htmlFor="implementoId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="implementoId"
              className="form-input"
              placeholder="ID do implemento"
              value={implementForm.id}
              onChange={(e) => setImplementForm({ ...implementForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="implementoNome">
              <i className="fas fa-font"></i> Nome
            </label>
            <input
              type="text"
              id="implementoNome"
              className="form-input"
              placeholder="Nome do implemento"
              value={implementForm.nome}
              onChange={(e) => setImplementForm({ ...implementForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Implemento
            </button>
          </div>
        </form>,
      )}

      {/* Director Modal */}
      {renderModal(
        showDirectorModal,
        () => setShowDirectorModal(false),
        "Cadastrar Novo Direcionador",
        <form className="cadastro-form" onSubmit={handleDirectorSubmit}>
          <div className="form-group">
            <label htmlFor="direcionadorId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="direcionadorId"
              className="form-input"
              placeholder="ID do direcionador"
              value={directorForm.id}
              onChange={(e) => setDirectorForm({ ...directorForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="direcionadorNome">
              <i className="fas fa-compass"></i> Direcionador
            </label>
            <input
              type="text"
              id="direcionadorNome"
              className="form-input"
              placeholder="Nome do direcionador"
              value={directorForm.nome}
              onChange={(e) => setDirectorForm({ ...directorForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="culturaAssociada">
              <i className="fas fa-seedling"></i> Cultura Associada
            </label>
            <input
              type="text"
              id="culturaAssociada"
              className="form-input"
              placeholder="Cultura associada"
              value={directorForm.culturaAssociada}
              onChange={(e) => setDirectorForm({ ...directorForm, culturaAssociada: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Direcionador
            </button>
          </div>
        </form>,
      )}

      {/* Vehicle Modal */}
      {renderModal(
        showVehicleModal,
        () => setShowVehicleModal(false),
        "Cadastrar Novo Veículo",
        <form className="cadastro-form" onSubmit={handleVehicleSubmit}>
          <div className="form-group">
            <label htmlFor="veiculoId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="veiculoId"
              className="form-input"
              placeholder="ID do veículo"
              value={vehicleForm.id}
              onChange={(e) => setVehicleForm({ ...vehicleForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="veiculoPlaca">
              <i className="fas fa-id-card"></i> Placa
            </label>
            <input
              type="text"
              id="veiculoPlaca"
              className="form-input"
              placeholder="Placa do veículo"
              value={vehicleForm.placa}
              onChange={(e) => setVehicleForm({ ...vehicleForm, placa: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="veiculoModelo">
              <i className="fas fa-car"></i> Modelo
            </label>
            <input
              type="text"
              id="veiculoModelo"
              className="form-input"
              placeholder="Modelo do veículo"
              value={vehicleForm.modelo}
              onChange={(e) => setVehicleForm({ ...vehicleForm, modelo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Veículo
            </button>
          </div>
        </form>,
      )}

      {/* Activity Modal */}
      {renderModal(
        showActivityModal,
        () => setShowActivityModal(false),
        "Cadastrar Nova Atividade",
        <form className="cadastro-form" onSubmit={handleActivitySubmit}>
          <div className="form-group">
            <label htmlFor="atividadeId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="atividadeId"
              className="form-input"
              placeholder="ID da atividade"
              value={activityForm.id}
              onChange={(e) => setActivityForm({ ...activityForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="atividadeNome">
              <i className="fas fa-tasks"></i> Atividade
            </label>
            <input
              type="text"
              id="atividadeNome"
              className="form-input"
              placeholder="Nome da atividade"
              value={activityForm.nome}
              onChange={(e) => setActivityForm({ ...activityForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Atividade
            </button>
          </div>
        </form>,
      )}

      {/* Tank Modal */}
      {renderModal(
        showTankModal,
        () => setShowTankModal(false),
        "Cadastrar Novo Tanque",
        <form className="cadastro-form" onSubmit={handleTankSubmit}>
          <div className="form-group">
            <label htmlFor="tanqueId">
              <i className="fas fa-hashtag"></i> ID
            </label>
            <input
              type="text"
              id="tanqueId"
              className="form-input"
              placeholder="ID do tanque"
              value={tankForm.id}
              onChange={(e) => setTankForm({ ...tankForm, id: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tanqueNome">
              <i className="fas fa-font"></i> Nome
            </label>
            <input
              type="text"
              id="tanqueNome"
              className="form-input"
              placeholder="Nome do tanque"
              value={tankForm.nome}
              onChange={(e) => setTankForm({ ...tankForm, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="cadastrar-button">
              <i className="fas fa-save"></i> Cadastrar Tanque
            </button>
          </div>
        </form>,
      )}
    </div>
  )
}

export default Cadastro
