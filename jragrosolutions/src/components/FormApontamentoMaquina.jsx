"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { ref, onValue, get, set, push, query, orderByChild, equalTo } from "firebase/database"
import { auth, database } from "../firebase/firebase"
import {
  Settings,
  Calendar,
  Activity,
  Wheat,
  Plus,
  X,
  Users,
  Tractor,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react"

const CACHED_HORIMETROS_KEY = "cached_horimetros"
const CACHED_ATIVIDADES_KEY = "cached_atividades"
const PREVIOUS_HORIMETROS_KEY = "previous_horimetros"

const AsyncStorage = {
  getItem: (key) => {
    try {
      return Promise.resolve(localStorage.getItem(key))
    } catch (error) {
      return Promise.resolve(null)
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
}

const CustomAlert = ({ type, title, message, onClose }) => {
  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-emerald-50/95 border-emerald-200 text-emerald-800",
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
          titleColor: "text-emerald-900",
        }
      case "error":
        return {
          container: "bg-red-50/95 border-red-200 text-red-800",
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          titleColor: "text-red-900",
        }
      case "warning":
        return {
          container: "bg-amber-50/95 border-amber-200 text-amber-800",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          titleColor: "text-amber-900",
        }
      default:
        return {
          container: "bg-blue-50/95 border-blue-200 text-blue-800",
          icon: <Info className="w-5 h-5 text-blue-600" />,
          titleColor: "text-blue-900",
        }
    }
  }

  const styles = getAlertStyles()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${styles.container} backdrop-blur-sm rounded-2xl shadow-2xl border max-w-md w-full p-6 animate-in zoom-in-95 duration-300`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{styles.icon}</div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg mb-2 ${styles.titleColor}`}>{title}</h3>
            {message && <p className="text-sm leading-relaxed whitespace-pre-line">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/80 hover:bg-white text-gray-700 font-medium rounded-lg transition-colors duration-200 shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

const initialFormData = {
  fichaControle: "", // Alterado de numeroMaquina para fichaControle
  data: "",
  direcionador: "",
  direcionadores: [],
  cultura: "",
  atividade: "",
  observacao: "",
}

const FormApontamentoMaquina = ({ onSubmit, onCancel, isLoading }) => {
  const [user] = useAuthState(auth)
  const [userPropriedade, setUserPropriedade] = useState(null)

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})

  const [atividades, setAtividades] = useState([])
  const [direcionadores, setDirecionadores] = useState([])
  const [implementos, setImplementos] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [horimetros, setHorimetros] = useState({})
  const [previousHorimetros, setPreviousHorimetros] = useState({})

  const [selectedDirecionadores, setSelectedDirecionadores] = useState([])
  const [selectedImplementos, setSelectedImplementos] = useState([])
  const [selectedOperacoesMecanizadas, setSelectedOperacoesMecanizadas] = useState([])

  const [listModalVisible, setListModalVisible] = useState(false)
  const [modalType, setModalType] = useState("")
  const [currentOperacaoId, setCurrentOperacaoId] = useState(null)
  const [tempSelectedDirecionadores, setTempSelectedDirecionadores] = useState([])
  const [tempSelectedImplementos, setTempSelectedImplementos] = useState([])

  const [alert, setAlert] = useState(null)

  const isMounted = useRef(true)

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message })
  }

  const closeAlert = () => {
    setAlert(null)
  }

  const isFormValid = useCallback(() => {
    const requiredFields = ["fichaControle", "data", "atividade"] // Alterado numeroMaquina para fichaControle
    const basicFieldsValid = requiredFields.every((field) => formData[field] && formData[field].trim() !== "")

    const direcionadorValid = Array.isArray(selectedDirecionadores) && selectedDirecionadores.length > 0
    const operacoesMecanizadasValid =
      Array.isArray(selectedOperacoesMecanizadas) && selectedOperacoesMecanizadas.length > 0

    return basicFieldsValid && direcionadorValid && operacoesMecanizadasValid
  }, [formData, selectedDirecionadores, selectedOperacoesMecanizadas])

  const resetForm = useCallback(() => {
    setFormData({
      ...initialFormData,
      data: new Date().toISOString().split("T")[0],
    })
    setSelectedDirecionadores([])
    setSelectedImplementos([])
    setSelectedOperacoesMecanizadas([])
    setErrors({})
  }, [])

  useEffect(() => {
    const fetchUserProperty = async () => {
      if (!user) return

      try {
        const propriedadesRef = ref(database, "propriedades")
        const snapshot = await get(propriedadesRef)

        if (snapshot.exists()) {
          const propriedades = snapshot.val()
          for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
            if (propriedadeData.users && propriedadeData.users[user.uid]) {
              setUserPropriedade(propriedadeName)
              break
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar propriedade do usuário:", error)
      }
    }

    fetchUserProperty()
  }, [user])

  useEffect(() => {
    if (!userPropriedade) return

    const loadAtividadesFromFirebase = () => {
      try {
        const atividadesRef = ref(database, `propriedades/${userPropriedade}/atividades`)

        const unsubscribe = onValue(
          atividadesRef,
          (snapshot) => {
            if (isMounted.current) {
              const data = snapshot.val() || {}
              const atividadesArray = Object.entries(data).map(([key, value]) => ({
                id: value.id || key,
                name: value.atividade || "Atividade sem nome",
              }))

              setAtividades(atividadesArray)

              AsyncStorage.setItem(CACHED_ATIVIDADES_KEY, JSON.stringify(atividadesArray)).catch((error) =>
                console.error("Erro ao salvar atividades no cache:", error),
              )
            }
          },
          (error) => {
            console.error("Erro ao carregar atividades do Firebase:", error)
            loadCachedAtividades()
          },
        )

        return unsubscribe
      } catch (error) {
        console.error("Erro ao configurar listener de atividades:", error)
        loadCachedAtividades()
      }
    }

    const loadCachedAtividades = async () => {
      try {
        const cachedAtividades = await AsyncStorage.getItem(CACHED_ATIVIDADES_KEY)
        if (cachedAtividades && isMounted.current) {
          setAtividades(JSON.parse(cachedAtividades))
        }
      } catch (error) {
        console.error("Erro ao carregar atividades do cache:", error)
      }
    }

    const unsubscribe = loadAtividadesFromFirebase()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [userPropriedade])

  useEffect(() => {
    if (!userPropriedade) return

    const direcionadoresRef = ref(database, `propriedades/${userPropriedade}/direcionadores`)
    const unsubscribe = onValue(direcionadoresRef, (snapshot) => {
      const data = snapshot.val() || {}
      const direcionadoresArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        name: value.direcionador || "Direcionador sem nome",
        culturaAssociada: value.culturaAssociada || "",
      }))
      setDirecionadores(direcionadoresArray)
    })

    return unsubscribe
  }, [userPropriedade])

  useEffect(() => {
    if (!userPropriedade) return

    const implementosRef = ref(database, `propriedades/${userPropriedade}/implementos`)
    const unsubscribe = onValue(implementosRef, (snapshot) => {
      const data = snapshot.val() || {}
      const implementosArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        name: value.nome || "Implemento sem nome",
      }))
      setImplementos(implementosArray)
    })

    return unsubscribe
  }, [userPropriedade])

  useEffect(() => {
    if (!userPropriedade) return

    const maquinariosRef = ref(database, `propriedades/${userPropriedade}/maquinarios`)
    const unsubscribe = onValue(maquinariosRef, (snapshot) => {
      const data = snapshot.val() || {}
      const maquinasArray = Object.entries(data).map(([key, value]) => ({
        id: key,
        name: value.name || value.nome || "Máquina sem nome",
        status: value.status || "Desconhecido",
      }))
      setMaquinas(maquinasArray)
      console.log("Máquinas carregadas:", maquinasArray)
    })

    return unsubscribe
  }, [userPropriedade])

  const getHorimetroAnterior = async (maquinaId) => {
    if (!maquinaId || !userPropriedade) return ""

    try {
      const horimetrosRef = ref(database, `propriedades/${userPropriedade}/horimetros/${maquinaId}`)
      const snapshot = await get(horimetrosRef)

      if (snapshot.exists()) {
        return snapshot.val().toString()
      }
    } catch (error) {
      console.error("Erro ao buscar horímetro anterior:", error)
    }

    return ""
  }

  const calcularTempoUso = (horimetroInicial, horimetroFinal) => {
    if (!horimetroInicial || !horimetroFinal) return 0
    const inicial = Number.parseFloat(horimetroInicial)
    const final = Number.parseFloat(horimetroFinal)
    if (isNaN(inicial) || isNaN(final) || final <= inicial) return 0
    return final - inicial
  }

  const addOperacaoMecanizada = () => {
    const newOperacao = {
      id: Date.now().toString(),
      maquina: "",
      maquinaId: "",
      horimetroAnterior: "",
      horimetroAtual: "",
      implementos: [],
      tempoUso: 0,
    }
    setSelectedOperacoesMecanizadas((prev) => [...prev, newOperacao])
  }

  const removeOperacaoMecanizadas = async (id) => {
    const operacao = selectedOperacoesMecanizadas.find((op) => op.id === id)

    if (operacao && operacao.maquinaId && operacao.horimetroAnterior) {
      await restoreHorimetroAnterior(operacao.maquinaId, operacao.horimetroAnterior)
    }

    setSelectedOperacoesMecanizadas((prev) => prev.filter((op) => op.id !== id))
  }

  const updateOperacaoMecanizada = async (id, field, value) => {
    if (field === "maquina") {
      const maquinaSelecionada = maquinas.find((m) => m.id === value)
      if (maquinaSelecionada) {
        const horimetroAtual = await getHorimetroAtual(value)
        setSelectedOperacoesMecanizadas((prev) =>
          prev.map((op) =>
            op.id === id
              ? {
                  ...op,
                  maquina: maquinaSelecionada.nome,
                  maquinaId: value,
                  horimetroAnterior: horimetroAtual.toString(),
                  horimetroAtual: "",
                  tempoUso: 0,
                }
              : op,
          ),
        )
      }
    } else if (field === "horimetroAtual") {
      setSelectedOperacoesMecanizadas((prev) =>
        prev.map((op) => {
          if (op.id === id) {
            const tempoUso = calcularTempoUso(op.horimetroAnterior, value)
            return { ...op, [field]: value, tempoUso }
          }
          return op
        }),
      )
    } else {
      setSelectedOperacoesMecanizadas((prev) => prev.map((op) => (op.id === id ? { ...op, [field]: value } : op)))
    }
  }

  const openImplementosModal = (operacaoId) => {
    const operacao = selectedOperacoesMecanizadas.find((op) => op.id === operacaoId)
    setCurrentOperacaoId(operacaoId)
    setTempSelectedImplementos(operacao?.implementos || [])
    setModalType("implementos-operacao")
    setListModalVisible(true)
  }

  const openModal = (type) => {
    setModalType(type)
    if (type === "direcionadores") {
      setTempSelectedDirecionadores([...selectedDirecionadores])
    } else if (type === "implementos") {
      setTempSelectedImplementos([...selectedImplementos])
    }
    setListModalVisible(true)
  }

  const closeModal = () => {
    setListModalVisible(false)
    setModalType("")
    setCurrentOperacaoId(null)
    setTempSelectedDirecionadores([])
    setTempSelectedImplementos([])
  }

  const toggleTempSelection = (item, type) => {
    if (type === "direcionadores") {
      setTempSelectedDirecionadores((prev) => {
        const isSelected = prev.some((d) => d.id === item.id)
        if (isSelected) {
          return prev.filter((d) => d.id !== item.id)
        } else {
          return [...prev, item]
        }
      })
    } else if (type === "implementos" || type === "implementos-operacao") {
      setTempSelectedImplementos((prev) => {
        const isSelected = prev.some((i) => i.id === item.id)
        if (isSelected) {
          return prev.filter((i) => i.id !== item.id)
        } else {
          return [...prev, item]
        }
      })
    }
  }

  const updateCulturaFromDirecionadores = (selectedDirecionadoresList) => {
    if (!selectedDirecionadoresList || selectedDirecionadoresList.length === 0) {
      setFormData((prev) => ({ ...prev, cultura: "" }))
      return
    }

    const culturas = selectedDirecionadoresList
      .map((direcionador) => direcionador.culturaAssociada)
      .filter((cultura) => cultura && cultura.trim() !== "")
      .filter((cultura, index, array) => array.indexOf(cultura) === index)

    if (culturas.length === 1) {
      setFormData((prev) => ({ ...prev, cultura: culturas[0].toLowerCase() }))
    } else if (culturas.length > 1) {
      setFormData((prev) => ({ ...prev, cultura: "" }))
    } else {
      setFormData((prev) => ({ ...prev, cultura: "" }))
    }
  }

  const confirmSelection = () => {
    if (modalType === "direcionadores") {
      setSelectedDirecionadores(tempSelectedDirecionadores)
      updateCulturaFromDirecionadores(tempSelectedDirecionadores)
    } else if (modalType === "implementos") {
      setSelectedImplementos(tempSelectedImplementos)
    } else if (modalType === "implementos-operacao" && currentOperacaoId) {
      setSelectedOperacoesMecanizadas((prev) =>
        prev.map((op) => (op.id === currentOperacaoId ? { ...op, implementos: tempSelectedImplementos } : op)),
      )
    }
    closeModal()
  }

  const sendDataToFirebase = useCallback(
    async (apontamentoData) => {
      if (!userPropriedade) {
        console.error("❌ userPropriedade não definida!")
        return false
      }

      try {
        console.log("🔍 userPropriedade:", userPropriedade)
        console.log("🔍 user.uid:", user?.uid)

        const apontamentosRef = ref(database, `propriedades/${userPropriedade}/apontamentos`)

        const existingEntryQuery = query(apontamentosRef, orderByChild("localId"), equalTo(apontamentoData.localId))
        const existingEntrySnapshot = await get(existingEntryQuery)

        if (!existingEntrySnapshot.exists()) {
          const newEntryRef = push(apontamentosRef)
          await set(newEntryRef, apontamentoData)
          console.log("✅ Apontamento salvo com localId:", apontamentoData.localId)
          return true
        } else {
          console.log("⚠️ Apontamento já existe com localId:", apontamentoData.localId)
          return false
        }
      } catch (error) {
        console.error("❌ Erro ao salvar apontamento:", error)
        throw error
      }
    },
    [userPropriedade, user],
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      const missingFields = []

      if (!formData.fichaControle || formData.fichaControle.trim() === "") {
        // Alterado numeroMaquina para fichaControle
        missingFields.push("Ficha de Controle") // Alterado texto do campo
      }

      if (!formData.data || formData.data.trim() === "") {
        missingFields.push("Data")
      }

      if (!Array.isArray(selectedDirecionadores) || selectedDirecionadores.length === 0) {
        missingFields.push("Direcionadores")
      }

      if (!formData.atividade || formData.atividade.trim() === "") {
        missingFields.push("Atividade")
      }

      if (!Array.isArray(selectedOperacoesMecanizadas) || selectedOperacoesMecanizadas.length === 0) {
        missingFields.push("Operações Mecanizadas")
      }

      const operacoesIncompletas = selectedOperacoesMecanizadas.filter((op) => {
        if (!op.maquinaId || !op.horimetroAtual) return true

        const horimetroAtual = Number.parseFloat(op.horimetroAtual)
        const horimetroAnterior = Number.parseFloat(op.horimetroAnterior)

        if (horimetroAtual < horimetroAnterior) return true

        if (op.tempoUso > 10) return true

        return false
      })

      if (operacoesIncompletas.length > 0) {
        missingFields.push(
          "Operações Mecanizadas (máquina, horímetro atual obrigatórios, horímetro ≥ anterior e tempo ≤ 10h)",
        )
      }

      if (missingFields.length > 0) {
        showAlert(
          "error",
          "Campos Obrigatórios",
          `Os seguintes campos são obrigatórios e devem ser preenchidos:\n\n• ${missingFields.join("\n• ")}`,
        )
        return
      }

      try {
        const culturasUnicas = selectedDirecionadores
          .map((d) => d.culturaAssociada)
          .filter((cultura) => cultura && cultura.trim() !== "")
          .filter((cultura, index, array) => array.indexOf(cultura) === index)

        const apontamentoData = {
          localId: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
          atividade: formData.atividade,
          cultura: culturasUnicas.length > 0 ? culturasUnicas[0] : "",
          data: formData.data,
          direcionador: selectedDirecionadores.length > 0 ? selectedDirecionadores[0].name : "",
          direcionadores: selectedDirecionadores.map((d) => ({
            culturaAssociada: d.culturaAssociada || "",
            id: d.id,
            name: d.name,
          })),
          fichaControle: formData.fichaControle, // Alterado de numeroMaquina para fichaControle
          observacao: formData.observacao || "",
          operacoesMecanizadas: selectedOperacoesMecanizadas.map((op, index) => ({
            bem: op.maquina || "",
            horaFinal: op.horimetroAtual,
            horaInicial: op.horimetroAnterior,
            id: Date.now() + index,
            implemento: op.implementos && op.implementos.length > 0 ? op.implementos[0].name : "",
            implementos: op.implementos || [],
            totalHoras: op.tempoUso.toFixed(2),
          })),
          propriedade: userPropriedade,
          status: "pending",
          timestamp: Date.now(),
          userId: user.uid,
          createdAt: new Date().toISOString(),
        }

        console.log("📝 Dados do apontamento a serem salvos:", apontamentoData)

        const success = await sendDataToFirebase(apontamentoData)

        if (success) {
          if (onSubmit) {
            onSubmit(apontamentoData)
          }

          resetForm()
        }
      } catch (error) {
        console.error("❌ Erro ao salvar apontamento:", error)
        showAlert("error", "Erro", "Erro ao salvar apontamento. Tente novamente.")
      }
    },
    [
      formData,
      selectedDirecionadores,
      selectedOperacoesMecanizadas,
      selectedImplementos,
      user,
      userPropriedade,
      onSubmit,
      sendDataToFirebase,
      resetForm,
    ],
  )

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const updateHorimetroInBD = async (maquinaId, novoHorimetro) => {
    if (!maquinaId || !novoHorimetro || !userPropriedade) return

    try {
      const horimetroRef = ref(database, `propriedades/${userPropriedade}/horimetros/${maquinaId}`)
      await set(horimetroRef, Number.parseFloat(novoHorimetro))
      console.log(`Horímetro atualizado para máquina ${maquinaId}: ${novoHorimetro}`)
    } catch (error) {
      console.error("Erro ao atualizar horímetro:", error)
    }
  }

  const restoreHorimetroAnterior = async (maquinaId, horimetroAnterior) => {
    if (!maquinaId || !horimetroAnterior || !userPropriedade) return

    try {
      const horimetroRef = ref(database, `propriedades/${userPropriedade}/horimetros/${maquinaId}`)
      await set(horimetroRef, Number.parseFloat(horimetroAnterior))
      console.log(`Horímetro restaurado para máquina ${maquinaId}: ${horimetroAnterior}`)
    } catch (error) {
      console.error("Erro ao restaurar horímetro:", error)
    }
  }

  const handleHorimetroBlur = async (id, value) => {
    const operacao = selectedOperacoesMecanizadas.find((op) => op.id === id)

    if (operacao && operacao.maquinaId && value) {
      const horimetroAtual = Number.parseFloat(value)
      const horimetroAnterior = Number.parseFloat(operacao.horimetroAnterior)

      if (horimetroAtual < horimetroAnterior) {
        showAlert(
          "error",
          "Horímetro Inválido",
          `O horímetro atual (${horimetroAtual}) não pode ser menor que o horímetro anterior (${horimetroAnterior}).`,
        )
        return
      }

      const tempoUso = horimetroAtual - horimetroAnterior
      if (tempoUso > 10) {
        showAlert(
          "error",
          "Tempo de Uso Excedido",
          `O tempo de uso (${tempoUso.toFixed(1)}h) não pode exceder 10 horas. Verifique os valores inseridos.`,
        )
        return
      }

      await updateHorimetroInBD(operacao.maquinaId, value)
    }
  }

  const getHorimetroAtual = async (maquinaId) => {
    if (!maquinaId || !userPropriedade) return ""

    try {
      const horimetrosRef = ref(database, `propriedades/${userPropriedade}/horimetros/${maquinaId}`)
      const snapshot = await get(horimetrosRef)

      if (snapshot.exists()) {
        return snapshot.val().toString()
      }
    } catch (error) {
      console.error("Erro ao buscar horímetro atual:", error)
    }

    return ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header do Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apontamento de Máquina</h1>
              <p className="text-gray-600">Registre as operações mecanizadas e atividades realizadas</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de Campos Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Ficha de Controle *
                </label>
                <input
                  type="text"
                  value={formData.fichaControle}
                  onChange={(e) => handleChange("fichaControle", e.target.value)}
                  placeholder="Digite a ficha de controle"
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>

              {/* Data */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleChange("data", e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>

              {/* Atividade */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Activity className="w-4 h-4 text-green-500" />
                  Atividade *
                </label>
                <select
                  value={formData.atividade}
                  onChange={(e) => handleChange("atividade", e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                >
                  <option value="">Selecione a atividade</option>
                  {atividades.map((atividade) => (
                    <option key={atividade.id} value={atividade.name}>
                      {atividade.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direcionadores */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4 text-green-500" />
                Direcionadores *
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDirecionadores.map((direcionador) => (
                  <span
                    key={direcionador.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {direcionador.name}
                    <button
                      type="button"
                      onClick={() => setSelectedDirecionadores((prev) => prev.filter((d) => d.id !== direcionador.id))}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openModal("direcionadores")}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Direcionadores
              </button>
            </div>

            {/* Cultura(s) Associada(s) */}
            {selectedDirecionadores.length > 0 && (
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Wheat className="w-4 h-4 text-green-500" />
                  Cultura(s) Associada(s)
                </label>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedDirecionadores
                      .map((direcionador) => direcionador.culturaAssociada)
                      .filter((cultura) => cultura && cultura.trim() !== "")
                      .filter((cultura, index, array) => array.indexOf(cultura) === index)
                      .map((cultura, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                        >
                          <Wheat className="w-3 h-3 mr-1" />
                          {cultura}
                        </span>
                      ))}
                    {selectedDirecionadores.every((d) => !d.culturaAssociada || d.culturaAssociada.trim() === "") && (
                      <span className="text-gray-500 text-sm italic">
                        Nenhuma cultura associada aos direcionadores selecionados
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tractor className="w-4 h-4 text-green-500" />
                  Operações Mecanizadas *
                </label>
                <button
                  type="button"
                  onClick={addOperacaoMecanizada}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Operação
                </button>
              </div>

              {selectedOperacoesMecanizadas.map((operacao, index) => (
                <div key={operacao.id} className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Operação {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeOperacaoMecanizadas(operacao.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Máquina */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Máquina *</label>
                      <select
                        value={operacao.maquinaId || ""}
                        onChange={(e) => updateOperacaoMecanizada(operacao.id, "maquina", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione a máquina</option>
                        {maquinas.map((maquina) => (
                          <option key={maquina.id} value={maquina.id}>
                            {maquina.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Horímetro Anterior */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horímetro Anterior</label>
                      <input
                        type="number"
                        value={operacao.horimetroAnterior}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="Automático"
                      />
                    </div>

                    {/* Horímetro Atual */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horímetro Atual *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={operacao.horimetroAtual}
                        onChange={(e) => updateOperacaoMecanizada(operacao.id, "horimetroAtual", e.target.value)}
                        onBlur={(e) => handleHorimetroBlur(operacao.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Digite o horímetro atual"
                      />
                    </div>
                  </div>

                  {/* Tempo de Uso e Validação */}
                  {operacao.horimetroAnterior && operacao.horimetroAtual && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Tempo de Uso:</span>
                        <span
                          className={`text-lg font-bold ${
                            operacao.tempoUso > 10 ||
                            Number.parseFloat(operacao.horimetroAtual) < Number.parseFloat(operacao.horimetroAnterior)
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {operacao.tempoUso.toFixed(1)} horas
                        </span>
                      </div>
                      {Number.parseFloat(operacao.horimetroAtual) < Number.parseFloat(operacao.horimetroAnterior) && (
                        <div className="mt-2 text-red-600 text-sm font-medium">
                          ⚠️ Horímetro atual não pode ser menor que o anterior ({operacao.horimetroAnterior})!
                        </div>
                      )}
                      {operacao.tempoUso > 10 && (
                        <div className="mt-2 text-red-600 text-sm font-medium">
                          ⚠️ Tempo de uso não pode exceder 10 horas!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Implementos da Operação */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Implementos</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {operacao.implementos?.map((implemento) => (
                        <span
                          key={implemento.id}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {implemento.name}
                          <button
                            type="button"
                            onClick={() => {
                              const novosImplementos = operacao.implementos.filter((i) => i.id !== implemento.id)
                              updateOperacaoMecanizada(operacao.id, "implementos", novosImplementos)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => openImplementosModal(operacao.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Selecionar Implementos
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Observações
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => handleChange("observacao", e.target.value)}
                placeholder="Observações sobre a atividade realizada"
                rows={4}
                className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 resize-none"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Salvando..." : "Salvar Apontamento"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para Seleção Múltipla */}
      {listModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                Selecionar {modalType === "direcionadores" ? "Direcionadores" : "Implementos"}
              </h3>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {modalType === "direcionadores" &&
                direcionadores.map((direcionador) => (
                  <label
                    key={direcionador.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedDirecionadores.some((d) => d.id === direcionador.id)}
                      onChange={() => toggleTempSelection(direcionador, "direcionadores")}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span>{direcionador.name}</span>
                  </label>
                ))}

              {(modalType === "implementos" || modalType === "implementos-operacao") &&
                implementos.map((implemento) => (
                  <label
                    key={implemento.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedImplementos.some((i) => i.id === implemento.id)}
                      onChange={() => toggleTempSelection(implemento, modalType)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>{implemento.name}</span>
                  </label>
                ))}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSelection}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {alert && <CustomAlert type={alert.type} title={alert.title} message={alert.message} onClose={closeAlert} />}
    </div>
  )
}

export default FormApontamentoMaquina
