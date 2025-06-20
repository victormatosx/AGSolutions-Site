"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import logo from "../assets/logo2.png" // Adjust the path as necessary
import logoVerde from "../assets/logoVerde.png" // Adjust the path as necessary

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={isScrolled ? logoVerde : logo}
              alt="J.R. AgroSolutions Logo"
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("about")}
              className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-green-600 transition-colors`}
            >
              Quem Somos
            </button>
            <button
              onClick={() => scrollToSection("solutions")}
              className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-green-600 transition-colors`}
            >
              Soluções
            </button>
            <button
              onClick={() => scrollToSection("founders")}
              className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-green-600 transition-colors`}
            >
              Fundadores
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`${isScrolled ? "text-gray-700" : "text-white"} hover:text-green-600 transition-colors`}
            >
              Fale Conosco
            </button>
            <Link
              to="/login"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Área do Cliente
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
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
              >
                Quem Somos
              </button>
              <button
                onClick={() => scrollToSection("solutions")}
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
              >
                Soluções
              </button>
              <button
                onClick={() => scrollToSection("founders")}
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
              >
                Fundadores
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-green-600 transition-colors text-left"
              >
                Fale Conosco
              </button>
              <Link
                to="/login"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Área do Cliente
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header