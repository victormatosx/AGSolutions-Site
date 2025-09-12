"use client"

import { useState, useEffect } from "react"
import { Eye, Edit, Trash2, Search, Loader2, X, Save, Calendar, User, CreditCard, Package } from "lucide-react"
import { database } from "../firebase/firebase"
import { ref, onValue, off, update } from "firebase/database"

const SalesList = ({ clients, onEditSale, onDeleteSale, propertyName = "Matrice" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSale, setSelectedSale] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log("[v0] Property name received:", propertyName)
    console.log("[v0] Connecting to Firebase path:", `propriedades/${propertyName}/vendas`)

    const salesRef = ref(database, `propriedades/${propertyName}/vendas`)

    const unsubscribe = onValue(
      salesRef,
      (snapshot) => {
        try {
          const data = snapshot.val()
          console.log("[v0] Firebase data received:", data)

          if (data) {
            // Convert Firebase object to array with IDs
            const salesArray = Object.keys(data).map((key) => {
              console.log("[v0] Processing sale:", key, data[key])
              return {
                id: key,
                ...data[key],
                clientId: data[key].clienteId || data[key].clientId,
                date: data[key].dataCarregamento || data[key].date,
                total: Number.parseFloat(data[key].valorTotal) || Number.parseFloat(data[key].total) || 0,
                paymentMethod: data[key].formaPagamento || data[key].paymentMethod || "Não informado",
                client: data[key].cliente || data[key].client,
                items: data[key].itens || data[key].items || [],
              }
            })
            console.log("[v0] Processed sales array:", salesArray)
            setSales(salesArray)
          } else {
            console.log("[v0] No sales data found")
            setSales([])
          }
          setLoading(false)
        } catch (err) {
          console.error("[v0] Erro ao carregar vendas:", err)
          setError("Erro ao carregar vendas")
          setLoading(false)
        }
      },
      (error) => {
        console.error("[v0] Erro na conexão com Firebase:", error)
        setError("Erro na conexão com o banco de dados")
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => off(salesRef, "value", unsubscribe)
  }, [propertyName])

  const getClientName = (clientId) => {
    // First try to get from clients prop
    const client = clients?.find((c) => c.id === clientId)
    if (client) return client.name

    // If not found in clients prop, try to get from sale data itself
    const sale = sales.find((s) => s.clientId === clientId)
    if (sale?.client) return sale.client

    return "Cliente não encontrado"
  }

  const filteredSales =
    sales?.filter((sale) => {
      const clientName = getClientName(sale.clientId).toLowerCase()
      const saleId = sale.id || ""
      const paymentMethod = sale.paymentMethod || ""

      return (
        clientName.includes(searchTerm.toLowerCase()) ||
        saleId.includes(searchTerm) ||
        paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }) || []

  const sortedSales = [...filteredSales].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date) - new Date(a.date)
      case "total":
        return (b.total || 0) - (a.total || 0)
      case "client":
        return getClientName(a.clientId).localeCompare(getClientName(b.clientId))
      default:
        return 0
    }
  })

  const handleViewSale = (sale) => {
    setSelectedSale(sale)
    setIsEditing(false)
    setEditForm({
      cliente: sale.cliente || "",
      dataCarregamento: sale.dataCarregamento || sale.date || "",
      formaPagamento: sale.formaPagamento || sale.paymentMethod || "",
      observacao: sale.observacao || "",
      observacaoPagamento: sale.observacaoPagamento || "",
      status: sale.status || "pendente",
      dataPedido: sale.dataPedido || "",
      prazoDias: sale.prazoDias || "",
    })
  }

  const handleEditSale = () => {
    setIsEditing(true)
  }

  const handleSaveSale = async () => {
    if (!selectedSale) return

    setSaving(true)
    try {
      const saleRef = ref(database, `propriedades/${propertyName}/vendas/${selectedSale.id}`)
      await update(saleRef, {
        cliente: editForm.cliente,
        dataCarregamento: editForm.dataCarregamento,
        formaPagamento: editForm.formaPagamento,
        observacao: editForm.observacao,
        observacaoPagamento: editForm.observacaoPagamento,
        status: editForm.status,
        dataPedido: editForm.dataPedido,
        prazoDias: editForm.prazoDias,
      })

      setIsEditing(false)
      setSelectedSale(null)
      console.log("[v0] Sale updated successfully")
    } catch (error) {
      console.error("[v0] Error updating sale:", error)
      alert("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedSale(null)
    setIsEditing(false)
    setEditForm({})
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando vendas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <button onClick={() => window.location.reload()} className="text-blue-500 hover:underline">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

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
              <tr
                key={sale.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewSale(sale)}
              >
                <td className="py-3 px-4 text-sm text-gray-600">#{sale.id.slice(-6)}</td>
                <td className="py-3 px-4 font-medium">{getClientName(sale.clientId)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {sale.date ? new Date(sale.date).toLocaleDateString("pt-BR") : "Data não informada"}
                </td>
                <td className="py-3 px-4 font-medium text-green-600">
                  R$ {(sale.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {sale.paymentMethod || "Não informado"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleViewSale(sale)}
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

      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes da Venda #{selectedSale.id.slice(-6)}</h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={handleEditSale}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={handleSaveSale}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar
                  </button>
                )}
                <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <User className="w-5 h-5 text-blue-600" />
                    Informações do Cliente
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.cliente}
                        onChange={(e) => setEditForm({ ...editForm, cliente: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {selectedSale.cliente || getClientName(selectedSale.clientId)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sale Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Informações da Venda
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pedido</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.dataPedido || selectedSale.dataPedido || ""}
                          onChange={(e) => setEditForm({ ...editForm, dataPedido: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {selectedSale.dataPedido
                            ? new Date(selectedSale.dataPedido).toLocaleDateString("pt-BR")
                            : "Data não informada"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedSale.itens && selectedSale.itens.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Itens da Venda ({selectedSale.itens.length} {selectedSale.itens.length === 1 ? "item" : "itens"})
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Produto</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Classificação</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Embalagem</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Talhão</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Variedade</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Quantidade</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Preço Unit.</th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.itens.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-2 py-3 text-sm text-gray-900">{item.tipoProduto || "-"}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{item.classificacao || "-"}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{item.embalagem || "-"}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{item.talhao || "-"}</td>
                            <td className="px-2 py-3 text-sm text-gray-700">{item.variedade || "-"}</td>
                            <td className="px-2 py-3 text-sm font-medium">{item.quantidade || "0"}</td>
                            <td className="px-2 py-3 text-sm">
                              R$ {(item.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-2 py-3 font-bold text-green-600">
                              R$ {(item.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total da Venda</label>
                        <p className="text-3xl font-bold text-green-600">
                          R${" "}
                          {(selectedSale.valorTotal || selectedSale.total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data de Carregamento</label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.dataCarregamento}
                            onChange={(e) => setEditForm({ ...editForm, dataCarregamento: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedSale.dataCarregamento
                              ? new Date(selectedSale.dataCarregamento).toLocaleDateString("pt-BR")
                              : "Data não informada"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Informações de Pagamento
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                      {isEditing ? (
                        <select
                          value={editForm.formaPagamento}
                          onChange={(e) => setEditForm({ ...editForm, formaPagamento: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione...</option>
                          <option value="A Prazo">A Prazo</option>
                          <option value="À Vista">À Vista</option>
                          <option value="Cartão">Cartão</option>
                          <option value="PIX">PIX</option>
                          <option value="Dinheiro">Dinheiro</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {selectedSale.formaPagamento || selectedSale.paymentMethod || "Não informado"}
                          </span>
                          {(selectedSale.formaPagamento === "A Prazo" || selectedSale.paymentMethod === "A Prazo") &&
                            selectedSale.prazoDias && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {selectedSale.prazoDias} dias
                              </span>
                            )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="pago">Pago</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedSale.status === "pago"
                              ? "bg-green-100 text-green-800"
                              : selectedSale.status === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedSale.status || "Pendente"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Pagamento</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.observacaoPagamento}
                        onChange={(e) => setEditForm({ ...editForm, observacaoPagamento: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Observações sobre o pagamento..."
                      />
                    ) : (
                      <p className="text-gray-900 text-sm bg-white p-2 rounded border">
                        {selectedSale.observacaoPagamento || "Nenhuma observação sobre o pagamento"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* General Observations */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  Observações Gerais
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  {isEditing ? (
                    <textarea
                      value={editForm.observacao}
                      onChange={(e) => setEditForm({ ...editForm, observacao: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Observações gerais sobre a venda..."
                    />
                  ) : (
                    <p className="text-gray-900 bg-white p-3 rounded border">
                      {selectedSale.observacao || "Nenhuma observação geral"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesList