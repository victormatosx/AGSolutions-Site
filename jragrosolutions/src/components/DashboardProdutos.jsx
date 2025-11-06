"use client"

import { useState, useEffect } from "react"
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
      if (!sale || sale.status?.toLowerCase() === "cancelada") return false
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      return !isNaN(saleDate.getTime()) && saleDate >= startDate
    })

    // Product metrics
    const productMetrics = {}
    const productPriceHistory = {}
    const productClients = {}

    validSales.forEach((sale) => {
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`

      if (sale.produtos) {
        Object.values(sale.produtos).forEach((product) => {
          const productName = product.nome || product.name || "Produto sem nome"
          const quantity = Number(product.quantidade) || 0
          const price = Number(product.preco) || Number(product.price) || 0
          const revenue = quantity * price
          const clientId = sale.clientId || sale.clienteId

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
          productMetrics[productName].priceSum += price
          productMetrics[productName].priceCount += 1

          // Price history
          if (!productPriceHistory[monthKey]) {
            productPriceHistory[monthKey] = { month: monthKey, totalPrice: 0, count: 0 }
          }
          productPriceHistory[monthKey].totalPrice += price
          productPriceHistory[monthKey].count += 1

          // Product clients
          if (!productClients[productName]) {
            productClients[productName] = new Set()
          }
          if (clientId) {
            productClients[productName].add(clientId)
          }
        })
      }
    })

    // Calculate metrics
    Object.values(productMetrics).forEach((product) => {
      product.avgPrice = product.priceCount > 0 ? product.priceSum / product.priceCount : 0
    })

    const totalRevenue = Object.values(productMetrics).reduce((sum, p) => sum + p.revenue, 0)
    const totalQuantity = Object.values(productMetrics).reduce((sum, p) => sum + p.quantity, 0)
    const avgPrice =
      Object.values(productMetrics).reduce((sum, p) => sum + p.avgPrice, 0) / Object.keys(productMetrics).length || 0

    // Top product
    const sortedByRevenue = Object.values(productMetrics).sort((a, b) => b.revenue - a.revenue)
    const topProduct = sortedByRevenue[0] || { name: "-", revenue: 0, quantity: 0 }

    // Revenue by product (top 20)
    const revenueByProduct = sortedByRevenue.slice(0, 20)

    // Price evolution
    const priceEvolution = Object.values(productPriceHistory)
      .map((item) => ({
        month: item.month,
        avgPrice: item.count > 0 ? item.totalPrice / item.count : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

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
      if (!sale || sale.status?.toLowerCase() === "cancelada") return false
      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      return !isNaN(saleDate.getTime()) && saleDate >= previousStartDate && saleDate < startDate
    })

    const previousProductMetrics = {}
    previousSales.forEach((sale) => {
      if (sale.produtos) {
        Object.values(sale.produtos).forEach((product) => {
          const productName = product.nome || product.name || "Produto sem nome"
          const quantity = Number(product.quantidade) || 0
          const price = Number(product.preco) || Number(product.price) || 0
          const revenue = quantity * price

          if (!previousProductMetrics[productName]) {
            previousProductMetrics[productName] = { revenue: 0 }
          }
          previousProductMetrics[productName].revenue += revenue
        })
      }
    })

    const safraComparison = sortedByRevenue.slice(0, 10).map((product) => {
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
  }, [salesData, period])

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
      title: "Preço Médio",
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
          <p className="text-gray-600">Análise de performance, mix de vendas e evolução de preços</p>
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
              Evolução do Preço Médio
            </h3>
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
                        {isPositive ? "↑" : "↓"} {Math.abs(Number(item.growth))}%
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
