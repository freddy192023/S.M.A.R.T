import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { busService } from '../services/busService';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import { tripService } from '../services/tripService';
import { reservationService } from '../services/reservationService';
import { VoucherModal } from '../components/VoucherModal';
import type { Reservation } from '../types';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { profile } = useAuth();
  const role = profile?.role || 'pasajero';
  const isPassenger = role === 'pasajero';
  const isAdminOrOperator = role === 'admin' || role === 'operador';

  const [stats, setStats] = useState({
    activeBuses: 0,
    activeDrivers: 0,
    activeRoutes: 0,
    currentTrips: 0,
    pendingTrips: 0,
    totalReservations: 0,
    myActiveReservations: 0,
    myTotalSpent: 0
  });

  const [trips, setTrips] = useState<any[]>([]);
  const [passengerReservations, setPassengerReservations] = useState<Reservation[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [busesData, driversData, routesData, tripsData, allReservations] = await Promise.all([
          busService.getAll(),
          driverService.getAll(),
          routeService.getAll(),
          tripService.getAllWithDetails(),
          reservationService.getAll()
        ]);

        const myRes = profile
          ? allReservations.filter(r => r.passenger_id === profile.id)
          : [];

        const myActive = myRes.filter(r => r.status === 'confirmed');
        const mySpent = myActive.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

        setStats({
          activeBuses: (busesData || []).filter((b: any) => b.status === 'disponible').length,
          activeDrivers: (driversData || []).filter((d: any) => d.status === 'activo' || d.status === 'en_viaje').length,
          activeRoutes: (routesData || []).filter((r: any) => r.status === 'activa').length,
          currentTrips: (tripsData || []).filter((t: any) => t.status === 'En Curso').length,
          pendingTrips: (tripsData || []).filter((t: any) => t.status === 'Programado').length,
          totalReservations: allReservations.filter(r => r.status === 'confirmed').length,
          myActiveReservations: myActive.length,
          myTotalSpent: mySpent
        });

        setTrips((tripsData || []).filter((t: any) => t.status === 'En Curso' || t.status === 'Programado'));
        setPassengerReservations(myActive);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [profile]);

  if (loading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>⏳ Cargando datos del dashboard en tiempo real...</p>
      </div>
    );
  }

  // Quick links filtered by role
  const quickLinks = [
    { key: 'search-trips', label: 'Buscar y Reservar Viaje', icon: '🔍', roles: ['pasajero', 'admin', 'operador'], variant: 'primary' },
    { key: 'my-reservations', label: 'Mis Reservas', icon: '🎫', roles: ['pasajero'], variant: 'secondary' },
    { key: 'reservations', label: 'Gestión de Reservas', icon: '📑', roles: ['admin', 'operador'], variant: 'secondary' },
    { key: 'buses', label: 'Administrar Flota', icon: '🚌', roles: ['admin', 'operador'], variant: 'secondary' },
    { key: 'drivers', label: 'Ver Conductores', icon: '👨‍✈️', roles: ['admin', 'operador'], variant: 'secondary' },
    { key: 'trips', label: 'Programar Viajes', icon: '🚍', roles: ['admin', 'operador', 'conductor'], variant: 'secondary' },
    { key: 'reports', label: 'Ver Reportes', icon: '📊', roles: ['admin', 'operador'], variant: 'primary' },
    { key: 'routes-admin', label: 'Consultar Rutas', icon: '🗺️', roles: ['pasajero', 'conductor'], variant: 'secondary' },
    { key: 'profile', label: 'Mi Perfil', icon: '👤', roles: ['pasajero', 'conductor', 'admin', 'operador'], variant: 'secondary' },
  ].filter(link => link.roles.includes(role));

  return (
    <>
      {/* Banner de Bienvenida del Pasajero */}
      {isPassenger && (
        <div className="content-card" style={{
          background: 'linear-gradient(135deg, rgba(0, 210, 196, 0.12) 0%, rgba(13, 21, 39, 0.8) 100%)',
          border: '1px solid var(--border-active)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
                🌟 Panel del Pasajero
              </span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
                ¡Hola, {profile?.name || profile?.full_name || 'Pasajero'}! ¿A dónde quieres viajar hoy?
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
                Encuentra salidas disponibles, elige tu asiento favorito en el bus y confirma tu boleto digital en segundos.
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
              onClick={() => setActiveView('search-trips')}
            >
              🔍 Reservar un Viaje Ahora
            </button>
          </div>
        </div>
      )}

      {/* Grid de Estadísticas */}
      <div className="stats-grid">
        {isPassenger ? (
          <>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🎫</span>
              <div className="stat-info">
                <span className="stat-value">{stats.myActiveReservations}</span>
                <span className="stat-label">Reservas Activas</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--success-color)' }}>🗺️</span>
              <div className="stat-info">
                <span className="stat-value">{stats.activeRoutes}</span>
                <span className="stat-label">Rutas Disponibles</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--warning-color)' }}>🚍</span>
              <div className="stat-info">
                <span className="stat-value">{stats.pendingTrips}</span>
                <span className="stat-label">Salidas Programadas</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>💳</span>
              <div className="stat-info">
                <span className="stat-value">S/ {stats.myTotalSpent.toFixed(2)}</span>
                <span className="stat-label">Total Invertido</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {isAdminOrOperator && (
              <div className="stat-card">
                <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🚌</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.activeBuses}</span>
                  <span className="stat-label">Buses Disponibles</span>
                </div>
              </div>
            )}
            {isAdminOrOperator && (
              <div className="stat-card">
                <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>👨‍✈️</span>
                <div className="stat-info">
                  <span className="stat-value">{stats.activeDrivers}</span>
                  <span className="stat-label">Conductores</span>
                </div>
              </div>
            )}
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--success-color)' }}>🗺️</span>
              <div className="stat-info">
                <span className="stat-value">{stats.activeRoutes}</span>
                <span className="stat-label">Rutas Activas</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--warning-color)' }}>🎟️</span>
              <div className="stat-info">
                <span className="stat-value">{stats.totalReservations}</span>
                <span className="stat-label">Reservas Confirmadas</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contenido Principal según el Rol */}
      {isPassenger ? (
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>🎟️ Mis Próximos Viajes</h2>
              <p>Tus boletos confirmados y listos para abordar</p>
            </div>
            {passengerReservations.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveView('my-reservations')}
              >
                Ver Todas Mis Reservas →
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Itinerario / Ruta</th>
                  <th>Fecha & Hora</th>
                  <th>Asiento</th>
                  <th>Bus Asignado</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {passengerReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                      <p style={{ marginBottom: '1rem' }}>Aún no tienes viajes reservados para las próximas fechas.</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveView('search-trips')}
                      >
                        🔍 Explorar Viajes y Reservar
                      </button>
                    </td>
                  </tr>
                ) : (
                  passengerReservations.map((res) => (
                    <tr key={res.id}>
                      <td className="text-bold" style={{ color: 'var(--accent-color)' }}>
                        {res.reservation_code}
                      </td>
                      <td className="text-bold">
                        {res.trip?.route || `${res.trip?.origin || 'Origen'} → ${res.trip?.destination || 'Destino'}`}
                      </td>
                      <td>
                        {res.trip?.date} a las <span className="text-accent">{res.trip?.time || '08:00'}</span>
                      </td>
                      <td>
                        <span className="badge badge-success">Asiento N° {res.seat_number}</span>
                      </td>
                      <td>{res.trip?.bus || 'Asignado'}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedVoucher(res)}
                        >
                          📄 Ver Boleto
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>🚍 Itinerarios y Viajes en Operación</h2>
              <p>Monitoreo en tiempo real de salidas programadas y en tránsito</p>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Vehículo</th>
                  {isAdminOrOperator && <th>Conductor Asignado</th>}
                  <th>Hora Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrOperator ? 5 : 4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay viajes registrados actualmente.
                    </td>
                  </tr>
                ) : (
                  trips.map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="text-bold">{t.route}</td>
                      <td>{t.bus}</td>
                      {isAdminOrOperator && <td>{t.conductor}</td>}
                      <td>{t.date} {t.time}</td>
                      <td>
                        <span className={`badge ${t.status === 'En Curso' ? 'badge-success' : 'badge-warning'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enlaces Rápidos */}
      {quickLinks.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: '2.5rem', textAlign: 'left', marginBottom: '1.2rem' }}>
            <h2>Accesos Directos</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {quickLinks.map(link => (
              <a 
                key={link.key}
                href={`#${link.key}`} 
                className={`btn btn-${link.variant}`} 
                onClick={(e) => { e.preventDefault(); setActiveView(link.key); }}
              >
                {link.icon} {link.label}
              </a>
            ))}
          </div>
        </>
      )}

      {/* Modal de Comprobante */}
      {selectedVoucher && (
        <VoucherModal
          reservation={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
