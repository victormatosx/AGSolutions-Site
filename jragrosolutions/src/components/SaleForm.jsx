import { useState } from "react"
import { ShoppingCart, Plus, Minus } from 'lucide-react'

const SaleForm = ({ clients, products, onSaleSubmit }) => {
  const [saleData, setSaleData] = useState({
    clientId: "",
    items: [{ productId: "", quantity: 1, price: 0 }],
    discount: 0,
    paymentMethod: "dinheiro",
    notes: ""
  })

  const addItem = () => {
    setSaleData({
      ...saleData,
      items: [...saleData.items, { productId: "", quantity: 1, price: 0 }]
    })
  }

  const removeItem = (index) => {
    const newItems = saleData.items.filter((_, i) => i !== index)
    setSaleData({ ...saleData, items: newItems })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...saleData.items]
    newItems[index][field] = value
    
    // Auto-fill price when product is selected
    if (field === "productId" && products) {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].price = product.price
      }
    }
    
    setSaleData({ ...saleData, items: newItems })
  }

  const calculateTotal = () => {
    const subtotal = saleData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    return subtotal - saleData.discount
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const total = calculateTotal()
    const sale = {
      ...saleData,
      total,
      date: new Date().toISOString(),
      id: Date.now().toString()
    }
    onSaleSubmit(sale)
    
    // Reset form
    setSaleData({
      clientId: "",
      items: [{ productId: "", quantity: 1, price: 0 }],
      discount: 0,
      paymentMethod: "dinheiro",
      notes: ""
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-green-600" />
        Registrar Nova Venda
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            value={saleData.clientId}
            onChange={(e) => setSaleData({ ...saleData, clientId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Selecione um cliente</option>
            {clients?.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        {/* Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Produtos</label>
          {saleData.items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, "productId", e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Selecione um produto</option>
                {products?.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Qtd"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
              
              <input
                type="number"
                placeholder="Preço"
                value={item.price}
                onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
              
              {saleData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mt-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>

        {/* Discount and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desconto (R$)</label>
            <input
              type="number"
              value={saleData.discount}
              onChange={(e) => setSaleData({ ...saleData, discount: parseFloat(e.target.value) || 0 })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <select
              value={saleData.paymentMethod}
              onChange={(e) => setSaleData({ ...saleData, paymentMethod: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
              <option value="prazo">A Prazo</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
          <textarea
            value={saleData.notes}
            onChange={(e) => setSaleData({ ...saleData, notes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Observações sobre a venda..."
          />
        </div>

        {/* Total */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Registrar Venda
        </button>
      </form>
    </div>
  )
}

export default SaleForm
