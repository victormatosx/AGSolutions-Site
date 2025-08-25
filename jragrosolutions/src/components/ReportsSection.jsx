import { useState } from "react"
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'

const ReportsSection = ({ salesData, clients }) => {
  const [reportType, setReportType] = useState("sales")
  const [dateRange, setDateRange] = useState("month")
  const [selectedClient, setSelectedClient] = useState("")

  const generateReport = () => {
    // Lógica para gerar relatório baseado nos filtros
    console.log("Gerando relatório:", { reportType, dateRange, selectedClient })
    
    // Aqui você implementaria a lógica real de geração de relatórios
    alert("Relatório gerado! (Funcionalidade será implementada)")
  }

  const exportReport = (format) => {
    // Lógica para exportar relatório
    console.log("Exportando relatório em formato:", format)
    alert(`Exportando relatório em ${format.toUpperCase()}...`)
  }

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
              <option value="custom">Período Personalizado</option>
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
              {clients?.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Prévia do Relatório</h4>
          
          {reportType === "sales" && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Vendas:</span>
                <span className="font-medium">R$ 45.230,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Número de Vendas:</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Médio:</span>
                <span className="font-medium">R$ 356,14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Melhor Cliente:</span>
                <span className="font-medium">João Silva</span>
              </div>
            </div>
          )}

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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Gerar Relatório
          </button>
          
          <button
            onClick={() => exportReport("pdf")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          
          <button
            onClick={() => exportReport("excel")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportsSection
