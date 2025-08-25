import { useState } from "react"
import { Eye, Edit, Trash2, Search } from 'lucide-react'

const SalesList = ({ sales, clients, onEditSale, onDeleteSale }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")

  const getClientName = (clientId) => {
    const client = clients?.find(c => c.id === clientId)
    return client ? client.name : "Cliente não encontrado"
  }

  const filteredSales = sales?.filter(sale => {
    const clientName = getClientName(sale.clientId).toLowerCase()
    return clientName.includes(searchTerm.toLowerCase()) ||
           sale.id.includes(searchTerm) ||
           sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  }) || []

  const sortedSales = [...filteredSales].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date) - new Date(a.date)
      case "total":
        return b.total - a.total
      case "client":
        return getClientName(a.clientId).localeCompare(getClientName(b.clientId))
      default:
        return 0
    }
  })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Vendas</h3>

      {/* Search and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por cliente, ID ou forma de pagamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Ordenar por Data</option>
          <option value="total">Ordenar por Valor</option>
          <option value="client">Ordenar por Cliente</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Pagamento</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-600">#{sale.id.slice(-6)}</td>
                <td className="py-3 px-4 font-medium">{getClientName(sale.clientId)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(sale.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4 font-medium text-green-600">
                  R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {sale.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => console.log("Ver detalhes:", sale)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditSale && onEditSale(sale)}
                      className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSale && onDeleteSale(sale.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedSales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "Nenhuma venda encontrada para sua busca." : "Nenhuma venda registrada ainda."}
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesList
