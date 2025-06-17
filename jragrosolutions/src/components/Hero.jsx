"use client"
import { ArrowRight, Play } from "lucide-react"

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Organic Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path d="M0,400 Q300,200 600,400 T1200,400 L1200,0 L0,0 Z" fill="url(#gradient1)" opacity="0.1" />
          <path d="M0,600 Q400,400 800,600 T1200,600 L1200,800 L0,800 Z" fill="url(#gradient2)" opacity="0.1" />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Cultivamos{" "}
            <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">inovação</span>
          </h1>

          <h2 className="text-2xl md:text-3xl text-gray-600 mb-8 font-light">
            Entregamos soluções que transformam o agro
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Conectamos tecnologia de ponta com a sabedoria do campo, criando soluções inteligentes que maximizam a
            produtividade e sustentabilidade do agronegócio brasileiro.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => scrollToSection("solutions")}
              className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Conheça nossas soluções</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection("contact")}
              className="group border-2 border-green-500 text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-500 hover:text-white transition-all duration-300 flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Solicite uma demonstração</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Propriedades atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">25%</div>
              <div className="text-gray-600">Aumento médio de produtividade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">15M</div>
              <div className="text-gray-600">Hectares monitorados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-green-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
