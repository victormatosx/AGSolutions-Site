// script.js - Página principal (Dashboard)
import { setupSidebar, setupHeaderButtons, setupAuth, getUserPropriedade, database, ref, get } from './common.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando dashboard...");
  setupSidebar();
  setupHeaderButtons();
  setupAuth((user, propriedadeNome) => {
    showDashboard(propriedadeNome);
  });
});

// Função para exibir o dashboard
async function showDashboard(propriedadeNome) {
  try {
    // Buscar dados resumidos para o dashboard
    const [maquinariosSnapshot, implementosSnapshot, direcionadoresSnapshot, usersSnapshot] = await Promise.all([
      get(ref(database, `propriedades/${propriedadeNome}/maquinarios`)),
      get(ref(database, `propriedades/${propriedadeNome}/implementos`)),
      get(ref(database, `propriedades/${propriedadeNome}/direcionadores`)),
      get(ref(database, `propriedades/${propriedadeNome}/users`)),
    ]);

    // Contar itens
    const maquinariosCount = maquinariosSnapshot.exists() ? Object.keys(maquinariosSnapshot.val()).length : 0;
    const implementosCount = implementosSnapshot.exists() ? Object.keys(implementosSnapshot.val()).length : 0;
    const direcionadoresCount = direcionadoresSnapshot.exists() ? Object.keys(direcionadoresSnapshot.val()).length : 0;
    const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;

    // Renderizar o dashboard
    const dataContainer = document.getElementById("data-container");
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
        
        <div class="dashboard-welcome">
          <div class="welcome-icon">
            <i class="fas fa-farm"></i>
          </div>
          <div class="welcome-text">
            <h3>Bem-vindo à Fazenda ${propriedadeNome}</h3>
            <p>Visualize o resumo das suas operações e recursos abaixo.</p>
          </div>
        </div>
        
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-tractor"></i>
            </div>
            <div class="card-content">
              <h3>${maquinariosCount}</h3>
              <p>Maquinários</p>
            </div>
            <div class="card-action">
              <a href="cadastros.html" class="card-button" data-action="view-maquinas">
                <i class="fas fa-eye"></i> Ver
              </a>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-tools"></i>
            </div>
            <div class="card-content">
              <h3>${implementosCount}</h3>
              <p>Implementos</p>
            </div>
            <div class="card-action">
              <a href="cadastros.html" class="card-button" data-action="view-implementos">
                <i class="fas fa-eye"></i> Ver
              </a>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-compass"></i>
            </div>
            <div class="card-content">
              <h3>${direcionadoresCount}</h3>
              <p>Direcionadores</p>
            </div>
            <div class="card-action">
              <a href="cadastros.html" class="card-button" data-action="view-direcionadores">
                <i class="fas fa-eye"></i> Ver
              </a>
            </div>
          </div>
          
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <h3>${usersCount}</h3>
              <p>Usuários</p>
            </div>
            <div class="card-action">
              <a href="cadastros.html" class="card-button" data-action="view-users">
                <i class="fas fa-eye"></i> Ver
              </a>
            </div>
          </div>
        </div>
        
        <div class="dashboard-actions">
          <div class="action-section">
            <h3><i class="fas fa-clipboard-list"></i> Ações Rápidas</h3>
            <div class="action-buttons">
              <a href="apontamentos.html" class="action-button">
                <i class="fas fa-plus-circle"></i> Novo Apontamento
              </a>
              <a href="cadastros.html" class="action-button">
                <i class="fas fa-plus-circle"></i> Nova Máquina
              </a>
              <a href="cadastros.html" class="action-button">
                <i class="fas fa-plus-circle"></i> Novo Implemento
              </a>
              <a href="cadastros.html" class="action-button">
                <i class="fas fa-plus-circle"></i> Novo Direcionador
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar estilos CSS para o dashboard
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .dashboard-welcome {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 30px;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #4CAF50;
      }
      
      .welcome-icon {
        font-size: 2.5rem;
        margin-right: 20px;
        color: #4CAF50;
      }
      
      .welcome-text h3 {
        margin: 0 0 10px 0;
        color: #333;
      }
      
      .welcome-text p {
        margin: 0;
        color: #666;
      }
      
      .dashboard-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .dashboard-card {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .dashboard-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      }
      
      .dashboard-card:nth-child(1) {
        border-top: 4px solid #4CAF50;
      }
      
      .dashboard-card:nth-child(2) {
        border-top: 4px solid #2196F3;
      }
      
      .dashboard-card:nth-child(3) {
        border-top: 4px solid #9C27B0;
      }
      
      .dashboard-card:nth-child(4) {
        border-top: 4px solid #FF9800;
      }
      
      .card-icon {
        font-size: 2rem;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .dashboard-card:nth-child(1) .card-icon {
        color: #4CAF50;
      }
      
      .dashboard-card:nth-child(2) .card-icon {
        color: #2196F3;
      }
      
      .dashboard-card:nth-child(3) .card-icon {
        color: #9C27B0;
      }
      
      .dashboard-card:nth-child(4) .card-icon {
        color: #FF9800;
      }
      
      .card-content {
        text-align: center;
        flex-grow: 1;
      }
      
      .card-content h3 {
        font-size: 2.5rem;
        margin: 0 0 5px 0;
        color: #333;
      }
      
      .card-content p {
        margin: 0;
        color: #666;
        font-size: 1rem;
      }
      
      .card-action {
        margin-top: 15px;
        text-align: center;
      }
      
      .card-button {
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 15px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s, transform 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }
      
      .card-button:hover {
        background-color: #1976D2;
        transform: translateY(-2px);
      }
      
      .dashboard-actions {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      
      .action-section h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
        display: flex;
        align-items: center;
      }
      
      .action-section h3 i {
        margin-right: 10px;
        color: #4CAF50;
      }
      
      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .action-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.2s, transform 0.2s;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-decoration: none;
      }
      
      .action-button:hover {
        background-color: #45a049;
        transform: translateY(-2px);
      }
      
      .action-button i {
        margin-right: 8px;
      }
      
      @media (max-width: 768px) {
        .dashboard-cards {
          grid-template-columns: 1fr;
        }
        
        .action-buttons {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styleElement);
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    document.getElementById("data-container").innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar o dashboard: ${error.message}
        </p>
      </div>
    `;
  }
}