"use client"

import { useState, useEffect } from "react"
import { Users, Plus, List, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { ref, onValue, set, remove } from "firebase/database"
import { database } from "../firebase/firebase"

const ITEMS_PER_PAGE = 10 // Reduced items per page for better pagination

const ClientForm = () => {
  const [allClients, setAllClients] = useState([])
  const [displayedClients, setDisplayedClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [clientData, setClientData] = useState({
    code: "",
    name: "",
  })
  const [editingClient, setEditingClient] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Added initial loading state
  const [searchTerm, setSearchTerm] = useState("")

  // Filter clients based on search term
  const filteredClients = allClients.filter((client) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const clientCode = client.code ? client.code.toString() : ""
    const clientName = client.name ? client.name.toString() : ""
    return clientCode.toLowerCase().includes(searchLower) || clientName.toLowerCase().includes(searchLower)
  })

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedClients = filteredClients.slice(startIndex, endIndex)

  // Load clients from Firebase Realtime Database
  useEffect(() => {
    const propriedadesRef = ref(database, "propriedades")

    const unsubscribe = onValue(propriedadesRef, (snapshot) => {
      const loadedClients = []

      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.clientes) {
          // Loop through all clients in the property
          Object.entries(propertyData.clientes).forEach(([id, cliente]) => {
            loadedClients.push({
              id,
              code: cliente.Código || "",
              name: cliente.Nome || "",
              propriedadeId: property.key,
            })
          })
        }
      })

      // Sort clients by name for consistent pagination
      loadedClients.sort((a, b) => a.name.localeCompare(b.name))

      setAllClients(loadedClients)
      setIsInitialLoading(false) // Set initial loading to false
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Save clients to Firebase Realtime Database
  const saveClientToFirebase = (client) => {
    const clientRef = ref(database, `propriedades/${client.propriedadeId}/clientes/${client.id}`)
    set(clientRef, {
      Código: client.code,
      Nome: client.name,
    })
  }

  // Remove client from Firebase
  const removeClientFromFirebase = (clientId, propriedadeId) => {
    const clientRef = ref(database, `propriedades/${propriedadeId}/clientes/${clientId}`)
    remove(clientRef)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!clientData.code || !clientData.name) return

    setIsLoading(true)

    try {
      if (editingClient) {
        // Update existing client in Firebase
        await saveClientToFirebase({
          ...clientData,
          id: editingClient.id,
          propriedadeId: editingClient.propriedadeId || (allClients[0]?.propriedadeId || "default"),
        })
        setEditingClient(null)
      } else {
        // Add new client to Firebase
        // Use the first available property ID or 'default' if none exists
        const firstPropriedadeId = allClients.length > 0 
          ? allClients[0].propriedadeId 
          : "default";

        const newClient = {
          ...clientData,
          id: Date.now().toString(),
          propriedadeId: firstPropriedadeId,
        }

        await saveClientToFirebase(newClient)
      }

      // Reset form
      setClientData({ code: "", name: "" })
      setShowForm(false)
    } catch (error) {
      console.error("Error saving client:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false) // Reset loading state
    }
  }


  const handleChange = (field, value) => {
    setClientData({ ...clientData, [field]: value })
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-gray-600 text-sm">Carregando clientes...</p>
      </div>
    </div>
  )

  const PaginationControls = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push("...")
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push("...")
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> até{" "}
              <span className="font-medium">{Math.min(endIndex, filteredClients.length)}</span> de{" "}
              <span className="font-medium">{filteredClients.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={index}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => goToPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? "z-10 bg-green-50 border-green-500 text-green-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            <span className="text-gray-700">Processando...</span>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Clientes Cadastrados
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingClient(null)
              setClientData({ code: "", name: "" })
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" />
            <span>{showForm ? "Voltar para Lista" : "Novo Cliente"}</span>
          </button>
        </div>

        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar cliente por nome ou código..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 placeholder-gray-400 transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {searchTerm && (
        <div className="text-sm text-gray-500 bg-green-50 px-4 py-2 rounded-lg inline-flex items-center mb-4">
          <svg
            className="w-4 h-4 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""} encontrado
          {filteredClients.length !== 1 ? "s" : ""} para "{searchTerm}"
        </div>
      )}

      {showForm ? (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                <input
                  type="text"
                  value={clientData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Código do cliente"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={clientData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setClientData({ code: "", name: "" })
                  setEditingClient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingClient ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {isInitialLoading ? (
            <LoadingSpinner />
          ) : paginatedClients.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls />
            </>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              {allClients.length === 0 ? (
                <>
                  <List className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente cadastrado</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo cliente.</p>
                </>
              ) : (
                <p className="text-gray-500">Nenhum cliente encontrado</p>
              )}
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Novo Cliente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClientForm
