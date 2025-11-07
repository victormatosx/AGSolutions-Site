"use client"

import { useState, useEffect, useMemo } from "react"
import { DollarSign, Users, TrendingUp, Package, MapPin, AlertCircle, Calendar, Award } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const DashboardVendas = ({ salesData, userData }) => {
  const [totalClients, setTotalClients] = useState(0)
  const [clients, setClients] = useState([
    { id: "c1", name: "João Silva", city: "São Paulo", state: "SP" },
    { id: "c2", name: "Maria Santos", city: "Rio de Janeiro", state: "RJ" },
    { id: "c3", name: "Pedro Costa", city: "Belo Horizonte", state: "MG" },
    { id: "c4", name: "Ana Paula", city: "Curitiba", state: "PR" },
    { id: "c5", name: "Carlos Oliveira", city: "Porto Alegre", state: "RS" },
    { id: "c6", name: "Fernanda Lima", city: "Salvador", state: "BA" },
  ])
  const [period, setPeriod] = useState("all") // all, month, quarter, year
  // Métrica do gráfico ABC de clientes: 'receita' ou 'ticket'
  const [abcMetric, setAbcMetric] = useState("receita")
  // Ano selecionado para Evolução de Preço Médio
  const [priceYear, setPriceYear] = useState(new Date().getFullYear())
  // Paginação para clientes inativos
  const [inactivePage, setInactivePage] = useState(1)
  // Modo do gráfico de evolução de preço: 'geral' ou 'produto'
  const [evolutionMode, setEvolutionMode] = useState('geral')
  const [selectedProducts, setSelectedProducts] = useState([])

  useEffect(() => {
    setTotalClients(clients.length)
  }, [clients])

  // Helper para obter o timestamp (ms) de uma venda
  const getSaleTimestampMs = (sale) => {
    if (!sale) return Number.NaN
    const fromNumberLike = (val) => {
      if (val == null || val === "") return Number.NaN
      if (typeof val === "number") {
        const s = String(val)
        return s.length <= 10 ? val * 1000 : val
      }
      const str = String(val).trim()
      let ms = Date.parse(str)
      if (!isNaN(ms)) return ms
      ms = Date.parse(str.replace(" ", "T"))
      return isNaN(ms) ? Number.NaN : ms
    }

    // dataPedido pode vir como DD/MM/YYYY (opcionalmente com hora) ou timestamp/ISO
    if (sale.dataPedido != null && sale.dataPedido !== "") {
      const val = sale.dataPedido
      if (typeof val === "number") return fromNumberLike(val)
      const str = String(val).trim()
      const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/)
      if (brMatch) {
        const [, d, m, y, time] = brMatch
        const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}${time ? "T" + time : "T00:00:00"}`
        const ms = Date.parse(iso)
        if (!isNaN(ms)) return ms
      }
      const parsed = fromNumberLike(str)
      if (!isNaN(parsed)) return parsed
    }

    // Fallbacks comuns
    const candidates = [sale.date, sale.criadoEm, sale.createdAt, sale.emissao]
    for (const c of candidates) {
      const ms = fromNumberLike(c)
      if (!isNaN(ms)) return ms
    }

    return Number.NaN
  }

  // Aplica filtro de período nas vendas (últimos 30/90/365 dias ou todo período)
  const filteredSales = useMemo(() => {
    if (!salesData || salesData.length === 0) return []
    const valid = salesData.filter((sale) => sale && sale.status?.toLowerCase() !== "cancelada")
    if (period === "all") return valid

    const days = period === "month" ? 30 : period === "quarter" ? 90 : period === "year" ? 365 : 0
    if (!days) return valid
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return valid.filter((s) => {
      const ms = getSaleTimestampMs(s)
      return !isNaN(ms) && ms >= cutoff
    })
  }, [salesData, period])

  // Anos disponíveis para o seletor do gráfico Evolução do Preço
  const priceYears = useMemo(() => {
    if (!salesData || salesData.length === 0) return []
    const yrs = new Set()
    salesData.forEach((s) => {
      const ms = getSaleTimestampMs(s)
      if (!isNaN(ms)) yrs.add(new Date(ms).getFullYear())
    })
    return Array.from(yrs).sort((a, b) => a - b)
  }, [salesData])

  const calculateClientAnalytics = () => {
    // Permite calcular mesmo sem a lista de clientes cadastrados (fallback para nome na venda)
    if (!filteredSales || filteredSales.length === 0) {
      return {
        totalRevenue: 0,
        activeClients: 0,
        avgTicket: 0,
        totalSales: 0,
        newClientsPercent: 0,
        abcCurve: [],
        abcCurveRevenue: [],
        abcCurveTicket: [],
        topClients: [],
        inactiveClients: [],
        clientProducts: [],
        lastPurchases: [],
      }
    }

    const validSales = filteredSales
    const totalRevenue = validSales.reduce((sum, sale) => sum + (Number(sale.valorTotal) || Number(sale.total) || 0), 0)
    const totalSales = validSales.length

    // Client revenue map
    const clientRevenue = {}
    const clientPurchaseCount = {}
    const clientLastPurchase = {}
    const nameByKey = {}

    validSales.forEach((sale) => {
      const clientId = sale.clientId || sale.clienteId
      // tentar mapear nome
      let clientName = null
      if (typeof sale?.cliente === "string" && sale.cliente.trim() !== "") clientName = sale.cliente
      else if (typeof sale?.clienteNome === "string" && sale.clienteNome.trim() !== "") clientName = sale.clienteNome
      else if (typeof sale?.clientName === "string" && sale.clientName.trim() !== "") clientName = sale.clientName
      else if (typeof sale?.nomeCliente === "string" && sale.nomeCliente.trim() !== "") clientName = sale.nomeCliente
      else if (sale?.cliente && typeof sale.cliente === "object" && sale.cliente.nome) clientName = sale.cliente.nome

      // gera chave: prioriza ID; fallback para nome normalizado
      let key = null
      if (clientId) key = `id:${clientId}`
      else if (clientName && clientName.trim() !== "") key = `name:${clientName.trim().toLowerCase()}`

      if (!key) return

      // nome de exibição: se ID, tenta achar no cadastro; senão usa o próprio nome
      if (!(key in nameByKey)) {
        if (clientId) {
          const found = clients?.find?.((c) => c.id === String(clientId))
          nameByKey[key] = found?.name || clientName || `Cliente ${clientId}`
        } else {
          nameByKey[key] = clientName?.trim() || "Cliente"
        }
      }

      const revenue = Number(sale.valorTotal) || Number(sale.total) || 0
      clientRevenue[key] = (clientRevenue[key] || 0) + revenue
      clientPurchaseCount[key] = (clientPurchaseCount[key] || 0) + 1

      const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm)
      if (!clientLastPurchase[key] || saleDate > clientLastPurchase[key]) {
        clientLastPurchase[key] = saleDate
      }
    })

    const activeClients = Object.keys(clientRevenue).length
    // Ticket Médio por venda = Receita Total / Número de Vendas
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    // Base agregada por cliente
    const clientAggregates = Object.entries(clientRevenue).map(([key, revenue]) => {
      const name = nameByKey[key] || "Cliente"
      const purchases = clientPurchaseCount[key] || 0
      const ticketMedio = purchases > 0 ? revenue / purchases : 0
      return { key, name, revenue, purchases, ticketMedio }
    })

    // Ordenações e Top 10
    const sortedByRevenue = [...clientAggregates].sort((a, b) => b.revenue - a.revenue)
    const sortedByTicket = [...clientAggregates].sort((a, b) => b.ticketMedio - a.ticketMedio)

    const abcCurveRevenue = sortedByRevenue.slice(0, 10).map((c) => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
      fullName: c.name,
      receita: c.revenue,
      purchases: c.purchases,
    }))

    const abcCurveTicket = sortedByTicket.slice(0, 10).map((c) => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
      fullName: c.name,
      ticketMedio: c.ticketMedio,
      purchases: c.purchases,
    }))

    // Mantém compatibilidade: abcCurve padrão por receita
    const abcCurve = abcCurveRevenue

    // Top 10 clients (por receita)
    const topClients = sortedByRevenue.slice(0, 10).map((c) => ({
      name: c.name,
      revenue: c.revenue,
      purchases: c.purchases,
    }))

    // Inactive clients (no purchase in 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // calcula inativos a partir das chaves observadas (IDs e nomes)
    // Inativos: somente clientes presentes nas vendas (sem considerar todos os cadastrados)
    const inactiveClients = Object.keys(clientLastPurchase)
      .map((key) => {
        const displayName = nameByKey[key] || (key.startsWith("id:") ? `Cliente ${key.slice(3)}` : "Cliente")
        const last = clientLastPurchase[key]
        if (!last) return null
        const daysSince = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
        return { name: displayName, last, daysSince }
      })
      .filter((c) => c && c.last < ninetyDaysAgo)
      .sort((a, b) => b.daysSince - a.daysSince)
      .map((c) => ({ name: c.name, lastPurchase: c.last.toLocaleDateString("pt-BR") }))

    // Helper para parsear dataPedido (formato DD/MM/YYYY ou timestamps)
    const parseDataPedidoMs = (value) => {
      if (value == null || value === "") return Number.NaN
      if (typeof value === "number") {
        const s = String(value)
        return s.length <= 10 ? value * 1000 : value
      }
      const str = String(value).trim()
      const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(.*))?$/)
      if (brMatch) {
        const [, d, m, y, time] = brMatch
        const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}${time ? "T" + time : "T00:00:00"}`
        const ms = Date.parse(iso)
        return isNaN(ms) ? Number.NaN : ms
      }
      let ms = Date.parse(str)
      if (!isNaN(ms)) return ms
      ms = Date.parse(str.replace(" ", "T"))
      return isNaN(ms) ? Number.NaN : ms
    }

    // Last purchases (5 últimas vendas), ordenadas por dataPedido
    const lastPurchases = validSales
      .map((sale) => {
        const ms = getSaleTimestampMs(sale)
        const total = Number(sale.valorTotal) || Number(sale.total) || 0
        let clientName = null
        if (typeof sale?.cliente === "string" && sale.cliente.trim() !== "") clientName = sale.cliente
        else if (typeof sale?.clienteNome === "string" && sale.clienteNome.trim() !== "") clientName = sale.clienteNome
        else if (typeof sale?.clientName === "string" && sale.clientName.trim() !== "") clientName = sale.clientName
        else if (typeof sale?.nomeCliente === "string" && sale.nomeCliente.trim() !== "") clientName = sale.nomeCliente
        else if (sale?.cliente && typeof sale.cliente === "object" && sale.cliente.nome) clientName = sale.cliente.nome
        if (!clientName && sale?.clientId) {
          const found = clients?.find?.((c) => c.id === String(sale.clientId) || c.id === sale.clientId)
          if (found?.name) clientName = found.name
        }
        return {
          id: sale.id,
          clientName: clientName || "Cliente",
          total,
          ms,
          date: isNaN(ms) ? "" : new Date(ms).toLocaleDateString("pt-BR"),
        }
      })
      .filter((p) => p.id && !isNaN(p.ms))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)

    return {
      totalRevenue,
      activeClients,
      avgTicket,
      totalSales,
      abcCurve,
      abcCurveRevenue,
      abcCurveTicket,
      topClients,
      inactiveClients,
      clientProducts: [],
      lastPurchases,
    }
  }

  const calculateProductAnalytics = () => {
    if (!filteredSales || filteredSales.length === 0) {
      return {
        totalProducts: 0,
        totalRevenue: 0,
        avgPrice: 0,
        topProduct: "N/A",
        revenueByProduct: [],
        priceEvolution: [],
        productMix: [],
        topClientsByProduct: [],
      }
    }

    const validSales = filteredSales
    const productRevenue = {}
    const productQuantity = {}
    const productPrices = {}

    const iterateItems = (sale) => {
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
      itemsArr.forEach((item) => {
        const productName = (item?.tipoProduto || item?.produto || item?.name || 'Produto').toString()
        const quantity = Number(item?.quantidade ?? item?.quantity ?? item?.qty ?? 0) || 0
        const price = Number(item?.preco ?? item?.price ?? item?.valorUnitario ?? 0) || 0
        const revenue = quantity * price

        productRevenue[productName] = (productRevenue[productName] || 0) + revenue
        productQuantity[productName] = (productQuantity[productName] || 0) + quantity

        if (!productPrices[productName]) {
          productPrices[productName] = []
        }
        productPrices[productName].push(price)
      })
    }

    validSales.forEach(iterateItems)

    const totalProducts = Object.keys(productRevenue).length
    const totalRevenue = Object.values(productRevenue).reduce((sum, rev) => sum + rev, 0)
    // Preço médio por produto: média das médias de cada produto (receita do produto / quantidade do produto)
    const perProductAverages = Object.keys(productRevenue).map((p) => {
      const qty = productQuantity[p] || 0
      const rev = productRevenue[p] || 0
      return qty > 0 ? rev / qty : 0
    })
    const avgPrice = perProductAverages.length > 0
      ? perProductAverages.reduce((a, b) => a + b, 0) / perProductAverages.length
      : 0

    // Mais vendido: produto com maior quantidade vendida (soma das unidades)
    const topProduct = Object.entries(productQuantity)
      .sort(([, aQty], [, bQty]) => bQty - aQty)[0]?.[0] || "N/A"

    // Revenue by product (top 20)
    const revenueByProduct = Object.entries(productRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([product, revenue]) => ({
        produto: product.length > 20 ? product.substring(0, 20) + "..." : product,
        receita: revenue,
      }))

    // Product mix (pie chart)
    const productMix = Object.entries(productRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([product, revenue]) => ({
        name: product.length > 15 ? product.substring(0, 15) + "..." : product,
        value: revenue,
      }))

    // Price evolution (média de preços por mês no ano selecionado)
    const monthsLabels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    const priceHistoryAll = {}
    const priceHistoryByProduct = {}
    ;(salesData || []).forEach((sale) => {
      if (!sale || sale.status?.toLowerCase() === 'cancelada') return
      const ms = getSaleTimestampMs(sale)
      if (isNaN(ms)) return
      const d = new Date(ms)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const monthKey = `${y}-${m}`
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
      itemsArr.forEach((item) => {
        const price = Number(item?.preco ?? item?.price ?? item?.valorUnitario ?? 0) || 0
        if (!priceHistoryAll[monthKey]) priceHistoryAll[monthKey] = { total: 0, count: 0, year: y, month: Number(m) }
        priceHistoryAll[monthKey].total += price
        priceHistoryAll[monthKey].count += 1

        const prodName = (item?.tipoProduto || item?.produto || item?.name || 'Produto').toString()
        if (!priceHistoryByProduct[prodName]) priceHistoryByProduct[prodName] = {}
        if (!priceHistoryByProduct[prodName][monthKey]) priceHistoryByProduct[prodName][monthKey] = { total: 0, count: 0 }
        priceHistoryByProduct[prodName][monthKey].total += price
        priceHistoryByProduct[prodName][monthKey].count += 1
      })
    })
    const priceEvolution = monthsLabels.map((label, idx) => {
      const key = `${priceYear}-${String(idx + 1).padStart(2,'0')}`
      const rec = priceHistoryAll[key]
      const avg = rec && rec.count > 0 ? rec.total / rec.count : 0
      return { mes: label, preco: avg }
    })

    // Evolução por produto (média mensal do preço unitário)
    const productNames = Object.keys(priceHistoryByProduct)
    const priceEvolutionByProduct = {}
    productNames.forEach((p) => {
      priceEvolutionByProduct[p] = monthsLabels.map((label, idx) => {
        const key = `${priceYear}-${String(idx + 1).padStart(2,'0')}`
        const rec = priceHistoryByProduct[p][key]
        const avg = rec && rec.count > 0 ? rec.total / rec.count : 0
        return { mes: label, preco: avg }
      })
    })

    return {
      totalProducts,
      totalRevenue,
      avgPrice,
      topProduct,
      revenueByProduct,
      priceEvolution,
      priceEvolutionByProduct,
      productNames,
      productMix,
      topClientsByProduct: [],
    }
  }

  const calculateRegionAnalytics = () => {
    if (!filteredSales || filteredSales.length === 0 || !clients || clients.length === 0) {
      return {
        revenueByRegion: [],
        clientsByRegion: [],
        avgTicketByRegion: [],
        topRegions: [],
        topProductsByRegion: [],
      }
    }

    const validSales = filteredSales
    const regionRevenue = {}
    const regionClients = {}

    validSales.forEach((sale) => {
      const clientId = sale.clientId || sale.clienteId
      const client = clients.find((c) => c.id === clientId)
      const region = client?.state || "Não informado"

      const revenue = Number(sale.valorTotal) || Number(sale.total) || 0
      regionRevenue[region] = (regionRevenue[region] || 0) + revenue

      if (!regionClients[region]) {
        regionClients[region] = new Set()
      }
      regionClients[region].add(clientId)
    })

    // Revenue by region
    const revenueByRegion = Object.entries(regionRevenue)
      .sort(([, a], [, b]) => b - a)
      .map(([region, revenue]) => ({
        regiao: region,
        faturamento: revenue,
      }))

    // Clients by region
    const clientsByRegion = Object.entries(regionClients).map(([region, clientSet]) => ({
      regiao: region,
      clientes: clientSet.size,
    }))

    // Avg ticket by region
    const avgTicketByRegion = Object.entries(regionRevenue).map(([region, revenue]) => ({
      regiao: region,
      ticket: regionClients[region] ? revenue / regionClients[region].size : 0,
    }))

    // Top regions
    const topRegions = revenueByRegion.slice(0, 5)

    return {
      revenueByRegion,
      clientsByRegion,
      avgTicketByRegion,
      topRegions,
      topProductsByProductByRegion: [],
    }
  }

  const clientAnalytics = calculateClientAnalytics()
  // Ajusta página quando a lista muda
  useEffect(() => {
    const total = clientAnalytics?.inactiveClients?.length || 0
    const pages = Math.max(1, Math.ceil(total / 5))
    if (inactivePage > pages) setInactivePage(pages)
  }, [clientAnalytics?.inactiveClients?.length])
  const productAnalytics = calculateProductAnalytics()
  const regionAnalytics = calculateRegionAnalytics()

  const COLORS = ["#25BE8C", "#2a9d8f", "#3b82f6", "#8b5cf6", "#f59e0b"]
  // Dados do gráfico de evolução conforme modo/seleção
  const priceEvolutionChartData = useMemo(() => {
    if (evolutionMode === 'produto') {
      const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
      const data = months.map((mes, idx) => {
        const row = { mes }
        selectedProducts.forEach((p) => {
          const serie = productAnalytics.priceEvolutionByProduct?.[p]
          row[p] = Array.isArray(serie) ? (serie[idx]?.preco ?? 0) : 0
        })
        return row
      })
      return data
    }
    return productAnalytics.priceEvolution
  }, [evolutionMode, selectedProducts, productAnalytics.priceEvolution, productAnalytics.priceEvolutionByProduct])
  const INACTIVE_PAGE_SIZE = 5
  const inactiveTotal = clientAnalytics?.inactiveClients?.length || 0
  const inactiveTotalPages = Math.max(1, Math.ceil(inactiveTotal / INACTIVE_PAGE_SIZE))
  const inactivePageSafe = Math.min(inactivePage, inactiveTotalPages)
  const inactiveStart = (inactivePageSafe - 1) * INACTIVE_PAGE_SIZE
  const inactiveSlice = clientAnalytics?.inactiveClients?.slice(inactiveStart, inactiveStart + INACTIVE_PAGE_SIZE) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Analítico de Vendas</h2>
          <p className="text-gray-600">Análise completa de clientes, produtos e regiões</p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setPeriod("month")}
            className={`order-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "month" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod("quarter")}
            className={`order-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "quarter" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`order-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "year" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ano
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`order-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              period === "all" ? "bg-[#25BE8C] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todo Período
          </button>
        </div>
      </div>

      {/* ========== SEÇÃO: ANÁLISE DE CLIENTES ========== */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Análise de Clientes</h3>
            <p className="text-gray-600">Curva ABC, ranking e comportamento de compra</p>
          </div>
        </div>

        {/* Client KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-green-600">+8%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{clientAnalytics.activeClients}</p>
            <p className="text-sm text-gray-600">Clientes Ativos</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{clientAnalytics.totalSales}</p>
            <p className="text-sm text-gray-600">Número de Vendas</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-green-600">+12%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {clientAnalytics.avgTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-sm text-gray-600">Ticket Médio</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-green-600">+15%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {clientAnalytics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-sm text-gray-600">Receita Total</p>
          </div>
        </div>

        {/* Client Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* ABC Curve - ocupa largura total */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Curva ABC de Clientes (Top 10)</h4>
              <div className="flex items-center gap-2">
                <label htmlFor="abcMetric" className="text-sm text-gray-600">
                  Métrica:
                </label>
                <select
                  id="abcMetric"
                  value={abcMetric}
                  onChange={(e) => setAbcMetric(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="receita">Receita Total</option>
                  <option value="ticket">Ticket Médio por Compra</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={abcMetric === "ticket" ? clientAnalytics.abcCurveTicket : clientAnalytics.abcCurveRevenue}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="abcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  domain={abcMetric === "ticket" ? [0, 1000000] : [0, 5000000]}
                  ticks={
                    abcMetric === "ticket"
                      ? [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000]
                      : [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000, 4500000, 5000000]
                  }
                  width={100}
                  tickFormatter={(v) =>
                    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
                  }
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  labelFormatter={(label, payload) => {
                    const p = payload && payload[0]
                    if (p && p.payload) {
                      const name = p.payload.fullName || label
                      const vendas = typeof p.payload.purchases === "number" ? p.payload.purchases : undefined
                      return vendas != null ? `${name} - ${vendas} vendas` : name
                    }
                    return label
                  }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                {/* Removido LabelList para evitar sobreposição de valores grandes; usar Tooltip */}
                <Bar
                  dataKey={abcMetric === "ticket" ? "ticketMedio" : "receita"}
                  fill="url(#abcGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Removido: Top 10 Clientes */}
        </div>

        {/* Inactive Clients & Last Purchases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Inactive Clients */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-bold text-gray-900">Clientes Inativos (90+ dias)</h4>
            </div>
            <div className="space-y-2">
              {inactiveSlice.length > 0 ? (
                inactiveSlice.map((client, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_160px] items-center p-3 bg-red-50 rounded-lg border border-red-200 gap-3"
                  >
                    <p className="text-sm font-medium text-gray-900">{client.name}</p>
                    <div className="text-right w-40">
                      <p className="text-xs text-red-600 font-medium">Última Venda:</p>
                      <p className="text-xs text-red-700 font-semibold">{client.lastPurchase}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum cliente inativo</p>
              )}
            </div>
          </div>

          {/* Last Purchases */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-bold text-gray-900">Últimas Compras</h4>
            </div>
            <div className="space-y-2">
              {clientAnalytics.lastPurchases.map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{purchase.clientName}</p>
                    <p className="text-xs text-gray-500">
                      ID: {purchase.id} • Data: {purchase.date}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#25BE8C]">
                    {purchase.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== SEÇÃO: ANÁLISE DE PRODUTOS ========== */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border-2 border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Análise de Produtos</h3>
            <p className="text-gray-600">Performance, mix de vendas e evolução de preços</p>
          </div>
        </div>

        {/* Product KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-green-600">+10%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{productAnalytics.totalProducts}</p>
            <p className="text-sm text-gray-600">Produtos Vendidos</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-green-600">+18%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {productAnalytics.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-sm text-gray-600">Receita Total</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-green-600">+5%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {productAnalytics.avgPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-sm text-gray-600">Preço Médio</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{productAnalytics.topProduct}</p>
            <p className="text-sm text-gray-600">Mais Vendido</p>
          </div>
        </div>

        {/* Product Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Product */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productAnalytics.revenueByProduct} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="produto" type="category" width={150} />
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Bar dataKey="receita" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Mix */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productAnalytics.productMix}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productAnalytics.productMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Evolution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">Evolução do Preço Médio</h4>
            <div className="flex items-center gap-2">
              <label htmlFor="priceYear" className="text-sm text-gray-600">Ano:</label>
              <select
                id="priceYear"
                value={priceYear}
                onChange={(e) => setPriceYear(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {priceYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={productAnalytics.priceEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
              <Legend />
              <Line type="monotone" dataKey="preco" stroke="#25BE8C" strokeWidth={2} name="Preço Médio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========== SEÇÃO: ANÁLISE DE REGIÕES ========== */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#25BE8C] rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Análise de Regiões</h3>
            <p className="text-gray-600">Faturamento geográfico e crescimento regional</p>
          </div>
        </div>

        {/* Region Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Region */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionAnalytics.revenueByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regiao" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Bar dataKey="faturamento" fill="#25BE8C" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clients by Region */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionAnalytics.clientsByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regiao" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" fill="#2a9d8f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Regions Table */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Posição</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Região</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Faturamento</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Crescimento</th>
                </tr>
              </thead>
              <tbody>
                {regionAnalytics.topRegions.map((region, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="w-8 h-8 bg-[#25BE8C] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{region.regiao}</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-[#25BE8C]">
                      {region.faturamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right text-green-600">
                      +{(Math.random() * 20).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardVendas

