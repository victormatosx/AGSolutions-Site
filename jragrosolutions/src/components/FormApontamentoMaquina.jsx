"use client"

import { useState } from "react"
import { Settings } from "lucide-react"

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
    <div className="form-container">
      <div className="form-header">
        <div className="form-icon">
          <Settings className="w-6 h-6" />
        </div>
        <div className="form-title">
          <h2>Apontamento de Máquina</h2>
          <p>Registre as horas trabalhadas e atividades realizadas</p>
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
            <label>Hora de Início *</label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) => handleChange("horaInicio", e.target.value)}
              className={errors.horaInicio ? "error" : ""}
            />
            {errors.horaInicio && <span className="error-text">{errors.horaInicio}</span>}
          </div>

          <div className="form-group">
            <label>Hora de Fim *</label>
            <input
              type="time"
              value={formData.horaFim}
              onChange={(e) => handleChange("horaFim", e.target.value)}
              className={errors.horaFim ? "error" : ""}
            />
            {errors.horaFim && <span className="error-text">{errors.horaFim}</span>}
          </div>

          <div className="form-group">
            <label>Atividade *</label>
            <select
              value={formData.atividade}
              onChange={(e) => handleChange("atividade", e.target.value)}
              className={errors.atividade ? "error" : ""}
            >
              <option value="">Selecione a atividade</option>
              <option value="preparo_solo">Preparo do Solo</option>
              <option value="plantio">Plantio</option>
              <option value="pulverizacao">Pulverização</option>
              <option value="colheita">Colheita</option>
              <option value="transporte">Transporte</option>
              <option value="manutencao">Manutenção</option>
            </select>
            {errors.atividade && <span className="error-text">{errors.atividade}</span>}
          </div>

          <div className="form-group">
            <label>Cultura *</label>
            <select
              value={formData.cultura}
              onChange={(e) => handleChange("cultura", e.target.value)}
              className={errors.cultura ? "error" : ""}
            >
              <option value="">Selecione a cultura</option>
              <option value="soja">Soja</option>
              <option value="milho">Milho</option>
              <option value="trigo">Trigo</option>
              <option value="algodao">Algodão</option>
              <option value="cana">Cana-de-açúcar</option>
            </select>
            {errors.cultura && <span className="error-text">{errors.cultura}</span>}
          </div>

          <div className="form-group">
            <label>Talhão</label>
            <input
              type="text"
              value={formData.talhao}
              onChange={(e) => handleChange("talhao", e.target.value)}
              placeholder="Ex: T01, T02..."
            />
          </div>

          <div className="form-group">
            <label>Área (hectares) *</label>
            <input
              type="number"
              step="0.1"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
              placeholder="0.0"
              className={errors.area ? "error" : ""}
            />
            {errors.area && <span className="error-text">{errors.area}</span>}
          </div>

          <div className="form-group">
            <label>Implemento</label>
            <select value={formData.implemento} onChange={(e) => handleChange("implemento", e.target.value)}>
              <option value="">Selecione o implemento</option>
              <option value="arado">Arado</option>
              <option value="grade">Grade</option>
              <option value="plantadeira">Plantadeira</option>
              <option value="pulverizador">Pulverizador</option>
              <option value="colheitadeira">Colheitadeira</option>
            </select>
          </div>

          <div className="form-group">
            <label>Hodômetro Inicial</label>
            <input
              type="number"
              value={formData.hodometroInicial}
              onChange={(e) => handleChange("hodometroInicial", e.target.value)}
              placeholder="Horas iniciais"
            />
          </div>

          <div className="form-group">
            <label>Hodômetro Final</label>
            <input
              type="number"
              value={formData.hodometroFinal}
              onChange={(e) => handleChange("hodometroFinal", e.target.value)}
              placeholder="Horas finais"
            />
          </div>

          <div className="form-group full-width">
            <label>Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Observações sobre a atividade realizada"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? "Salvando..." : "Salvar Apontamento"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormApontamentoMaquina
