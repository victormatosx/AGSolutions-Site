import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CofounderCard from '../components/CofounderCard';
import '../styles/Home.css';

const Home = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
    setFormData({ name: '', email: '', message: '' });
  };

  const cofounders = [
    {
      name: 'Jeovane Silva',
      role: 'CEO & Cofundador',
      image: 'https://tryeasel.dev/placeholder.svg?width=300&height=300',
      description: 'Especialista em agronegócio com mais de 15 anos de experiência no setor.'
    },
    {
      name: 'Renato Santos',
      role: 'CTO & Cofundador',
      image: 'https://tryeasel.dev/placeholder.svg?width=300&height=300',
      description: 'Engenheiro de software com foco em soluções tecnológicas para agricultura.'
    },
    {
      name: 'Victor Costa',
      role: 'COO & Cofundador',
      image: 'https://tryeasel.dev/placeholder.svg?width=300&height=300',
      description: 'Especialista em operações e gestão de projetos no agronegócio.'
    }
  ];

  return (
    <div className="home">
      <Header />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Inovação para o Agronegócio</h1>
          <p className="hero-subtitle">
            Soluções tecnológicas que transformam a agricultura brasileira
          </p>
          <button className="hero-cta">Conheça Nossas Soluções</button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Quem Somos</h2>
              <p>
                A J.R. Agsolutions é uma empresa inovadora que desenvolve soluções 
                tecnológicas para o agronegócio brasileiro. Nossa missão é transformar 
                a agricultura através da tecnologia, proporcionando maior eficiência, 
                sustentabilidade e produtividade para nossos clientes.
              </p>
              <p>
                Com uma equipe especializada e anos de experiência no setor, oferecemos 
                desde consultoria estratégica até implementação de sistemas avançados 
                de gestão agrícola.
              </p>
            </div>
            <div className="about-image">
              <img src="https://tryeasel.dev/placeholder.svg?width=600&height=400" alt="Agricultura moderna" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team">
        <div className="container">
          <h2>Nossa Equipe</h2>
          <p className="team-subtitle">Conheça os fundadores da J.R. Agsolutions</p>
          <div className="team-grid">
            {cofounders.map((cofounder, index) => (
              <CofounderCard key={index} {...cofounder} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Entre em Contato</h2>
          <p className="contact-subtitle">
            Estamos prontos para ajudar sua empresa a crescer
          </p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Sua mensagem"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Enviar Mensagem</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;