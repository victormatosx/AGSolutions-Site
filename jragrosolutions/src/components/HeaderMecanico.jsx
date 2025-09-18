"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase/firebase"
import { useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Plus } from "lucide-react"
import logoVerde from "../assets/logoVerde.png"

const HeaderMecanico = ({ onNavigate, currentPage, activeTab = 'aberto', setActiveTab = () => {} }) => {
  const [user, loading, error] = useAuthState(auth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const navigate = useNavigate() 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page)
    } else {
      navigate(`/${page}`)
    }
    closeMenu()
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  if (!user && !loading) return null

  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNavigation("home")} className="flex items-center">
            <img src={logoVerde || "/placeholder.svg"} alt="J.R. AgroSolutions Logo" className="h-16 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Navigation Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('aberto')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'aberto'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Ver Ordens em Aberto
              </button>
              <button
                onClick={() => setActiveTab('fechado')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'fechado'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Ver Ordens Concluídas
              </button>
            </div>
            
            {/* Spacer */}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            <nav className="flex flex-col space-y-4 px-4">
              <div className="flex flex-col space-y-2 py-2">
                <button
                  onClick={() => {
                    setActiveTab('aberto');
                    closeMenu();
                  }}
                  className={`px-4 py-3 text-left font-medium transition-colors ${
                    activeTab === 'aberto'
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Ver Ordens em Aberto
                </button>
                <button
                  onClick={() => {
                    setActiveTab('fechado');
                    closeMenu();
                  }}
                  className={`px-4 py-3 text-left font-medium transition-colors ${
                    activeTab === 'fechado'
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Ver Ordens Concluídas
                </button>
              </div>
              <hr className="border-gray-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-left text-red-600 hover:text-red-700 transition-colors px-4 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do sistema</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default HeaderMecanico
