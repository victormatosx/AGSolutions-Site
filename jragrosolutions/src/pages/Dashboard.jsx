"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Leaf,
  Home,
  BarChart3,
  Settings,
  Users,
  Bell,
  Search,
  Menu,
  X,
  Thermometer,
  Droplets,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  LogOut,
} from "lucide-react"

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    {
      title: "Propriedades Ativas",
      value: "12",
      change: "+2 este mês",
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sensores Online",
      value: "48",
      change: "100% operacional",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Alertas Ativos",
      value: "3",
      change: "2 críticos",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Produtividade",
      value: "+18%",
      change: "vs mês anterior",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const recentAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Umidade do solo baixa - Setor A",
      time: "2 min atrás",
      property: "Fazenda São João",
    },
    {
      id: 2,
      type: "success",
      message: "Irrigação automática ativada",
      time: "15 min atrás",
      property: "Fazenda Santa Maria",
    },
    {
      id: 3,
      type: "critical",
      message: "Sensor de temperatura offline",
      time: "1 hora atrás",
      property: "Fazenda Boa Vista",
    },
  ]

  const sensorData = [
    {
      name: "Temperatura",
      value: "24°C",
      status: "normal",
      icon: Thermometer,
      color: "text-blue-600",
    },
    {
      name: "Umidade do Solo",
      value: "65%",
      status: "normal",
      icon: Droplets,
      color: "text-green-600",
    },
    {
      name: "pH do Solo",
      value: "6.8",
      status: "normal",
      icon: BarChart3,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">J.R. AgroSolutions</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            <a
              href="#"
              className="bg-green-50 text-green-700 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-700 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Relatórios
            </a>
            <a
              href="#"
              className="text-gray-700 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            >
              <Users className="w-5 h-5 mr-3" />
              Propriedades
            </a>
            <a
              href="#"
              className="text-gray-700 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            >
              <Settings className="w-5 h-5 mr-3" />
              Configurações
            </a>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-3 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JR</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600">Aqui está um resumo das suas propriedades e sensores.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Recentes</h3>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === "critical"
                          ? "bg-red-500"
                          : alert.type === "warning"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.property}</p>
                      <p className="text-xs text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status dos Sensores</h3>
              <div className="space-y-4">
                {sensorData.map((sensor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <sensor.icon className={`w-5 h-5 ${sensor.color}`} />
                      <span className="text-sm font-medium text-gray-800">{sensor.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-800">{sensor.value}</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-800">Gerar Relatório</h4>
                <p className="text-sm text-gray-600">Criar relatório personalizado</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Settings className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-800">Configurar Alertas</h4>
                <p className="text-sm text-gray-600">Personalizar notificações</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-800">Adicionar Propriedade</h4>
                <p className="text-sm text-gray-600">Cadastrar nova fazenda</p>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Dashboard
