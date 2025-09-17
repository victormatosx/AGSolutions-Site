"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, database } from "../firebase/firebase"
import { ref, get } from "firebase/database"
import { useNavigate } from "react-router-dom"
import HeaderVendas from "../components/HeaderVendas"
import {
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Target,
  Plus,
  List,
  Home,
  UserPlus,
  Loader2,
  Menu,
} from "lucide-react"

// Componentes para as diferentes seções
const DASHBOARD = "dashboard"
const NEW_SALE = "newSale"
const SALES_LIST = "salesList"
const REPORTS = "reports"
const CLIENTS = "clients"

const Vendas = () => {
  const [user, loading, error] = useAuthState(auth)
  const [userData, setUserData] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeSection, setActiveSection] = useState(DASHBOARD)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [sales, setSales] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [preselectedSaleForPDF, setPreselectedSaleForPDF] = useState(null)
  const navigate = useNavigate()

  // Fetch sales and clients data
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.propriedade) return

      try {
        // Fetch sales
        const salesRef = ref(database, `propriedades/${userData.propriedade}/vendas`)
        const salesSnapshot = await get(salesRef)
        if (salesSnapshot.exists()) {
          const salesData = Object.entries(salesSnapshot.val()).map(([id, sale]) => ({
            id,
            ...sale,
            clientId: sale.clienteId || sale.clientId,
            date: sale.dataCarregamento || sale.date,
            total: Number(sale.valorTotal) || Number(sale.total) || 0,
            paymentMethod: sale.formaPagamento || sale.paymentMethod || "Não informado",
          }))
          setSales(salesData)
        }

        // Fetch clients
        const clientsRef = ref(database, `propriedades/${userData.propriedade}/clientes`)
        const clientsSnapshot = await get(clientsRef)
        console.log("Clients snapshot:", clientsSnapshot.val()) // Debug log

        if (clientsSnapshot.exists()) {
          const clientsData = []
          const clientsObj = clientsSnapshot.val()

          // Handle both array and object formats
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
            // Handle object format
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

          console.log("Processed clients:", clientsData) // Debug log
          setClients(clientsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userData?.propriedade) {
      fetchData()
    }
  }, [userData])

  // Dynamic imports with React.lazy
  const DashboardVendas = lazy(() => import("../components/DashboardVendas"))
  const SaleForm = lazy(() => import("../components/SaleForm"))
  const SalesList = lazy(() => import("../components/SalesList"))
  const ReportsSection = lazy(() => import("../components/ReportsSection"))
  const ClientForm = lazy(() => import("../components/ClientForm"))

  // Loading component for Suspense
  const LoadingFallback = () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const handleGeneratePDF = (sale) => {
    setPreselectedSaleForPDF(sale.id)
    setActiveSection(REPORTS)
  }

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

  // Dados mockados
  // Navigation items
  const navItems = [
    { id: DASHBOARD, label: "Dashboard", icon: Home },
    { id: NEW_SALE, label: "Nova Venda", icon: Plus },
    { id: SALES_LIST, label: "Vendas", icon: List },
    { id: REPORTS, label: "Relatórios", icon: BarChart3 },
    { id: CLIENTS, label: "Clientes", icon: UserPlus },
  ]

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

  const renderSection = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          switch (activeSection) {
            case DASHBOARD:
              return <DashboardVendas userData={userData} salesData={sales} />
            case NEW_SALE:
              return <SaleForm onSuccess={() => setActiveSection(SALES_LIST)} userData={userData} />
            case SALES_LIST:
              return <SalesList onGeneratePDF={handleGeneratePDF} />
            case REPORTS:
              return isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <ReportsSection
                  sales={sales}
                  clients={clients}
                  propertyName={userData?.propriedade}
                  preselectedSaleId={preselectedSaleForPDF}
                />
              )
            case CLIENTS:
              return <ClientForm />
            default:
              return <DashboardVendas userData={userData} salesData={sales} />
          }
        })()}
      </Suspense>
    )
  }

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
      <HeaderVendas
        onSectionChange={setActiveSection}
        activeSection={activeSection}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
        onCloseMenu={() => setShowMobileMenu(false)}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="pt-24 pb-20 md:pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {activeSection === DASHBOARD && "Visão Geral"}
                {activeSection === NEW_SALE && "Nova Venda"}
                {activeSection === SALES_LIST && "Lista de Vendas"}
                {activeSection === REPORTS && "Relatórios"}
                {activeSection === CLIENTS && "Clientes"}
              </h1>
              <p className="text-gray-600">Bem-vindo, {userData?.name || user?.email?.split("@")[0]}!</p>
            </div>

            {activeSection !== DASHBOARD && (
              <button
                onClick={() => {
                  setPreselectedSaleForPDF(null)
                  setActiveSection(DASHBOARD)
                }}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Voltar para o Dashboard
              </button>
            )}
          </div>

          {/* Render the active section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">{renderSection()}</div>

          {/* Quick Actions - Only show on dashboard */}
          {activeSection === DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={() => setActiveSection(NEW_SALE)}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nova Venda</h3>
                <p className="text-gray-600">Registre uma nova venda</p>
              </button>

              <button
                onClick={() => setActiveSection(SALES_LIST)}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <List className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendas</h3>
                <p className="text-gray-600">Visualize todas as vendas</p>
              </button>

              <button
                onClick={() => setActiveSection(REPORTS)}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
                <p className="text-gray-600">Acesse relatórios detalhados</p>
              </button>

              <button
                onClick={() => setActiveSection(CLIENTS)}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Clientes</h3>
                <p className="text-gray-600">Gerencie seus clientes</p>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Vendas
