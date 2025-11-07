"use client"

import { useState, useEffect, useMemo } from "react"
import { Package, DollarSign, TrendingUp, Users, BarChart3, PieChartIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const DashboardProdutos = ({ salesData, userData }) => {
  const [period, setPeriod] = useState("month")
  // Ano selecionado para EvoluÃ§Ã£o de PreÃ§o MÃ©dio
  const [priceYear, setPriceYear] = useState(new Date().getFullYear())
  // Modo de evolução: geral vs por produto; seleção múltipla
  const [evolutionMode, setEvolutionMode] = useState('geral')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgPrice: 0,
    topProduct: { name: "-", value: 0, quantity: 0 },
    revenueByProduct: [],
    priceEvolution: [],
    productMix: [],
    topClientsByProduct: [],
    safraComparison: [],
  })

  useEffect(() => {
    if (!salesData || salesData.length === 0) return

    const now = new Date()
    const startDate = new Date()

    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === "quarter") {
      startDate.setMonth(now.getMonth() - 3)
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const validSales = salesData.filter((sale) => {
      if (!sale) return false
      const status = sale.status?.toLowerCase()
      if (status === "cancelada" || status === "cancelado") return false
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      return !isNaN(saleDate.getTime()) && saleDate >= startDate
    })

    // Product metrics
    const productMetrics = {}
    const productPriceHistory = {}
    const productClients = {}
    let totalRevenueFromSales = 0

    validSales.forEach((sale) => {
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`

      // Suporta 'itens' (array/obj), 'items' e fallback 'produtos'
      const itemsArr = Array.isArray(sale?.itens)
        ? sale.itens
        : sale?.itens && typeof sale.itens === 'object'
          ? Object.values(sale.itens)
          : Array.isArray(sale?.items)
            ? sale.items
            : sale?.items && typeof sale.items === 'object'
              ? Object.values(sale.items)
              : sale?.produtos && typeof sale.produtos === 'object'
                ? Object.values(sale.produtos)
                : []

      // Monte um snapshot de itens com totais e quantidades
      const parsedItems = []
      let sumItemTotals = 0
      let sumItemQty = 0
      itemsArr.forEach((item) => {
        const productName = (item?.tipoProduto || item?.produto || item?.name || "Produto sem nome").toString()
        let quantity = Number(item?.quantidade ?? item?.quantity ?? item?.qty)
        if (!Number.isFinite(quantity)) quantity = 0
        let price = Number(item?.preco ?? item?.price ?? item?.valorUnitario)
        if (!Number.isFinite(price)) price = 0
        const itemTotalRaw = Number(item?.valorTotal)
        const itemTotal = Number.isFinite(itemTotalRaw) && itemTotalRaw > 0 ? itemTotalRaw : quantity * price
        parsedItems.push({ productName, quantity, itemTotal })
        sumItemTotals += itemTotal
        sumItemQty += quantity
      })

      // Valor total da venda (prioriza campos de venda)
      const saleValue = (Number(sale?.valorTotal) || Number(sale?.total) || 0) > 0
        ? (Number(sale?.valorTotal) || Number(sale?.total) || 0)
        : sumItemTotals
      totalRevenueFromSales += Number.isFinite(saleValue) ? saleValue : 0

      // Distribui o total da venda pelos itens para garantir soma = total da venda
      const factor = sumItemTotals > 0 && saleValue > 0 ? (saleValue / sumItemTotals) : 0
      const clientId = sale.clientId || sale.clienteId

      parsedItems.forEach(({ productName, quantity, itemTotal }) => {
        let revenue = itemTotal
        if (saleValue > 0) {
          if (factor > 0) {
            revenue = itemTotal * factor
          } else if (sumItemQty > 0) {
            revenue = saleValue * (quantity / sumItemQty)
          }
        }

        if (!productMetrics[productName]) {
          productMetrics[productName] = {
            name: productName,
            revenue: 0,
            quantity: 0,
            avgPrice: 0,
            priceSum: 0,
            priceCount: 0,
          }
        }

        productMetrics[productName].revenue += revenue
        productMetrics[productName].quantity += quantity
        // Para média ponderada: acumular receita e quantidade
        productMetrics[productName].priceSum += revenue
        productMetrics[productName].priceCount += quantity

        // Price history (usar receita ajustada e quantidade)
        if (!productPriceHistory[monthKey]) {
          productPriceHistory[monthKey] = { month: monthKey, totalRevenue: 0, totalQuantity: 0 }
        }
        productPriceHistory[monthKey].totalRevenue += revenue
        productPriceHistory[monthKey].totalQuantity += quantity

        // Product clients
        if (!productClients[productName]) {
          productClients[productName] = new Set()
        }
        if (clientId) {
          productClients[productName].add(clientId)
        }
      })
    })

    // Calculate metrics
    Object.values(productMetrics).forEach((product) => {
      product.avgPrice = product.priceCount > 0 ? product.priceSum / product.priceCount : 0
    })

    // Receita Total baseada no total das vendas (deve igualar Clientes)
    const totalRevenue = totalRevenueFromSales
    const totalQuantity = Object.values(productMetrics).reduce((sum, p) => sum + p.quantity, 0)
    // Preço médio geral ponderado por quantidade
    const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0

    // Top product (por quantidade vendida)
    const sortedByRevenue = Object.values(productMetrics).sort((a, b) => b.revenue - a.revenue)
    const sortedByQuantity = Object.values(productMetrics).sort((a, b) => b.quantity - a.quantity)
    const topProduct = sortedByQuantity[0] || { name: "-", revenue: 0, quantity: 0 }

    // Revenue by product (top 20)
    const revenueByProduct = sortedByRevenue.slice(0, 20)

    // Price evolution por ano selecionado (Jan..Dez)
    const monthsLabels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    // Construir histÃ³rico de preÃ§os com TODAS as vendas (nÃ£o sÃ³ do perÃ­odo)
    const priceHistoryAll = {}
;(salesData || []).forEach((sale) => {
  if (!sale) return
  const statusAll = sale.status?.toLowerCase()
  if (statusAll === 'cancelada' || statusAll === 'cancelado') return
  const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
  if (isNaN(saleDate.getTime())) return
  const y = saleDate.getFullYear()
  const m = String(saleDate.getMonth() + 1).padStart(2, '0')
  const key = ${y}-
  const itemsArr = Array.isArray(sale?.itens)
    ? sale.itens
    : sale?.itens && typeof sale.itens === 'object'
      ? Object.values(sale.itens)
      : Array.isArray(sale?.items)
        ? sale.items
        : sale?.items && typeof sale.items === 'object'
          ? Object.values(sale.items)
          : sale?.produtos && typeof sale.produtos === 'object'
            ? Object.values(sale.produtos)
            : []

  // Snapshot de itens
  const parsed = []
  let sumTotals = 0
  let sumQty = 0
  itemsArr.forEach((item) => {
    let q = Number(item?.quantidade ?? item?.quantity ?? item?.qty)
    if (!Number.isFinite(q)) q = 0
    let p = Number(item?.preco ?? item?.price ?? item?.valorUnitario)
    if (!Number.isFinite(p)) p = 0
    const t = Number(item?.valorTotal)
    const it = Number.isFinite(t) && t > 0 ? t : q * p
    parsed.push({ q, it })
    sumTotals += it
    sumQty += q
  })

  const saleValue = (Number(sale?.valorTotal) || Number(sale?.total) || 0) > 0
    ? (Number(sale?.valorTotal) || Number(sale?.total) || 0)
    : sumTotals
  const factorAll = sumTotals > 0 && saleValue > 0 ? (saleValue / sumTotals) : 0

  parsed.forEach(({ q, it }) => {
    let rev = it
    if (saleValue > 0) {
      if (factorAll > 0) rev = it * factorAll
      else if (sumQty > 0) rev = saleValue * (q / sumQty)
    }
    if (!priceHistoryAll[key]) priceHistoryAll[key] = { totalRevenue: 0, totalQuantity: 0 }
    priceHistoryAll[key].totalRevenue += rev
    priceHistoryAll[key].totalQuantity += q
  })
})const priceEvolution = monthsLabels.map((label, idx) => {
      const key = `${priceYear}-${String(idx + 1).padStart(2,'0')}`
      const rec = priceHistoryAll[key]
      const avg = rec && rec.totalQuantity > 0 ? rec.totalRevenue / rec.totalQuantity : 0
      return { month: label, avgPrice: avg }
    })

    // Product mix (pie chart)
    const COLORS = ["#25BE8C", "#2a9d8f", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"]
    const productMix = sortedByRevenue.slice(0, 8).map((product, index) => ({
      name: product.name,
      value: product.revenue,
      percentage: ((product.revenue / totalRevenue) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }))

    // Top clients by product
    const topClientsByProduct = sortedByRevenue.slice(0, 5).map((product) => ({
      productName: product.name,
      clientCount: productClients[product.name]?.size || 0,
      revenue: product.revenue,
    }))

    // Safra comparison (current vs previous period)
    const previousStartDate = new Date(startDate)
    if (period === "month") {
      previousStartDate.setMonth(previousStartDate.getMonth() - 1)
    } else if (period === "quarter") {
      previousStartDate.setMonth(previousStartDate.getMonth() - 3)
    } else if (period === "year") {
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
    }

    const previousSales = salesData.filter((sale) => {
      if (!sale || ["cancelada","cancelado"].includes((sale.status?.toLowerCase() || ""))) return false
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      return !isNaN(saleDate.getTime()) && saleDate >= previousStartDate && saleDate < startDate
    })

    const previousProductMetrics = {}
    previousSales.forEach((sale) => {
  const itemsArr = Array.isArray(sale?.itens)
    ? sale.itens
    : sale?.itens && typeof sale.itens === 'object'
      ? Object.values(sale.itens)
      : Array.isArray(sale?.items)
        ? sale.items
        : sale?.items && typeof sale.items === 'object'
          ? Object.values(sale.items)
          : sale?.produtos && typeof sale.produtos === 'object'
            ? Object.values(sale.produtos)
            : []

  // Snapshot de itens
  const parsedPrev = []
  let sumPrevTotals = 0
  let sumPrevQty = 0
  itemsArr.forEach((item) => {
    const productName = (item?.tipoProduto || item?.produto || item?.name || "Produto sem nome").toString()
    let quantity = Number(item?.quantidade ?? item?.quantity ?? item?.qty)
    if (!Number.isFinite(quantity)) quantity = 0
    let price = Number(item?.preco ?? item?.price ?? item?.valorUnitario)
    if (!Number.isFinite(price)) price = 0
    const itemTotalRaw = Number(item?.valorTotal)
    const itemTotal = Number.isFinite(itemTotalRaw) && itemTotalRaw > 0 ? itemTotalRaw : quantity * price
    parsedPrev.push({ productName, quantity, itemTotal })
    sumPrevTotals += itemTotal
    sumPrevQty += quantity
  })

  const saleValuePrev = (Number(sale?.valorTotal) || Number(sale?.total) || 0) > 0
    ? (Number(sale?.valorTotal) || Number(sale?.total) || 0)
    : sumPrevTotals
  const factorPrev = sumPrevTotals > 0 && saleValuePrev > 0 ? (saleValuePrev / sumPrevTotals) : 0

  parsedPrev.forEach(({ productName, quantity, itemTotal }) => {
    let revenue = itemTotal
    if (saleValuePrev > 0) {
      if (factorPrev > 0) revenue = itemTotal * factorPrev
      else if (sumPrevQty > 0) revenue = saleValuePrev * (quantity / sumPrevQty)
    }

    if (!previousProductMetrics[productName]) {
      previousProductMetrics[productName] = { revenue: 0 }
    }
    previousProductMetrics[productName].revenue += revenue
  })
})const safraComparison = sortedByRevenue.slice(0, 10).map((product) => {
      const previousRevenue = previousProductMetrics[product.name]?.revenue || 0
      const growth = previousRevenue > 0 ? ((product.revenue - previousRevenue) / previousRevenue) * 100 : 0

      return {
        name: product.name,
        current: product.revenue,
        previous: previousRevenue,
        growth: growth.toFixed(1),
      }
    })

    setAnalytics({
      totalProducts: Object.keys(productMetrics).length,
      totalRevenue,
      avgPrice,
      topProduct: {
        name: topProduct.name,
        value: topProduct.revenue,
        quantity: topProduct.quantity,
      },
      revenueByProduct,
      priceEvolution,
      productMix,
      topClientsByProduct,
      safraComparison,
    })
  }, [salesData, period, priceYear])

  // Anos disponÃ­veis nas vendas (para o seletor do grÃ¡fico de preÃ§o)
  const priceYears = useMemo(() => {
    if (!salesData || salesData.length === 0) return []
    const yrs = new Set()
    salesData.forEach((s) => {
      const d = new Date(s.dataPedido || s.date || s.criadoEm)
      if (!isNaN(d.getTime())) yrs.add(d.getFullYear())
    })
    return Array.from(yrs).sort((a, b) => a - b)
  }, [salesData])

  const indicators = [
    {
      title: "Total de Produtos",
      value: analytics.totalProducts,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Receita Total",
      value: analytics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "PreÃ§o MÃ©dio",
      value: analytics.avgPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produto Mais Vendido",
      value: analytics.topProduct.name,
      subtitle: `${analytics.topProduct.quantity} unidades`,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard de Produtos</h2>
          <p className="text-gray-600">AnÃ¡lise de performance, mix de vendas e evoluÃ§Ã£o de preÃ§os</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "month" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            MÃªs
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
              <h3 className="text-xl font-bold text-gray-900 mb-1 truncate" title={indicator.value}>
                {indicator.value}
              </h3>
              <p className="text-gray-600 text-sm">{indicator.title}</p>
              {indicator.subtitle && <p className="text-gray-500 text-xs mt-1">{indicator.subtitle}</p>}
            </div>
          )
        })}
      </div>

      {/* Main Chart - Revenue by Product */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Receita por Produto (Top 20)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.revenueByProduct} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Price Evolution */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              EvoluÃ§Ã£o do PreÃ§o MÃ©dio
            </h3>
            <div className="flex items-center justify-end mb-2">
              <label htmlFor="priceYearProdutos" className="text-sm text-gray-600 mr-2">Ano:</label>
              <select
                id="priceYearProdutos"
                value={priceYear}
                onChange={(e) => setPriceYear(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {priceYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.priceEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Mix */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Mix de Vendas por Produto
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.productMix}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Clients by Product */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Top Clientes por Produto
            </h3>
            <div className="space-y-3">
              {analytics.topClientsByProduct.map((item, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.clientCount} clientes
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Receita:{" "}
                    <span className="font-bold text-[#25BE8C]">
                      {item.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Safra Comparison */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Comparativo de Safra
            </h3>
            <div className="space-y-3">
              {analytics.safraComparison.map((item, index) => {
                const isPositive = Number(item.growth) > 0
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-2">{item.name}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Atual</p>
                        <p className="font-bold text-[#25BE8C]">
                          {item.current.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Anterior</p>
                        <p className="font-bold text-gray-700">
                          {item.previous.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isPositive ? "â†‘" : "â†“"} {Math.abs(Number(item.growth))}%
                      </span>
                      <span className="text-xs text-gray-500">{isPositive ? "Crescimento" : "Queda"}</span>
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

export default DashboardProdutos