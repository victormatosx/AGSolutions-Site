import { Brain, Rocket, Eye, TrendingUp, ArrowRight, CheckCircle } from "lucide-react"

const HowWeWork = () => {
  const steps = [
    {
      number: "01",
      icon: Brain,
      title: "Análise Estratégica",
      description:
        "Realizamos uma análise profunda do seu negócio, identificando gargalos e oportunidades de crescimento através de metodologias comprovadas.",
      features: ["Auditoria completa", "Mapeamento de processos", "Análise de concorrência"],
      color: "green-unified", // Usando um nome de cor unificado
    },
    {
      number: "02",
      icon: Rocket,
      title: "Estratégia Personalizada",
      description:
        "Desenvolvemos uma estratégia sob medida para seus objetivos, combinando as melhores práticas do mercado com inovação tecnológica.",
      features: ["Plano de ação detalhado", "Cronograma otimizado", "KPIs definidos"],
      color: "green-unified", // Usando um nome de cor unificado
    },
    {
      number: "03",
      icon: Eye,
      title: "Execução Monitorada",
      description:
        "Implementamos as soluções com acompanhamento em tempo real, garantindo que cada etapa seja executada com precisão e qualidade.",
      features: ["Implementação ágil", "Testes contínuos", "Ajustes em tempo real"],
      color: "green-unified", // Usando um nome de cor unificado
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Crescimento Sustentável",
      description:
        "Otimizamos continuamente os resultados, garantindo crescimento consistente e sustentável para o seu negócio a longo prazo.",
      features: ["Otimização contínua", "Relatórios detalhados", "Suporte especializado"],
      color: "green-unified", // Usando um nome de cor unificado
    },
  ]

  const getColorClasses = (color) => {
    // Definindo uma única paleta de verde mais vivo
    const unifiedGreen = {
      bg: "bg-emerald-50", // Um verde claro para o fundo do card
      border: "border-emerald-200", // Uma borda um pouco mais escura
      icon: "bg-[#16A449]", // O verde vivo para o ícone
      text: "text-[#16A449]", // O verde vivo para o texto de destaque
      gradient: "from-[#16A449] to-emerald-700", // Um gradiente que começa com o verde vivo
    }
    return unifiedGreen
  }

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-100 to-lime-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#21C45D] to-[#16A34A] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
              Nossa Metodologia
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Como Transformamos
              <span className="block bg-gradient-to-r from-[#21C45D] to-[#16A34A] bg-clip-text text-transparent">
                Seu Negócio
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Um processo estruturado e comprovado que combina estratégia, tecnologia e execução para entregar
              resultados excepcionais.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            {steps.map((step, index) => {
              const colors = getColorClasses(step.color)
              return (
                <div
                  key={index}
                  className={`group relative ${colors.bg} ${colors.border} border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-slate-200">
                    <span className="text-lg font-bold text-slate-700">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>

                  {/* Features */}
                  <div className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
                        <span className="text-slate-700 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow connector for desktop */}
                  {index < steps.length - 1 && index % 2 === 0 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Commitment Section */}
          <div className="bg-[#16A449] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Nosso Compromisso com Você</h3>
                <p className="text-xl text-green-100 max-w-3xl mx-auto">
                  Estamos dedicados a construir uma parceria sólida, focada em inovação, transparência e no seu sucesso
                  a longo prazo.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    Parceria
                  </div>
                  <div className="text-green-100 font-medium">Colaboração Contínua</div>
                  <div className="text-sm text-green-200 mt-1">Trabalhamos lado a lado em cada etapa</div>
                </div>
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    Inovação
                  </div>
                  <div className="text-green-100 font-medium">Soluções de Ponta</div>
                  <div className="text-sm text-green-200 mt-1">Sempre buscando o que há de mais novo</div>
                </div>
                <div className="group">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-white group-hover:scale-110 transition-transform duration-300">
                    Transparência
                  </div>
                  <div className="text-green-100 font-medium">Comunicação Clara</div>
                  <div className="text-sm text-green-200 mt-1">Relatórios e feedbacks honestos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowWeWork