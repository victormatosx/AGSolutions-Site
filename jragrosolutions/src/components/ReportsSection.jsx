"use client"

import { useState, useMemo, useEffect } from "react"
import { BarChart3, Download } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import SalesReportPDF from "./SalesReportPDF"
import { database } from "../firebase/firebase"
import { ref, onValue, off } from "firebase/database"

const ReportsSection = ({ propertyName = "Matrice", preselectedSaleId = null }) => {
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  const [productTypes, setProductTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSales, setSelectedSales] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [hideMonetaryValues, setHideMonetaryValues] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const resetView = () => {
    setSelectedSales([])
    setSelectAll(false)
    setSelectedClient("")
    setSelectedProductType("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  useEffect(() => {
    if (preselectedSaleId && sales.length > 0) {
      const saleExists = sales.find((sale) => sale.id === preselectedSaleId)
      if (saleExists) {
        setSelectedSales([preselectedSaleId])
        console.log(`Pre-selected sale: ${preselectedSaleId}`)
      }
    }
  }, [preselectedSaleId, sales])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const salesRef = ref(database, `propriedades/${propertyName}/vendas`)
        const clientsRef = ref(database, `propriedades/${propertyName}/clientes`)

        onValue(salesRef, (snapshot) => {
          const salesData = snapshot.val()
          if (salesData) {
            const salesArray = Object.keys(salesData).map((saleId) => {
              const sale = salesData[saleId]

              const items = sale.itens
                ? Object.keys(sale.itens).map((itemKey) => {
                    const item = sale.itens[itemKey]
                    return {
                      id: itemKey,
                      tipoProduto: item.tipoProduto || "",
                      variedade: item.variedade || "",
                      classificacao: item.classificacao || "",
                      embalagem: item.embalagem || "",
                      quantidade: item.quantidade || 0,
                      preco: item.preco || 0,
                      valorTotal: item.valorTotal || 0,
                      tamanho: item.tamanho || "",
                      productType: item.tipoProduto || "",
                      culturaAssociada: item.tipoProduto || "",
                      talhao: item.talhao || "",
                    }
                  })
                : []

              return {
                id: saleId,
                cliente: sale.cliente || "",
                clientId: sale.clienteId || "",
                dataPedido: sale.dataPedido || "",
                dataCarregamento: sale.dataCarregamento || "",
                formaPagamento: sale.formaPagamento || "",
                formaPagamentoId: sale.formaPagamentoId || "",
                prazoDias: sale.prazoDias || null,
                criadoEm: sale.criadoEm || "",
                criadoPor: sale.criadoPor || "",
                observacao: sale.observacao || "",
                observacaoPagamento: sale.observacaoPagamento || "",
                propriedade: sale.propriedade || "",
                status: sale.status || "",
                tipoFrete: sale.tipoFrete || "",
                valorTotal:
                  items.reduce((sum, item) => sum + (Number(item.valorTotal) || 0), 0) || sale.valorTotal || 0,
                items: items,
                total: items.reduce((sum, item) => sum + (Number(item.valorTotal) || 0), 0) || sale.valorTotal || 0,
                paymentMethod: sale.formaPagamento || "",
                date: sale.dataPedido || sale.criadoEm || "",
                observations: sale.observacao || "",
              }
            })
            setSales(salesArray)
          } else {
            setSales([])
          }
          setLoading(false)
        })

        onValue(clientsRef, (snapshot) => {
          const clientsData = snapshot.val()
          if (clientsData) {
            const clientsArray = Object.keys(clientsData).map((clientId) => ({
              id: clientId,
              nome: clientsData[clientId].nome || clientsData[clientId].name || "",
              name: clientsData[clientId].nome || clientsData[clientId].name || "",
              Nome: clientsData[clientId].nome || clientsData[clientId].name || "",
            }))
            setClients(clientsArray)
          } else {
            setClients([])
          }
        })
      } catch (err) {
        console.error("Error fetching data from Firebase:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      const salesRef = ref(database, `propriedades/${propertyName}/vendas`)
      const clientsRef = ref(database, `propriedades/${propertyName}/clientes`)
      off(salesRef)
      off(clientsRef)
    }
  }, [propertyName])

  useEffect(() => {
    if (sales.length > 0) {
      const types = new Set()
      sales.forEach((sale) => {
        sale.items?.forEach((item) => {
          if (item.tipoProduto) {
            types.add(item.tipoProduto)
          }
        })
      })

      const productTypesArray = Array.from(types).map((type) => ({
        id: type.toLowerCase(),
        name: type,
      }))

      setProductTypes(productTypesArray)
    }
  }, [sales])

  const getClientName = (sale) => {
    if (sale.cliente) return sale.cliente

    if (sale.clientId) {
      const client = clients.find((c) => c.id === sale.clientId)
      if (client) return client.Nome || client.nome || client.name || `Cliente ${sale.clientId}`
    }

    return "Cliente não especificado"
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0)
  }

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

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter((sale) => {
        const clientName = getClientName(sale).toLowerCase()
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

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      return dateB - dateA
    })

    return result
  }, [sales, selectedClient, selectedProductType, searchTerm])

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  const toggleSaleSelection = (saleId) => {
    setSelectedSales((prev) => (prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]))
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSales([])
    } else {
      setSelectedSales(filteredSales.map((sale) => sale.id))
    }
    setSelectAll(!selectAll)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
          <span className="ml-3 text-gray-600">Carregando dados do Firebase...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">Erro ao carregar dados</div>
          <div className="text-gray-600 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#16A34A]" />
        Relatórios de Vendas - {propertyName}
      </h3>

      <div className="space-y-6">
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
              <label
                className={`relative inline-flex items-center cursor-pointer ${selectedSales.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={hideMonetaryValues}
                  onChange={(e) => setHideMonetaryValues(e.target.checked)}
                  disabled={selectedSales.length === 0}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer ${selectedSales.length > 0 ? "peer-checked:bg-[#16A34A]" : ""} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${selectedSales.length > 0 ? "peer-checked:border-[#16A34A]" : ""}`}
                ></div>
                <span className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span
                    className={`w-5 h-5 flex items-center justify-center ${hideMonetaryValues ? "text-[#16A34A]" : "text-gray-400"}`}
                  >
                    {hideMonetaryValues ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 018.74 9.547l-2.477-2.477A9.767 9.767 0 006.75 12z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M12 15a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                        <path
                          fillRule="evenodd"
                          d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={selectedSales.length === 0 ? "text-gray-400" : "text-gray-700"}>
                    {hideMonetaryValues ? "Valores ocultos" : "Ocultar valores"}
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
                onClick={() => {
                  // Reset the view after a short delay to ensure the PDF is generated
                  setTimeout(resetView, 1000);
                }}
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
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredSales.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded mx-auto block"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
                  >
                    Forma de Pagamento
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36"
                  >
                    Valor Total
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                  >
                    Itens
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSales.length > 0 ? (
                  currentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`${sale.status === "cancelada" 
                        ? "bg-red-50 text-red-700 hover:bg-red-100" 
                        : selectedSales.includes(sale.id) 
                          ? "bg-gray-100 hover:bg-gray-200" 
                          : "hover:bg-gray-50"} transition-colors`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedSales.includes(sale.id)}
                          onChange={() => toggleSaleSelection(sale.id)}
                          className="h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {sale.dataPedido ? formatDate(sale.dataPedido) : formatDate(sale.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{getClientName(sale)}</div>
                        {sale.items?.length > 0 && (
                          <div
                            className="text-xs text-gray-500 truncate max-w-xs"
                            title={[...new Set(sale.items.map((item) => item.tipoProduto).filter(Boolean))].join(", ")}
                          >
                            {[...new Set(sale.items.map((item) => item.tipoProduto).filter(Boolean))].join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                            sale.status === "cancelada" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {sale.status === "cancelada" ? "Cancelada" : sale.paymentMethod || "Não informado"}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-right text-sm font-semibold ${sale.status === "cancelada" ? "text-red-600" : "text-gray-900"}`}
                      >
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {sale.items?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="font-medium text-gray-600">Nenhuma venda encontrada</p>
                        <p className="text-xs text-gray-500">Tente ajustar os filtros de busca</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Anterior
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages || totalPages === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">{filteredSales.length === 0 ? 0 : indexOfFirstItem + 1}</span> a{" "}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredSales.length)}</span> de{" "}
                    <span className="font-medium">{filteredSales.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-[#16A34A] border-[#16A34A] text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages || totalPages === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      <span className="sr-only">Próximo</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

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
