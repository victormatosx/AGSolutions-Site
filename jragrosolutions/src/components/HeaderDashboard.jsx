"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import logoVerde from "../../public/logoVerde.png"

const Header = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Effect to handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Determine scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past a threshold
        setIsVisible(false)
      } else {
        // Scrolling up or near the top
        setIsVisible(true)
      }

      // Update last scroll position
      lastScrollY.current = currentScrollY
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Function to close menu (used by mobile links)
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Function to handle navigation
  const handleNavigation = (page) => {
    onNavigate(page)
    closeMenu()
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNavigation('dashboard')} className="flex items-center">
            <img src={logoVerde} alt="J.R. AgroSolutions Logo" className="h-16 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('dashboard')}
              className={`transition-colors ${
                currentPage === 'dashboard' 
                  ? 'text-green-600 font-semibold' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('apontamentos')}
              className={`transition-colors ${
                currentPage === 'apontamentos' 
                  ? 'text-green-600 font-semibold' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Apontamentos
            </button>
            <button 
              onClick={() => handleNavigation('cadastros')}
              className={`transition-colors ${
                currentPage === 'cadastros' 
                  ? 'text-green-600 font-semibold' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Cadastros
            </button>
            {/* Styled Home Link moved to the end */}
            <button
              onClick={() => handleNavigation('home')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Voltar para Home
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
              <button
                onClick={() => handleNavigation('home')}
                className={`text-left transition-colors ${
                  currentPage === 'home' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('dashboard')}
                className={`text-left transition-colors ${
                  currentPage === 'dashboard' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('apontamentos')}
                className={`text-left transition-colors ${
                  currentPage === 'apontamentos' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Apontamentos
              </button>
              <button
                onClick={() => handleNavigation('cadastros')}
                className={`text-left transition-colors ${
                  currentPage === 'cadastros' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Cadastros
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header