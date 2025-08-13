"use client"

import { useState } from "react"
import { Settings, User, Calendar, Clock, Activity, Wheat, MapPin, Wrench } from "lucide-react"

const FormApontamentoMaquina = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    maquina: "",
    operador: "",
    data: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFim: "",
    atividade: "",
    cultura: "",
    talhao: "",
    area: "",
    implemento: "",
    hodometroInicial: "",
    hodometroFinal: "",
    observacoes: "",
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.maquina) newErrors.maquina = "Máquina é obrigatória"
    if (!formData.operador) newErrors.operador = "Operador é obrigatório"
    if (!formData.horaInicio) newErrors.horaInicio = "Hora de início é obrigatória"
    if (!formData.horaFim) newErrors.horaFim = "Hora de fim é obrigatória"
    if (!formData.atividade) newErrors.atividade = "Atividade é obrigatória"
    if (!formData.cultura) newErrors.cultura = "Cultura é obrigatória"
    if (!formData.area) newErrors.area = "Área é obrigatória"

    // Validar se hora fim é maior que hora início
    if (formData.horaInicio && formData.horaFim && formData.horaFim <= formData.horaInicio) {
      newErrors.horaFim = "Hora de fim deve ser maior que hora de início"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const horasTrabalho = calculateWorkHours(formData.horaInicio, formData.horaFim)
      onSubmit({
        ...formData,
        horasTrabalho,
        tipo: "apontamento_maquina",
        timestamp: new Date().toISOString(),
      })
    }
  }

  const calculateWorkHours = (inicio, fim) => {
    const [horaInicio, minutoInicio] = inicio.split(":").map(Number)
    const [horaFim, minutoFim] = fim.split(":").map(Number)

    const inicioMinutos = horaInicio * 60 + minutoInicio
    const fimMinutos = horaFim * 60 + minutoFim

    return ((fimMinutos - inicioMinutos) / 60).toFixed(2)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
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
              <p className="text-gray-600">Registre as horas trabalhadas e atividades realizadas</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Máquina */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Máquina *
                </label>
                <select
                  value={formData.maquina}
                  onChange={(e) => handleChange("maquina", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.maquina
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="">Selecione a máquina</option>
                  <option value="trator_john_deere_6110">Trator John Deere 6110</option>
                  <option value="colheitadeira_case_2388">Colheitadeira Case 2388</option>
                  <option value="pulverizador_jacto_uniport">Pulverizador Jacto Uniport</option>
                  <option value="plantadeira_semeato_td300">Plantadeira Semeato TD300</option>
                </select>
                {errors.maquina && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.maquina}
                  </p>
                )}
              </div>

              {/* Operador */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 text-green-500" />
                  Operador *
                </label>
                <input
                  type="text"
                  value={formData.operador}
                  onChange={(e) => handleChange("operador", e.target.value)}
                  placeholder="Nome do operador"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.operador
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.operador && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.operador}
                  </p>
                )}
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

              {/* Hora Início */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-green-500" />
                  Hora de Início *
                </label>
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => handleChange("horaInicio", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.horaInicio
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.horaInicio && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.horaInicio}
                  </p>
                )}
              </div>

              {/* Hora Fim */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-green-500" />
                  Hora de Fim *
                </label>
                <input
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => handleChange("horaFim", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.horaFim
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.horaFim && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.horaFim}
                  </p>
                )}
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
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.atividade
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="">Selecione a atividade</option>
                  <option value="preparo_solo">Preparo do Solo</option>
                  <option value="plantio">Plantio</option>
                  <option value="pulverizacao">Pulverização</option>
                  <option value="colheita">Colheita</option>
                  <option value="transporte">Transporte</option>
                  <option value="manutencao">Manutenção</option>
                </select>
                {errors.atividade && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.atividade}
                  </p>
                )}
              </div>

              {/* Cultura */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Wheat className="w-4 h-4 text-green-500" />
                  Cultura *
                </label>
                <select
                  value={formData.cultura}
                  onChange={(e) => handleChange("cultura", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.cultura
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="">Selecione a cultura</option>
                  <option value="soja">Soja</option>
                  <option value="milho">Milho</option>
                  <option value="trigo">Trigo</option>
                  <option value="algodao">Algodão</option>
                  <option value="cana">Cana-de-açúcar</option>
                </select>
                {errors.cultura && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.cultura}
                  </p>
                )}
              </div>

              {/* Talhão */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Talhão
                </label>
                <input
                  type="text"
                  value={formData.talhao}
                  onChange={(e) => handleChange("talhao", e.target.value)}
                  placeholder="Ex: T01, T02..."
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>

              {/* Área */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Área (hectares) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.area
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.area}
                  </p>
                )}
              </div>

              {/* Implemento */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Wrench className="w-4 h-4 text-green-500" />
                  Implemento
                </label>
                <select
                  value={formData.implemento}
                  onChange={(e) => handleChange("implemento", e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                >
                  <option value="">Selecione o implemento</option>
                  <option value="arado">Arado</option>
                  <option value="grade">Grade</option>
                  <option value="plantadeira">Plantadeira</option>
                  <option value="pulverizador">Pulverizador</option>
                  <option value="colheitadeira">Colheitadeira</option>
                </select>
              </div>

              {/* Hodômetro Inicial */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Hodômetro Inicial
                </label>
                <input
                  type="number"
                  value={formData.hodometroInicial}
                  onChange={(e) => handleChange("hodometroInicial", e.target.value)}
                  placeholder="Horas iniciais"
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>

              {/* Hodômetro Final */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Hodômetro Final
                </label>
                <input
                  type="number"
                  value={formData.hodometroFinal}
                  onChange={(e) => handleChange("hodometroFinal", e.target.value)}
                  placeholder="Horas finais"
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
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
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Salvando..." : "Salvar Apontamento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FormApontamentoMaquina
