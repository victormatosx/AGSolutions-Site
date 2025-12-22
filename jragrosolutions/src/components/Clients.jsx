"use client"

import { useState } from "react"
import { Users, MapPin, Sparkles, ChevronRight, CheckCircle } from "lucide-react"

const clients = [
  {
    name: "Fazenda Matrice",
    location: "Cristalina, GO",
    segment: "Grãos e irrigação",
    summary:
      "Ecossistema digital integrado com app offline e dashboard web para centralizar a gestão operacional mesmo com baixa conectividade.",
    project:
      "Desenvolvemos um app mobile offline para operadores registrarem horas-máquina direto no campo, sincronizando com uma dashboard responsiva. Inclui controle completo de abastecimentos internos e externos com fotos de comprovantes, horímetro/agômetro e evidências para auditoria. O ambiente também consolida vendas (sementes e produtos agrícolas) e o fluxo de ordens de serviço: operadores abrem solicitações de manutenção, mecânicos executam e finalizam com rastreabilidade do histórico.",
    results: [
      "Operação funciona offline no campo e sincroniza de forma confiável",
      "Abastecimentos auditáveis com evidências e controle de custos",
      "Vendas e ordens de serviço consolidadas em um único ambiente",
    ],
    tags: ["App offline", "Abastecimento", "Vendas e O.S."],
    meta: [
      { label: "Formato", value: "App offline + Dashboard web responsiva" },
      { label: "Escopo", value: "Horas-máquina, abastecimento, vendas e O.S." },
      { label: "Conectividade", value: "Funciona offline e sincroniza na sede" },
    ],
  },
  {
    name: "HortiCerrado",
    location: "São Gotardo, MG",
    segment: "Hortifrúti",
    summary:
      "Plataforma para gestão técnica do ciclo produtivo de hortifrúti, cobrindo sementes, plantio, tratos e pós-colheita.",
    project:
      "Criamos um app mobile (em expansão para web) para acompanhar tecnicamente cada etapa das culturas. O produtor registra dados agronômicos, monitora desenvolvimento e toma decisões baseadas em dados. Foco atual em cebola, alho e cenoura, com arquitetura preparada para novas culturas sem reescrever o produto.",
    results: [
      "Padronização e rastreabilidade técnica de cada fase produtiva",
      "Visão clara do desenvolvimento das lavouras para reduzir perdas",
      "Base de dados pronta para escalar para novas culturas",
    ],
    tags: ["Ciclo produtivo", "Rastreabilidade", "Arquitetura escalável"],
    meta: [
      { label: "Formato", value: "App mobile (expansão web em curso)" },
      { label: "Escopo", value: "Sementes, plantio, tratos, manejo e pós-colheita" },
      { label: "Culturas foco", value: "Cebola, alho, cenoura (+ novas culturas)" },
    ],
  },
  {
    name: "Agris",
    location: "Triângulo Mineiro e Goiás",
    segment: "Multifazendas",
    summary:
      "Plataforma estratégica para organizar processos produtivos e inteligência operacional em diferentes propriedades.",
    project:
      "Combina app de campo com plataforma web para planejamento, registros e controle gerencial. Permite acompanhar do preparo ao pós-colheita, conectando dados técnicos, históricos de manejo e resultados por safra. Foi concebido para crescer de forma modular, cobrindo múltiplas culturas e modelos produtivos sem perder eficiência ou controle.",
    results: [
      "Organização das etapas produtivas com indicadores por ciclo",
      "Histórico estruturado para decisões e planejamento de safras",
      "Arquitetura modular para múltiplas culturas e propriedades",
    ],
    tags: ["Planejamento", "Inteligência operacional", "Multiculture"],
    meta: [
      { label: "Formato", value: "App de campo + plataforma web" },
      { label: "Escopo", value: "Planejamento, registros e indicadores por safra" },
      { label: "Alcance", value: "Multiculturas e múltiplas propriedades" },
    ],
  },
]

const Clients = () => {
  const [selectedClient, setSelectedClient] = useState(clients[0])

  return (
    <section id="clients" className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#21C45D] to-[#16A34A] bg-clip-text text-transparent font-semibold text-sm uppercase tracking-wider mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
              Nossos Clientes
              <div className="w-8 h-px bg-gradient-to-r from-[#21C45D] to-[#16A34A]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Resultados reais em campo</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quem confia na J.R. AgroSolutions para operar com mais previsibilidade, rastreabilidade e velocidade de
              decisão.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map((client) => {
                const isSelected = selectedClient.name === client.name
                return (
                  <button
                    key={client.name}
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className={`group text-left p-6 rounded-2xl border w-full transition-all duration-200 ${
                      isSelected
                        ? "border-green-500 bg-white shadow-lg shadow-green-100"
                        : "border-gray-200 bg-white hover:border-green-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-green-600 text-white"
                              : "bg-green-50 text-green-600 group-hover:bg-green-100"
                          }`}
                        >
                          <Users size={22} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin size={14} />
                            <span>{client.location}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`mt-1 transition-transform duration-200 ${
                          isSelected ? "text-green-600" : "text-gray-300 group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                    <p className="mt-4 text-gray-600 leading-relaxed">{client.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {client.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-700 uppercase tracking-wider">
                    <Sparkles size={14} />
                    Detalhes do projeto
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{selectedClient.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <MapPin size={16} />
                    <span>{selectedClient.location}</span>
                  </div>
                </div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
                  {selectedClient.segment}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {selectedClient.meta?.map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col gap-1 shadow-sm"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-green-700">{item.label}</span>
                    <span className="text-sm text-gray-700 leading-snug">{item.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedClient.project}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedClient.results.map((result) => (
                  <div
                    key={result}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <CheckCircle size={18} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Clients
