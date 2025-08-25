import { useState, useEffect } from "react"
import { DollarSign, Users, Package, Target, TrendingUp, Calendar } from 'lucide-react'

const DashboardVendas = ({ salesData }) => {
  const [stats, setStats] = useState([
    {
      title: "Vendas do Mês",
      value: "R$ 0,00",
      change: "0%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clientes Ativos",
      value: "0",
      change: "0%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produtos Vendidos",
      value: "0",
      change: "0%",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Meta do Mês",
      value: "0%",
      change: "0%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ])

  useEffect(() => {
    if (salesData) {
      // Calcular estatísticas baseadas nos dados reais
      const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0)
      const uniqueClients = new Set(salesData.map(sale => sale.clientId)).size
      const totalProducts = salesData.reduce((sum, sale) => sum + sale.quantity, 0)
      const monthGoal = 50000 // Meta mensal exemplo
      const goalPercentage = Math.round((totalSales / monthGoal) * 100)

      setStats([
        {
          ...stats[0],
          value: `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: "+12%"
        },
        {
          ...stats[1],
          value: uniqueClients.toString(),
          change: "+8%"
        },
        {
          ...stats[2],
          value: totalProducts.toString(),
          change: "+15%"
        },
        {
          ...stats[3],
          value: `${goalPercentage}%`,
          change: "+5%"
        }
      ])
    }
  }, [salesData])

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h2>
        <p className="text-gray-600">Acompanhe o desempenho das suas vendas em tempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Sales Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Vendas dos Últimos 7 Dias
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de vendas será implementado aqui</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardVendas
