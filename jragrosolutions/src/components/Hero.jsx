"use client"
import { ArrowRight, Play } from "lucide-react"
import banner from "../../public/bannerTrans2.png"

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0">
        <img
          src={banner}
          alt="J.R. AgroSolutions - Tecnologia no Campo"
          className="w-full h-full object-cover"
        />

      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Cultivando{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">inovação</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
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
              className="group border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-800 transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm"
            >
              <Play className="w-5 h-5" />
              <span>Solicite uma demonstração</span>
            </button>
          </div>
        </div>
      </div>

    </section>
  )
}

export default Hero