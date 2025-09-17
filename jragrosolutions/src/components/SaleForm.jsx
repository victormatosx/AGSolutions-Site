"use client"

import { useState, useEffect, useRef } from "react"
import useOutsideAlerter from "../../hooks/useOutsideAlerter"
import {
  ShoppingCart,
  Plus,
  Minus,
  Calendar,
  User,
  CreditCard,
  Package,
  Truck,
  FileText,
  Search,
  ChevronDown,
  X,
} from "lucide-react"
import { ref, onValue, push } from "firebase/database"
import { database } from "../firebase/firebase"

const SaleForm = ({ products, onSaleSubmit, userData }) => {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [talhoes, setTalhoes] = useState([])
  const [talhaoSearchTerm, setTalhaoSearchTerm] = useState("")
  const [variedades, setVariedades] = useState([])
  const [variedadeSearchTerm, setVariedadeSearchTerm] = useState("")
  const [embalagens, setEmbalagens] = useState([])
  const [embalagemSearchTerm, setEmbalagemSearchTerm] = useState("")
  const [productos, setProductos] = useState([])
  const [productoSearchTerm, setProductoSearchTerm] = useState("")

  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showTalhaoModal, setShowTalhaoModal] = useState(false)
  const [showClassificationModal, setShowClassificationModal] = useState(false)
  const [showPackagingModal, setShowPackagingModal] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Fetch talhoes from Firebase Realtime Database
  useEffect(() => {
    const direcionadoresRef = ref(database, "propriedades")

    const unsubscribe = onValue(direcionadoresRef, (snapshot) => {
      const talhoesData = []
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.direcionadores) {
          Object.entries(propertyData.direcionadores).forEach(([talhaoId, talhaoData]) => {
            talhoesData.push({
              id: talhaoId,
              name: talhaoData.direcionador || "Talhão sem nome",
            })
          })
        }
      })
      setTalhoes(talhoesData)
    })

    return () => unsubscribe()
  }, [])

  // Fetch variedades from Firebase Realtime Database
  useEffect(() => {
    const classificacaoRef = ref(database, "propriedades")

    const unsubscribe = onValue(classificacaoRef, (snapshot) => {
      const variedadesData = []
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.classificacao) {
          Object.entries(propertyData.classificacao).forEach(([classificacaoId, classificacaoData]) => {
            if (classificacaoData.Descrição) {
              variedadesData.push({
                id: `${property.key}-${classificacaoId}`,
                name: classificacaoData.Descrição,
              })
            }
          })
        }
      })
      // Remove duplicates
      const uniqueVariedades = Array.from(new Set(variedadesData.map((v) => v.name))).map((name) => {
        return variedadesData.find((v) => v.name === name)
      })
      setVariedades(uniqueVariedades)
    })

    return () => unsubscribe()
  }, [])

  // Fetch embalagens from Firebase Realtime Database
  useEffect(() => {
    const embalagensRef = ref(database, "propriedades")

    const unsubscribe = onValue(embalagensRef, (snapshot) => {
      const embalagensData = []
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.embalagens) {
          Object.entries(propertyData.embalagens).forEach(([embalagemId, embalagemData]) => {
            if (embalagemData.descricao) {
              embalagensData.push({
                id: embalagemId,
                descricao: embalagemData.descricao,
                property: propertyData.Nome || "Propriedade sem nome",
              })
            }
          })
        }
      })
      setEmbalagens(embalagensData)
    })

    return () => unsubscribe()
  }, [])

  // Filter embalagens based on search term
  const filteredEmbalagens = embalagens.filter(
    (embalagem) =>
      embalagem.descricao.toLowerCase().includes(embalagemSearchTerm.toLowerCase()) ||
      embalagem.property.toLowerCase().includes(embalagemSearchTerm.toLowerCase()),
  )

  // Fetch unique culturaAssociada values from Firebase Realtime Database
  useEffect(() => {
    const productosRef = ref(database, "propriedades")

    const unsubscribe = onValue(productosRef, (snapshot) => {
      const culturas = new Set()
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.direcionadores) {
          Object.values(propertyData.direcionadores).forEach((direcionador) => {
            if (direcionador.culturaAssociada) {
              culturas.add(direcionador.culturaAssociada)
            }
          })
        }
      })

      // Convert Set to array of objects with id and name
      const productosData = Array.from(culturas).map((cultura, index) => ({
        id: `cultura-${index}`,
        name: cultura,
      }))

      setProductos(productosData)
    })

    return () => unsubscribe()
  }, [])

  // Filter productos based on search term
  const filteredProductos = productos.filter((producto) =>
    producto.name.toLowerCase().includes(productoSearchTerm.toLowerCase()),
  )

  // Fetch clients from Firebase Realtime Database
  useEffect(() => {
    const clientsRef = ref(database, "propriedades")

    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const clientsData = []
      snapshot.forEach((property) => {
        const propertyData = property.val()
        if (propertyData.clientes) {
          Object.entries(propertyData.clientes).forEach(([clientId, clientData]) => {
            clientsData.push({
              id: clientId,
              name: clientData.Nome || "Cliente sem nome",
              property: propertyData.Nome || "Propriedade sem nome",
            })
          })
        }
      })
      setClients(clientsData)
    })

    return () => unsubscribe()
  }, [])

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.property.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter talhoes based on search term
  const filteredTalhoes = talhoes.filter((talhao) => talhao.name.toLowerCase().includes(talhaoSearchTerm.toLowerCase()))

  // Filter variedades based on search term
  const filteredVariedades = variedades.filter((variedade) =>
    variedade.name.toLowerCase().includes(variedadeSearchTerm.toLowerCase()),
  )

  const [saleData, setSaleData] = useState({
    orderDate: new Date().toISOString().split("T")[0],
    clientId: "",
    paymentMethod: "",
    paymentTerm: "",
    paymentNotes: "",
    items: [
      {
        productId: "",
        talhao: "",
        variety: "",
        classification: "",
        packaging: "",
        quantity: 0,
        unitPrice: 0,
      },
    ],
    loadingDate: new Date().toISOString().split("T")[0],
    shippingMethod: "",
    generalNotes: "",
  })

  const [showItemsModal, setShowItemsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" })

  const clientModalRef = useRef(null)
  const itemsModalRef = useRef(null)
  const productModalRef = useRef(null)
  const talhaoModalRef = useRef(null)
  const classificationModalRef = useRef(null)
  const packagingModalRef = useRef(null)

  useOutsideAlerter(clientModalRef, () => setShowClientModal(false))
  useOutsideAlerter(itemsModalRef, () => {
    // Use a timeout to allow other click events to process first (like opening a sub-modal)
    setTimeout(() => {
      if (!showProductModal && !showTalhaoModal && !showClassificationModal && !showPackagingModal) {
        setShowItemsModal(false)
      }
    }, 0)
  })
  useOutsideAlerter(productModalRef, () => setShowProductModal(false))
  useOutsideAlerter(talhaoModalRef, () => setShowTalhaoModal(false))
  useOutsideAlerter(classificationModalRef, () => setShowClassificationModal(false))
  useOutsideAlerter(packagingModalRef, () => setShowPackagingModal(false))

  const openClientModal = () => {
    setSearchTerm("")
    setShowClientModal(true)
  }

  const openProductModal = (itemIndex) => {
    setCurrentItemIndex(itemIndex)
    setProductoSearchTerm("")
    setShowProductModal(true)
  }

  const openTalhaoModal = (itemIndex) => {
    setCurrentItemIndex(itemIndex)
    setTalhaoSearchTerm("")
    setShowTalhaoModal(true)
  }

  const openClassificationModal = (itemIndex) => {
    setCurrentItemIndex(itemIndex)
    setVariedadeSearchTerm("")
    setShowClassificationModal(true)
  }

  const openPackagingModal = (itemIndex) => {
    setCurrentItemIndex(itemIndex)
    setEmbalagemSearchTerm("")
    setShowPackagingModal(true)
  }

  const selectClient = (clientId) => {
    setSaleData({ ...saleData, clientId })
    setShowClientModal(false)
  }

  const selectProduct = (productId) => {
    updateItem(currentItemIndex, "productId", productId)
    setShowProductModal(false)
  }

  const selectTalhao = (talhaoId) => {
    updateItem(currentItemIndex, "talhao", talhaoId)
    setShowTalhaoModal(false)
  }

  const selectClassification = (classification) => {
    updateItem(currentItemIndex, "classification", classification)
    setShowClassificationModal(false)
  }

  const selectPackaging = (packagingId) => {
    updateItem(currentItemIndex, "packaging", packagingId)
    setShowPackagingModal(false)
  }

  const addItem = () => {
    setSaleData({
      ...saleData,
      items: [
        ...saleData.items,
        {
          productId: "",
          talhao: "",
          variety: "",
          classification: "",
          packaging: "",
          quantity: 0,
          unitPrice: 0,
        },
      ],
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
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].unitPrice = product.price
      }
    }

    setSaleData({ ...saleData, items: newItems })
  }

  const calculateTotal = () => {
    return saleData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const formatToBrazilianDate = (dateString) => {
    if (!dateString) return ""
    const [year, month, day] = dateString.split("T")[0].split("-")
    return `${day}/${month}/${year}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage({ type: "", text: "" })

    try {
      const total = calculateTotal()
      const now = new Date().toISOString()

      // Format dates to Brazilian format (DD/MM/YYYY)
      const formattedOrderDate = formatToBrazilianDate(saleData.orderDate)
      const formattedLoadingDate = saleData.loadingDate ? formatToBrazilianDate(saleData.loadingDate) : ""

      // Format the sale data according to the required structure
      const sale = {
        cliente: clients.find((c) => c.id === saleData.clientId)?.name || "",
        clienteId: saleData.clientId,
        criadoEm: now,
        criadoPor: userData?.nome || "Sistema",
        dataCarregamento: formattedLoadingDate,
        dataCarregamentoTimestamp: saleData.loadingDate ? new Date(saleData.loadingDate).getTime() : null,
        dataPedido: formattedOrderDate,
        dataTimestamp: new Date(saleData.orderDate).getTime(),
        formaPagamento: saleData.paymentMethod,
        tipoFrete: saleData.shippingMethod,
        formaPagamentoId:
          {
            "A Vista": "vista",
            "A Prazo": "prazo",
            Bonificação: "bonificacao",
            "Outras Entradas": "outras",
          }[saleData.paymentMethod] || saleData.paymentMethod,
        itens: saleData.items.map((item) => {
          const product = productos.find((p) => p.id === item.productId)
          const embalagem = embalagens.find((e) => e.id === item.packaging)

          return {
            classificacao: item.classification || "",
            classificacaoId: item.classificationId || "",
            embalagem: embalagem?.descricao || "",
            embalagemId: item.packaging || "",
            preco: Number.parseFloat(item.unitPrice) || 0,
            quantidade: Number.parseFloat(item.quantity) || 0,
            talhao: talhoes.find((t) => t.id === item.talhao)?.name || "",
            talhaoId: item.talhao || "",
            tipoProduto: product?.name || "",
            tipoProdutoId: product?.id || "",
            valorTotal: (Number.parseFloat(item.quantity) * Number.parseFloat(item.unitPrice) || 0).toFixed(2),
            variedade: item.variety || "",
            variedadeId: item.varietyId || "",
          }
        }),
        observacao: saleData.generalNotes,
        observacaoPagamento: saleData.paymentNotes,
        propriedade: userData?.propriedade || "",
        status: "pendente", // Default status
        valorTotal: Number.parseFloat(total).toFixed(2),
        prazoDias: saleData.paymentMethod === "A Prazo" ? String(saleData.paymentTerm || "0") : null,
      }

      // Save to Firebase Realtime Database under the user's property node
      if (!userData || !userData.propriedade) {
        throw new Error("Dados da propriedade não encontrados. Por favor, faça login novamente.")
      }

      // Save under the specific property's 'vendas' node
      const salesRef = ref(database, `propriedades/${userData.propriedade}/vendas`)
      await push(salesRef, sale)

      setSubmitMessage({
        type: "success",
        text: "Venda registrada com sucesso!",
      })

      // Call onSaleSubmit if it exists (for parent component updates)
      if (onSaleSubmit && typeof onSaleSubmit === "function") {
        onSaleSubmit(sale)
      }

      // Reset form
      setSaleData({
        clientId: "",
        orderDate: new Date().toISOString().split("T")[0],
        loadingDate: "",
        paymentMethod: "",
        paymentTerm: "",
        shippingMethod: "",
        generalNotes: "",
        items: [],
      })
      
      // Scroll to top of the page after successful submission
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitMessage({ type: "", text: "" })
      }, 3000)
    } catch (error) {
      console.error("Erro ao registrar venda:", error)
      setSubmitMessage({
        type: "error",
        text: `Erro ao registrar venda: ${error.message}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-green-600" />
        Registrar Nova Venda
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data do Pedido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Data do Pedido
          </label>
          <input
            type="date"
            value={saleData.orderDate}
            onChange={(e) => setSaleData({ ...saleData, orderDate: e.target.value })}
            onFocus={(e) => e.target.showPicker()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            Nome do Cliente
          </label>
          <button
            type="button"
            onClick={openClientModal}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50"
          >
            <span className={saleData.clientId ? "text-gray-900" : "text-gray-500"}>
              {saleData.clientId
                ? clients.find((c) => c.id === saleData.clientId)?.name
                : "Selecione um cliente"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Forma de Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            Forma de Pagamento
          </label>
          <select
            value={saleData.paymentMethod}
            onChange={(e) => setSaleData({ ...saleData, paymentMethod: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Selecione a forma de pagamento</option>
            <option value="A Vista">À Vista</option>
            <option value="A Prazo">A Prazo</option>
            <option value="Bonificação">Bonificação</option>
            <option value="Outras Entradas">Outras Entradas</option>
          </select>
        </div>

        {/* Prazo em dias (só aparece se for A Prazo) */}
        {saleData.paymentMethod === "A Prazo" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prazo (em dias)</label>
            <input
              type="number"
              value={saleData.paymentTerm}
              onChange={(e) => setSaleData({ ...saleData, paymentTerm: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 30, 60, 90..."
              min="1"
              required
            />
          </div>
        )}

        {/* Observações do Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observações do Pagamento</label>
          <textarea
            value={saleData.paymentNotes}
            onChange={(e) => setSaleData({ ...saleData, paymentNotes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows="2"
            placeholder="Detalhes sobre o pagamento..."
          />
        </div>

        {/* Itens da Venda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            Itens da Venda
          </label>
          <button
            type="button"
            onClick={() => setShowItemsModal(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
          >
            <Package className="w-5 h-5" />
            {saleData.items.length > 0 && saleData.items[0].productId
              ? `${saleData.items.length} item(ns) adicionado(s) - Clique para editar`
              : "Clique para adicionar itens"}
          </button>

          {/* Resumo dos itens */}
          {saleData.items.length > 0 && saleData.items[0].productId && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Resumo dos Itens:</h4>
              {saleData.items.map((item, index) => (
                <div key={index} className="text-sm text-gray-600 mb-1">
                  {productos?.find((p) => p.id === item.productId)?.name || "Produto"} - Quantidade: {item.quantity} - R$ {" "}
                  {(item.quantity * item.unitPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data de Carregamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-green-600" />
            Data de Carregamento
          </label>
          <input
            type="date"
            value={saleData.loadingDate}
            onChange={(e) => setSaleData({ ...saleData, loadingDate: e.target.value })}
            onFocus={(e) => e.target.showPicker()}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 cursor-pointer"
            required
          />
        </div>

        {/* Tipo de Frete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-green-600" />
            Tipo de Frete <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="shippingMethod"
                value="CIF"
                checked={saleData.shippingMethod === "CIF"}
                onChange={(e) => setSaleData({ ...saleData, shippingMethod: e.target.value })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                required
              />
              <span className="ml-2 text-gray-700">CIF</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="shippingMethod"
                value="FOB"
                checked={saleData.shippingMethod === "FOB"}
                onChange={(e) => setSaleData({ ...saleData, shippingMethod: e.target.value })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">FOB</span>
            </label>
          </div>
        </div>

        {/* Observações Gerais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            Observações Gerais
          </label>
          <textarea
            value={saleData.generalNotes}
            onChange={(e) => setSaleData({ ...saleData, generalNotes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Observações gerais sobre a venda..."
          />
        </div>

        {/* Total */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total do Pedido:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Success/Error Message */}
        {submitMessage.text && (
          <div
            className={`p-4 rounded-lg ${
              submitMessage.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {isSubmitting ? "Registrando..." : "Registrar Venda"}
        </button>
      </form>

      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={clientModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Cliente</h3>
              <button onClick={() => setShowClientModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar cliente ou propriedade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{client.name}</div>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Itens da Venda */}
      {showItemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={itemsModalRef} className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Itens da Venda
              </h3>
              <button onClick={() => setShowItemsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {saleData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Item {index + 1}
                    </span>
                    {saleData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                      <button
                        type="button"
                        onClick={() => openProductModal(index)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className={item.productId ? "text-gray-900" : "text-gray-500"}>
                          {item.productId
                            ? productos.find((p) => p.id === item.productId)?.name || "Produto selecionado"
                            : "Selecione o Produto"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Talhão</label>
                      <button
                        type="button"
                        onClick={() => openTalhaoModal(index)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className={item.talhao ? "text-gray-900" : "text-gray-500"}>
                          {item.talhao
                            ? talhoes.find((t) => t.id === item.talhao)?.name || "Talhão selecionado"
                            : "Selecione um talhão"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Variedade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Variedade</label>
                      <input
                        type="text"
                        value={item.variety}
                        onChange={(e) => updateItem(index, "variety", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        placeholder="Digite a variedade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
                      <button
                        type="button"
                        onClick={() => openClassificationModal(index)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className={item.classification ? "text-gray-900" : "text-gray-500"}>
                          {item.classification || "Selecione a classificação"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Embalagem</label>
                      <button
                        type="button"
                        onClick={() => openPackagingModal(index)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className={item.packaging ? "text-gray-900" : "text-gray-500"}>
                          {item.packaging
                            ? `${embalagens.find((e) => e.id === item.packaging)?.descricao} - ${embalagens.find((e) => e.id === item.packaging)?.property}`
                            : "Selecione a embalagem"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Quantidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        min="0"
                        required
                      />
                    </div>

                    {/* Preço Unitário */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário</label>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={item.unitPrice === 0 ? "" : item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        onKeyPress={(event) => {
                          if (!/[0-9.]/.test(event.key)) {
                            event.preventDefault()
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="w-full border-2 border-dashed border-green-300 text-green-600 py-3 px-4 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Novo Item
              </button>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-medium text-gray-700">Total do Pedido:</span>
                <span className="text-xl font-bold text-green-600">
                  R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => setShowItemsModal(false)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirmar Itens
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={productModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Produto</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={productoSearchTerm}
                  onChange={(e) => setProductoSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredProductos.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => selectProduct(producto.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{producto.name}</div>
                  </button>
                ))}
                {filteredProductos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhum produto encontrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTalhaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={talhaoModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Talhão</h3>
              <button onClick={() => setShowTalhaoModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar talhão..."
                  value={talhaoSearchTerm}
                  onChange={(e) => setTalhaoSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredTalhoes.map((talhao) => (
                  <button
                    key={talhao.id}
                    onClick={() => selectTalhao(talhao.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{talhao.name}</div>
                  </button>
                ))}
                {filteredTalhoes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhum talhão encontrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showClassificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={classificationModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Classificação</h3>
              <button onClick={() => setShowClassificationModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar classificação..."
                  value={variedadeSearchTerm}
                  onChange={(e) => setVariedadeSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredVariedades.map((variedade) => (
                  <button
                    key={variedade.id}
                    onClick={() => selectClassification(variedade.name)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{variedade.name}</div>
                  </button>
                ))}
                {filteredVariedades.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhuma classificação encontrada</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPackagingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={packagingModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Embalagem</h3>
              <button onClick={() => setShowPackagingModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar embalagem..."
                  value={embalagemSearchTerm}
                  onChange={(e) => setEmbalagemSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredEmbalagens.map((embalagem) => (
                  <button
                    key={embalagem.id}
                    onClick={() => selectPackaging(embalagem.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{embalagem.descricao}</div>
                  </button>
                ))}
                {filteredEmbalagens.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhuma embalagem encontrada</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaleForm
