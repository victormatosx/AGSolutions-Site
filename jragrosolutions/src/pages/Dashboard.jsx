import React from 'react';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-nav">
          <h1>J.R. Agsolutions</h1>
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h2>Bem-vindo, {user?.name}!</h2>
            <p>Acesse suas informações e relatórios abaixo</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Relatórios</h3>
              <p>Visualize seus relatórios de produção e análises</p>
              <button className="card-btn">Ver Relatórios</button>
            </div>

            <div className="dashboard-card">
              <h3>Projetos</h3>
              <p>Acompanhe o andamento dos seus projetos</p>
              <button className="card-btn">Ver Projetos</button>
            </div>

            <div className="dashboard-card">
              <h3>Suporte</h3>
              <p>Entre em contato com nossa equipe de suporte</p>
              <button className="card-btn">Contatar Suporte</button>
            </div>

            <div className="dashboard-card">
              <h3>Configurações</h3>
              <p>Gerencie suas preferências e configurações</p>
              <button className="card-btn">Configurar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;