"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, Trash2, Search, Loader2, X, Save, Calendar, User, CreditCard, Package } from "lucide-react"
import useOutsideAlerter from "../../hooks/useOutsideAlerter"
import { database } from "../firebase/firebase"
import { ref, onValue, off, update } from "firebase/database"

const SalesList = ({ clients, onEditSale, onDeleteSale, propertyName = "Matrice" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSale, setSelectedSale] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const modalRef = useRef(null)

  // --- Helpers de data (robustos) ---
  const parseDateToMs = (value) => {
    if (value == null || value === "") return null

    // Número: pode ser timestamp em s (10 dígitos) ou ms (13 dígitos)
    if (typeof value === "number") {
      const s = value.toString()
      if (s.length <= 10) return value * 1000 // segundos -> ms
      return value // já em ms
    }

    // String contendo apenas dígitos (timestamp em seg ou ms)
    if (/^\d+$/.test(value.trim())) {
      const n = Number(value)
      const s = value.trim().length
      return s <= 10 ? n * 1000 : n
    }

    const str = value.trim()

    // Formato DD/MM/YYYY (ou DD/MM/YYYY hh:mm)
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/)
    if (brMatch) {
      const [, day, month, year, timePart] = brMatch
      const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}${timePart ? "T" + timePart : "T00:00:00"}`
      const ms = Date.parse(iso)
      return isNaN(ms) ? null : ms
    }

    // Tenta parse direto (ISO, "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS", etc.)
    let ms = Date.parse(str)
    if (!isNaN(ms)) return ms

    // Tenta trocar espaço por 'T' (algumas strings ficam 'YYYY-MM-DD HH:MM:SS')
    ms = Date.parse(str.replace(" ", "T"))
    if (!isNaN(ms)) return ms

    return null
  }

  const formatDateFromMs = (ms) => {
    if (!ms && ms !== 0) return "Data não informada"
    const d = new Date(ms)
    if (isNaN(d)) return "Data inválida"
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Para inputs tipo date (YYYY-MM-DD)
  const formatForInput = (ms) => {
    if (!ms && ms !== 0) return ""
    const d = new Date(ms)
    if (isNaN(d)) return ""
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  // Aceita qualquer valor bruto (timestamp/string) e retorna DD/MM/YYYY ou fallback
  const formatAnyDate = (raw) => formatDateFromMs(parseDateToMs(raw))

  // --- Fim helpers ---

  useEffect(() => {
    const salesRef = ref(database, `propriedades/${propertyName}/vendas`)

    const unsubscribe = onValue(
      salesRef,
      (snapshot) => {
        try {
          const data = snapshot.val()
          if (data) {
            const salesArray = Object.keys(data).map((key) => {
              const raw = data[key].dataCarregamento ?? data[key].date ?? data[key].dataPedido ?? null
              const parsedMs = parseDateToMs(raw)
              return {
                id: key,
                ...data[key],
                clientId: data[key].clienteId || data[key].clientId,
                // mantemos o valor bruto para compatibilidade, mas adicionamos parsedDateMs
                date: raw,
                parsedDateMs: parsedMs,
                total: Number.parseFloat(data[key].valorTotal || data[key].total || 0) || 0,
                paymentMethod: data[key].formaPagamento || data[key].paymentMethod || "Não informado",
                client: data[key].cliente || data[key].client,
                itens: data[key].itens || data[key].items || [],
              }
            })
            setSales(salesArray)
          } else {
            setSales([])
          }
          setLoading(false)
        } catch (err) {
          setError("Erro ao carregar vendas")
          setLoading(false)
        }
      },
      (error) => {
        setError("Erro na conexão com o banco de dados")
        setLoading(false)
      },
    )

    return () => off(salesRef, "value", unsubscribe)
  }, [propertyName])

  // Fechar o modal ao clicar fora
  useOutsideAlerter(modalRef, () => {
    if (selectedSale) {
      handleCloseModal()
    }
  })

  const getClientName = (clientId) => {
    const client = clients?.find((c) => c.id === clientId)
    if (client) return client.name
    const sale = sales.find((s) => s.clientId === clientId)
    if (sale?.client) return sale.client
    return "Cliente não encontrado"
  }

  const filteredSales =
    sales?.filter((sale) => {
      const clientName = getClientName(sale.clientId).toLowerCase()
      const saleId = sale.id || ""
      const paymentMethod = (sale.paymentMethod || "").toLowerCase()
      return (
        clientName.includes(searchTerm.toLowerCase()) ||
        saleId.includes(searchTerm) ||
        paymentMethod.includes(searchTerm.toLowerCase())
      )
    }) || []

  const sortedSales = [...filteredSales].sort((a, b) => {
    switch (sortBy) {
      case "date": {
        const aMs = a.parsedDateMs ?? -Infinity
        const bMs = b.parsedDateMs ?? -Infinity
        return bMs - aMs // desc
      }
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

    // Prepara valores para o formulário (formatados para input type="date")
    setEditForm({
      cliente: sale.cliente || "",
      // preferimos usar parsedDateMs para transformar em YYYY-MM-DD
      dataCarregamento: formatForInput(sale.parsedDateMs ?? parseDateToMs(sale.dataCarregamento ?? sale.date ?? "")),
      formaPagamento: sale.formaPagamento || sale.paymentMethod || "",
      observacao: sale.observacao || "",
      observacaoPagamento: sale.observacaoPagamento || "",
      status: sale.status || "pendente",
      dataPedido: formatForInput(parseDateToMs(sale.dataPedido ?? "")) || "",
      prazoDias: sale.prazoDias || "",
    })
  }

  const handleCancelSale = async () => {
    if (!selectedSale || !window.confirm('Tem certeza que deseja cancelar esta venda?')) return

    setSaving(true)
    try {
      const saleRef = ref(database, `propriedades/${propertyName}/vendas/${selectedSale.id}`)
      await update(saleRef, {
        status: 'cancelada',
        dataCancelamento: new Date().toISOString()
      })
      
      // Atualiza o estado local
      setSelectedSale({
        ...selectedSale,
        status: 'cancelada'
      })
      
      // Atualiza o formulário de edição
      setEditForm({
        ...editForm,
        status: 'cancelada'
      })
    } catch (error) {
      console.error('Erro ao cancelar venda:', error)
      alert('Erro ao cancelar venda. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSale = async () => {
    if (!selectedSale) return

    setSaving(true)
    try {
      const saleRef = ref(database, `propriedades/${propertyName}/vendas/${selectedSale.id}`)
      // Aqui salvamos os valores como estão no formulário.
      // Se você quiser salvar timestamp em ms, converta editForm.dataCarregamento -> timestamp antes de salvar.
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
    } catch (error) {
      alert("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedSale(null)
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
            </tr>
          </thead>
          <tbody>
            {sortedSales.map((sale) => (
              <tr
                key={sale.id}
                className={`border-b ${sale.status === 'cancelada' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'hover:bg-gray-50'} cursor-pointer`}
                onClick={() => handleViewSale(sale)}
              >
                <td className="py-3 px-4 text-sm text-gray-600">#{sale.id.slice(-6)}</td>
                <td className="py-3 px-4 font-medium">{getClientName(sale.clientId)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {sale.dataPedido ? formatAnyDate(sale.dataPedido) : (sale.parsedDateMs ? formatDateFromMs(sale.parsedDateMs) : formatAnyDate(sale.date))}
                </td>
                <td className={`py-3 px-4 font-medium ${sale.status === 'cancelada' ? 'text-red-600' : 'text-green-600'}`}>
                  R$ {(sale.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  {sale.status === 'cancelada' ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Cancelada
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {sale.paymentMethod || "Não informado"}
                    </span>
                  )}
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
          <div ref={modalRef} className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalhes da Venda #{selectedSale.id.slice(-6)}</h2>
              <div className="flex items-center gap-2">
                {selectedSale.status !== 'cancelada' && (
                  <button
                    onClick={handleCancelSale}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Cancelar Venda
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
                    <p className="text-gray-900 font-medium">
                      {selectedSale.cliente || getClientName(selectedSale.clientId)}
                    </p>
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
                      <p className="text-gray-900">
                        {selectedSale.dataPedido ? formatAnyDate(selectedSale.dataPedido) : "Não informado"}
                      </p>
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
                        <p className="text-gray-900">
                          {selectedSale.parsedDateMs
                            ? formatDateFromMs(selectedSale.parsedDateMs)
                            : formatAnyDate(selectedSale.dataCarregamento || selectedSale.date) || "Não informado"}
                        </p>
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
                      <p className="text-gray-900">{selectedSale.formaPagamento || selectedSale.paymentMethod || "Não informado"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedSale.status === "pago"
                            ? "bg-green-100 text-green-800"
                            : selectedSale.status === "cancelada"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedSale.status === "pago"
                          ? "Pago"
                          : selectedSale.status === "cancelada"
                          ? "Cancelada"
                          : "Pendente"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Pagamento</label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {selectedSale.observacaoPagamento || "Nenhuma observação sobre o pagamento"}
                    </p>
                  </div>
                </div>
              </div>

              {/* General Observations */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  Observações
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-line">
                    {selectedSale.observacao || "Nenhuma observação adicionada."}
                  </p>
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
