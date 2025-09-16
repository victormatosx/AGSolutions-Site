"use client"

import { useState, useMemo, useEffect } from "react"
import { BarChart3, Download } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import SalesReportPDF from "./SalesReportPDF"

const ReportsSection = ({ sales = [], clients = [] }) => {
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  const [productTypes, setProductTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSales, setSelectedSales] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [hideMonetaryValues, setHideMonetaryValues] = useState(false)

  // Mock product types data
  useEffect(() => {
    const mockProductTypes = [
      { id: "milho", name: "Milho" },
      { id: "soja", name: "Soja" },
      { id: "feijao", name: "Feijão" },
      { id: "arroz", name: "Arroz" },
      { id: "trigo", name: "Trigo" },
    ]

    setProductTypes(mockProductTypes)
  }, [])

  // Get client name by ID
  const getClientName = (clientId) => {
    if (!clientId) return "Cliente não especificado"
    const client = clients.find((c) => c.id === clientId)
    if (!client) return `Cliente ${clientId}` // Fallback to ID if client not found
    return client.Nome || client.nome || client.name || `Cliente ${clientId}`
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0)
  }

  // --- Date helpers ---
  const parseDateToMs = (value) => {
    if (value == null || value === "") return null
    if (typeof value === "number") {
      const s = value.toString()
      if (s.length <= 10) return value * 1000
      return value
    }
    if (/^\d+$/.test(value.trim())) {
      const n = Number(value)
      const s = value.trim().length
      return s <= 10 ? n * 1000 : n
    }
    const str = value.trim()
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/)
    if (brMatch) {
      const [, day, month, year, timePart] = brMatch
      const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}${timePart ? "T" + timePart : "T00:00:00"}`
      const ms = Date.parse(iso)
      return isNaN(ms) ? null : ms
    }
    let ms = Date.parse(str)
    if (!isNaN(ms)) return ms
    ms = Date.parse(str.replace(" ", "T"))
    if (!isNaN(ms)) return ms
    return null
  }

  const formatDate = (dateString) => {
    const ms = parseDateToMs(dateString)
    if (!ms && ms !== 0) return "Data não informada"
    const d = new Date(ms)
    if (isNaN(d)) return dateString || "Data inválida"
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Filter sales based on selected client and product type
  const filteredSales = useMemo(() => {
    let result = [...sales]

    if (selectedClient) {
      result = result.filter((sale) => sale.clientId === selectedClient)
    }

    if (selectedProductType) {
      result = result.filter((sale) =>
        sale.items?.some(
          (item) => item.productType === selectedProductType || item.culturaAssociada === selectedProductType,
        ),
      )
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter((sale) => {
        const clientName = getClientName(sale.clientId).toLowerCase()
        const saleId = sale.id?.toLowerCase() || ""
        const total = formatCurrency(sale.total || 0).toLowerCase()

        return (
          clientName.includes(searchLower) ||
          saleId.includes(searchLower) ||
          total.includes(searchLower) ||
          sale.observations?.toLowerCase().includes(searchLower) ||
          sale.status?.toLowerCase().includes(searchLower)
        )
      })
    }

    result.sort((a, b) => {
      const dateA = parseDateToMs(a.dataPedido || a.date)
      const dateB = parseDateToMs(b.dataPedido || b.date)

      // Handle null dates - put them at the end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      // Sort from most recent to oldest (descending order)
      return dateB - dateA
    })

    return result
  }, [sales, selectedClient, selectedProductType, searchTerm, getClientName])

  // Toggle selection of a single sale
  const toggleSaleSelection = (saleId) => {
    setSelectedSales((prev) => (prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]))
  }

  // Toggle select all sales
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSales([])
    } else {
      setSelectedSales(filteredSales.map((sale) => sale.id))
    }
    setSelectAll(!selectAll)
  }


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#16A34A]" />
        Relatórios de Vendas
      </h3>

      <div className="space-y-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar vendas por cliente, ID, valor, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A]"
            >
              <option value="">Todos os Clientes</option>
              {clients?.map((client) => {
                const displayName = client.nome || client.name || `Cliente ${client.id}`
                return (
                  <option key={client.id} value={client.id}>
                    {displayName}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Produto</label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A]"
            >
              <option value="">Todos os Tipos</option>
              {productTypes.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedSales.length > 0
                ? `${selectedSales.length} venda(s) selecionada(s)`
                : `${filteredSales.length} venda(s) encontrada(s)`}
            </span>
            {selectedSales.length > 0 && (
              <button onClick={() => setSelectedSales([])} className="text-xs text-[#16A34A] hover:text-green-700">
                Limpar seleção
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center">
              <label className={`relative inline-flex items-center cursor-pointer ${selectedSales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="checkbox"
                  checked={hideMonetaryValues}
                  onChange={(e) => setHideMonetaryValues(e.target.checked)}
                  disabled={selectedSales.length === 0}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer ${selectedSales.length > 0 ? 'peer-checked:bg-[#16A34A]' : ''} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${selectedSales.length > 0 ? 'peer-checked:border-[#16A34A]' : ''}`}>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center ${hideMonetaryValues ? 'text-[#16A34A]' : 'text-gray-400'}`}>
                    {hideMonetaryValues ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 018.74 9.547l-2.477-2.477A9.767 9.767 0 006.75 12z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 15a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span className={selectedSales.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                    {hideMonetaryValues ? 'Valores ocultos' : 'Ocultar valores'}
                  </span>
                </span>
              </label>
            </div>
            <div className="flex-1">
              <PDFDownloadLink
                document={
                  <SalesReportPDF
                    sales={selectedSales.length > 0 ? sales.filter((s) => selectedSales.includes(s.id)) : filteredSales}
                    selectedSales={selectedSales}
                    clientName={selectedClient ? getClientName(selectedClient) : "Todos os Clientes"}
                    hideMonetaryValues={hideMonetaryValues}
                  />
                }
                fileName={`relatorio-vendas-${new Date().toISOString().split("T")[0]}.pdf`}
                className="w-full sm:w-auto"
              >
              {({ blob, url, loading, error }) => {
                const hasSelectedSales = selectedSales.length > 0
                const isDisabled = loading || !hasSelectedSales

                return (
                  <button
                    disabled={isDisabled}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDisabled
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#16A34A] text-white hover:bg-green-600"
                    }`}
                    title={!hasSelectedSales ? "Selecione pelo menos uma venda para gerar o relatório" : ""}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {hasSelectedSales
                          ? `Exportar ${selectedSales.length} venda(s) selecionada(s)`
                          : "Selecione vendas para exportar"}
                      </>
                    )}
                  </button>
                )
              }}
              </PDFDownloadLink>
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                  >
                    <input
                      type="checkbox"
                      checked={selectAll && filteredSales.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Forma de Pagamento
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Valor Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Itens
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSales.includes(sale.id)}
                          onChange={() => toggleSaleSelection(sale.id)}
                          className="h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.dataPedido ? formatDate(sale.dataPedido) : formatDate(sale.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getClientName(sale.clientId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {sale.paymentMethod || "Não informado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {formatCurrency(Number(sale.total) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {sale.items?.length || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma venda encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-900 mb-4">Resumo do Relatório</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Total de Vendas</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{filteredSales.length}</div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 0 && <span>{selectedSales.length} selecionada(s)</span>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Valor Total</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(filteredSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0))}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 0 && (
                  <span>
                    {formatCurrency(
                      filteredSales
                        .filter((sale) => selectedSales.includes(sale.id))
                        .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0),
                    )}{" "}
                    selecionado(s)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Ticket Médio</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(
                  filteredSales.length > 0
                    ? filteredSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0) / filteredSales.length
                    : 0,
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 1 && (
                  <span>
                    {formatCurrency(
                      filteredSales
                        .filter((sale) => selectedSales.includes(sale.id))
                        .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0) / selectedSales.length,
                    )}{" "}
                    (selecionadas)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsSection
