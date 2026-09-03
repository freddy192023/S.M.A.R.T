import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { busService } from '../services/busService';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import { tripService } from '../services/tripService';
import { reservationService } from '../services/reservationService';
import { VoucherModal } from '../components/VoucherModal';
import { PassengerManifestModal } from '../components/PassengerManifestModal';
import { useNotification } from '../context/NotificationContext';
import type { Reservation } from '../types';

interface DashboardProps {
  setActiveView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { profile } = useAuth();
  const { showNotification } = useNotification();
  const role = profile?.role || 'pasajero';
  const isPassenger = role === 'pasajero';
  const isDriver = role === 'conductor';

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
  const [manifestTrip, setManifestTrip] = useState<any | null>(null);
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

  const handleTripStatusChange = async (tripId: string, newStatusLabel: 'En Curso' | 'Finalizado') => {
    try {
      const dbStatus = newStatusLabel === 'En Curso' ? 'en_curso' : 'finalizado';
      if (!tripId.startsWith('gen-trip-')) {
        await tripService.updateStatus(tripId, dbStatus);
      }
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatusLabel } : t));
      showNotification(
        'Estado del Viaje Actualizado',
        `El viaje ${tripId} ahora se encuentra en estado: ${newStatusLabel.toUpperCase()}.`,
        newStatusLabel === 'En Curso' ? 'info' : 'success'
      );
    } catch (err) {
      console.error('Error cambiando estado de viaje:', err);
      showNotification('Aviso Operacional', `Se actualizó el estado a ${newStatusLabel} localmente.`, 'info');
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatusLabel } : t));
    }
  };

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
    { key: 'trips', label: isDriver ? 'Mis Viajes y Control' : 'Programar Viajes', icon: '🚍', roles: ['admin', 'operador', 'conductor'], variant: 'primary' },
    { key: 'reports', label: 'Ver Reportes', icon: '📊', roles: ['admin', 'operador'], variant: 'secondary' },
    { key: 'profile', label: 'Mi Perfil', icon: '👤', roles: ['pasajero', 'conductor', 'admin', 'operador'], variant: 'secondary' },
  ].filter(link => link.roles.includes(role));

  const driverActiveTrip = trips[0] || null;

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

      {/* Banner de Bienvenida del Conductor */}
      {isDriver && (
        <div className="content-card" style={{
          background: 'linear-gradient(135deg, rgba(0, 210, 196, 0.15) 0%, rgba(13, 21, 39, 0.9) 100%)',
          border: '1px solid var(--accent-glow)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
                👨‍✈️ Consola Operacional del Conductor
              </span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
                ¡Hola, {profile?.name || profile?.full_name || 'Conductor'}! Listo para tu jornada operacional.
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '650px' }}>
                Revisa tu bus asignado, controla el inicio y fin de tus recorridos y gestiona el abordaje de pasajeros en tiempo real.
              </p>
            </div>
            {driverActiveTrip && (
              <button
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
                onClick={() => setManifestTrip(driverActiveTrip)}
              >
                📋 Abrir Manifiesto de Pasajeros
              </button>
            )}
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
        ) : isDriver ? (
          <>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🚌</span>
              <div className="stat-info">
                <span className="stat-value">{driverActiveTrip?.bus || 'BUS-001'}</span>
                <span className="stat-label">Bus Asignado</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--success-color)' }}>🗺️</span>
              <div className="stat-info">
                <span className="stat-value">{driverActiveTrip?.route || 'Ruta General'}</span>
                <span className="stat-label">Ruta Programada</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--warning-color)' }}>🎟️</span>
              <div className="stat-info">
                <span className="stat-value">{driverActiveTrip?.actual_passengers || 0} / {driverActiveTrip?.bus_capacity || 40}</span>
                <span className="stat-label">Pasajeros Reservados</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>⏱️</span>
              <div className="stat-info">
                <span className="stat-value">{driverActiveTrip?.status || 'Programado'}</span>
                <span className="stat-label">Estado del Recorrido</span>
              </div>
            </div>
          </>
        ) : (
          <>
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
      ) : isDriver ? (
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>🚍 Control Operacional del Conductor</h2>
              <p>Gestiona el estado de tu viaje asignado y valida la lista de abordaje de pasajeros</p>
            </div>
            {driverActiveTrip && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setManifestTrip(driverActiveTrip)}
              >
                📋 Ver Manifiesto Completo
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ruta Programada</th>
                  <th>Vehículo</th>
                  <th>Hora Salida</th>
                  <th>Pasajeros</th>
                  <th>Estado Recorrido</th>
                  <th>Control Operacional</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                      No tienes viajes asignados para operar en este momento.
                    </td>
                  </tr>
                ) : (
                  trips.map((t: any, idx: number) => {
                    const isRunning = t.status === 'En Curso';
                    const isFinished = t.status === 'Finalizado';
                    return (
                      <tr key={idx}>
                        <td className="text-bold">{t.route}</td>
                        <td>
                          <strong>{t.bus}</strong> ({t.bus_model})
                        </td>
                        <td>{t.date} a las <span className="text-accent">{t.time}</span></td>
                        <td>
                          <span className="badge badge-success">
                            {t.actual_passengers || 0} / {t.bus_capacity || 40} abordados
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isRunning ? 'badge-success' : isFinished ? 'badge-secondary' : 'badge-warning'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!isRunning && !isFinished && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleTripStatusChange(t.id, 'En Curso')}
                              >
                                ▶ Iniciar Viaje
                              </button>
                            )}
                            {isRunning && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ background: 'var(--warning-color)', color: '#000' }}
                                onClick={() => handleTripStatusChange(t.id, 'Finalizado')}
                              >
                                🏁 Finalizar Viaje
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setManifestTrip(t)}
                            >
                              📋 Manifiesto
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                  <th>Conductor Asignado</th>
                  <th>Hora Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay viajes registrados actualmente.
                    </td>
                  </tr>
                ) : (
                  trips.map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="text-bold">{t.route}</td>
                      <td>{t.bus}</td>
                      <td>{t.conductor}</td>
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

      {/* Modal de Manifiesto de Pasajeros para Conductor */}
      {manifestTrip && (
        <PassengerManifestModal
          trip={manifestTrip}
          onClose={() => setManifestTrip(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
