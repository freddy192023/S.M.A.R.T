import React, { useState, useEffect } from 'react';
import { busService } from '../services/busService';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import { tripService } from '../services/tripService';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const [stats, setStats] = useState({ activeBuses: 0, activeDrivers: 0, activeRoutes: 0, currentTrips: 0, pendingTrips: 0 });
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [busesData, driversData, routesData, tripsData] = await Promise.all([
          busService.getAll(),
          driverService.getAll(),
          routeService.getAll(),
          tripService.getAllWithDetails()
        ]);

        setStats({
          activeBuses: (busesData || []).filter((b: any) => b.status === 'disponible').length,
          activeDrivers: (driversData || []).filter((d: any) => d.status === 'activo' || d.status === 'en_viaje').length,
          activeRoutes: (routesData || []).filter((r: any) => r.status === 'activa').length,
          currentTrips: (tripsData || []).filter((t: any) => t.status === 'En Curso').length,
          pendingTrips: (tripsData || []).filter((t: any) => t.status === 'Programado').length
        });

        setTrips((tripsData || []).filter((t: any) => t.status === 'En Curso'));
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>⏳ Cargando datos del dashboard desde Supabase...</p>
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🚌</span>
          <div className="stat-info">
            <span className="stat-value">{stats.activeBuses}</span>
            <span className="stat-label">Buses Disponibles</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>👨‍✈️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.activeDrivers}</span>
            <span className="stat-label">Conductores</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--success-color)' }}>🗺️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.activeRoutes}</span>
            <span className="stat-label">Rutas Activas</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--warning-color)' }}>🚍</span>
          <div className="stat-info">
            <span className="stat-value">{stats.currentTrips} / {stats.pendingTrips}</span>
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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay viajes en curso actualmente.</td></tr>
              ) : (
                trips.map((t: any, idx: number) => (
                  <tr key={idx}>
                    <td className="text-bold">{t.route}</td>
                    <td>{t.bus}</td>
                    <td>{t.conductor}</td>
                    <td>{t.time}</td>
                    <td><span className="badge badge-success">En Curso</span></td>
                  </tr>
                ))
              )}
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
