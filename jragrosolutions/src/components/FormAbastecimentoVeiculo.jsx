"use client"

import { useState } from "react"
import { Car } from "lucide-react"

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
    <div className="form-container">
      <div className="form-header">
        <div className="form-icon">
          <Car className="w-6 h-6" />
        </div>
        <div className="form-title">
          <h2>Abastecimento de Veículo</h2>
          <p>Registre o abastecimento do veículo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Veículo *</label>
            <select
              value={formData.veiculo}
              onChange={(e) => handleChange("veiculo", e.target.value)}
              className={errors.veiculo ? "error" : ""}
            >
              <option value="">Selecione o veículo</option>
              <option value="pickup_ford_ranger">Pickup Ford Ranger</option>
              <option value="caminhao_mercedes_1318">Caminhão Mercedes 1318</option>
              <option value="van_fiat_ducato">Van Fiat Ducato</option>
              <option value="carro_toyota_corolla">Carro Toyota Corolla</option>
            </select>
            {errors.veiculo && <span className="error-text">{errors.veiculo}</span>}
          </div>

          <div className="form-group">
            <label>Motorista *</label>
            <input
              type="text"
              value={formData.motorista}
              onChange={(e) => handleChange("motorista", e.target.value)}
              placeholder="Nome do motorista"
              className={errors.motorista ? "error" : ""}
            />
            {errors.motorista && <span className="error-text">{errors.motorista}</span>}
          </div>

          <div className="form-group">
            <label>Data *</label>
            <input type="date" value={formData.data} onChange={(e) => handleChange("data", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Hora *</label>
            <input type="time" value={formData.hora} onChange={(e) => handleChange("hora", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Tipo de Combustível</label>
            <select value={formData.combustivel} onChange={(e) => handleChange("combustivel", e.target.value)}>
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
              <option value="diesel">Diesel</option>
              <option value="gnv">GNV</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade (Litros) *</label>
            <input
              type="number"
              step="0.1"
              value={formData.quantidade}
              onChange={(e) => handleChange("quantidade", e.target.value)}
              placeholder="0.0"
              className={errors.quantidade ? "error" : ""}
            />
            {errors.quantidade && <span className="error-text">{errors.quantidade}</span>}
          </div>

          <div className="form-group">
            <label>Odômetro (Km) *</label>
            <input
              type="number"
              value={formData.odometro}
              onChange={(e) => handleChange("odometro", e.target.value)}
              placeholder="Quilometragem atual"
              className={errors.odometro ? "error" : ""}
            />
            {errors.odometro && <span className="error-text">{errors.odometro}</span>}
          </div>

          <div className="form-group">
            <label>Posto/Fornecedor *</label>
            <input
              type="text"
              value={formData.posto}
              onChange={(e) => handleChange("posto", e.target.value)}
              placeholder="Nome do posto ou fornecedor"
              className={errors.posto ? "error" : ""}
            />
            {errors.posto && <span className="error-text">{errors.posto}</span>}
          </div>

          <div className="form-group">
            <label>Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.valorTotal}
              onChange={(e) => handleChange("valorTotal", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group full-width">
            <label>Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Observações adicionais sobre o abastecimento"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? "Salvando..." : "Salvar Abastecimento"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormAbastecimentoVeiculo
