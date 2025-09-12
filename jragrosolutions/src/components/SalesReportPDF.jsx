// VERSÃO ATUALIZADA - 11/09/2025 17:52
// Este é o componente atualizado com o novo design

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Cores da marca
const colors = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  text: '#333333',
  lightText: '#666666',
  border: '#E0E0E0',
  background: '#F5F5F5',
  success: '#388E3C',
  warning: '#F57C00',
  error: '#D32F2F'
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  // Cabeçalho
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  headerInfo: {
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.lightText,
    marginBottom: 3,
  },
  // Informações da Venda
  saleInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.lightText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'medium',
  },
  // Tabela de Itens
  table: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableCol: {
    padding: 5,
  },
  tableCell: {
    fontSize: 9,
    padding: 2,
  },
  // Resumo Financeiro
  summary: {
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    width: '70%',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 10,
    color: colors.lightText,
  },
  summaryValue: {
    width: '30%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'medium',
  },
  totalRow: {
    backgroundColor: colors.background,
    fontWeight: 'bold',
  },
  // Rodapé
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: colors.lightText,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // Status
  status: {
    padding: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    minWidth: 60,
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
    color: colors.success,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: colors.warning,
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    color: colors.error,
  },
});

// Componente para exibir o status da venda
const StatusBadge = ({ status }) => {
  const statusMap = {
    'pago': { label: 'PAGO', style: styles.statusPaid },
    'pendente': { label: 'PENDENTE', style: styles.statusPending },
    'cancelado': { label: 'CANCELADO', style: styles.statusCancelled },
  };

  const statusInfo = statusMap[status?.toLowerCase()] || { label: status || 'N/A', style: styles.statusPending };

  return (
    <View style={[styles.status, statusInfo.style]}>
      <Text>{statusInfo.label}</Text>
    </View>
  );
};

