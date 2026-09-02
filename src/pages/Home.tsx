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
        <span className="hero-tag">Transporte Privado Inteligente</span>
        <h1 className="hero-title">Reserva tu viaje y viaja de forma <span>inteligente.</span></h1>
        <p className="hero-subtitle">S.M.A.R.T es la plataforma integral para consultar salidas disponibles, seleccionar tu asiento en el bus y gestionar tus viajes en tiempo real.</p>
        <div className="hero-buttons">
          <a href="#routes" className="btn btn-primary" onClick={() => setActiveView('routes')}>Explorar Rutas</a>
          {currentUser ? (
            <a href="#search-trips" className="btn btn-secondary" onClick={() => setActiveView('search-trips')}>🔍 Buscar y Reservar</a>
          ) : (
            <a href="#login" className="btn btn-secondary" onClick={() => setActiveView('login')}>Iniciar Sesión / Registro</a>
          )}
        </div>
      </section>

      <section className="section-container">
        <div className="section-header">
          <h2>Experiencia Completa para Pasajeros y Empresas</h2>
          <p>Un ecosistema digital moderno que une la gestión de flota con la reserva de asientos en tiempo real.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Búsqueda de Viajes</h3>
            <p>Consulta itinerarios por origen, destino y fecha con tarifas y horarios transparentes.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💺</span>
            <h3>Selección de Asientos</h3>
            <p>Visualiza el diagrama real del autobús y escoge tu ubicación preferida en tiempo real.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎫</span>
            <h3>Boletos y Comprobantes</h3>
            <p>Generación instantánea de comprobante digital con código único de reserva y QR.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚌</span>
            <h3>Gestión de Flota</h3>
            <p>Administración y control detallado de buses, capacidades y estados operacionales.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👨‍✈️</span>
            <h3>Conductores y Rutas</h3>
            <p>Asignación validada de choferes profesionales, rutas fijas y paraderos intermedios.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Dashboard y Reportes</h3>
            <p>Control de ocupación, métricas de frecuencia de viajes e ingresos consolidados.</p>
          </div>
        </div>
      </section>
    </>
  );
};
