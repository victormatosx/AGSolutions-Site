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

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#21C45D] to-[#16A34A] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
                Quem Somos
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
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
                className="group bg-white p-8 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
                  <div className="text-4xl font-bold mb-2">+20 anos</div>
                  <div className="opacity-90">de experiência acumulada</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="opacity-90">foco em sustentabilidade</div>
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