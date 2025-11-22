import React, { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { ref, onValue, get } from "firebase/database"
import { useAuthState } from "react-firebase-hooks/auth"
import { database, auth } from "../firebase/firebase"

const MaquinarioSelector = ({ isOpen, onClose, onSelect }) => {
  const [currentUser] = useAuthState(auth)
  const [userPropriedade, setUserPropriedade] = useState(null)
  const [activeTab, setActiveTab] = useState("maquinario")
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    const resolvePropriedade = async () => {
      if (!currentUser) {
        setUserPropriedade(null)
        setLoading(false)
        return
      }
      try {
        const propriedadesRef = ref(database, "propriedades")
        const snapshot = await get(propriedadesRef)
        if (snapshot.exists()) {
          const propriedades = snapshot.val()
          for (const [propName, propData] of Object.entries(propriedades)) {
            const users = propData.users || {}
            if (users[currentUser.uid]) {
              setUserPropriedade(propName)
              return
            }
            for (const [, userData] of Object.entries(users)) {
              if (userData.email && userData.email === currentUser.email) {
                setUserPropriedade(propName)
                return
              }
            }
          }
        }
        setUserPropriedade(null)
      } catch (error) {
        console.error("Erro ao buscar propriedade do usuário:", error)
        setUserPropriedade(null)
        setLoading(false)
      }
    }

    resolvePropriedade()
  }, [isOpen, currentUser])

  useEffect(() => {
    if (!isOpen || !userPropriedade) return

    setLoading(true)
    const tipo = activeTab === "maquinario" ? "maquinarios" : "implementos"
    const itemsRef = ref(database, `propriedades/${userPropriedade}/${tipo}`)

    const unsubscribe = onValue(
      itemsRef,
      (snapshot) => {
        const data = snapshot.val()
        const itemsList = []

        if (data) {
          Object.entries(data).forEach(([id, item]) => {
            itemsList.push({
              id,
              nome: item.nome || "Sem nome",
              modelo: item.modelo || "",
              descricao: item.descricao || "",
              propriedade: userPropriedade,
            })
          })
        }

        setItems(itemsList)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching data: ", error)
        setItems([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [isOpen, activeTab, userPropriedade])

  const filteredItems = items.filter(
    (item) =>
      item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.modelo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Selecionar {activeTab === "maquinario" ? "Máquinário" : "Implemento"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("maquinario")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "maquinario" ? "bg-green-100 text-green-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Máquinário
            </button>
            <button
              onClick={() => setActiveTab("implemento")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "implemento" ? "bg-green-100 text-green-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Implemento
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={`Buscar ${activeTab === "maquinario" ? "máquinário" : "implemento"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect({
                      id: item.id,
                      nome: item.nome,
                      tipo: activeTab === "maquinario" ? "Máquinário" : "Implemento",
                      modelo: item.modelo || "Não especificado",
                      descricao: item.descricao || "",
                    })
                    onClose()
                  }}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="font-medium text-slate-900">{item.nome}</h4>
                        <span className="text-xs text-slate-400">ID: {item.id}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.modelo && `Modelo: ${item.modelo}`}</p>
                      {item.descricao && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.descricao}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">
                {searchTerm
                  ? `Nenhum ${activeTab === "maquinario" ? "máquinário" : "implemento"} encontrado para "${searchTerm}"`
                  : `Nenhum ${activeTab === "maquinario" ? "máquinário" : "implemento"} cadastrado.`}
              </p>
              {!userPropriedade && <p className="text-xs text-slate-400 mt-2">Propriedade do usuário não encontrada.</p>}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaquinarioSelector
