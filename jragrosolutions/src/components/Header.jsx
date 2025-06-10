import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">J.R. Agsolutions</span>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="#about" className="nav-link">Sobre</Link>
          <Link to="#team" className="nav-link">Equipe</Link>
          <Link to="#contact" className="nav-link">Contato</Link>
          <Link to="/login" className="nav-link client-area">Área do Cliente</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;