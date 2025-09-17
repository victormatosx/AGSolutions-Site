import React from "react"
import HeaderMecanico from "./HeaderMecanico"

const MecanicoComponent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderMecanico />
      <main className="container mx-auto max-w-6xl px-4 pt-28 pb-10">
        <h1 className="text-2xl font-bold text-gray-900">Área do Mecânico</h1>
        <p className="text-gray-600 mt-2">Bem-vindo! Aqui você poderá visualizar e gerenciar as ordens de serviço.</p>

        {/* TODO: Adicione aqui o conteúdo principal da página do mecânico */}
        <div className="mt-6 rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
          <p className="text-sm text-gray-500">Conteúdo da página do mecânico vai aqui.</p>
        </div>
      </main>
    </div>
  )
}

export default MecanicoComponent
