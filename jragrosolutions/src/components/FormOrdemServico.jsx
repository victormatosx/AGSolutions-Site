import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, ChevronDown } from 'lucide-react'
import MaquinarioSelector from './MaquinarioSelector'

const Popup = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Atenção</h3>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-slate-700 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}

const FormOrdemServico = ({ onSubmit, onCancel, isLoading }) => {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [showPopup, setShowPopup] = useState(false)
  const [showMaquinarioSelector, setShowMaquinarioSelector] = useState(false)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    maquinario: {
      id: '',
      nome: '',
      tipo: '',
      modelo: '',
      descricao: ''
    },
    horimetro: '',
    data: getCurrentDate(),
    descricao: '',
    fotos: []
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name !== 'maquinario') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleFileChange = (e) => {
    setShowPopup(true)
    e.target.value = null // Reset file input
  }
  
  const handleFileButtonClick = (e) => {
    e.preventDefault()
    setShowPopup(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Ordem de Serviço</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Maquinário/Implemento <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMaquinarioSelector(true)}
              className={`w-full text-left px-4 py-2 rounded-lg border ${
                formData.maquinario.nome 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-300 hover:border-slate-400'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all flex items-center justify-between`}
            >
              {formData.maquinario.nome ? (
                <span className="font-medium text-slate-900">{formData.maquinario.nome}</span>
              ) : (
                <span className="text-slate-500">Selecione um máquinário ou implemento</span>
              )}
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </button>
            {!formData.maquinario.nome && (
              <p className="mt-1 text-sm text-slate-500">
                Selecione um item da lista
              </p>
            )}
            <input
              type="hidden"
              name="maquinario"
              value={formData.maquinario.id}
              required
            />
          </div>
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
                <label 
                  htmlFor="fotos" 
                  className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700"
                  onClick={handleFileButtonClick}
                >
                  <span>Selecione as fotos</span>
                  <input
                    id="fotos"
                    name="fotos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                    ref={fileInputRef}
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
    
    {showPopup && (
      <Popup 
        message="Esta funcionalidade de anexar fotos ainda não está disponível. Estamos trabalhando nela e em breve você poderá anexar fotos dos equipamentos." 
        onClose={() => setShowPopup(false)}
      />
    )}
    
    <MaquinarioSelector
      isOpen={showMaquinarioSelector}
      onClose={() => setShowMaquinarioSelector(false)}
      onSelect={(selectedItem) => {
        setFormData(prev => ({
          ...prev,
          maquinario: {
            id: selectedItem.id,
            nome: selectedItem.nome,
            tipo: selectedItem.tipo,
            modelo: selectedItem.modelo,
            descricao: selectedItem.descricao
          }
        }));
      }}
    />
  </>
  )
}

export default FormOrdemServico
