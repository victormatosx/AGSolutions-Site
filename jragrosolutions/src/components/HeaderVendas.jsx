"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { useNavigate } from "react-router-dom"
import { Menu, X, LogOut, ShoppingCart, Home, BarChart2, List, UserPlus, Plus } from "lucide-react"
import logoVerde from "../assets/logoVerde.png"

const HeaderVendas = ({ 
  onSectionChange, 
  activeSection,
  onMenuToggle,
  showMobileMenu,
  onCloseMenu
}) => {
  const [user, loading, error] = useAuthState(auth)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const navigate = useNavigate()

  // Effect to handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scrolled state for header styling
      setIsScrolled(currentScrollY > 50)
      
      // Determine scroll direction for auto-hide behavior
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false)
      } else {
        // Scrolling up or near top
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'newSale', label: 'Nova Venda', icon: Plus },
    { id: 'salesList', label: 'Vendas', icon: List },
    { id: 'reports', label: 'Relatórios', icon: BarChart2 },
    { id: 'clients', label: 'Clientes', icon: UserPlus },
  ]

  // Handle section change
  const handleSectionChange = (section) => {
    if (onSectionChange) {
      onSectionChange(section)
    }
    if (onCloseMenu) {
      onCloseMenu()
    }
  }


  // If no user is logged in, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <img src={logoVerde} alt="J.R. AgroSolutions Logo" className="h-10 w-auto" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white/80 backdrop-blur-sm py-4'
      } ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoVerde} 
              alt="JR AgroSolutions" 
              className="h-14 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* User Dropdown */}
            <div className="ml-2 relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 p-2 rounded-lg hover:bg-gray-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 hidden group-hover:block z-50 border border-gray-100">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Área de Vendas</p>
                </div>
                <button
                  onClick={() => {
                    auth.signOut()
                    navigate('/login')
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-700 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-inner">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  onCloseMenu()
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeSection === item.id ? 'text-green-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500">Área de Vendas</p>
            </div>
            
            <button
              onClick={() => {
                auth.signOut()
                navigate('/login')
              }}
              className="w-full flex items-center px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 mt-1"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default HeaderVendas
