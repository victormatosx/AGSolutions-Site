import { useState } from "react"
import { Users, Plus } from 'lucide-react'

const ClientForm = ({ onClientSubmit }) => {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cpfCnpj: "",
    notes: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    onClientSubmit(client)
    
    // Reset form
    setClientData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      cpfCnpj: "",
      notes: ""
    })
  }

  const handleChange = (field, value) => {
    setClientData({ ...clientData, [field]: value })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        Cadastrar Novo Cliente
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <input
              type="text"
              value={clientData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
            <input
              type="text"
              value={clientData.cpfCnpj}
              onChange={(e) => handleChange("cpfCnpj", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
            <input
              type="tel"
              value={clientData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
          <input
            type="text"
            value={clientData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
            <input
              type="text"
              value={clientData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <input
              type="text"
              value={clientData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
            <input
              type="text"
              value={clientData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
          <textarea
            value={clientData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Informações adicionais sobre o cliente..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Cliente
        </button>
      </form>
    </div>
  )
}

export default ClientForm
