import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>J.R. Agsolutions</h3>
            <p>Soluções inovadoras para o agronegócio brasileiro</p>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <p>📧 contato@jragrosolutions.com.br</p>
            <p>📱 (11) 99999-9999</p>
            <p>📍 São Paulo, SP</p>
          </div>
          <div className="footer-section">
            <h4>Redes Sociais</h4>
            <div className="social-links">
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Facebook</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 J.R. Agsolutions. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;