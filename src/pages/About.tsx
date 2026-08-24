import React from 'react';

export const About: React.FC = () => {
  return (
    <section className="section-container" style={{ paddingTop: '60px' }}>
      <div className="section-header">
        <h2>Sobre S.M.A.R.T</h2>
        <p>Una plataforma de movilidad empresarial diseñada para optimizar los recursos logísticos.</p>
      </div>
      <div className="about-box">
        <div className="about-text">
          <h3>Propósito de la Plataforma</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            S.M.A.R.T es una plataforma inteligente de gestión y control de transporte diseñada para centralizar la administración de recursos, rutas y operaciones en un solo lugar.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
            Buscamos entregar a las organizaciones una herramienta de alto nivel técnico para el control de la flota, conductores e itinerarios de viajes, permitiendo la toma de decisiones oportuna.
          </p>
        </div>
        <div className="about-bullets">
          <div className="bullet-item">
            <span className="bullet-icon">⚡</span>
            <div>
              <h4 style={{ marginBottom: '0.2rem' }}>Administración</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Control centralizado</p>
            </div>
          </div>
          <div className="bullet-item">
            <span className="bullet-icon">📅</span>
            <div>
              <h4 style={{ marginBottom: '0.2rem' }}>Organización</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Itinerarios ordenados</p>
            </div>
          </div>
          <div className="bullet-item">
            <span className="bullet-icon">🔍</span>
            <div>
              <h4 style={{ marginBottom: '0.2rem' }}>Control</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supervisión de flota</p>
            </div>
          </div>
          <div className="bullet-item">
            <span className="bullet-icon">ℹ️</span>
            <div>
              <h4 style={{ marginBottom: '0.2rem' }}>Consulta</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Datos transparentes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
