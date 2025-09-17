import { useState, useEffect } from "react"
import { DollarSign, Users } from 'lucide-react'
import { ref, onValue } from "firebase/database"
import { database } from "../firebase/firebase"

const DashboardVendas = ({ salesData }) => {
  const [totalClients, setTotalClients] = useState(0);
  const [stats, setStats] = useState([
    {
      title: "Vendas do Mês",
      value: "R$ 0,00",
      change: "0%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clientes Ativos",
      value: "0",
      change: "0%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clientes Totais",
      value: "0",
      change: "0%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    }
  ])

  // Load total clients from Firebase on component mount
  useEffect(() => {
    const propriedadesRef = ref(database, "propriedades");
    
    const unsubscribe = onValue(propriedadesRef, (snapshot) => {
      let clientCount = 0;
      
      snapshot.forEach((property) => {
        const propertyData = property.val();
        if (propertyData.clientes) {
          clientCount += Object.keys(propertyData.clientes).length;
        }
      });
      
      setTotalClients(clientCount);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log('Sales data received in DashboardVendas:', salesData);
    
    // Always update the stats when either salesData or totalClients changes
    const updateStats = () => {
      if (salesData && salesData.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        console.log(`Filtering sales for month: ${currentMonth + 1}/${currentYear}`);

        // Filtrar vendas não canceladas
        let validSales = salesData.filter(sale => {
          if (!sale) return false;
          
          const status = sale.status?.toLowerCase();
          if (status === 'cancelada') {
            console.log('Skipping canceled sale:', sale.id);
            return false;
          }
          
          // Tenta obter a data da venda
          const saleDate = new Date(sale.dataPedido || sale.date || sale.criadoEm || now);
          const isValidDate = !isNaN(saleDate.getTime());
          
          if (!isValidDate) {
            console.log(`Sale ${sale.id || 'unknown'} has an invalid date, including it`);
            return true; // Inclui vendas com data inválida
          }
          
          // Verifica se a data está no mês atual
          const isCurrentMonth = saleDate.getMonth() === currentMonth && 
                              saleDate.getFullYear() === currentYear;
          
          console.log(`Sale ${sale.id || 'unknown'} - Date: ${saleDate}, Is Current Month: ${isCurrentMonth}, Status: ${status}`);
          
          // Se não há vendas no mês atual, inclui todas as não canceladas
          const hasCurrentMonthSales = salesData.some(s => {
            if (!s || s.status?.toLowerCase() === 'cancelada') return false;
            const d = new Date(s.dataPedido || s.date || s.criadoEm);
            return !isNaN(d.getTime()) && 
                  d.getMonth() === currentMonth && 
                  d.getFullYear() === currentYear;
          });
          
          return hasCurrentMonthSales ? isCurrentMonth : true;
        });

        console.log('Valid sales for current month:', validSales);

        // Calcular estatísticas baseadas nos dados filtrados
        const totalSales = validSales.reduce((sum, sale) => {
          const saleValue = Number(sale.valorTotal) || Number(sale.total) || 0;
          console.log(`Sale ${sale.id || 'unknown'} value:`, saleValue);
          return sum + saleValue;
        }, 0);
        
        console.log('Total sales value:', totalSales);

        const uniqueClients = new Set(validSales
          .map(sale => sale.clientId || sale.clienteId || '')
          .filter(id => id !== '')
        ).size;
        
        console.log('Unique clients:', uniqueClients);
        console.log('Total clients from state:', totalClients);

        const updatedStats = [
          {
            ...stats[0],
            value: totalSales.toLocaleString('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }),
            change: "+12%"
          },
          {
            ...stats[1],
            value: uniqueClients.toString(),
            change: "+8%"
          },
          {
            ...stats[2],
            value: totalClients > 0 ? totalClients.toString() : '0',
            change: "+15%"
          }
        ];
        
        console.log('Updated stats:', updatedStats);
        return updatedStats;
      } else {
        console.log('No sales data available or empty array');
        // Return default stats with the current totalClients
        return [
          stats[0],
          stats[1],
          {
            ...stats[2],
            value: totalClients > 0 ? totalClients.toString() : '0'
          }
        ];
      }
    };

    setStats(updateStats());
  }, [salesData, totalClients])

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de Vendas</h2>
        <p className="text-gray-600">Acompanhe o desempenho das suas vendas em tempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default DashboardVendas
