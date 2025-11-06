"use client"

import { useState, useEffect } from "react"
import { MapPin, DollarSign, Users, TrendingUp, Package, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const DashboardRegioes = ({ salesData, userData }) => {
  const [period, setPeriod] = useState("month")
  const [analytics, setAnalytics] = useState({
    totalRegions: 0,
    totalRevenue: 0,
    avgTicketByRegion: 0,
    regionRanking: [],
    clientsByRegion: [],
    topProductsByRegion: [],
    regionalGrowth: [],
    revenueMap: [],
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

    // Region metrics
    const regionMetrics = {}
    const regionClients = {}
    const regionProducts = {}

    validSales.forEach((sale) => {
      // Extract region from sale data (cidade, estado, or região)
      const region = sale.cidade || sale.estado || sale.regiao || sale.region || "Não informado"
      const clientId = sale.clientId || sale.clienteId
      const revenue = Number(sale.valorTotal) || Number(sale.total) || 0

      if (!regionMetrics[region]) {
        regionMetrics[region] = {
          name: region,
          revenue: 0,
          sales: 0,
        }
      }

      regionMetrics[region].revenue += revenue
      regionMetrics[region].sales += 1

      // Track clients by region
      if (!regionClients[region]) {
        regionClients[region] = new Set()
      }
      if (clientId) {
        regionClients[region].add(clientId)
      }

      // Track products by region
      if (sale.produtos) {
        if (!regionProducts[region]) {
          regionProducts[region] = {}
        }
        Object.values(sale.produtos).forEach((product) => {
          const productName = product.nome || product.name || "Produto sem nome"
          if (!regionProducts[region][productName]) {
            regionProducts[region][productName] = 0
          }
          regionProducts[region][productName] += Number(product.quantidade) || 0
        })
      }
    })

    // Calculate metrics
    const totalRevenue = Object.values(regionMetrics).reduce((sum, r) => sum + r.revenue, 0)
    const totalRegions = Object.keys(regionMetrics).length

    // Add client count to region metrics
    Object.keys(regionMetrics).forEach((region) => {
      regionMetrics[region].clientCount = regionClients[region]?.size || 0
      regionMetrics[region].avgTicket =
        regionMetrics[region].clientCount > 0 ? regionMetrics[region].revenue / regionMetrics[region].clientCount : 0
    })

    const avgTicketByRegion = Object.values(regionMetrics).reduce((sum, r) => sum + r.avgTicket, 0) / totalRegions || 0

    // Region ranking
    const regionRanking = Object.values(regionMetrics)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((r) => ({
        ...r,
        percentage: ((r.revenue / totalRevenue) * 100).toFixed(1),
      }))

    // Clients by region
    const clientsByRegion = Object.values(regionMetrics)
      .sort((a, b) => b.clientCount - a.clientCount)
      .slice(0, 10)

    // Top products by region
    const topProductsByRegion = Object.entries(regionProducts)
      .slice(0, 5)
      .map(([region, products]) => {
        const sortedProducts = Object.entries(products)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, quantity]) => ({ name, quantity }))

        return {
          region,
          products: sortedProducts,
        }
      })

    // Regional growth (compare with previous period)
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

    const previousRegionMetrics = {}
    previousSales.forEach((sale) => {
      const region = sale.cidade || sale.estado || sale.regiao || sale.region || "Não informado"
      const revenue = Number(sale.valorTotal) || Number(sale.total) || 0

      if (!previousRegionMetrics[region]) {
        previousRegionMetrics[region] = { revenue: 0 }
      }
      previousRegionMetrics[region].revenue += revenue
    })

    const regionalGrowth = regionRanking.map((region) => {
      const previousRevenue = previousRegionMetrics[region.name]?.revenue || 0
      const growth = previousRevenue > 0 ? ((region.revenue - previousRevenue) / previousRevenue) * 100 : 0

      return {
        name: region.name,
        current: region.revenue,
        previous: previousRevenue,
        growth: growth.toFixed(1),
      }
    })

    // Revenue map data (for visualization)
    const COLORS = ["#25BE8C", "#2a9d8f", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"]
    const revenueMap = regionRanking.map((region, index) => ({
      ...region,
      color: COLORS[index % COLORS.length],
    }))

    setAnalytics({
      totalRegions,
      totalRevenue,
      avgTicketByRegion,
      regionRanking,
      clientsByRegion,
      topProductsByRegion,
      regionalGrowth,
      revenueMap,
    })
  }, [salesData, period])

  const indicators = [
    {
      title: "Receita Total",
      value: analytics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Regiões Ativas",
      value: analytics.totalRegions,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ticket Médio Regional",
      value: analytics.avgTicketByRegion.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard de Regiões</h2>
          <p className="text-gray-600">Análise geográfica de vendas e crescimento regional</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          )
        })}
      </div>

      {/* Map Visualization (Simulated with Bar Chart) */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#25BE8C]" />
          Mapa de Faturamento por Região
        </h3>
        <p className="text-gray-600 text-sm mb-6">Visualização do volume de vendas por localização</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.revenueMap}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
              {analytics.revenueMap.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Region Ranking */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#25BE8C]" />
              Ranking de Regiões por Faturamento
            </h3>
            <div className="space-y-3">
              {analytics.regionRanking.map((region, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#25BE8C] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{region.name}</p>
                      <p className="text-xs text-gray-500">{region.sales} vendas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#25BE8C]">
                      {region.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    <p className="text-xs text-gray-500">{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clients by Region */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Clientes por Região
            </h3>
            <div className="space-y-3">
              {analytics.clientsByRegion.map((region, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{region.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Ticket médio: {region.avgTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {region.clientCount} clientes
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Products by Region */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Produtos Mais Vendidos por Região
            </h3>
            <div className="space-y-4">
              {analytics.topProductsByRegion.map((item, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-semibold text-gray-900 mb-3">{item.region}</p>
                  <div className="space-y-2">
                    {item.products.map((product, pIndex) => (
                      <div key={pIndex} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{product.name}</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-purple-700 border border-purple-200">
                          {product.quantity} un.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Growth */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Crescimento Regional
            </h3>
            <div className="space-y-3">
              {analytics.regionalGrowth.slice(0, 5).map((item, index) => {
                const isPositive = Number(item.growth) > 0
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-2">{item.name}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isPositive ? "↑" : "↓"} {Math.abs(Number(item.growth))}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {isPositive ? "Crescimento" : "Queda"} vs período anterior
                      </span>
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

export default DashboardRegioes
