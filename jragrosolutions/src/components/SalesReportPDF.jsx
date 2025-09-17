// VERSÃO ATUALIZADA - Estrutura completa do relatório
// Este é o componente atualizado com o novo design detalhado por venda

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { format, parseISO, isValid, isDate } from "date-fns"
import matriceLogo from "../assets/matriceLogo.png"

// Cores do tema
const colors = {
  primary: "#2E7D32", // Verde mais escuro
  secondary: "#388E3C", // Verde médio
  accent: "#81C784", // Verde claro
  text: {
    primary: "#212121",
    secondary: "#424242",
    light: "#757575",
  },
  background: {
    main: "#FFFFFF",
    alt: "#FAFAFA",
    highlight: "#E8F5E9",
  },
  border: "#BDBDBD",
  headerBg: "#1B5E20", // Verde escuro para cabeçalho
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: colors.background.main,
    color: colors.text.primary,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },

  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  logoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginBottom: 10,
  },

  logo: {
    width: 120,
    height: 'auto',
    maxHeight: 50,
    marginRight: 15,
  },

  headerText: {
    flex: 1,
  },

  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  subtitle: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 8,
  },

  saleSection: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
    pageBreakInside: 'avoid',
  },

  saleHeader: {
    backgroundColor: colors.headerBg,
    padding: '8 12',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  saleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  saleInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },

  saleInfoItem: {
    marginBottom: 4,
  },

  saleInfoLabel: {
    fontSize: 9,
    color: colors.text.secondary,
    fontWeight: "bold",
  },

  saleInfoValue: {
    fontSize: 10,
    color: colors.text.primary,
  },

  itemsTable: {
    marginTop: 10,
  },

  itemsTableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: '6 8',
    color: colors.background.main,
    fontSize: 8,
    fontWeight: "bold",
  },

  itemsTableRow: {
    flexDirection: "row",
    padding: '6 8',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    fontSize: 8,
    minHeight: 20,
  },

  itemsTableRowEven: {
    backgroundColor: colors.background.alt,
  },

  itemCol: { flex: 0.5, padding: '0 2' }, // Item
  productCol: { flex: 1.5, padding: '0 2' }, // Produto
  talhaoCol: { flex: 1.2, padding: '0 2' }, // Talhão
  varietyCol: { flex: 1, padding: '0 2' }, // Variedade
  classificationCol: { flex: 0.8, padding: '0 2' }, // Classificação
  packagingCol: { flex: 0.8, padding: '0 2' }, // Embalagem
  quantityCol: { flex: 0.6, padding: '0 2', textAlign: "right" }, // Quant.
  priceCol: { flex: 0.9, padding: '0 2', textAlign: "right" }, // Preço Unit.
  subtotalCol: { flex: 0.9, padding: '0 2', textAlign: "right" }, // Subtotal

  saleTotal: {
    backgroundColor: colors.background.alt,
    padding: '8 12',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },

  saleTotalText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
  },

  grandTotal: {
    backgroundColor: colors.primary,
    padding: '10 15',
    marginTop: 20,
    borderRadius: 2,
    alignItems: 'flex-end',
  },

  grandTotalText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.background.main,
  },

  // Footer styles
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: colors.text.secondary,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },

  generationDate: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 15,
    fontSize: 10,
    color: colors.text.secondary,
  },

  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: colors.text.light,
  },
})

