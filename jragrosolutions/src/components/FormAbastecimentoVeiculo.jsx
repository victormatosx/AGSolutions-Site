"use client"

import { useState, useEffect } from "react"
import { Car, Droplets, Gauge, FileText, UploadCloud } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { database, auth, storage } from "../firebase/firebase"
import { ref, get, push } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

const FormAbastecimentoVeiculo = ({ onSubmit, onCancel, isLoading }) => {
  const [user, loading, error] = useAuthState(auth)

  const [formData, setFormData] = useState({
    combustivel: "",
    tanque: "",
    veiculo: "",
    quantidade: "",
    hodometro: "",
    valorUnitario: "",
    valorTotal: "",
    formaPagamento: "",
    observacao: "",
  })

  const [errors, setErrors] = useState({})
  const [tanques, setTanques] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [loadingVeiculos, setLoadingVeiculos] = useState(true)
  const [loadingTanques, setLoadingTanques] = useState(true)
  const [files, setFiles] = useState({ hodometro: null, comprovante: null })
  const [uploading, setUploading] = useState(false)
  const [userPropriedade, setUserPropriedade] = useState(null)

  useEffect(() => {
    const resolvePropriedade = async () => {
      if (!user) {
        setUserPropriedade(null)
        return
      }
      try {
        const propriedadesRef = ref(database, "propriedades")
        const snapshot = await get(propriedadesRef)
        if (snapshot.exists()) {
          const propriedadesData = snapshot.val()
          for (const [propName, propData] of Object.entries(propriedadesData)) {
            const users = propData.users || {}
            if (users[user.uid]) {
              setUserPropriedade(propName)
              return
            }
            for (const [, userData] of Object.entries(users)) {
              if (userData.email && userData.email === user.email) {
                setUserPropriedade(propName)
                return
              }
            }
          }
        }
        setUserPropriedade(null)
      } catch (err) {
        console.error("Erro ao identificar propriedade do usuário:", err)
        setUserPropriedade(null)
      }
    }

    resolvePropriedade()
  }, [user])

  useEffect(() => {
    if (!userPropriedade) return

    const fetchTanques = async () => {
      try {
        setLoadingTanques(true)
        const tanquesRef = ref(database, `propriedades/${userPropriedade}/tanques`)
        const snapshot = await get(tanquesRef)

        if (snapshot.exists()) {
          const tanquesData = snapshot.val()
          const tanquesList = Object.entries(tanquesData).map(([tanqueKey, tanqueData]) => ({
            id: tanqueKey,
            nome: tanqueData.nome,
            propriedade: userPropriedade,
          }))
          setTanques(tanquesList)
          console.log("Tanques carregados:", tanquesList)
        } else {
          console.log("Nenhum tanque encontrado no banco de dados")
          setTanques([])
        }
      } catch (error) {
        console.error("Erro ao carregar tanques:", error)
        setTanques([])
      } finally {
        setLoadingTanques(false)
      }
    }

    const fetchVeiculos = async () => {
      try {
        setLoadingVeiculos(true)
        const veiculosRef = ref(database, `propriedades/${userPropriedade}/veiculos`)
        const snapshot = await get(veiculosRef)

        if (snapshot.exists()) {
          const veiculosData = snapshot.val()
          const veiculosList = Object.entries(veiculosData).map(([veiculoKey, veiculoData]) => ({
            id: veiculoKey,
            nome: `${veiculoData?.modelo || "Veículo"} (${veiculoData?.placa || "Sem placa"})`,
            modelo: veiculoData?.modelo,
            placa: veiculoData?.placa,
            propriedade: userPropriedade,
          }))

          setVeiculos(veiculosList)
          console.log("Veículos carregados:", veiculosList)
        } else {
          console.log("Nenhuma veículo encontrado no banco de dados")
          setVeiculos([])
        }
      } catch (error) {
        console.error("Erro ao carregar veículos:", error)
        setVeiculos([])
      } finally {
        setLoadingVeiculos(false)
      }
    }

    fetchTanques()
    fetchVeiculos()
  }, [userPropriedade])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.combustivel) newErrors.combustivel = "Combustível é obrigatório"
    if (!formData.tanque) newErrors.tanque = "Tanque é obrigatório"
    if (!formData.veiculo) newErrors.veiculo = "Veículo é obrigatório"
    if (!formData.quantidade) newErrors.quantidade = "Quantidade é obrigatória"
    if (!formData.hodometro) newErrors.hodometro = "Hodômetro é obrigatório"
    const tanqueSelecionado = tanques.find((t) => t.id === formData.tanque)
    const isPostoExterno = tanqueSelecionado?.nome?.toLowerCase() === "posto externo"
    if (isPostoExterno) {
      if (!formData.valorUnitario) newErrors.valorUnitario = "Valor unitário é obrigatório para posto externo"
      if (!formData.valorTotal) newErrors.valorTotal = "Valor total é obrigatório para posto externo"
      if (!formData.formaPagamento) newErrors.formaPagamento = "Forma de pagamento é obrigatória para posto externo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        if (!user) {
          alert("Erro: Usuário não está logado")
          return
        }

        const veiculoSelecionado = veiculos.find((v) => v.id === formData.veiculo)
        const tanqueSelecionado = tanques.find((t) => t.id === formData.tanque)

        if (!veiculoSelecionado || !tanqueSelecionado) {
          alert("Erro: Veículo ou tanque não encontrado")
          return
        }

        setUploading(true)

        const uploadAttachment = async (file, path) => {
          const fileRef = storageRef(storage, path)
          await uploadBytes(fileRef, file)
          const url = await getDownloadURL(fileRef)
          return { path, url }
        }

        const hodometroUpload =
          files.hodometro && tanqueSelecionado && veiculoSelecionado
            ? await uploadAttachment(
                files.hodometro,
                `${veiculoSelecionado.propriedade}/abastecimentos/hodometro/${Date.now()}_${files.hodometro.name}`,
              )
            : {}
        const comprovanteUpload =
          files.comprovante && tanqueSelecionado && veiculoSelecionado
            ? await uploadAttachment(
                files.comprovante,
                `${veiculoSelecionado.propriedade}/abastecimentos/comprovantes/${Date.now()}_${files.comprovante.name}`,
              )
            : {}

        const abastecimentoData = {
          horimetro: formData.hodometro,
          localId: Date.now().toString(),
          observacao: formData.observacao || "",
          placa: veiculoSelecionado.placa,
          produto: formData.combustivel,
          propriedade: veiculoSelecionado.propriedade,
          quantidade: formData.quantidade,
          valorUnitario: formData.valorUnitario || "",
          valorTotal: formData.valorTotal || "",
          formaPagamento: formData.formaPagamento || "",
          hodometroPhotoPath: hodometroUpload.path || "",
          hodometroPhotoUrl: hodometroUpload.url || "",
          comprovantePhotoPath: comprovanteUpload.path || "",
          comprovantePhotoUrl: comprovanteUpload.url || "",
          status: "pending",
          tanqueDiesel: tanqueSelecionado.nome,
          timestamp: Date.now(),
          tipo: "abastecimento",
          tipoEquipamento: "veiculo",
          userId: user.uid,
          veiculo: veiculoSelecionado.modelo,
        }

        const propriedade = veiculoSelecionado.propriedade
        const abastecimentosRef = ref(database, `propriedades/${propriedade}/abastecimentoVeiculos`)

        await push(abastecimentosRef, abastecimentoData)

        console.log("Abastecimento salvo com sucesso:", abastecimentoData)

        onSubmit({
          ...formData,
          tipo: "abastecimento_veiculo",
          timestamp: new Date().toISOString(),
        })

        setFormData({
          combustivel: "",
          tanque: "",
          veiculo: "",
          quantidade: "",
          hodometro: "",
          valorUnitario: "",
          valorTotal: "",
          formaPagamento: "",
          observacao: "",
        })
        setFiles({ hodometro: null, comprovante: null })

        alert("Abastecimento registrado com sucesso!")
      } catch (error) {
        console.error("Erro ao salvar abastecimento:", error)
        alert("Erro ao salvar abastecimento. Tente novamente.")
      } finally {
        setUploading(false)
      }
    }
  }

  const handleChange = (field, value) => {
    if (field === "quantidade" || field === "valorUnitario") {
      const numericQuantidade = field === "quantidade" ? value : formData.quantidade
      const numericUnitario = field === "valorUnitario" ? value : formData.valorUnitario
      const total =
        numericQuantidade && numericUnitario
          ? (Number.parseFloat(numericQuantidade) * Number.parseFloat(numericUnitario)).toFixed(2)
          : ""
      setFormData((prev) => ({ ...prev, [field]: value, valorTotal: total }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <Car className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Carregando...</h3>
          <p className="text-slate-500">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Acesso Negado</h2>
          <p className="text-red-600 mb-6">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const tanqueSelecionado = tanques.find((t) => t.id === formData.tanque)
  const isPostoExterno = tanqueSelecionado?.nome?.toLowerCase() === "posto externo"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Abastecimento de Veículo</h1>
              <p className="text-gray-600">Registre o abastecimento do veículo</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Droplets className="w-4 h-4 text-green-500" />
                  Combustível *
                </label>
                <select
                  value={formData.combustivel}
                  onChange={(e) => handleChange("combustivel", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.combustivel
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="">Selecione o combustível</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Alcool">Álcool</option>
                </select>
                {errors.combustivel && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.combustivel}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Tanque *
                </label>
                <select
                  value={formData.tanque}
                  onChange={(e) => handleChange("tanque", e.target.value)}
                  disabled={loadingTanques}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.tanque
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  } ${loadingTanques ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">{loadingTanques ? "Carregando tanques..." : "Selecione o tanque"}</option>
                  {tanques.map((tanque) => (
                    <option key={tanque.id} value={tanque.id}>
                      {tanque.nome}
                    </option>
                  ))}
                </select>
                {errors.tanque && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.tanque}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Car className="w-4 h-4 text-green-500" />
                  Veículo *
                </label>
                <select
                  value={formData.veiculo}
                  onChange={(e) => handleChange("veiculo", e.target.value)}
                  disabled={loadingVeiculos}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.veiculo
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  } ${loadingVeiculos ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">{loadingVeiculos ? "Carregando veículos..." : "Selecione o veículo"}</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.nome}
                    </option>
                  ))}
                </select>
                {errors.veiculo && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.veiculo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Quantidade (Litros) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Gauge className="w-4 h-4 text-green-500" />
                  Hodômetro (Km) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.hodometro}
                  onChange={(e) => handleChange("hodometro", e.target.value)}
                  placeholder="Quilometragem atual"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.hodometro
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.hodometro && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            {errors.hodometro}
          </p>
        )}
      </div>
    </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <UploadCloud className="w-4 h-4 text-green-500" />
                  Foto do Hodômetro
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles((prev) => ({ ...prev, hodometro: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
                {files.hodometro && <p className="text-xs text-green-700">{files.hodometro.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <UploadCloud className="w-4 h-4 text-green-500" />
                  Foto do Comprovante
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles((prev) => ({ ...prev, comprovante: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
                {files.comprovante && <p className="text-xs text-green-700">{files.comprovante.name}</p>}
              </div>
            </div>

            {isPostoExterno && (
              <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Informações do posto externo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Valor Unitário (R$) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorUnitario}
                      onChange={(e) => handleChange("valorUnitario", e.target.value)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                        errors.valorUnitario
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500 hover:border-green-300"
                      }`}
                      placeholder="0,00"
                    />
                    {errors.valorUnitario && (
                      <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        {errors.valorUnitario}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Valor Total (R$) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorTotal}
                      onChange={(e) => handleChange("valorTotal", e.target.value)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                        errors.valorTotal
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500 hover:border-green-300"
                      }`}
                      placeholder="0,00"
                    />
                    {errors.valorTotal && (
                      <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        {errors.valorTotal}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      Forma de Pagamento *
                    </label>
                    <select
                      value={formData.formaPagamento}
                      onChange={(e) => handleChange("formaPagamento", e.target.value)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                        errors.formaPagamento
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500 hover:border-green-300"
                      }`}
                    >
                      <option value="">Selecione</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="pix">Pix</option>
                    </select>
                    {errors.formaPagamento && (
                      <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        {errors.formaPagamento}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 text-gray-400" />
                Observação
              </label>
              <textarea
                value={formData.observacao}
                onChange={(e) => handleChange("observacao", e.target.value)}
                placeholder="Observações adicionais sobre o abastecimento (opcional)"
                rows={4}
                className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300 resize-none"
              />
            </div>

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
          disabled={isLoading || uploading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || uploading ? "Enviando..." : "Enviar Abastecimento"}
        </button>
      </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FormAbastecimentoVeiculo
