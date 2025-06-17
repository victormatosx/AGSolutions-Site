import { Droplets, BarChart3, Cloud, TrendingUp } from "lucide-react"

const Challenges = () => {
  const challenges = [
    {
      icon: Droplets,
      title: "Desperdício de recursos",
      description: "Uso ineficiente de água, fertilizantes e defensivos agrícolas",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Falta de dados",
      description: "Ausência de informações precisas para tomada de decisões",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Cloud,
      title: "Clima imprevisível",
      description: "Dificuldade em prever e se adaptar às mudanças climáticas",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Produtividade estagnada",
      description: "Necessidade de aumentar a produção sem expandir áreas",
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
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
              Desafios que nos{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                impulsionam
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Identificamos os principais obstáculos do agronegócio moderno e desenvolvemos soluções tecnológicas
              específicas para cada desafio.
            </p>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${challenge.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <challenge.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{challenge.title}</h3>
                <p className="text-gray-600 leading-relaxed">{challenge.description}</p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Transformamos desafios em oportunidades
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Cada obstáculo é uma chance de inovar. Nossa equipe desenvolve soluções personalizadas que atendem às
                necessidades específicas de cada propriedade rural.
              </p>
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
                Descubra nossas soluções
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Challenges
