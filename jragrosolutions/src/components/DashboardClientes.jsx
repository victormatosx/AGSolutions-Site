"use client"

import { useState, useEffect } from "react"
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  Calendar,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react"
import { ref, onValue } from "firebase/database"
import { database } from "../firebase/firebase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const DashboardClientes = ({ salesData, userData }) => {
  const [clients, setClients] = useState([])
  const [period, setPeriod] = useState("month") // month, quarter, year
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    activeClients: 0,
    avgTicket: 0,
    totalRevenue: 0,
    totalSales: 0,
    newClientsPercent: 0,
    recurringClientsPercent: 0,
    abcCurve: [],
    topClients: [],
    inactiveClients: [],
    clientProducts: [],
  })

  const [loadingActiveClients, setLoadingActiveClients] = useState(true)

  // Load clients from Firebase
  useEffect(() => {
    if (!userData?.propriedade) return

    const clientsRef = ref(database, `propriedades/${userData.propriedade}/clientes`)
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const clientsData = []
        const clientsObj = snapshot.val()

        if (Array.isArray(clientsObj)) {
          clientsObj.forEach((client, index) => {
            if (client) {
              clientsData.push({
                id: index.toString(),
                name: client.Nome || client.nome || client.name || `Cliente ${index}`,
                ...client,
              })
            }
          })
        } else {
          Object.entries(clientsObj).forEach(([id, client]) => {
            if (client) {
              clientsData.push({
                id,
                name: client.Nome || client.nome || client.name || `Cliente ${id}`,
                ...client,
              })
            }
          })
        }

        setClients(clientsData)
      }
    })

    return () => unsubscribe()
  }, [userData])

  // Calculate analytics
  useEffect(() => {
    setLoadingActiveClients(true)

    console.log("[v0] ===== INÍCIO DO CÁLCULO DE CLIENTES ATIVOS =====")
    console.log("[v0] Total de vendas recebidas:", salesData?.length || 0)

    if (salesData && salesData.length > 0) {
      console.log("[v0] Amostra das primeiras 3 vendas:")
      salesData.slice(0, 3).forEach((sale, index) => {
        console.log(`[v0] Venda ${index + 1}:`, {
          id: sale.id,
          cliente: sale.cliente,
          clienteNome: sale.clienteNome,
          clientName: sale.clientName,
          nomeCliente: sale.nomeCliente,
          status: sale.status,
          todasAsChaves: Object.keys(sale),
        })
      })
    }

    if (!salesData || salesData.length === 0) {
      console.log("[v0] Nenhuma venda encontrada")
      setAnalytics((prev) => ({ ...prev, activeClients: 0 }))
      setLoadingActiveClients(false)
      return
    }

    const now = new Date()
    const startDate = new Date()

    // Define período de análise
    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(now.getMonth() - 3)
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const uniqueClientsAllSales = new Set()
    let processedSales = 0
    let salesWithClient = 0
    let salesWithoutClient = 0

    salesData.forEach((sale, index) => {
      // Ignora vendas nulas ou canceladas
      if (!sale) {
        return
      }

      if (sale.status?.toLowerCase() === "cancelada" || sale.status?.toLowerCase() === "cancelado") {
        return
      }

      processedSales++
      let clientName = null

      // Tenta diferentes campos possíveis
      if (sale.cliente && typeof sale.cliente === "string" && sale.cliente.trim() !== "") {
        clientName = sale.cliente
      } else if (sale.clienteNome && typeof sale.clienteNome === "string" && sale.clienteNome.trim() !== "") {
        clientName = sale.clienteNome
      } else if (sale.clientName && typeof sale.clientName === "string" && sale.clientName.trim() !== "") {
        clientName = sale.clientName
      } else if (sale.nomeCliente && typeof sale.nomeCliente === "string" && sale.nomeCliente.trim() !== "") {
        clientName = sale.nomeCliente
      } else if (sale.cliente && typeof sale.cliente === "object" && sale.cliente.nome) {
        clientName = sale.cliente.nome
      }

      if (clientName && clientName.trim() !== "") {
        const normalized = clientName.trim().toLowerCase()
        uniqueClientsAllSales.add(normalized)
        salesWithClient++

        if (salesWithClient <= 5) {
          console.log(`[v0] Cliente #${salesWithClient} adicionado:`, clientName)
        }
      } else {
        salesWithoutClient++

        if (salesWithoutClient <= 5) {
          console.log(`[v0] Venda sem cliente (ID: ${sale.id}):`, {
            cliente: sale.cliente,
            clienteNome: sale.clienteNome,
            todasAsChaves: Object.keys(sale),
          })
        }
      }
    })

    console.log("[v0] ===== RESULTADO DO PROCESSAMENTO =====")
    console.log("[v0] Vendas processadas:", processedSales)
    console.log("[v0] Vendas COM cliente:", salesWithClient)
    console.log("[v0] Vendas SEM cliente:", salesWithoutClient)
    console.log("[v0] Total de clientes únicos:", uniqueClientsAllSales.size)
    console.log("[v0] Primeiros 10 clientes únicos:", Array.from(uniqueClientsAllSales).slice(0, 10))

    // ---- FILTRAGEM POR PERÍODO ----
    const validSales = salesData.filter((sale) => {
      if (!sale || sale.status?.toLowerCase() === "cancelada" || sale.status?.toLowerCase() === "cancelado")
        return false
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      return !isNaN(saleDate.getTime()) && saleDate >= startDate
    })

    console.log("[v0] Vendas válidas no período:", validSales.length)

    const totalSales = validSales.length

    // ---- AGRUPAMENTO DE CLIENTES ----
    const clientMetrics = {}
    validSales.forEach((sale) => {
      let clientName = null

      if (sale.cliente && typeof sale.cliente === "string") {
        clientName = sale.cliente
      } else if (sale.clienteNome && typeof sale.clienteNome === "string") {
        clientName = sale.clienteNome
      } else if (sale.clientName && typeof sale.clientName === "string") {
        clientName = sale.clientName
      } else if (sale.nomeCliente && typeof sale.nomeCliente === "string") {
        clientName = sale.nomeCliente
      } else if (sale.cliente && typeof sale.cliente === "object" && sale.cliente.nome) {
        clientName = sale.cliente.nome
      }

      if (!clientName || clientName.trim() === "") return

      const normalized = clientName.trim().toLowerCase()

      if (!clientMetrics[normalized]) {
        clientMetrics[normalized] = {
          name: clientName.trim(),
          revenue: 0,
          purchases: 0,
          products: new Set(),
          lastPurchase: null,
          firstPurchase: null,
        }
      }

      const saleValue = Number(sale.valorTotal) || Number(sale.total) || 0
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)

      clientMetrics[normalized].revenue += saleValue
      clientMetrics[normalized].purchases += 1

      if (sale.produtos) {
        Object.values(sale.produtos).forEach((prod) => {
          if (prod.nome) clientMetrics[normalized].products.add(prod.nome)
        })
      }

      if (sale.itens) {
        Object.values(sale.itens).forEach((item) => {
          if (item.nome) clientMetrics[normalized].products.add(item.nome)
        })
      }

      if (!clientMetrics[normalized].lastPurchase || saleDate > clientMetrics[normalized].lastPurchase) {
        clientMetrics[normalized].lastPurchase = saleDate
      }
      if (!clientMetrics[normalized].firstPurchase || saleDate < clientMetrics[normalized].firstPurchase) {
        clientMetrics[normalized].firstPurchase = saleDate
      }
    })

    // ---- CÁLCULOS ----
    const totalRevenue = Object.values(clientMetrics).reduce((sum, c) => sum + c.revenue, 0)
    const activeClientsPeriod = Object.keys(clientMetrics).length
    // Ticket Médio por venda = Receita Total / Número de Vendas
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    // Clientes novos vs recorrentes
    const newClients = Object.values(clientMetrics).filter(
      (c) => c.firstPurchase && c.firstPurchase >= startDate,
    ).length
    const newClientsPercent = activeClientsPeriod > 0 ? (newClients / activeClientsPeriod) * 100 : 0
    const recurringClientsPercent = 100 - newClientsPercent

    // Curva ABC
    const sortedClients = Object.values(clientMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        name: c.name,
        revenue: c.revenue,
        percentage: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0,
      }))

    let accumulated = 0
    const abcCurve = sortedClients.slice(0, 20).map((c) => {
      accumulated += c.percentage
      return { ...c, accumulated: accumulated.toFixed(1) }
    })

    // Top 10 clientes
    const topClients = sortedClients.slice(0, 10).map((c) => {
      const clientData = clientMetrics[c.name.trim().toLowerCase()]
      return {
        ...c,
        purchases: clientData?.purchases || 0,
        lastPurchase: clientData?.lastPurchase,
      }
    })

    // Clientes inativos (+90 dias)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const inactiveClients = Object.values(clientMetrics)
      .filter((c) => c.lastPurchase && c.lastPurchase < ninetyDaysAgo)
      .map((c) => ({
        name: c.name,
        lastPurchase: c.lastPurchase,
        daysSinceLastPurchase: Math.floor((now - c.lastPurchase) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase)
      .slice(0, 10)

    // Produtos preferidos
    const clientProducts = topClients.slice(0, 5).map((c) => {
      const clientData = clientMetrics[c.name.trim().toLowerCase()]
      return {
        clientName: c.name,
        products: clientData ? Array.from(clientData.products).slice(0, 3) : [],
      }
    })

    setAnalytics({
      totalClients: clients.length,
      activeClients: Object.keys(clientMetrics).length,
      avgTicket,
      totalRevenue,
      totalSales,
      newClientsPercent,
      recurringClientsPercent,
      abcCurve,
      topClients,
      inactiveClients,
      clientProducts,
    })

    console.log("[v0] ===== ANALYTICS ATUALIZADO =====")
    console.log("[v0] activeClients (período) definido como:", Object.keys(clientMetrics).length)
    setLoadingActiveClients(false)
  }, [salesData, clients, period])

  const indicators = [
    {
      title: "Clientes Ativos",
      value: loadingActiveClients ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        analytics.activeClients
      ),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ticket Médio",
      value: analytics.avgTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Receita Total",
      value: analytics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Número de Vendas",
      value: analytics.totalSales,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with period filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard de Clientes</h2>
          <p className="text-gray-600">Análise detalhada do comportamento e performance dos clientes</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "month" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod("quarter")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "quarter" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "year" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => {
          const IconComponent = indicator.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 ${indicator.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${indicator.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{indicator.value}</h3>
              <p className="text-gray-600 text-sm">{indicator.title}</p>
              {indicator.subtitle && <p className="text-gray-500 text-xs mt-1">{indicator.subtitle}</p>}
            </div>
          )
        })}
      </div>

      {/* Main Chart - ABC Curve */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Curva ABC de Clientes</h3>
        <p className="text-gray-600 text-sm mb-6">Top 20 clientes que geram a maior receita (Regra 80/20)</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.abcCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="revenue" fill="#25BE8C" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Top 10 Clients */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#25BE8C]" />
              Top 10 Maiores Clientes
            </h3>
            <div className="space-y-3">
              {analytics.topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#25BE8C] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.purchases} compras</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#25BE8C]">
                      {client.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    <p className="text-xs text-gray-500">{client.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inactive Clients */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Clientes Inativos (+90 dias)
            </h3>
            <div className="space-y-3">
              {analytics.inactiveClients.length > 0 ? (
                analytics.inactiveClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Última compra: {client.lastPurchase?.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {client.daysSinceLastPurchase} dias
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Nenhum cliente inativo</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Preferred Products by Client */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Produtos Preferidos por Cliente
            </h3>
            <div className="space-y-4">
              {analytics.clientProducts.map((item, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-semibold text-gray-900 mb-2">{item.clientName}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.products.length > 0 ? (
                      item.products.map((product, pIndex) => (
                        <span
                          key={pIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-purple-700 border border-purple-200"
                        >
                          {product}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Sem produtos registrados</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Purchases */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Últimas Compras
            </h3>
            <div className="space-y-3">
              {analytics.topClients.slice(0, 5).map((client, index) => {
                const daysSinceLastPurchase = client.lastPurchase
                  ? Math.floor((new Date() - client.lastPurchase) / (1000 * 60 * 60 * 24))
                  : null
                const isRecent = daysSinceLastPurchase && daysSinceLastPurchase < 30

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{client.lastPurchase?.toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {client.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      {isRecent ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardClientes
