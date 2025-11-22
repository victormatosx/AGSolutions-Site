import React, { useState, useRef } from 'react'
import { Upload, ChevronDown } from 'lucide-react'
import MaquinarioSelector from './MaquinarioSelector'
import { storage, auth } from "../firebase/firebase"
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage"
import { useAuthState } from "react-firebase-hooks/auth"

const FormOrdemServico = ({ onSubmit, onCancel, isLoading }) => {
  const [user] = useAuthState(auth)
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [showMaquinarioSelector, setShowMaquinarioSelector] = useState(false)
  const fileInputRef = useRef(null)
  const [uploadingFotos, setUploadingFotos] = useState(false)
  const [uploadError, setUploadError] = useState('')
  
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
    fotos: [],
    servicoTipo: '',
    sistemas: [],
    subcomponentes: [],
    outroSubcomponente: ''
  })

  const sistemasOptions = [
    'Hidraulico',
    'Elétrico e Eletrônico',
    'Motor',
    'Transmissão',
    'Segurança e Controles',
    'Estrutura e Rodados'
  ]

  const subcomponentesOptions = {
    Hidraulico: [
      'Bombas hidráulicas',
      'Válvulas / distribuidores',
      'Cilindros hidráulicos',
      'Mangueiras e conexões',
      'Reservatório e filtros'
    ],
    'Elétrico e Eletrônico': [
      'Bateria e cabos',
      'Alternador e motor de partida',
      'Chicote elétrico / conectores',
      'Iluminação e sinalização',
      'Sensores',
      'Atuadores elétricos',
      'Controladores eletrônicos'
    ],
    Motor: [
      'Bloco / cabeçote',
      'Sistema de combustão / injeção',
      'Admissão e escapamento',
      'Arrefecimento',
      'Lubrificação',
      'Sistema de combustível'
    ],
    Transmissão: [
      'Caixa de câmbio',
      'Embreagem / conversor de torque',
      'Eixos / diferenciais',
      'Redutores finais',
      'Cardans / juntas universais',
      'Sistema de tração'
    ],
    'Segurança e Controles': [
      'Freios',
      'Direção',
      'Cabine / comandos',
      'Painéis e indicadores',
      'Sistemas de proteção',
      'Ar-condicionado / ventilação cabine'
    ],
    'Estrutura e Rodados': [
      'Chassi / estrutura principal',
      'Cabine / carenagens',
      'Pneus Rodas / aros',
      'Rolamentos e cubos de roda',
      'Suspensão / eixos'
    ]
  }

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
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'))
    setFormData(prev => ({ ...prev, fotos: files }))
    setUploadError(files.length === 0 ? 'Selecione arquivos de imagem válidos.' : '')
  }

  const handleRemoveFoto = (index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }))
  }

  const uploadFotos = async () => {
    if (!formData.fotos || formData.fotos.length === 0) return []
    const propriedadeId = 'Matrice' // ajustar conforme o contexto real
    const userId = user?.uid || 'anon'
    const basePath = `ordensServico/${propriedadeId}/${formData.maquinario.id || 'sem-id'}/${userId}/${Date.now()}`

    const uploads = formData.fotos.map(async (file, index) => {
      const safeName = file.name.replace(/\s+/g, '_')
      const path = `${basePath}_${index}_${safeName}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      return { url, name: file.name, path }
    })
    return Promise.all(uploads)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError('')
    setUploadingFotos(true)

    try {
      const fotosUpload = await uploadFotos()
      await onSubmit({ ...formData, fotos: fotosUpload })
      setFormData(prev => ({ ...prev, fotos: [] }))
      if (fileInputRef.current) fileInputRef.current.value = null
    } catch (error) {
      console.error('Erro ao enviar fotos:', error)
      setUploadError('Não foi possível anexar as fotos. Tente novamente.')
    } finally {
      setUploadingFotos(false)
    }
  }

  const toggleArrayValue = (field, value) => {
    setFormData(prev => {
      if (field === 'sistemas') {
        const isSame = prev.sistemas[0] === value
        // seleção única; ao trocar sistema, limpa subcomponentes
        return { ...prev, sistemas: isSame ? [] : [value], subcomponentes: [], outroSubcomponente: '' }
      }
      if (field === 'subcomponentes') {
        const isSame = prev.subcomponentes[0] === value
        return { ...prev, subcomponentes: isSame ? [] : [value], outroSubcomponente: isSame || value !== 'Outro' ? prev.outroSubcomponente : '' }
      }
      const exists = prev[field].includes(value)
      const updated = exists ? prev[field].filter(v => v !== value) : [...prev[field], value]
      return { ...prev, [field]: updated }
    })
  }

  return (
    <>
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Ordem de Serviço</h2>
        
        <div className="space-y-4 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maquinário/Implemento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMaquinarioSelector(true)}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${
                  formData.maquinario.nome 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-300 hover:border-slate-400'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all flex items-center justify-between min-h-[44px]`}
              >
                {formData.maquinario.nome ? (
                  <span className="font-medium text-slate-900 text-sm sm:text-base truncate pr-2">{formData.maquinario.nome}</span>
                ) : (
                  <span className="text-slate-500 text-sm sm:text-base">Selecione um maquinário ou implemento</span>
                )}
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
              </button>
              {!formData.maquinario.nome && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horimetro" className="block text-sm font-medium text-slate-700 mb-2">
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base min-h-[44px]"
              />
              <p className="mt-1 text-xs sm:text-sm text-slate-500">Horímetro atual do equipamento</p>
            </div>

            <div>
              <label htmlFor="data" className="block text-sm font-medium text-slate-700 mb-2">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                onFocus={(e) => e.target.showPicker()}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base min-h-[44px] cursor-pointer"
              />
              <p className="mt-1 text-xs sm:text-sm text-slate-500">Data da solicitação</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Descrição do Serviço Solicitado *</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {['Manutenção Preventiva', 'Manutenção Corretiva', 'Ajustes/Regulagens'].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-green-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name="servicoTipo"
                      value={opt}
                      checked={formData.servicoTipo === opt}
                      onChange={(e) => handleInputChange({ target: { name: 'servicoTipo', value: e.target.value } })}
                      className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Detalhamento do Serviço Solicitado</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Sistema</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sistemasOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-green-300 transition-colors"
                    >
                      <input
                        type="radio"
                        name="sistema"
                        value={opt}
                        checked={formData.sistemas[0] === opt}
                        onChange={() => toggleArrayValue('sistemas', opt)}
                        className="w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.sistemas.length === 0 ? (
                <p className="text-sm text-slate-500">Selecione um sistema para escolher os subcomponentes correspondentes.</p>
              ) : (
                formData.sistemas.map((grupo) => (
                  <div key={grupo} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{`Subcomponente: ${grupo}`}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {[...(subcomponentesOptions[grupo] || []), 'Outro'].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-green-300 transition-colors"
                        >
                          <input
                            type="radio"
                            name="subcomponente"
                            value={opt}
                            checked={formData.subcomponentes[0] === opt}
                            onChange={() => toggleArrayValue('subcomponentes', opt)}
                            className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {formData.subcomponentes[0] === 'Outro' && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descreva o outro subcomponente</label>
                        <input
                          type="text"
                          value={formData.outroSubcomponente}
                          onChange={(e) => setFormData(prev => ({ ...prev, outroSubcomponente: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="Informe o subcomponente"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-2">
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
            />
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Forneça o máximo de detalhes possível sobre o problema</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Anexar Fotos <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                <div className="flex text-xs sm:text-sm text-slate-600">
                  <label 
                    htmlFor="fotos" 
                    className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700"
                  >
                    <span>Selecione as fotos</span>
                    <input
                      id="fotos"
                      name="fotos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingFotos}
                      className="sr-only"
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG ate 10MB</p>
                {formData.fotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-green-600">{formData.fotos.length} arquivo(s) selecionado(s)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.fotos.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left">
                          <span className="text-xs text-slate-700 truncate pr-2">{file.name}</span>
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveFoto(index)}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              </div>
            </div>
          </div>

        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-200 space-y-3 sm:space-y-0">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            <span className="text-red-500">*</span> Campos obrigatórios
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingFotos}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
            >
              {isLoading || uploadingFotos ? "Criando..." : "Criar Ordem de Servico"}
            </button>
          </div>
        </div>
      </form>
    </div>
    
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
