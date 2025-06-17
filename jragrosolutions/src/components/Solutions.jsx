"use client"

import { useState } from "react"
import { Wifi, BarChart3, Cpu, Zap, ChevronLeft, ChevronRight } from "lucide-react"

const Solutions = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const solutions = [
    {
      icon: Wifi,
      title: "Sensores agrícolas",
      description: "Monitoramento em tempo real de umidade do solo, temperatura, pH e nutrientes",
      features: [
        "Sensores IoT de alta precisão",
        "Conectividade 4G/5G",
        "Bateria de longa duração",
        "Resistente às intempéries",
      ],
      color: "from-blue-500 to-blue-600",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: BarChart3,
      title: "Dashboards em tempo real",
      description: "Visualização intuitiva de dados com alertas inteligentes e relatórios personalizados",
      features: ["Interface responsiva", "Alertas personalizáveis", "Relatórios automáticos", "Análise preditiva"],
      color: "from-purple-500 to-purple-600",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: Zap,
      title: "Conectividade no campo",
      description: "Soluções de conectividade robusta para áreas rurais remotas",
      features: ["Rede mesh inteligente", "Cobertura estendida", "Baixo consumo energético", "Fácil instalação"],
      color: "from-orange-500 to-orange-600",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: Cpu,
      title: "IA para tomada de decisão",
      description: "Inteligência artificial que analisa dados e sugere ações otimizadas",
      features: ["Machine Learning avançado", "Previsões precisas", "Otimização automática", "Aprendizado contínuo"],
      color: "from-green-500 to-green-600",
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % solutions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + solutions.length) % solutions.length)
  }

  return (
    <section id="solutions" className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Nossas{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                soluções
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tecnologias integradas que transformam dados em decisões inteligentes para maximizar a produtividade do
              seu agronegócio.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <solution.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{solution.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
                    <ul className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="lg:hidden mb-16">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {solutions.map((solution, index) => (
                    <div key={index} className="w-full flex-shrink-0 p-4">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-6`}
                        >
                          <solution.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{solution.title}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{solution.description}</p>
                        <ul className="space-y-2">
                          {solution.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {solutions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Integration Message */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Soluções integradas e escaláveis</h3>
            <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-8 max-w-4xl mx-auto">
              Todas as nossas soluções trabalham em conjunto, criando um ecossistema tecnológico completo que se adapta
              às necessidades específicas da sua propriedade.
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Solicite uma demonstração
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Solutions
