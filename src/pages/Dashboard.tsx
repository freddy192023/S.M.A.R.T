import React from 'react';
import { MOCK_DATA } from '../mockData';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const activeBuses = MOCK_DATA.buses.filter(b => b.status === 'Activo').length;
  const activeDrivers = MOCK_DATA.drivers.filter(d => d.status === 'Activo' || d.status === 'En Viaje').length;
  const activeRoutes = MOCK_DATA.routes.filter(r => r.status === 'Activa').length;
  const currentTrips = MOCK_DATA.trips.filter(t => t.status === 'En Curso').length;
  const pendingTrips = MOCK_DATA.trips.filter(t => t.status === 'Programado').length;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🚌</span>
          <div className="stat-info">
            <span className="stat-value">{activeBuses}</span>
            <span className="stat-label">Buses Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>👨‍✈️</span>
          <div className="stat-info">
            <span className="stat-value">{activeDrivers}</span>
            <span className="stat-label">Conductores</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--success-color)' }}>🗺️</span>
          <div className="stat-info">
            <span className="stat-value">{activeRoutes}</span>
            <span className="stat-label">Rutas Activas</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--warning-color)' }}>🚍</span>
          <div className="stat-info">
            <span className="stat-value">{currentTrips} / {pendingTrips}</span>
            <span className="stat-label">Viajes (En curso / Prog.)</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="card-title-group">
            <h2>🚍 Viajes en Curso Operacional</h2>
            <p>Itinerarios actualmente en recorrido y monitoreados en la plataforma</p>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Vehículo</th>
                <th>Conductor Asignado</th>
                <th>Hora Salida</th>
                <th>Progreso Estimado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-bold">R-002 (Ruta 210)</td>
                <td>BUS-002 (EF-GH-34)</td>
                <td>Pedro Muñoz</td>
                <td>09:00</td>
                <td>
                  <div className="progress-bar-container" style={{ width: '100%' }}>
                    <div className="progress-bar" style={{ width: '65%', background: 'var(--accent-color)' }}></div>
                  </div>
                </td>
                <td><span className="badge badge-success">En Curso</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '3rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <h2>Enlaces Rápidos</h2>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="#buses" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setActiveView('buses'); }}>Administrar Flota</a>
        <a href="#drivers" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setActiveView('drivers'); }}>Ver Conductores</a>
        <a href="#trips" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); setActiveView('trips'); }}>Programar Viajes</a>
        <a href="#reports" className="btn btn-primary" onClick={(e) => { e.preventDefault(); setActiveView('reports'); }}>Ver Reportes de Frecuencia</a>
      </div>
    </>
  );
};
export default Dashboard;