const SalesReportPDF = ({ sales, selectedSales, clientName = 'Todos os Clientes', dateRange = 'Período não especificado' }) => {
  // Filtra as vendas se específicas forem selecionadas
  const salesToShow = selectedSales && selectedSales.length > 0 
    ? sales.filter(sale => selectedSales.includes(sale.id))
    : sales;

  // Formatação de moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  // Formatação de data
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString || '--/--/---- --:--';
    }
  };

  // Calcula totais
  const calculateTotals = () => {
    let subtotal = 0;
    let discount = 0;
    let total = 0;
    let totalItems = 0;

    salesToShow.forEach(sale => {
      subtotal += Number(sale.subtotal) || 0;
      discount += Number(sale.discount) || 0;
      total += Number(sale.total) || 0;
      totalItems += sale.items?.length || 0;
    });

    return { subtotal, discount, total, totalItems };
  };

  const { subtotal, discount, total, totalItems } = calculateTotals();
  const totalSales = salesToShow.length;
  const averageTicket = totalSales > 0 ? total / totalSales : 0;

  // Pega a primeira venda para exibir detalhes (assumindo relatório de uma única venda)
  const sale = salesToShow[0] || {};
  const items = sale.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AG SOLUTIONS</Text>
            <Text style={styles.headerSubtitle}>Soluções em Agronegócio</Text>
            <Text style={styles.headerSubtitle}>CNPJ: 12.345.678/0001-90</Text>
            <Text style={styles.headerSubtitle}>contato@agsolutions.com.br</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>RELATÓRIO DE VENDA</Text>
            <Text style={styles.headerSubtitle}>Nº {sale.id || '--'}</Text>
            <Text style={styles.headerSubtitle}>
              Emissão: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
            <View style={{ marginTop: 5 }}>
              <StatusBadge status={sale.status || 'pendente'} />
            </View>
          </View>
        </View>

        {/* Informações da Venda */}
        <View style={styles.saleInfo}>
          <Text style={styles.sectionTitle}>DADOS DA VENDA</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data da Venda</Text>
              <Text style={styles.infoValue}>{formatDate(sale.date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vendedor</Text>
              <Text style={styles.infoValue}>{sale.seller || 'Não informado'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Forma de Pagamento</Text>
              <Text style={styles.infoValue}>{sale.paymentMethod || 'Não informado'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Condição de Pagamento</Text>
              <Text style={styles.infoValue}>{sale.paymentTerms || 'À vista'}</Text>
            </View>
          </View>
        </View>

        {/* Informações do Cliente */}
        <View style={styles.saleInfo}>
          <Text style={styles.sectionTitle}>DADOS DO CLIENTE</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome/Razão Social</Text>
              <Text style={styles.infoValue}>{sale.client || 'Cliente não informado'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CPF/CNPJ</Text>
              <Text style={styles.infoValue}>{sale.clientDocument || '--'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{sale.clientPhone || '--'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{sale.clientEmail || '--'}</Text>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>
                {[
                  sale.clientAddress?.street,
                  sale.clientAddress?.number,
                  sale.clientAddress?.complement,
                  sale.clientAddress?.neighborhood,
                  sale.clientAddress?.city,
                  sale.clientAddress?.state,
                  sale.clientAddress?.zipCode
                ].filter(Boolean).join(', ') || '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Itens da Venda */}
        <View>
          <Text style={styles.sectionTitle}>ITENS DA VENDA</Text>
          <View style={styles.table}>
            {/* Cabeçalho da Tabela */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCol, { width: '10%' }]}>CÓDIGO</Text>
              <Text style={[styles.tableCol, { width: '35%' }]}>DESCRIÇÃO</Text>
              <Text style={[styles.tableCol, { width: '10%', textAlign: 'right' }]}>QTD</Text>
              <Text style={[styles.tableCol, { width: '15%', textAlign: 'right' }]}>VALOR UNIT.</Text>
              <Text style={[styles.tableCol, { width: '15%', textAlign: 'right' }]}>DESCONTO</Text>
              <Text style={[styles.tableCol, { width: '15%', textAlign: 'right' }]}>TOTAL</Text>
            </View>

            {/* Linhas dos Itens */}
            {items.length > 0 ? (
              items.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '10%' }]}>{item.code || '--'}</Text>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '35%' }]}>{item.name || 'Produto sem nome'}</Text>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '10%', textAlign: 'right' }]}>{item.quantity || 0}</Text>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatCurrency(item.discount)}</Text>
                  <Text style={[styles.tableCol, styles.tableCell, { width: '15%', textAlign: 'right', fontWeight: 'bold' }]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.tableRow, { justifyContent: 'center', padding: 10 }]}>
                <Text style={{ fontStyle: 'italic', color: colors.lightText }}>Nenhum item encontrado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descontos:</Text>
            <Text style={styles.summaryValue}>- {formatCurrency(discount)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>TOTAL:</Text>
            <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>{formatCurrency(total)}</Text>
          </View>
          
          {sale.paymentTerms && sale.paymentTerms.toLowerCase() !== 'à vista' && (
            <View style={{ marginTop: 15 }}>
              <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>CONDIÇÃO DE PAGAMENTO</Text>
              <Text style={{ fontSize: 9, color: colors.lightText }}>{sale.paymentTerms}</Text>
            </View>
          )}
          
          {sale.notes && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>OBSERVAÇÕES</Text>
              <Text style={{ fontSize: 9, color: colors.lightText, textAlign: 'justify' }}>{sale.notes}</Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>AG SOLUTIONS - Rua Exemplo, 1234 - Bairro - Cidade/UF - CEP: 12345-678</Text>
          <Text>Telefone: (11) 1234-5678 | E-mail: contato@agsolutions.com.br | Site: www.agsolutions.com.br</Text>
          <Text style={{ marginTop: 5 }}>Este documento não é um documento fiscal. Emitido em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Função auxiliar para obter o nome do cliente (mesma usada no SalesList)
const getClientName = (clientId, clients = []) => {
  const client = clients.find(c => c.id === clientId);
  return client ? client.name : 'Cliente não encontrado';
};

export default SalesReportPDF;
