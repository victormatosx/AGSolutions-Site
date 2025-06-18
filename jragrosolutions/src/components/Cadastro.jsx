"use client"

import { useState, useEffect } from "react"
import { database } from "../firebase/firebase"
import { ref, set, onValue, off } from "firebase/database"
import "../../styles/cadastro.css"

const Cadastro = () => {
  // Estados para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState("usuarios")

  // Estados para os dados
  const [usuarios, setUsuarios] = useState([])
  const [maquinarios, setMaquinarios] = useState([])
  const [implementos, setImplementos] = useState([])
  const [direcionadores, setDirecionadores] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [atividades, setAtividades] = useState([])
  const [tanques, setTanques] = useState([])

  // Estados para os formulários modais
  const [showUserForm, setShowUserForm] = useState(false)
  const [showMachineForm, setShowMachineForm] = useState(false)
  const [showImplementForm, setShowImplementForm] = useState(false)
  const [showDirecionadorForm, setShowDirecionadorForm] = useState(false)
  const [showVeiculoForm, setShowVeiculoForm] = useState(false)
  const [showAtividadeForm, setShowAtividadeForm] = useState(false)
  const [showTanqueForm, setShowTanqueForm] = useState(false)

  // Estados para busca
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para os dados dos formulários
  const [userData, setUserData] = useState({
    email: "",
    nome: "",
    propriedade: "",
    role: "user",
  })

  const [machineData, setMachineData] = useState({
    id: "",
    nome: "",
  })

  const [implementData, setImplementData] = useState({
    id: "",
    nome: "",
  })

  const [direcionadorData, setDirecionadorData] = useState({
    id: "",
    direcionador: "",
    culturaAssociada: "",
  })

  const [veiculoData, setVeiculoData] = useState({
    id: "",
    placa: "",
    modelo: "",
  })

  const [atividadeData, setAtividadeData] = useState({
    id: "",
    atividade: "",
  })

  const [tanqueData, setTanqueData] = useState({
    id: "",
    nome: "",
  })

  // Carregar dados do Firebase
  useEffect(() => {
    const usersRef = ref(database, "propriedades/Matrice/users")
    const machinesRef = ref(database, "propriedades/Matrice/maquinarios")
    const implementsRef = ref(database, "propriedades/Matrice/implementos")

    // Listener para usuários
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setUsuarios(usersList)
      }
    })

    // Listener para máquinas
    onValue(machinesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const machinesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setMaquinarios(machinesList)
      }
    })

    // Listener para implementos
    onValue(implementsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const implementsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setImplementos(implementsList)
      }
    })

    // Listener para direcionadores
    const direcionadoresRef = ref(database, "propriedades/Matrice/direcionadores")
    onValue(direcionadoresRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const direcionadoresList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setDirecionadores(direcionadoresList)
      }
    })

    // Listener para veículos
    const veiculosRef = ref(database, "propriedades/Matrice/veiculos")
    onValue(veiculosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const veiculosList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setVeiculos(veiculosList)
      }
    })

    // Listener para atividades
    const atividadesRef = ref(database, "propriedades/Matrice/atividades")
    onValue(atividadesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const atividadesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setAtividades(atividadesList)
      }
    })

    // Listener para tanques
    const tanquesRef = ref(database, "propriedades/Matrice/tanques")
    onValue(tanquesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const tanquesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }))
        setTanques(tanquesList)
      }
    })

    // Cleanup listeners
    return () => {
      off(usersRef)
      off(machinesRef)
      off(implementsRef)
      off(direcionadoresRef)
      off(veiculosRef)
      off(atividadesRef)
      off(tanquesRef)
    }
  }, [])

  // Funções para adicionar dados
  const handleAddUser = async (e) => {
    e.preventDefault()
    // Removido o código de adição de usuário para exibir o alerta
  }

  const handleAddMachine = async (e) => {
    e.preventDefault()
    try {
      const machinesRef = ref(database, `propriedades/Matrice/maquinarios/${machineData.id}`)
      await set(machinesRef, {
        id: machineData.id,
        nome: machineData.nome,
        status: "Operacional",
      })
      setMachineData({ id: "", nome: "" })
      setShowMachineForm(false)
      alert("Máquina cadastrada com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar máquina:", error)
      alert("Erro ao cadastrar máquina")
    }
  }

  const handleAddImplement = async (e) => {
    e.preventDefault()
    try {
      const implementsRef = ref(database, `propriedades/Matrice/implementos/${implementData.id}`)
      await set(implementsRef, {
        id: implementData.id,
        nome: implementData.nome,
        status: "Operacional",
      })
      setImplementData({ id: "", nome: "" })
      setShowImplementForm(false)
      alert("Implemento cadastrado com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar implemento:", error)
      alert("Erro ao cadastrar implemento")
    }
  }

  const handleAddDirecionador = async (e) => {
    e.preventDefault()
    try {
      const direcionadoresRef = ref(database, `propriedades/Matrice/direcionadores/${direcionadorData.id}`)
      await set(direcionadoresRef, {
        id: direcionadorData.id,
        direcionador: direcionadorData.direcionador,
        culturaAssociada: direcionadorData.culturaAssociada,
        dataCadastro: new Date().toISOString(),
      })
      setDirecionadorData({ id: "", direcionador: "", culturaAssociada: "" })
      setShowDirecionadorForm(false)
      alert("Direcionador cadastrado com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar direcionador:", error)
      alert("Erro ao cadastrar direcionador")
    }
  }

  const handleAddVeiculo = async (e) => {
    e.preventDefault()
    try {
      const veiculosRef = ref(database, `propriedades/Matrice/veiculos/${veiculoData.id}`)
      await set(veiculosRef, {
        id: veiculoData.id,
        placa: veiculoData.placa,
        modelo: veiculoData.modelo,
        dataCadastro: new Date().toISOString(),
      })
      setVeiculoData({ id: "", placa: "", modelo: "" })
      setShowVeiculoForm(false)
      alert("Veículo cadastrado com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error)
      alert("Erro ao cadastrar veículo")
    }
  }

  const handleAddAtividade = async (e) => {
    e.preventDefault()
    try {
      const atividadesRef = ref(database, `propriedades/Matrice/atividades/${atividadeData.id}`)
      await set(atividadesRef, {
        id: atividadeData.id,
        atividade: atividadeData.atividade,
        dataCadastro: new Date().toISOString(),
      })
      setAtividadeData({ id: "", atividade: "" })
      setShowAtividadeForm(false)
      alert("Atividade cadastrada com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar atividade:", error)
      alert("Erro ao cadastrar atividade")
    }
  }

  const handleAddTanque = async (e) => {
    e.preventDefault()
    try {
      const tanquesRef = ref(database, `propriedades/Matrice/tanques/${tanqueData.id}`)
      await set(tanquesRef, {
        id: tanqueData.id,
        nome: tanqueData.nome,
        dataCadastro: new Date().toISOString(),
      })
      setTanqueData({ id: "", nome: "" })
      setShowTanqueForm(false)
      alert("Tanque cadastrado com sucesso!")
    } catch (error) {
      console.error("Erro ao cadastrar tanque:", error)
      alert("Erro ao cadastrar tanque")
    }
  }

  // Função para filtrar itens baseado na busca
  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items
    return items.filter(
      (item) => item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || item.id?.toString().includes(searchTerm),
    )
  }

  const handleShowUserForm = () => {
    alert(
      "Você não tem permissão para criar novos usuários. Entre em contato pelo WhatsApp (34) 9 9653-2577 ou pelo E-mail victor@jragrosolutions.com.br para cadastrar novos usuários.",
    )
  }

  return (
    <div className="cadastro-container">
      {/* Header */}
      <div className="cadastro-header">
        <div className="header-title">
          <div className="title-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="currentColor"
              />
              <circle cx="19" cy="8" r="3" fill="currentColor" />
            </svg>
          </div>
          <h1>Cadastro</h1>
        </div>
        <div className="header-divider"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeSection === "usuarios" ? "active" : ""}`}
          onClick={() => setActiveSection("usuarios")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M16 7c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="currentColor"
            />
          </svg>
          Usuários
        </button>
        <button
          className={`nav-tab ${activeSection === "maquinarios" ? "active" : ""}`}
          onClick={() => setActiveSection("maquinarios")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
              fill="currentColor"
            />
          </svg>
          Máquinas
        </button>
        <button
          className={`nav-tab ${activeSection === "implementos" ? "active" : ""}`}
          onClick={() => setActiveSection("implementos")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
              fill="currentColor"
            />
          </svg>
          Implementos
        </button>
        <button
          className={`nav-tab ${activeSection === "direcionadores" ? "active" : ""}`}
          onClick={() => setActiveSection("direcionadores")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
          Direcionadores
        </button>
        <button
          className={`nav-tab ${activeSection === "veiculos" ? "active" : ""}`}
          onClick={() => setActiveSection("veiculos")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
              fill="currentColor"
            />
          </svg>
          Veículos
        </button>
        <button
          className={`nav-tab ${activeSection === "atividades" ? "active" : ""}`}
          onClick={() => setActiveSection("atividades")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
              fill="currentColor"
            />
          </svg>
          Atividades
        </button>
        <button
          className={`nav-tab ${activeSection === "tanques" ? "active" : ""}`}
          onClick={() => setActiveSection("tanques")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          Tanques
        </button>
      </div>

      {/* Content */}
      <div className="content-area">
        {/* Seção de Usuários */}
        {activeSection === "usuarios" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon usuarios">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 7c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Usuários</h2>
              </div>
              <button className="add-button" onClick={handleShowUserForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Novo Usuário
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(usuarios, searchTerm).map((usuario) => (
                <div key={usuario.id} className="item-card usuarios">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{usuario.nome}</h3>
                    <p className="card-id"># Email: {usuario.email}</p>
                    <p className="card-detail">Propriedade: {usuario.propriedade}</p>
                    <p className="card-detail">Função: {usuario.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Máquinas */}
        {activeSection === "maquinarios" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon maquinarios">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Máquinas</h2>
              </div>
              <button className="add-button" onClick={() => setShowMachineForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Nova Máquina
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar máquinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(maquinarios, searchTerm).map((maquina) => (
                <div key={maquina.id} className="item-card maquinarios">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{maquina.nome}</h3>
                    <p className="card-id"># ID: {maquina.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Implementos */}
        {activeSection === "implementos" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon implementos">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Implementos</h2>
              </div>
              <button className="add-button" onClick={() => setShowImplementForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Novo Implemento
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar implementos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(implementos, searchTerm).map((implemento) => (
                <div key={implemento.id} className="item-card implementos">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{implemento.nome}</h3>
                    <p className="card-id"># ID: {implemento.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Direcionadores */}
        {activeSection === "direcionadores" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon direcionadores">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Direcionadores</h2>
              </div>
              <button className="add-button" onClick={() => setShowDirecionadorForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Novo Direcionador
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar direcionadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(direcionadores, searchTerm).map((direcionador) => (
                <div key={direcionador.id} className="item-card direcionadores">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{direcionador.direcionador}</h3>
                    <p className="card-id"># ID: {direcionador.id}</p>
                    <p className="card-detail">Cultura: {direcionador.culturaAssociada}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Veículos */}
        {activeSection === "veiculos" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon veiculos">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Veículos</h2>
              </div>
              <button className="add-button" onClick={() => setShowVeiculoForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Novo Veículo
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(veiculos, searchTerm).map((veiculo) => (
                <div key={veiculo.id} className="item-card veiculos">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{veiculo.modelo}</h3>
                    <p className="card-id"># ID: {veiculo.id}</p>
                    <p className="card-detail">Placa: {veiculo.placa}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Atividades */}
        {activeSection === "atividades" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon atividades">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Atividades</h2>
              </div>
              <button className="add-button" onClick={() => setShowAtividadeForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Nova Atividade
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(atividades, searchTerm).map((atividade) => (
                <div key={atividade.id} className="item-card atividades">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{atividade.atividade}</h3>
                    <p className="card-id"># ID: {atividade.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Tanques */}
        {activeSection === "tanques" && (
          <div className="section-content">
            <div className="section-header">
              <div className="section-title">
                <div className="section-icon tanques">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2>Tanques</h2>
              </div>
              <button className="add-button" onClick={() => setShowTanqueForm(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Cadastrar Novo Tanque
              </button>
            </div>

            <div className="search-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar tanques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="items-grid">
              {filterItems(tanques, searchTerm).map((tanque) => (
                <div key={tanque.id} className="item-card tanques">
                  <div className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{tanque.nome}</h3>
                    <p className="card-id"># ID: {tanque.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {showUserForm && (
        <div className="modal-overlay" onClick={() => setShowUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Usuário</h3>
              <button className="close-button" onClick={() => setShowUserForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            {/* Formulário de usuário removido */}
          </div>
        </div>
      )}

      {showMachineForm && (
        <div className="modal-overlay" onClick={() => setShowMachineForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Nova Máquina</h3>
              <button className="close-button" onClick={() => setShowMachineForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddMachine}>
              <div className="form-group">
                <label>ID da Máquina</label>
                <input
                  type="text"
                  value={machineData.id}
                  onChange={(e) => setMachineData({ ...machineData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome da Máquina</label>
                <input
                  type="text"
                  value={machineData.nome}
                  onChange={(e) => setMachineData({ ...machineData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowMachineForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImplementForm && (
        <div className="modal-overlay" onClick={() => setShowImplementForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Implemento</h3>
              <button className="close-button" onClick={() => setShowImplementForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddImplement}>
              <div className="form-group">
                <label>ID do Implemento</label>
                <input
                  type="text"
                  value={implementData.id}
                  onChange={(e) => setImplementData({ ...implementData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome do Implemento</label>
                <input
                  type="text"
                  value={implementData.nome}
                  onChange={(e) => setImplementData({ ...implementData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowImplementForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Direcionador */}
      {showDirecionadorForm && (
        <div className="modal-overlay" onClick={() => setShowDirecionadorForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Direcionador</h3>
              <button className="close-button" onClick={() => setShowDirecionadorForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddDirecionador}>
              <div className="form-group">
                <label>ID do Direcionador</label>
                <input
                  type="text"
                  value={direcionadorData.id}
                  onChange={(e) => setDirecionadorData({ ...direcionadorData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome do Direcionador</label>
                <input
                  type="text"
                  value={direcionadorData.direcionador}
                  onChange={(e) => setDirecionadorData({ ...direcionadorData, direcionador: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cultura Associada</label>
                <input
                  type="text"
                  value={direcionadorData.culturaAssociada}
                  onChange={(e) => setDirecionadorData({ ...direcionadorData, culturaAssociada: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowDirecionadorForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Veículo */}
      {showVeiculoForm && (
        <div className="modal-overlay" onClick={() => setShowVeiculoForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Veículo</h3>
              <button className="close-button" onClick={() => setShowVeiculoForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddVeiculo}>
              <div className="form-group">
                <label>ID do Veículo</label>
                <input
                  type="text"
                  value={veiculoData.id}
                  onChange={(e) => setVeiculoData({ ...veiculoData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Placa do Veículo</label>
                <input
                  type="text"
                  value={veiculoData.placa}
                  onChange={(e) => setVeiculoData({ ...veiculoData, placa: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Modelo do Veículo</label>
                <input
                  type="text"
                  value={veiculoData.modelo}
                  onChange={(e) => setVeiculoData({ ...veiculoData, modelo: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowVeiculoForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atividade */}
      {showAtividadeForm && (
        <div className="modal-overlay" onClick={() => setShowAtividadeForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Nova Atividade</h3>
              <button className="close-button" onClick={() => setShowAtividadeForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddAtividade}>
              <div className="form-group">
                <label>ID da Atividade</label>
                <input
                  type="text"
                  value={atividadeData.id}
                  onChange={(e) => setAtividadeData({ ...atividadeData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome da Atividade</label>
                <input
                  type="text"
                  value={atividadeData.atividade}
                  onChange={(e) => setAtividadeData({ ...atividadeData, atividade: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAtividadeForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tanque */}
      {showTanqueForm && (
        <div className="modal-overlay" onClick={() => setShowTanqueForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cadastrar Novo Tanque</h3>
              <button className="close-button" onClick={() => setShowTanqueForm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTanque}>
              <div className="form-group">
                <label>ID do Tanque</label>
                <input
                  type="text"
                  value={tanqueData.id}
                  onChange={(e) => setTanqueData({ ...tanqueData, id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome do Tanque</label>
                <input
                  type="text"
                  value={tanqueData.nome}
                  onChange={(e) => setTanqueData({ ...tanqueData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowTanqueForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cadastro