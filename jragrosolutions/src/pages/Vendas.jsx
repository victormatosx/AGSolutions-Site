"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, database } from "../firebase/firebase"
import { ref, get } from "firebase/database"
import { useNavigate } from "react-router-dom"
import HeaderVendas from "../components/HeaderVendas"
import { ShoppingCart, TrendingUp, Users, DollarSign, Package, BarChart3, Calendar, Target } from "lucide-react"

const Vendas = () => {
  const [user, loading, error] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const navigate = useNavigate()

  // Verificar se o usuário está logado e tem permissão
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) {
        navigate("/login")
        return
      }

      try {
        // Buscar dados do usuário
        const propriedadesRef = ref(database, "propriedades")
        const propriedadesSnapshot = await get(propriedadesRef)

        if (propriedadesSnapshot.exists()) {
          const propriedades = propriedadesSnapshot.val()
          let foundUserData = null

          // Percorrer todas as propriedades para encontrar o usuário
          for (const [propriedadeName, propriedadeData] of Object.entries(propriedades)) {
            if (propriedadeData.users && propriedadeData.users[user.uid]) {
              foundUserData = {
                ...propriedadeData.users[user.uid],
                propriedade: propriedadeName,
              }
              break
            }
          }

          if (foundUserData) {
            if (foundUserData.role !== "seller") {
              // Usuário não tem permissão de vendedor
              await auth.signOut()
              navigate("/login")
              return
            }
            setUserData(foundUserData)
          } else {
            // Usuário não encontrado
            await auth.signOut()
            navigate("/login")
          }
        }
      } catch (error) {
        console.error("Erro ao verificar acesso:", error)
        await auth.signOut()
        navigate("/login")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!loading) {
      checkUserAccess()
    }
  }, [user, loading, navigate])

  // Dados mockados para demonstração
  const salesStats = [
    {
      title: "Vendas do Mês",
      value: "R$ 45.230",
      change: "+12%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clientes Ativos",
      value: "127",
      change: "+8%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produtos Vendidos",
      value: "89",
      change: "+15%",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Meta do Mês",
      value: "78%",
      change: "+5%",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <ShoppingCart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Carregando painel de vendas</h3>
          <p className="text-slate-500">Aguarde enquanto preparamos seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <HeaderVendas />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Vendas</h1>
            <p className="text-gray-600">
              Bem-vindo, {userData?.name || user?.email}! Gerencie suas vendas e acompanhe seu desempenho.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {salesStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
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

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Nova Venda */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nova Venda</h3>
              <p className="text-gray-600 mb-4">Registre uma nova venda e acompanhe o progresso.</p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Iniciar Venda
              </button>
            </div>

            {/* Relatórios */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
              <p className="text-gray-600 mb-4">Visualize relatórios detalhados de suas vendas.</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Ver Relatórios
              </button>
            </div>

            {/* Agenda */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agenda</h3>
              <p className="text-gray-600 mb-4">Gerencie seus compromissos e visitas.</p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Ver Agenda
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Atividade Recente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Venda para João Silva</p>
                  <p className="text-sm text-gray-600">Produto: Fertilizante Premium - R$ 1.250,00</p>
                </div>
                <span className="text-sm text-gray-500">Hoje, 14:30</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Reunião com Maria Santos</p>
                  <p className="text-sm text-gray-600">Apresentação de novos produtos</p>
                </div>
                <span className="text-sm text-gray-500">Ontem, 16:00</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Venda para Fazenda Esperança</p>
                  <p className="text-sm text-gray-600">Produto: Sementes Híbridas - R$ 3.500,00</p>
                </div>
                <span className="text-sm text-gray-500">2 dias atrás</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Vendas
