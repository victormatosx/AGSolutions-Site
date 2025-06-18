"use client"

import { useState, useEffect, useRef } from "react" // Import useEffect and useRef
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
// Assuming logoVerde is correctly imported or handled in your project setup
// Note: In a Next.js App Router project, you would typically place images in the public directory
// and reference them directly like /logoVerde.png.
// Since this seems to be a React Router project based on the imports, I'll keep the current import path.
import logoVerde from "../../public/logoVerde.png"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // State to track header visibility
  const lastScrollY = useRef(0) // Ref to store the last scroll position

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
  }, []) // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Function to close menu (used by mobile links)
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `} // Apply transform and transition based on isVisible state
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {/* Using the imported image */}
            <img src={logoVerde} alt="J.R. AgroSolutions Logo" className="h-16 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/apontamentos" className="text-gray-700 hover:text-green-600 transition-colors">
              Apontamentos
            </Link>
            <Link to="/cadastros" className="text-gray-700 hover:text-green-600 transition-colors">
              Cadastros
            </Link>
            {/* Styled Home Link moved to the end */}
            <Link
              to="/"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Home
            </Link>
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
              {/* Mobile Home link remains standard */}
              <Link
                to="/"
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
                onClick={closeMenu} // Use the closeMenu function
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
                onClick={closeMenu} // Use the closeMenu function
              >
                Dashboard
              </Link>
              <Link
                to="/apontamentos"
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
                onClick={closeMenu} // Use the closeMenu function
              >
                Apontamentos
              </Link>
              <Link
                to="/cadastros"
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
                onClick={closeMenu} // Use the closeMenu function
              >
                Cadastros
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header