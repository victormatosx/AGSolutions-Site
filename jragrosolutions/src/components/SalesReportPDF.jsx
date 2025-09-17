import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import { format, parseISO, isValid, isDate } from "date-fns"
import matriceLogo from "../assets/matriceLogo.png"

// Cores do tema - simplificadas e discretas
const colors = {
  primary: "#2E7D32",
  secondary: "#4CAF50",
  text: {
    primary: "#212121",
    secondary: "#666666",
    light: "#999999",
  },
  background: {
    main: "#FFFFFF",
    alt: "#F8F8F8",
    header: "#E8F5E9",
  },
  border: "#E0E0E0",
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.background.main,
    color: colors.text.primary,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },

  // Cabeçalho principal do documento
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
    textAlign: 'left',
  },

  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    textAlign: 'left',
  },

  reportSubtitle: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'left',
  },

  // Seção de cada venda
  saleSection: {
    marginBottom: 25,
    pageBreakInside: 'avoid',
  },

  // Cabeçalho da venda
  saleHeader: {
    backgroundColor: colors.background.header,
    padding: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },

  saleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },

  // Layout das informações em duas linhas
  saleInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  saleInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  saleInfoLabel: {
    fontSize: 9,
    color: colors.text.secondary,
    marginRight: 5,
  },

  saleInfoValue: {
    fontSize: 9,
    color: colors.text.primary,
    fontWeight: "bold",
  },

  saleInfoSeparator: {
    marginLeft: 20,
    marginRight: 20,
    color: colors.text.light,
    fontSize: 9,
  },

  // Tabela de itens
  itemsTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
  },

  itemsTableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 8,
    color: colors.background.main,
    fontSize: 9,
    fontWeight: "bold",
  },

  itemsTableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    fontSize: 9,
    minHeight: 24,
    alignItems: "stretch",
    position: 'relative',
  },

  // Separador visual entre colunas
  columnSeparator: {
    width: 1,
    backgroundColor: colors.border,
    height: '100%',
    margin: 0,
  },

  itemsTableRowAlt: {
    backgroundColor: colors.background.alt,
  },

  // Estilo para as células da tabela
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },

  // Estilo para o texto das células
  tableCellText: {
    fontSize: 8,
    lineHeight: 1.2,
  },

  // Colunas da tabela com tamanhos fixos e centralizadas
  itemCol: {
    width: 40,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  productCol: {
    width: 80,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  varietyCol: {
    width: 70,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  talhaoCol: {
    width: 150,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  classificationCol: {
    width: 90,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  packagingCol: {
    width: 80,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityCol: {
    width: 50,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  priceCol: {
    width: 70,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  subtotalCol: {
    width: 80,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  // Total da venda
  saleTotal: {
    backgroundColor: colors.background.main,
    padding: '8 12',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    alignItems: 'flex-end',
  },

  saleTotalText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text.primary,
  },

  // Total geral
  grandTotalSection: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    alignItems: 'flex-end',
  },

  grandTotalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },

  // Rodapé
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: colors.text.light,
    fontSize: 8,
    paddingTop: 10,
  },

  footerLine: {
    marginBottom: 2,
  },

  // Informações de geração
  generationInfo: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 9,
    color: colors.text.secondary,
  },

  // Status cancelada
  canceledBadge: {
    backgroundColor: '#f44336',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginLeft: 10,
  },
})

const SalesReportPDF = ({
  sales,
  selectedSales,
  clientName = "Todos os Clientes",
  hideMonetaryValues = false,
  periodStart = null,
  periodEnd = null
}) => {
  const safeFormatDate = (dateInput) => {
    try {
      if (!dateInput) return "Data não informada"

      let date

      // Handle direct date strings like "16/09/2025"
      if (typeof dateInput === "string") {
        // Check if it's already in Brazilian format DD/MM/YYYY
        const brazilianDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        if (brazilianDateRegex.test(dateInput)) {
          return dateInput // Return as is if already formatted correctly
        }

        // Try parsing as ISO string first
        date = parseISO(dateInput)
        if (isValid(date)) {
          return format(date, "dd/MM/yyyy")
        }

        // Try parsing as timestamp string
        if (/^\d+$/.test(dateInput)) {
          const timestamp = dateInput.length === 10 ? Number(dateInput) * 1000 : Number(dateInput)
          date = new Date(timestamp)
          if (isValid(date)) {
            return format(date, "dd/MM/yyyy")
          }
        }

        // Try parsing common date formats
        const commonFormats = [
          /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
          /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
          /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
        ]

        for (let format of commonFormats) {
          if (format.test(dateInput)) {
            date = new Date(dateInput)
            if (isValid(date)) {
              return format(date, "dd/MM/yyyy")
            }
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

      return "Data inválida"
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput)
      return "Data inválida"
    }
  }

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
          safeSale.client = safeSale.cliente || safeSale.client || safeSale.clientName || "Cliente não informado"
          safeSale.paymentMethod = safeSale.paymentMethod || safeSale.formaPagamento || "Não especificado"
          safeSale.paymentTerms = safeSale.paymentTerms || safeSale.prazoDias || null
          safeSale.orderDate = safeSale.orderDate || safeSale.dataPedido || safeSale.date
          safeSale.loadingDate = safeSale.dataCarregamento || safeSale.loadingDate || null
          safeSale.total = typeof safeSale.total === "number" ? safeSale.total : 0

          if (!Array.isArray(safeSale.items)) {
            safeSale.items = []
          }

          // Format dates - fix the date formatting to use the correct field names
          safeSale.orderDateFormatted = safeFormatDate(safeSale.dataPedido || safeSale.orderDate)
          safeSale.loadingDateFormatted = safeFormatDate(safeSale.dataCarregamento || safeSale.loadingDate)

          safeSale.items = safeSale.items.map((item, index) => ({
            ...item,
            itemNumber: index + 1,
            name: item.name || item.tipoProduto || "Item sem nome",
            productType: item.productType || item.tipoProduto || "Não especificado",
            variety: item.variety || item.variedade || "Não especificado",
            talhao: item.talhao || "Não especificado",
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

  const formatPeriod = () => {
    if (periodStart && periodEnd) {
      return `${safeFormatDate(periodStart)} a ${safeFormatDate(periodEnd)}`
    }
    return `Gerado em ${format(new Date(), "dd/MM/yyyy")}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho do Documento com Logo */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src={matriceLogo} />
            <View style={styles.headerText}>
              <Text style={styles.reportTitle}>AgroColeta - Sistema de Gestão Agrícola</Text>
              <Text style={styles.reportSubtitle}>Controle de Vendas</Text>
            </View>
          </View>
        </View>

        {/* Lista de Vendas */}
        {salesToShow.map((sale, saleIndex) => (
          <View key={sale.id} style={styles.saleSection}>
            {/* Cabeçalho da Venda */}
            <View style={styles.saleHeader}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.saleTitle}>
                  Venda {saleIndex + 1} - {sale.client}
                </Text>
                {sale.status === 'cancelada' && (
                  <Text style={styles.canceledBadge}>Cancelada</Text>
                )}
              </View>

              <Text style={[styles.saleInfoLabel, { marginBottom: 8, fontSize: 10 }]}>Informações da Venda</Text>

              {/* Primeira linha: Cliente e Data do Pedido */}
              <View style={styles.saleInfoRow}>
                <View style={styles.saleInfoGroup}>
                  <Text style={styles.saleInfoLabel}>Cliente:</Text>
                  <Text style={styles.saleInfoValue}>{sale.client}</Text>
                </View>
                <View style={styles.saleInfoGroup}>
                  <Text style={styles.saleInfoLabel}>Data do Pedido:</Text>
                  <Text style={styles.saleInfoValue}>{sale.orderDateFormatted}</Text>
                </View>
              </View>

              {/* Segunda linha: Forma de Pagamento e Data Carregamento */}
              <View style={styles.saleInfoRow}>
                <View style={styles.saleInfoGroup}>
                  <Text style={styles.saleInfoLabel}>Forma de Pagamento:</Text>
                  <Text style={styles.saleInfoValue}>{sale.paymentMethod}</Text>
                  {sale.paymentTerms && (
                    <>
                      <Text style={styles.saleInfoSeparator}>•</Text>
                      <Text style={styles.saleInfoLabel}>Prazo:</Text>
                      <Text style={styles.saleInfoValue}>{sale.paymentTerms} dias</Text>
                    </>
                  )}
                </View>
                {(sale.loadingDate || sale.dataCarregamento) && (
                  <View style={styles.saleInfoGroup}>
                    <Text style={styles.saleInfoLabel}>Data Carregamento:</Text>
                    <Text style={styles.saleInfoValue}>{sale.loadingDateFormatted}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Título da tabela */}
            <View style={{
              backgroundColor: colors.background.main,
              padding: '6 10',
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={[styles.saleInfoLabel, { fontSize: 10 }]}>Itens da Venda</Text>
            </View>

            {/* Tabela de Itens */}
            <View style={styles.itemsTable}>
              {/* Cabeçalho da tabela */}
              <View style={styles.itemsTableHeader}>
                <View style={styles.itemCol}>
                  <Text>Item</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.productCol}>
                  <Text>Produto</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.varietyCol}>
                  <Text>Variedade</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.talhaoCol}>
                  <Text>Talhão</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.classificationCol}>
                  <Text>Classificação</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.packagingCol}>
                  <Text>Embalagem</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.quantityCol}>
                  <Text>Quant.</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.priceCol}>
                  <Text>Preço Unit.</Text>
                </View>
                <View style={styles.columnSeparator} />
                <View style={styles.subtotalCol}>
                  <Text>Subtotal</Text>
                </View>
              </View>

              {/* Linhas da tabela */}
              {sale.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.itemsTableRow,
                    itemIndex % 2 === 1 && styles.itemsTableRowAlt
                  ]}
                >
                  <View style={[styles.itemCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.itemNumber}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.productCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.productType}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.varietyCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.variety}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.talhaoCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.talhao}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.classificationCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.classification}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.packagingCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.packaging}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.quantityCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{item.quantity}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.priceCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{formatCurrency(item.price)}</Text>
                  </View>
                  <View style={styles.columnSeparator} />
                  <View style={[styles.subtotalCol, styles.tableCell]}>
                    <Text style={styles.tableCellText}>{formatCurrency(item.total)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Total da Venda */}
            <View style={styles.saleTotal}>
              <Text style={styles.saleTotalText}>
                Total desta Venda: {formatCurrency(sale.total)}
              </Text>
            </View>
          </View>
        ))}

        {/* Total Geral */}
        <View style={styles.grandTotalSection}>
          <Text style={styles.grandTotalText}>
            Total Geral do Relatório: {formatCurrency(grandTotal)}
          </Text>
        </View>


        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Relatório gerado em {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</Text>
          <Text>Propriedade: Matrice</Text>
          <Text style={styles.footerLine}>J. R. AgroSolutions</Text>
        </View>
      </Page>
    </Document>
  )
}

export default SalesReportPDF