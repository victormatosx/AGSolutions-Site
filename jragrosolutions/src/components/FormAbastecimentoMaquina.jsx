"use client"

import { useState } from "react"
import { Fuel } from "lucide-react"

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
    <div className="form-container">
      <div className="form-header">
        <div className="form-icon">
          <Fuel className="w-6 h-6" />
        </div>
        <div className="form-title">
          <h2>Abastecimento de Máquina</h2>
          <p>Registre o abastecimento da máquina agrícola</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Máquina *</label>
            <select
              value={formData.maquina}
              onChange={(e) => handleChange("maquina", e.target.value)}
              className={errors.maquina ? "error" : ""}
            >
              <option value="">Selecione a máquina</option>
              <option value="trator_john_deere_6110">Trator John Deere 6110</option>
              <option value="colheitadeira_case_2388">Colheitadeira Case 2388</option>
              <option value="pulverizador_jacto_uniport">Pulverizador Jacto Uniport</option>
              <option value="plantadeira_semeato_td300">Plantadeira Semeato TD300</option>
            </select>
            {errors.maquina && <span className="error-text">{errors.maquina}</span>}
          </div>

          <div className="form-group">
            <label>Operador *</label>
            <input
              type="text"
              value={formData.operador}
              onChange={(e) => handleChange("operador", e.target.value)}
              placeholder="Nome do operador"
              className={errors.operador ? "error" : ""}
            />
            {errors.operador && <span className="error-text">{errors.operador}</span>}
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
              <option value="diesel">Diesel</option>
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
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
            <label>Hodômetro *</label>
            <input
              type="number"
              value={formData.hodometro}
              onChange={(e) => handleChange("hodometro", e.target.value)}
              placeholder="Horas trabalhadas"
              className={errors.hodometro ? "error" : ""}
            />
            {errors.hodometro && <span className="error-text">{errors.hodometro}</span>}
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

export default FormAbastecimentoMaquina
