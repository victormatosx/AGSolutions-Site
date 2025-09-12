// VERSÃO ATUALIZADA - 12/09/2025 17:52
// Este é o componente atualizado com o novo design

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definindo cores mais profissionais
const colors = {
  primary: '#1B5E20', // Verde escuro
  secondary: '#388E3C', // Verde médio
  accent: '#81C784', // Verde claro
  text: {
    primary: '#212121',
    secondary: '#757575',
    light: '#9E9E9E'
  },
  background: {
    main: '#FFFFFF',
    alt: '#F5F5F5',
    highlight: '#E8F5E9'
  },
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.background.main,
    color: colors.text.primary,
    fontSize: 10,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 10
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4
  },
  
  reportInfo: {
    textAlign: 'right',
  },
  
  // Report title section
  titleSection: {
    backgroundColor: colors.background.highlight,
    padding: 15,
    marginBottom: 20,
    borderRadius: 4
  },
  
  reportTitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 5
  },
  
  periodText: {
    color: colors.text.secondary,
    fontSize: 12
  },

  // Stats cards
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },

  statCard: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background.alt,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary
  },

  statLabel: {
    color: colors.text.secondary,
    marginBottom: 4
  },

  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary
  },

  // Table styles
  table: {
    marginTop: 15,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 8,
    color: colors.background.main,
    fontSize: 10,
  },

  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontSize: 9
  },

  tableRowEven: {
    backgroundColor: colors.background.alt,
  },

  cell: {
    flex: 1,
    padding: 4
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10
  },

  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: colors.text.light
  }
});

const SalesReportPDF = ({ sales, selectedSales, clientName = 'Todos os Clientes', dateRange = 'Período não especificado' }) => {
  // Filtra as vendas se específicas forem selecionadas
  const salesToShow = selectedSales && selectedSales.length > 0 
    ? sales.filter(sale => selectedSales.includes(sale.id))
    : sales;

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', 
    currency: 'BRL'
  }).format(value || 0);

  // Cálculos de resumo
  const totals = salesToShow.reduce((acc, sale) => ({
    total: acc.total + (Number(sale.total) || 0),
    quantity: acc.quantity + (sale.items?.length || 0),
  }), { total: 0, quantity: 0 });

  const averageTicket = salesToShow.length ? totals.total / salesToShow.length : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>AG SOLUTIONS</Text>
            <Text>Soluções em Agronegócio</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text>Gerado em: {format(new Date(), "dd/MM/yyyy")}</Text>
            <Text>Hora: {format(new Date(), "HH:mm")}</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>Relatório de Vendas</Text>
          <Text style={styles.periodText}>{dateRange}</Text>
          <Text style={styles.periodText}>Cliente: {clientName}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de Vendas</Text>
            <Text style={styles.statValue}>{salesToShow.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Valor Total</Text>
            <Text style={styles.statValue}>{formatCurrency(totals.total)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ticket Médio</Text>
            <Text style={styles.statValue}>{formatCurrency(averageTicket)}</Text>
          </View>
        </View>

        {/* Sales Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 0.5 }]}>Data</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>Cliente</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>Pagamento</Text>
            <Text style={[styles.cell, { flex: 0.7, textAlign: 'right' }]}>Total</Text>
          </View>

          {salesToShow.map((sale, index) => (
            <View key={sale.id} style={[
              styles.tableRow,
              index % 2 === 0 && styles.tableRowEven
            ]}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{format(new Date(sale.date), "dd/MM/yyyy")}</Text>
              <Text style={[styles.cell, { flex: 1.5 }]}>{sale.client || sale.clientName}</Text>
              <Text style={[styles.cell, { flex: 0.8 }]}>{sale.paymentMethod}</Text>
              <Text style={[styles.cell, { flex: 0.7, textAlign: 'right' }]}>
                {formatCurrency(sale.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>AG SOLUTIONS - Rua Exemplo, 1234 - Centro - Cidade/UF - CEP 12345-678</Text>
          <Text>Tel: (11) 1234-5678 | contato@agsolutions.com.br</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default SalesReportPDF;
