import React from 'react';
import type { User } from '../types';

interface HomeProps {
  setActiveView: (view: string) => void;
  currentUser: User | null;
}

export const Home: React.FC<HomeProps> = ({ setActiveView, currentUser }) => {
  return (
    <>
      <section className="hero-section">
        <span className="hero-tag">Transporte Inteligente</span>
        <h1 className="hero-title">Gestiona tu transporte de forma <span>inteligente.</span></h1>
        <p className="hero-subtitle">S.M.A.R.T centraliza la administración, control y consulta de las operaciones de transporte en una sola plataforma corporativa.</p>
        <div className="hero-buttons">
          <a href="#routes" className="btn btn-primary" onClick={() => setActiveView('routes')}>Explorar rutas</a>
          {currentUser ? (
            <a href="#dashboard" className="btn btn-secondary" onClick={() => setActiveView('dashboard')}>Ir a Dashboard</a>
          ) : (
            <a href="#login" className="btn btn-secondary" onClick={() => setActiveView('login')}>Iniciar sesión</a>
          )}
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <h2>Características Principales</h2>
          <p>La solución integral para resolver los desafíos de logística y transporte en tiempo real.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🚌</span>
            <h3>Gestión de Buses</h3>
            <p>Administración y control detallado de los vehículos disponibles en la flota corporativa.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗺️</span>
            <h3>Gestión de Rutas</h3>
            <p>Creación, consulta y organización de rutas, recorridos principales y paraderos intermedios.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👨‍✈️</span>
            <h3>Conductores</h3>
            <p>Administración de choferes, vencimiento de licencias y asignación eficiente a los viajes.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚍</span>
            <h3>Gestión de Viajes</h3>
            <p>Programación, asignación de buses/choferes y seguimiento general de la operación.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔐</span>
            <h3>Seguridad</h3>
            <p>Control de acceso basado en roles (RBAC) y perfiles de usuarios autorizados.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Reportes</h3>
            <p>Consultas operacionales avanzadas e información clave para la toma de decisiones.</p>
          </div>
        </div>
      </section>
    </>
  );
};
