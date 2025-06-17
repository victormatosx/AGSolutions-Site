import { Linkedin, Mail } from "lucide-react"

const Founders = () => {
  const founders = [
    {
      name: "Jeovane Oliveira",
      role: "CEO & Co-fundador",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Engenheiro Agrônomo com 15 anos de experiência no agronegócio. Especialista em agricultura de precisão e sustentabilidade rural.",
      quote: "Acredito que a tecnologia é a chave para um agronegócio mais produtivo e sustentável.",
      linkedin: "https://www.linkedin.com/in/jeovaneoliveira/",
      email: "jeovane.oliveira@jragrosolutions.com",
    },
    {
      name: "Renato Mendes",
      role: "CTO & Co-fundador",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Engenheiro de Software com expertise em IoT, IA e sistemas distribuídos. Apaixonado por transformar dados em insights acionáveis.",
      quote: "Cada linha de código que escrevemos tem o potencial de transformar uma propriedade rural.",
      linkedin: "https://www.linkedin.com/in/renato-mendes-39a1a96/",
      email: "renato@jragrosolutions.com",
    },
    {
      name: "Victor Matos",
      role: "COO & Co-fundadora",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Administradora com MBA em Agronegócios e 12 anos de experiência em gestão de operações rurais. Especialista em otimização de processos.",
      quote: "A eficiência operacional é o que transforma inovação em resultados reais no campo.",
      linkedin: "https://www.linkedin.com/in/victor-matos-11a12622b/",
      email: "victor@jragrosolutions.com",
    },
  ]

  return (
    <section id="founders" className="py-20 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-300/15 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Conheça nossos{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                fundadores
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A paixão pelo agronegócio e pela tecnologia nos uniu para criar soluções que fazem a diferença no campo
              brasileiro.
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Photo */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 p-1">
                    <img
                      src={founder.image || "/placeholder.svg"}
                      alt={founder.name}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {founder.role}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{founder.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{founder.bio}</p>

                  {/* Quote */}
                  <div className="bg-green-50 p-6 rounded-2xl mb-6 relative">
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-green-50 transform rotate-45"></div>
                    <p className="text-green-700 italic font-medium">"{founder.quote}"</p>
                  </div>

                  {/* Contact */}
                  <div className="flex justify-center space-x-4">
                    <a
                      href={founder.linkedin}
                      className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={`mailto:${founder.email}`}
                      className="w-12 h-12 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Mail className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Company Story */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Nossa jornada começou no campo</h3>
              <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-4xl mx-auto">
                Unidos pela visão de transformar o agronegócio brasileiro através da tecnologia, João e Ricardo
                combinaram suas expertises para criar soluções que realmente fazem a diferença na vida dos produtores
                rurais. Cada projeto é uma oportunidade de contribuir para um futuro mais sustentável e produtivo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Founders
