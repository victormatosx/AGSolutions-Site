"use client"

import { useState } from "react"
import { Linkedin, Mail, X, GraduationCap, Briefcase, Award } from "lucide-react"
import renato from "../assets/renato.jpg"
import jeovane from "../assets/jeovane.png"
import victor from "../assets/victor.png"

const Founders = () => {
  const [selectedFounder, setSelectedFounder] = useState(null)

  const founders = [
    {
      name: "Renato Mendes",
      role: "Especialista em Agronegócio",
      image: renato,
      shortBio: "Vasta experiência no setor de agronegócio com foco em consultoria e gestão de projetos agrícolas.",
      quote: "A consultoria especializada é fundamental para o sucesso do produtor rural. ",
      linkedin: "https://www.linkedin.com/in/renato-mendes-39a1a96/",
      email: "renato@jragrosolutions.com",
      fullInfo: {
        description:
          "Renato Mendes traz uma vasta experiência no setor de agronegócio, com uma sólida formação acadêmica e uma carreira diversificada em consultoria e gestão de projetos agrícolas.",
        education: [
          "MBA em Finanças - Fundação Getulio Vargas (FGV)",
          "Pós-Graduação em Administração do Agronegócio - Universidade Federal de São Carlos (UFSCar)",
        ],
        experience: [
          "Co-Fundador e Consultor Sênior - Agris Consultoria / Horticerrado",
          "Co-Fundador e CEO - Paty Agro",
          "Vice-Presidente de Contas-Chave - Verde AgriTech",
        ],
        expertise:
          "Renato Mendes consolidou sua carreira no agronegócio, focando na produção de hortaliças e laticínios. Como consultor, ele assessora diversos produtores do Brasil, ajudando-os em questões técnicas, gestão de negócios e novos projetos.",
      },
    },
    {
      name: "Jeovane Oliveira",
      role: "Inovação e Tecnologia",
      image: jeovane,
      shortBio: "Mais de 20 anos de experiência em TI, liderando a transformação digital no agronegócio.",
      quote: "A tecnologia é o motor da transformação digital no agronegócio.",
      linkedin: "https://www.linkedin.com/in/jeovaneoliveira/",
      email: "jeovane.oliveira@jragrosolutions.com",
      fullInfo: {
        description:
          "Com mais de 20 anos de experiência no setor de Tecnologia da Informação, Jeovane lidera a J. R. AGSOLUTIONS com uma visão inovadora e um profundo conhecimento do agronegócio e tecnologia.",
        education: [
          "Mestrando em Ciência de Dados pela UFU",
          "MBA em Gestão de Negócios pela FGV",
          "Especialista em Contabilidade, Direito Tributário e Desenvolvimento Java",
        ],
        experience: [
          "CEO e Fundador - J. R. AGSOLUTIONS",
          "Consultor Sênior em Tecnologia para Agronegócio",
          "Especialista em Automação de Processos Agrícolas",
        ],
        expertise:
          "Pioneiro em soluções tecnológicas para o agronegócio. Sob a liderança de Jeovane, a J. R. AGSOLUTIONS está na vanguarda da transformação digital no agronegócio, desenvolvendo soluções inovadoras que impulsionam a produtividade e sustentabilidade do setor.",
      },
    },
    {
      name: "Victor Matos",
      role: "Desenvolvimento Fullstack",
      image: victor,
      shortBio: "Combinando criatividade, tecnologia e paixão, transforma o agronegócio com sistemas modernos, eficientes e intuitivos.",
      quote: "A inovação nasce quando tecnologia e propósito caminham juntos.",
      linkedin: "https://www.linkedin.com/in/victor-matos-11a12622b/",
      email: "victor@jragrosolutions.com",
      fullInfo: {
        description:
          "Atuando como Desenvolvedor Fullstack na J. R. AGSOLUTIONS, Victor combina criatividade, tecnologia e paixão por soluções digitais para transformar o agronegócio com sistemas modernos, eficientes e intuitivos.",
        education: [
          "Graduando em Sistemas de Informação — UNIPAM",
          "Curso de React.js e React Native",
          "Curso de JavaScript (ES6+)",
          "Curso de Tailwind CSS",
          "Curso de Firebase, Node.js e MongoDB"
        ],
        experience: [
          "Desenvolvedor Fullstack — J. R. AGSOLUTIONS",
          "Criação de aplicações web e mobile voltadas ao agronegócio, com foco em usabilidade, performance e escalabilidade",
          "Responsável pelo desenvolvimento de soluções como Ordermilk e AgroColeta"
        ],
        expertise:
          "Integração de front-end e back-end com tecnologias modernas. UI/UX com foco na experiência do produtor rural. Desenvolvimento ágil e colaborativo. Paixão por criar soluções que impactam positivamente a vida no campo."
      },
    },
  ]

  const openModal = (founder) => {
    setSelectedFounder(founder)
  }

  const closeModal = () => {
    setSelectedFounder(null)
  }

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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#21C45D] to-[#16A34A] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
              Co-Fundadores
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Conheça nossos{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                co-fundadores
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
                className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer"
                onClick={() => openModal(founder)}
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
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {founder.role}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{founder.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{founder.shortBio}</p>

                  {/* Contact */}
                  <div className="flex justify-center space-x-3">
                    <a
                      href={founder.linkedin}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Linkedin className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </a>
                    <a
                      href={`mailto:${founder.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>

                  <div className="mt-4 text-green-600 text-sm font-medium">Clique para ver mais detalhes →</div>
                </div>
              </div>
            ))}
          </div>

          {/* Company Story */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Nossa jornada começou no campo</h3>
              <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-4xl mx-auto">
                Unidos pela visão de transformar o agronegócio brasileiro através da tecnologia, nossos co-fundadores
                combinaram suas expertises para criar soluções que realmente fazem a diferença na vida dos produtores
                rurais. Cada projeto é uma oportunidade de contribuir para um futuro mais sustentável e produtivo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedFounder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 p-1">
                    <img
                      src={selectedFounder.image || "/placeholder.svg"}
                      alt={selectedFounder.name}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedFounder.name}</h2>
                    <p className="text-green-600 font-semibold text-lg">{selectedFounder.role}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed">{selectedFounder.fullInfo.description}</p>
                </div>

                {/* Quote */}
                <div className="bg-green-50 p-6 rounded-2xl relative">
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-green-50 transform rotate-45"></div>
                  <p className="text-green-700 italic font-medium text-lg">"{selectedFounder.quote}"</p>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-800">Formação Acadêmica</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedFounder.fullInfo.education.map((edu, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-800">Experiência Profissional</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedFounder.fullInfo.experience.map((exp, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expertise */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-800">Expertise</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedFounder.fullInfo.expertise}</p>
                </div>

                {/* Contact */}
                <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                  <a
                    href={selectedFounder.linkedin}
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-full transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:${selectedFounder.email}`}
                    className="flex items-center gap-2 bg-green-100 hover:bg-green-200 px-6 py-3 rounded-full transition-colors"
                  >
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Founders