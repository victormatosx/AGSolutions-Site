import { useState, useMemo } from "react"
import { BarChart3, Download, Calendar, Filter, Check, X } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
// Importando o componente SalesReportPDF
import SalesReportPDF from './SalesReportPDF'

const ReportsSection = ({ sales = [], clients = [] }) => {
  const [reportType, setReportType] = useState("sales")
  const [dateRange, setDateRange] = useState("month")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedSales, setSelectedSales] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Filter sales based on selected client
  const filteredSales = useMemo(() => {
    let result = [...sales];
    
    if (selectedClient) {
      result = result.filter(sale => sale.clientId === selectedClient);
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
    
    return result;
  }, [sales, selectedClient, dateRange]);
  
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
        <BarChart3 className="w-5 h-5 text-purple-600" />
        Relatórios de Vendas
      </h3>

      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="sales">Vendas</option>
              <option value="clients">Clientes</option>
              <option value="products">Produtos</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente (Opcional)</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                className="text-xs text-purple-600 hover:text-purple-800"
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
              {({ blob, url, loading, error }) => (
                <button 
                  disabled={loading || filteredSales.length === 0}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loading || filteredSales.length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
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
                      {selectedSales.length > 0 
                        ? `Exportar ${selectedSales.length} venda(s) selecionada(s)`
                        : 'Exportar todas as vendas'}
                    </>
                  )}
                </button>
              )}
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
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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

          {reportType === "clients" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Clientes:</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Novos Clientes:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clientes Ativos:</span>
                <span className="font-medium">67</span>
              </div>
            </div>
          )}

          {reportType === "products" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Produtos Vendidos:</span>
                <span className="font-medium">234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produto Mais Vendido:</span>
                <span className="font-medium">Fertilizante Premium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categoria Top:</span>
                <span className="font-medium">Fertilizantes</span>
              </div>
            </div>
          )}
        </div>

        {/* PDF Export is handled by the PDFDownloadLink component above */}
      </div>
    </div>
  )
}

export default ReportsSection
