import { Search, Settings, Monitor, Zap } from "lucide-react"

const HowWeWork = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Diagnóstico inteligente",
      description:
        "Analisamos sua propriedade com tecnologia de ponta, identificando oportunidades de melhoria e otimização de recursos.",
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      icon: Settings,
      title: "Implementação de soluções",
      description:
        "Instalamos e configuramos sistemas personalizados, adaptados às características específicas da sua operação.",
      color: "from-purple-500 to-purple-600",
    },
    {
      number: "03",
      icon: Monitor,
      title: "Monitoramento por IA",
      description:
        "Nossa inteligência artificial monitora continuamente os dados, fornecendo insights em tempo real para decisões assertivas.",
      color: "from-orange-500 to-orange-600",
    },
    {
      number: "04",
      icon: Zap,
      title: "Otimização contínua",
      description:
        "Refinamos constantemente os processos, garantindo máxima eficiência e retorno sobre o investimento.",
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Como{" "}
              <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                trabalhamos
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nossa metodologia comprovada garante resultados excepcionais através de um processo estruturado e
              orientado por dados.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8 lg:gap-16`}
              >
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                    <div className="text-6xl font-bold text-gray-200">{step.number}</div>
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{step.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{step.description}</p>
                </div>

                {/* Visual Element */}
                <div className="flex-1 flex justify-center">
                  <div
                    className={`w-80 h-80 bg-gradient-to-br ${step.color} rounded-3xl opacity-10 flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-4 border-2 border-white/20 rounded-2xl"></div>
                    <div className="absolute inset-8 border border-white/10 rounded-xl"></div>
                    <step.icon className="w-24 h-24 text-white/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Process Flow */}
          <div className="mt-20 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Processo integrado e eficiente</h3>
              <p className="text-lg opacity-90 max-w-3xl mx-auto">
                Cada etapa do nosso processo é cuidadosamente planejada para maximizar resultados e garantir a
                satisfação dos nossos clientes.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">7 dias</div>
                <div className="opacity-90">Diagnóstico completo</div>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">30 dias</div>
                <div className="opacity-90">Implementação</div>
              </div>
              <div className="hidden md:block w-8 h-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="opacity-90">Monitoramento</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowWeWork
