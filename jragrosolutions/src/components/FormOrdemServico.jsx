import React, { useState } from 'react'
import { Upload } from 'lucide-react'

const FormOrdemServico = ({ onSubmit, onCancel, isLoading }) => {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    maquinario: '',
    horimetro: '',
    data: getCurrentDate(), // Set current date as default
    descricao: '',
    fotos: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      fotos: files
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Ordem de Serviço</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="maquinario" className="block text-sm font-medium text-slate-700 mb-1">
            Maquinário/Implemento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="maquinario"
            name="maquinario"
            placeholder="Ex: Trator John Deere 6110J"
            value={formData.maquinario}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
          <p className="mt-1 text-sm text-slate-500">Digite o nome ou modelo do equipamento</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="horimetro" className="block text-sm font-medium text-slate-700 mb-1">
              Horímetro de Entrada <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              id="horimetro"
              name="horimetro"
              placeholder="0.0"
              value={formData.horimetro}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-sm text-slate-500">Horímetro atual do equipamento</p>
          </div>

          <div>
            <label htmlFor="data" className="block text-sm font-medium text-slate-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-sm text-slate-500">Data da solicitação</p>
          </div>
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">
            Descrição do Problema <span className="text-red-500">*</span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            placeholder="Descreva detalhadamente o problema encontrado no equipamento..."
            value={formData.descricao}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="mt-1 text-sm text-slate-500">Forneça o máximo de detalhes possível sobre o problema</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Anexar Fotos <span className="text-slate-500 font-normal">(opcional)</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <label htmlFor="fotos" className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700">
                  <span>Selecione as fotos</span>
                  <input
                    id="fotos"
                    name="fotos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG até 10MB</p>
              {formData.fotos.length > 0 && (
                <p className="text-sm text-green-600">{formData.fotos.length} arquivo(s) selecionado(s)</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          <span className="text-red-500">*</span> Campos obrigatórios
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Criando..." : "Criar Ordem de Serviço"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default FormOrdemServico
