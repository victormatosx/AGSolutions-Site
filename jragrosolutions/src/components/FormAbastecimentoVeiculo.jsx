"use client"

import { useState } from "react"
import { Car, User, Calendar, Clock, Droplets, MapPin, DollarSign } from "lucide-react"

const FormAbastecimentoVeiculo = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    veiculo: "",
    motorista: "",
    data: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    combustivel: "gasolina",
    quantidade: "",
    odometro: "",
    posto: "",
    valorTotal: "",
    observacoes: "",
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.veiculo) newErrors.veiculo = "Veículo é obrigatório"
    if (!formData.motorista) newErrors.motorista = "Motorista é obrigatório"
    if (!formData.quantidade) newErrors.quantidade = "Quantidade é obrigatória"
    if (!formData.odometro) newErrors.odometro = "Odômetro é obrigatório"
    if (!formData.posto) newErrors.posto = "Posto é obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        tipo: "abastecimento_veiculo",
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
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Abastecimento de Veículo</h1>
              <p className="text-gray-600">Registre o abastecimento do veículo</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid de Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Veículo */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Veículo *
                </label>
                <select
                  value={formData.veiculo}
                  onChange={(e) => handleChange("veiculo", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.veiculo
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                >
                  <option value="">Selecione o veículo</option>
                  <option value="pickup_ford_ranger">Pickup Ford Ranger</option>
                  <option value="caminhao_mercedes_1318">Caminhão Mercedes 1318</option>
                  <option value="van_fiat_ducato">Van Fiat Ducato</option>
                  <option value="carro_toyota_corolla">Carro Toyota Corolla</option>
                </select>
                {errors.veiculo && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.veiculo}
                  </p>
                )}
              </div>

              {/* Motorista */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 text-green-500" />
                  Motorista *
                </label>
                <input
                  type="text"
                  value={formData.motorista}
                  onChange={(e) => handleChange("motorista", e.target.value)}
                  placeholder="Nome do motorista"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.motorista
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.motorista && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.motorista}
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
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                  <option value="diesel">Diesel</option>
                  <option value="gnv">GNV</option>
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

              {/* Odômetro */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Odômetro (Km) *
                </label>
                <input
                  type="number"
                  value={formData.odometro}
                  onChange={(e) => handleChange("odometro", e.target.value)}
                  placeholder="Quilometragem atual"
                  className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                    errors.odometro
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-green-500 hover:border-green-300"
                  }`}
                />
                {errors.odometro && (
                  <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {errors.odometro}
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

              {/* Valor Total */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorTotal}
                  onChange={(e) => handleChange("valorTotal", e.target.value)}
                  placeholder="0.00"
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

export default FormAbastecimentoVeiculo
