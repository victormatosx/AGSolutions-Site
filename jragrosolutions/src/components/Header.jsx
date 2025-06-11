import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import logoBranca from '../assets/logo2.png';
import logoVerde from '../assets/logo3.png';

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
            <img src={isScrolled ? logoVerde : logoBranca} alt="J.R. Agsolutions" className="logo-image" />
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className={`nav-link ${!isScrolled ? 'text-white' : ''}`}>Home</Link>
          <Link to="#about" className={`nav-link ${!isScrolled ? 'text-white' : ''}`}>Sobre</Link>
          <Link to="#team" className={`nav-link ${!isScrolled ? 'text-white' : ''}`}>Equipe</Link>
          <Link to="#contact" className={`nav-link ${!isScrolled ? 'text-white' : ''}`}>Contato</Link>
          <Link to="/login" className="nav-link client-area">Área do Cliente</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;