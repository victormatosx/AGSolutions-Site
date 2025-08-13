"use client"

import { useState } from "react"
import { Fuel, Droplets, Clock, User, Calendar, MapPin } from "lucide-react"

const FormAbastecimentoMaquina = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    maquina: "",
    operador: "",
    data: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    combustivel: "diesel",
    quantidade: "",
    hodometro: "",
    posto: "",
    observacoes: "",
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.maquina) newErrors.maquina = "Máquina é obrigatória"
    if (!formData.operador) newErrors.operador = "Operador é obrigatório"
    if (!formData.quantidade) newErrors.quantidade = "Quantidade é obrigatória"
    if (!formData.hodometro) newErrors.hodometro = "Hodômetro é obrigatório"
    if (!formData.posto) newErrors.posto = "Posto é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        tipo: "abastecimento_maquina",
        timestamp: new Date().toISOString(),
      })
    }
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
              <Fuel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Abastecimento de Máquina</h1>
              <p className="text-gray-600">Registre o abastecimento da máquina agrícola</p>
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

              {/* Hora */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-green-500" />
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleChange("hora", e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                />
              </div>

              {/* Combustível */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Droplets className="w-4 h-4 text-green-500" />
                  Tipo de Combustível
                </label>
                <select
                  value={formData.combustivel}
                  onChange={(e) => handleChange("combustivel", e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300"
                >
                  <option value="diesel">Diesel</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                </select>
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

              {/* Hodômetro */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Hodômetro *
                </label>
                <input
                  type="number"
                  value={formData.hodometro}
                  onChange={(e) => handleChange("hodometro", e.target.value)}
                  placeholder="Horas trabalhadas"
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

              {/* Posto */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Posto/Fornecedor *
                </label>
                <input
                  type="text"
                  value={formData.posto}
                  onChange={(e) => handleChange("posto", e.target.value)}
                  placeholder="Nome do posto ou fornecedor"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.posto
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.posto && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.posto}
                  </p>
                )}
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
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Salvando..." : "Salvar Abastecimento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FormAbastecimentoMaquina
