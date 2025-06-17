import { Target, Eye, Heart, Leaf } from "lucide-react"

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description:
        "Democratizar o acesso à tecnologia agrícola, oferecendo soluções inteligentes que aumentam a produtividade e sustentabilidade do campo brasileiro.",
    },
    {
      icon: Eye,
      title: "Visão",
      description:
        "Ser referência em inovação tecnológica para o agronegócio, conectando produtores rurais às melhores práticas e tecnologias do mercado.",
    },
    {
      icon: Heart,
      title: "Valores",
      description:
        "Sustentabilidade, inovação, transparência e compromisso com o desenvolvimento rural e a preservação ambiental.",
    },
  ]

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2310b981' fillOpacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-6">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Quem Somos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Inovação que{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                transforma
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Somos uma empresa brasileira especializada em desenvolver soluções tecnológicas inovadoras para o
              agronegócio, unindo a tradição do campo com a modernidade da tecnologia.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Nossa História</h3>
              <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-8">
                Nascemos da paixão pelo campo e pela tecnologia. Fundada por especialistas em agronegócio e tecnologia,
                a J.R. AgroSolutions surgiu para preencher a lacuna entre o conhecimento tradicional rural e as
                inovações tecnológicas modernas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">2019</div>
                  <div className="opacity-90">Ano de fundação</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="opacity-90">Foco em sustentabilidade</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
