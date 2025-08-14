"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { Fuel, Droplets, Truck, Gauge, FileText } from "lucide-react"
import { auth, database } from "../firebase/firebase"
import { ref, onValue, push, set } from "firebase/database"

const FormAbastecimentoMaquina = ({ onSubmit, onCancel, isLoading }) => {
  const [user, loading, error] = useAuthState(auth)

  const [formData, setFormData] = useState({
    produto: "Diesel", // Combustível
    tanqueDiesel: "", // Tanque
    bem: "", // Máquina
    quantidade: "", // Quantidade
    horimetro: "", // Horímetro
    observacao: "", // Observação
  })

  const [errors, setErrors] = useState({})
  const [tanques, setTanques] = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tanquesRef = ref(database, "propriedades/Matrice/tanques")
        onValue(
          tanquesRef,
          (snapshot) => {
            const data = snapshot.val()
            console.log("Dados dos tanques:", data) // Debug
            if (data) {
              const tanquesList = Object.keys(data).map((key) => ({
                id: key,
                nome: data[key].nome,
                dataCadastro: data[key].dataCadastro,
              }))
              console.log("Lista de tanques processada:", tanquesList) // Debug
              setTanques(tanquesList)
            } else {
              console.log("Nenhum tanque encontrado no banco")
              setTanques([])
            }
          },
          (error) => {
            console.error("Erro ao buscar tanques:", error)
            setTanques([
              { id: "1", nome: "Posto Externo" },
              { id: "3", nome: "Tanque Diesel Sede" },
              { id: "12", nome: "Tanque Gasolina" },
              { id: "17", nome: "Tanque Álcool" },
              { id: "19", nome: "Tanque Reserva" },
            ])
          },
        )

        const maquinasRef = ref(database, "propriedades/Matrice/maquinarios")
        onValue(
          maquinasRef,
          (snapshot) => {
            const data = snapshot.val()
            if (data) {
              const maquinasList = Object.keys(data).map((key) => ({
                id: key,
                nome: data[key].nome || `${data[key].codigo} - ${data[key].modelo}`,
                codigo: data[key].codigo,
                modelo: data[key].modelo,
              }))
              setMaquinas(maquinasList)
            } else {
              // Fallback com dados simulados se não houver máquinas no BD
              setMaquinas([
                { id: "367_t14_trator_jd_7230_j", nome: "367 - T14 - Trator Jd 7230 J" },
                { id: "368_t15_trator_jd_6110", nome: "368 - T15 - Trator Jd 6110" },
                { id: "369_c01_colheitadeira_case", nome: "369 - C01 - Colheitadeira Case 2388" },
                { id: "370_p01_pulverizador_jacto", nome: "370 - P01 - Pulverizador Jacto" },
              ])
            }
            setLoadingData(false)
          },
          (error) => {
            console.error("Erro ao buscar máquinas:", error)
            setMaquinas([
              { id: "367_t14_trator_jd_7230_j", nome: "367 - T14 - Trator Jd 7230 J" },
              { id: "368_t15_trator_jd_6110", nome: "368 - T15 - Trator Jd 6110" },
            ])
            setLoadingData(false)
          },
        )
      } catch (error) {
        console.error("Erro geral ao buscar dados do Firebase:", error)
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.produto) newErrors.produto = "Combustível é obrigatório"
    if (!formData.tanqueDiesel) newErrors.tanqueDiesel = "Tanque é obrigatório"
    if (!formData.bem) newErrors.bem = "Máquina é obrigatória"
    if (!formData.quantidade) newErrors.quantidade = "Quantidade é obrigatória"
    if (!formData.horimetro) newErrors.horimetro = "Horímetro é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const submissionData = {
          ...formData,
          tipo: "abastecimento",
          status: "pending", // Alterado de "validated" para "pending"
          timestamp: Date.now(),
          localId: Date.now().toString(),
          propriedade: "Matrice",
          userId: user?.uid || "anonymous", // Usando o userId do usuário logado
        }

        // Salvar na estrutura: propriedades/Matrice/abastecimentos
        const abastecimentosRef = ref(database, "propriedades/Matrice/abastecimentos")
        const newAbastecimentoRef = push(abastecimentosRef)

        await set(newAbastecimentoRef, submissionData)

        console.log("Abastecimento salvo com sucesso:", submissionData)

        // Limpar formulário após sucesso
        setFormData({
          produto: "Diesel",
          tanqueDiesel: "",
          bem: "",
          quantidade: "",
          horimetro: "",
          observacao: "",
        })

        // Chamar callback se fornecido
        if (onSubmit) {
          onSubmit(submissionData)
        }

        alert("Abastecimento registrado com sucesso!")
      } catch (error) {
        console.error("Erro ao salvar abastecimento:", error)
        alert("Erro ao salvar abastecimento. Tente novamente.")
      }
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro de autenticação: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não autenticado. Faça login para continuar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header do Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Fuel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Abastecimento de Máquina</h1>
              <p className="text-gray-600">Registre o abastecimento da máquina agrícola</p>
              <p className="text-sm text-green-600 mt-1">Usuário: {user.email}</p>
            </div>
          </div>
        </div>

        {loadingData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span className="text-gray-600">Carregando dados do banco...</span>
            </div>
          </div>
        )}

        {!loadingData && tanques.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800">⚠️ Nenhum tanque encontrado no banco de dados. Verifique a conexão.</p>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Combustível */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Droplets className="w-4 h-4 text-green-500" />
                  Combustível *
                </label>
                <select
                  value={formData.produto}
                  onChange={(e) => handleChange("produto", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.produto
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Alcool">Álcool</option>
                </select>
                {errors.produto && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.produto}
                  </p>
                )}
              </div>

              {/* Tanque */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Tanque * {!loadingData && `(${tanques.length} encontrados)`}
                </label>
                <select
                  value={formData.tanqueDiesel}
                  onChange={(e) => handleChange("tanqueDiesel", e.target.value)}
                  disabled={loadingData}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.tanqueDiesel
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  } ${loadingData ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">{loadingData ? "Carregando tanques..." : "Selecione o tanque"}</option>
                  {tanques.map((tanque) => (
                    <option key={tanque.id} value={tanque.nome}>
                      {tanque.nome}
                    </option>
                  ))}
                </select>
                {errors.tanqueDiesel && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.tanqueDiesel}
                  </p>
                )}
              </div>

              {/* Máquina */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Truck className="w-4 h-4 text-green-500" />
                  Máquina *
                </label>
                <select
                  value={formData.bem}
                  onChange={(e) => handleChange("bem", e.target.value)}
                  disabled={loadingData}
                  size="1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 max-h-48 overflow-y-auto ${
                    errors.bem
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  } ${loadingData ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">{loadingData ? "Carregando máquinas..." : "Selecione a máquina"}</option>
                  {maquinas.map((maquina) => (
                    <option key={maquina.id} value={maquina.nome}>
                      {maquina.nome}
                    </option>
                  ))}
                </select>
                {errors.bem && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.bem}
                  </p>
                )}
              </div>

              {/* Quantidade */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Quantidade (Litros) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantidade}
                  onChange={(e) => handleChange("quantidade", e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.quantidade
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.quantidade && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.quantidade}
                  </p>
                )}
              </div>

              {/* Horímetro */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Gauge className="w-4 h-4 text-green-500" />
                  Horímetro *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.horimetro}
                  onChange={(e) => handleChange("horimetro", e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.horimetro
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.horimetro && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.horimetro}
                  </p>
                )}
              </div>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 text-gray-400" />
                Observação
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => handleChange("observacao", e.target.value)}
                placeholder="Observações adicionais sobre o abastecimento"
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
                disabled={isLoading || loadingData}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando..." : loadingData ? "Carregando..." : "Enviar Abastecimento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FormAbastecimentoMaquina
