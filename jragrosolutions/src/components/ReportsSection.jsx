import { useState, useMemo, useEffect } from "react"
import { BarChart3, Download, Calendar, Filter, Check, X } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ref, onValue } from "firebase/database"
import { database } from "../firebase/firebase"
import SalesReportPDF from './SalesReportPDF'

const ReportsSection = ({ sales = [], clients = [] }) => {
  const [dateRange, setDateRange] = useState("month")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedProductType, setSelectedProductType] = useState("")
  const [productTypes, setProductTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSales, setSelectedSales] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Fetch product types from Firebase
  useEffect(() => {
    const productosRef = ref(database, "propriedades")

    const unsubscribe = onValue(productosRef, (snapshot) => {
      const culturas = new Set()
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.direcionadores) {
          Object.values(propertyData.direcionadores).forEach((direcionador) => {
            if (direcionador.culturaAssociada) {
              culturas.add(direcionador.culturaAssociada)
            }
          })
        }
      })

      const productosData = Array.from(culturas).map((cultura, index) => ({
        id: `cultura-${index}`,
        name: cultura,
      }))

      setProductTypes(productosData)
    })

    return () => unsubscribe()
  }, [])

  // Get client name by ID
  const getClientName = (clientId) => {
    if (!clientId) return 'Cliente não especificado';
    const client = clients.find(c => c.id === clientId);
    if (!client) return `Cliente ${clientId}`; // Fallback to ID if client not found
    return client.Nome || client.nome || client.name || `Cliente ${clientId}`;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  // Filter sales based on selected client and product type
  const filteredSales = useMemo(() => {
    let result = [...sales];
    
    if (selectedClient) {
      result = result.filter(sale => sale.clientId === selectedClient);
    }
    
    if (selectedProductType) {
      result = result.filter(sale => 
        sale.items?.some(item => 
          item.productType === selectedProductType || 
          item.culturaAssociada === selectedProductType
        )
      );
    }
    
    // Apply date range filter
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        startDate.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        break;
    }
    
    if (dateRange !== 'all') {
      result = result.filter(sale => {
        try {
          const saleDate = new Date(sale.date);
          return saleDate >= startDate;
        } catch (e) {
          return false;
        }
      });
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(sale => {
        const clientName = getClientName(sale.clientId).toLowerCase();
        const saleId = sale.id?.toLowerCase() || '';
        const total = formatCurrency(sale.total || 0).toLowerCase();
        
        return (
          clientName.includes(searchLower) ||
          saleId.includes(searchLower) ||
          total.includes(searchLower) ||
          sale.observations?.toLowerCase().includes(searchLower) ||
          sale.status?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return result;
  }, [sales, selectedClient, selectedProductType, dateRange, searchTerm]);
  
  // Toggle selection of a single sale
  const toggleSaleSelection = (saleId) => {
    setSelectedSales(prev => 
      prev.includes(saleId)
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };
  
  // Toggle select all sales
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSales([]);
    } else {
      setSelectedSales(filteredSales.map(sale => sale.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'Data inválida';
    }
  };
  
  // Get date range text
  const getDateRangeText = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return `Hoje (${now.toLocaleDateString('pt-BR')})`;
      case 'week':
        return `Esta Semana (${now.toLocaleDateString('pt-BR', {weekday: 'long'})} ${now.getDate()}/${now.getMonth() + 1})`;
      case 'month':
        return `Este Mês (${now.toLocaleDateString('pt-BR', {month: 'long'})} ${now.getFullYear()})`;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${quarter}º Trimestre de ${now.getFullYear()}`;
      case 'year':
        return `Ano de ${now.getFullYear()}`;
      case 'all':
        return 'Todo o Período';
      default:
        return 'Período não especificado';
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A]"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16A34A]"
            >
              <option value="">Todos os Clientes</option>
              {clients?.map(client => {
                const displayName = client.nome || client.name || `Cliente ${client.id}`;
                return (
                  <option key={client.id} value={client.id}>
                    {displayName}
                  </option>
                );
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
              <button 
                onClick={() => setSelectedSales([])}
                className="text-xs text-[#16A34A] hover:text-green-700"
              >
                Limpar seleção
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <PDFDownloadLink
              document={
                <SalesReportPDF 
                  sales={selectedSales.length > 0 
                    ? sales.filter(s => selectedSales.includes(s.id))
                    : filteredSales}
                  selectedSales={selectedSales}
                  clientName={selectedClient ? getClientName(selectedClient) : 'Todos os Clientes'}
                  dateRange={getDateRangeText()}
                />
              }
              fileName={`relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`}
              className="w-full sm:w-auto"
            >
              {({ blob, url, loading, error }) => {
                const hasSelectedSales = selectedSales.length > 0;
                const isDisabled = loading || !hasSelectedSales;
                
                return (
                  <button 
                    disabled={isDisabled}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDisabled
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#16A34A] text-white hover:bg-green-600'
                    }`}
                    title={!hasSelectedSales ? 'Selecione pelo menos uma venda para gerar o relatório' : ''}
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
                          : 'Selecione vendas para exportar'}
                      </>
                    )}
                  </button>
                );
              }}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Sales List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredSales.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-[#16A34A] focus:ring-[#16A34A] border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getClientName(sale.clientId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {sale.paymentMethod || 'Não informado'}
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
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {filteredSales.length}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 0 && (
                  <span>{selectedSales.length} selecionada(s)</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Valor Total</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(
                  filteredSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 0 && (
                  <span>
                    {formatCurrency(
                      filteredSales
                        .filter(sale => selectedSales.includes(sale.id))
                        .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)
                    )} selecionado(s)
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
                    : 0
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {selectedSales.length > 1 && (
                  <span>
                    {formatCurrency(
                      filteredSales
                        .filter(sale => selectedSales.includes(sale.id))
                        .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0) / selectedSales.length
                    )} (selecionadas)
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