const SalesReportPDF = ({ sales, selectedSales, clientName = "Todos os Clientes", hideMonetaryValues = false }) => {
  // Safe date formatter with better error handling
  const safeFormatDate = (dateInput) => {
    try {
      if (!dateInput) return "Data não informada"

      let date

      if (typeof dateInput === "string") {
        date = parseISO(dateInput)
        if (isValid(date)) {
          return format(date, "dd/MM/yyyy")
        }

        if (/^\d+$/.test(dateInput)) {
          const timestamp = dateInput.length === 10 ? Number(dateInput) * 1000 : Number(dateInput)
          date = new Date(timestamp)
          if (isValid(date)) {
            return format(date, "dd/MM/yyyy")
          }
        }
      }

      if (typeof dateInput === "number") {
        const timestamp = dateInput.toString().length === 10 ? dateInput * 1000 : dateInput
        date = new Date(timestamp)
        if (isValid(date)) {
          return format(date, "dd/MM/yyyy")
        }
      }

      if (isDate(dateInput) && isValid(dateInput)) {
        return format(dateInput, "dd/MM/yyyy")
      }

      if (date && isValid(date)) {
        return format(date, "dd/MM/yyyy")
      }

      return "Data inválida"
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput)
      return "Data inválida"
    }
  }

  // Process sales data with proper error handling
  const processSalesData = (salesData) => {
    if (!Array.isArray(salesData)) {
      console.error("Invalid sales data:", salesData)
      return []
    }

    return salesData
      .map((sale) => {
        try {
          if (!sale || typeof sale !== "object") {
            console.warn("Invalid sale item:", sale)
            return null
          }

          const safeSale = { ...sale }

          safeSale.id = safeSale.id || `sale-${Math.random().toString(36).substr(2, 9)}`
          // Use the cliente field directly from the sale object
          safeSale.client = safeSale.cliente || safeSale.client || safeSale.clientName || "Cliente não informado"
          safeSale.paymentMethod = safeSale.paymentMethod || safeSale.formaPagamento || "Não especificado"
          safeSale.paymentTerms = safeSale.paymentTerms || safeSale.prazoDias || null
          safeSale.orderDate = safeSale.orderDate || safeSale.dataPedido || safeSale.date
          // Ensure dataCarregamento is properly mapped to loadingDate
          safeSale.loadingDate = safeSale.dataCarregamento || safeSale.loadingDate || null
          safeSale.total = typeof safeSale.total === "number" ? safeSale.total : 0

          if (!Array.isArray(safeSale.items)) {
            safeSale.items = []
          }

          if (!safeSale.orderDate) {
            safeSale.orderDate = new Date().toISOString()
          } else {
            try {
              const date = new Date(safeSale.orderDate)
              if (isValid(date)) {
                safeSale.orderDate = date.toISOString()
              } else {
                safeSale.orderDate = new Date().toISOString()
              }
            } catch (e) {
              safeSale.orderDate = new Date().toISOString()
            }
          }

          safeSale.items = safeSale.items.map((item, index) => ({
            ...item,
            itemNumber: index + 1,
            name: item.name || item.tipoProduto || "Item sem nome",
            productType: item.productType || item.tipoProduto || "Não especificado",
            variety: item.variety || item.variedade || "Não especificado",
            classification: item.classification || item.classificacao || "Não especificado",
            packaging: item.packaging || item.embalagem || "Não especificado",
            quantity:
              typeof item.quantity === "number"
                ? item.quantity
                : typeof item.quantidade === "number"
                  ? item.quantidade
                  : 0,
            price: typeof item.price === "number" ? item.price : typeof item.preco === "number" ? item.preco : 0,
            total:
              typeof item.total === "number"
                ? item.total
                : typeof item.valorTotal === "number"
                  ? item.valorTotal
                  : (typeof item.quantity === "number"
                      ? item.quantity
                      : typeof item.quantidade === "number"
                        ? item.quantidade
                        : 0) *
                    (typeof item.price === "number" ? item.price : typeof item.preco === "number" ? item.preco : 0),
          }))

          return safeSale
        } catch (error) {
          console.error("Error processing sale:", error, "Sale data:", sale)
          return null
        }
      })
      .filter(Boolean)
  }

  // Filter and process sales
  const salesToShow = processSalesData(
    selectedSales?.length > 0 ? sales.filter((sale) => selectedSales.includes(sale?.id)) : sales,
  )

  const formatCurrency = (value) => {
    if (hideMonetaryValues) return "******"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0)
  }

  const grandTotal = salesToShow.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src={matriceLogo} />
            <View style={styles.headerText}>
              <Text style={styles.reportTitle}>Relatório Sistema de Gestão Agrícola AgroColeta</Text>
              <Text style={styles.subtitle}>Sistema de Controle de Vendas</Text>
            </View>
          </View>
        </View>

        {salesToShow.map((sale, saleIndex) => (
          <View key={sale.id} style={styles.saleSection}>
            {/* Cabeçalho da Venda */}
            <View style={styles.saleHeader}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text style={styles.saleTitle}>
                  Venda {saleIndex + 1} - {sale.client}
                </Text>
                {sale.status === 'cancelada' && (
                  <Text style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    Cancelada
                  </Text>
                )}
              </View>

              {/* Informações da Venda */}
              <View style={styles.saleInfoGrid}>
                <View style={styles.saleInfoItem}>
                  <Text style={styles.saleInfoLabel}>Cliente:</Text>
                  <Text style={styles.saleInfoValue}>{sale.client}</Text>
                </View>

                <View style={styles.saleInfoItem}>
                  <Text style={styles.saleInfoLabel}>Forma Pagamento:</Text>
                  <Text style={styles.saleInfoValue}>{sale.paymentMethod}</Text>
                </View>

                {sale.paymentTerms && (
                  <View style={styles.saleInfoItem}>
                    <Text style={styles.saleInfoLabel}>Prazo Dias:</Text>
                    <Text style={styles.saleInfoValue}>{sale.paymentTerms} dias</Text>
                  </View>
                )}

                <View style={styles.saleInfoItem}>
                  <Text style={styles.saleInfoLabel}>Data Pedido:</Text>
                  <Text style={styles.saleInfoValue}>{sale.dataPedido || sale.orderDate}</Text>
                </View>

                {(sale.loadingDate || sale.dataCarregamento) && (
                  <View style={styles.saleInfoItem}>
                    <Text style={styles.saleInfoLabel}>Data Carregamento:</Text>
                    <Text style={styles.saleInfoValue}>
                      {sale.dataCarregamento || sale.loadingDate}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Tabela de Itens da Venda */}
            <View style={styles.itemsTable}>
              <View style={styles.itemsTableHeader}>
                <Text style={styles.itemCol}>Item</Text>
                <Text style={styles.productCol}>Produto</Text>
                <Text style={styles.talhaoCol}>Talhão</Text>
                <Text style={styles.varietyCol}>Variedade</Text>
                <Text style={styles.classificationCol}>Classificação</Text>
                <Text style={styles.packagingCol}>Embalagem</Text>
                <Text style={styles.quantityCol}>Quant.</Text>
                <Text style={styles.priceCol}>Preço Unit.</Text>
                <Text style={styles.subtotalCol}>Subtotal</Text>
              </View>

              {sale.items.map((item, itemIndex) => (
                <View key={itemIndex} style={[styles.itemsTableRow, itemIndex % 2 === 0 && styles.itemsTableRowEven]}>
                  <Text style={styles.itemCol}>{item.itemNumber}</Text>
                  <Text style={styles.productCol}>{item.productType}</Text>
                  <Text style={styles.talhaoCol}>{item.talhao || '-'}</Text>
                  <Text style={styles.varietyCol}>{item.variety}</Text>
                  <Text style={styles.classificationCol}>{item.classification}</Text>
                  <Text style={styles.packagingCol}>{item.packaging}</Text>
                  <Text style={styles.quantityCol}>{item.quantity}</Text>
                  <Text style={styles.priceCol}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.subtotalCol}>{formatCurrency(item.total)}</Text>
                </View>
              ))}
            </View>

            {/* Total da Venda */}
            <View style={styles.saleTotal}>
              <Text style={styles.saleTotalText}>Total dessa Venda: {formatCurrency(sale.total)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalText}>Total Geral do Relatório: {formatCurrency(grandTotal)}</Text>
        </View>

        <View style={styles.generationDate}>
          <Text>Relatório gerado em {format(new Date(), "dd/MM/yyyy")}</Text>
        </View>

        <View style={styles.footer}>
          <Text>J.R. AGSOLUTIONS - Rua Gameleiras, 529 - Campestre - São Gotardo/MG - CEP 38.800-000</Text>
          <Text>Tel: (34) 9 9653-2577 | contato@jragrosolutions.com.br</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

export default SalesReportPDF
