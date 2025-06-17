"use client"
import { ArrowUp, Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import logo from "../../public/logo2.png"

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              {/* Replaced Leaf icon with the logo image */}
              <img
                src={logo} // Use .src to get the image URL
                alt="J.R. AgroSolutions Logo"
                className="h-16 w-auto" // Adjust size as needed
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Transformamos o agronegócio brasileiro através de soluções tecnológicas inovadoras.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-left"
                >
                  Quem Somos
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("solutions")}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-left"
                >
                  Soluções
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("founders")}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-left"
                >
                  Fundadores
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-left"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Serviços</h3>
            <ul className="space-y-3 text-gray-300">
              <li>Integrações
              </li>
              <li>Dashboards Inteligentes</li>
              <li>Conectividade Rural</li>
              <li>Geração de Relatórios PDF</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-300 text-sm">Email</div>
                  <a
                    href="mailto:contato@jragrosolutions.com"
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    contato@jragrosolutions.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-300 text-sm">Telefone</div>
                  <a href="tel:+5511999999999" className="text-white hover:text-green-400 transition-colors">
                    (34) 9 9653-2577
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-gray-300 text-sm">Localização</div>
                  <div className="text-white">Minas Gerais - Brasil</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} J.R. AgroSolutions. Todos os direitos reservados.
            </div>

            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Termos de Uso
              </a>
              <button
                onClick={scrollToTop}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                aria-label="Voltar ao topo"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer