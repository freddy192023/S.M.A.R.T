import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/tripService';
import { routeService } from '../../services/routeService';
import { busService } from '../../services/busService';
import { driverService } from '../../services/driverService';
import { StatusBadge, ProcessFlow } from '../../components/Common';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { PassengerManifestModal } from '../../components/PassengerManifestModal';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manifestTrip, setManifestTrip] = useState<any | null>(null);

  const [newTrip, setNewTrip] = useState({
    route_id: '',
    bus_id: '',
    driver_id: '',
    departure_time: new Date().toISOString().slice(0, 16),
    price: 35.00,
    status: 'Programado'
  });
  const [saving, setSaving] = useState(false);

  const { showNotification } = useNotification();
  const { profile } = useAuth();
  
  const role = profile?.role || 'pasajero';
  const isDriver = role === 'conductor';
  const isAdminOrOperator = role === 'admin' || role === 'operador';

  const loadAllData = async () => {
    try {
      const [tripsData, routesData, busesData, driversData] = await Promise.all([
        tripService.getAllWithDetails(),
        routeService.getAll(),
        busService.getAll(),
        driverService.getAll()
      ]);
      setTrips(tripsData || []);
      setRoutes(routesData || []);
      setBuses(busesData || []);
      setDrivers(driversData || []);

      if (routesData && routesData.length > 0) {
        setNewTrip(prev => ({
          ...prev,
          route_id: routesData[0].id,
          bus_id: busesData[0]?.id || '',
          driver_id: driversData[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Error cargando datos de viajes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.route_id) {
      showNotification('Campo Requerido', 'Por favor selecciona una ruta para el viaje.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const selectedRoute = routes.find(r => r.id === newTrip.route_id);
      const selectedBus = buses.find(b => b.id === newTrip.bus_id);
      const selectedDriver = drivers.find(d => d.id === newTrip.driver_id);

      const created = await tripService.create({
        route_id: newTrip.route_id,
        bus_id: newTrip.bus_id || null,
        driver_id: newTrip.driver_id || null,
        departure_time: newTrip.departure_time,
        price: Number(newTrip.price) || 35.00,
        status: 'Programado'
      });

      const dateObj = new Date(newTrip.departure_time);
      const fullCreated = {
        ...created,
        route: selectedRoute?.name || 'Ruta General',
        origin: selectedRoute?.origin || 'Origen Central',
        destination: selectedRoute?.destination || 'Destino',
        bus: selectedBus?.plate || 'Bus B-01',
        bus_model: selectedBus?.model || 'Estándar',
        conductor: selectedDriver?.full_name || 'Conductor Asignado',
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Programado',
        actual_passengers: 0,
        bus_capacity: selectedBus?.capacity || 40
      };

      setTrips(prev => [fullCreated, ...prev]);
      setShowAddModal(false);
      showNotification('Viaje Programado', `Nuevo viaje en ${selectedRoute?.name || 'la ruta'} programado con éxito.`, 'success');
    } catch (err: any) {
      console.error('Error creando viaje:', err);
      showNotification('Error', 'No se pudo programar el viaje en la base de datos.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleTripStatusChange = async (tripId: string, newStatusLabel: 'En Curso' | 'Finalizado') => {
    try {
      const dbStatus = newStatusLabel === 'En Curso' ? 'en_curso' : 'finalizado';
      if (!tripId.startsWith('gen-trip-')) {
        await tripService.updateStatus(tripId, dbStatus);
      }
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatusLabel } : t));
      showNotification(
        'Estado del Viaje Actualizado',
        `El recorrido ${tripId} ahora está: ${newStatusLabel.toUpperCase()}.`,
        newStatusLabel === 'En Curso' ? 'info' : 'success'
      );
    } catch (err) {
      console.error('Error cambiando estado de viaje:', err);
      showNotification('Aviso Operacional', `Estado actualizado a ${newStatusLabel} localmente.`, 'info');
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatusLabel } : t));
    }
  };

  if (loading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>⏳ Cargando programación de viajes y asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>{isDriver ? '🚍 Mis Viajes y Consola Operacional' : '🚍 Planificación y Programación de Viajes'}</h2>
          <p>
            {isDriver 
              ? 'Consola de inicio/fin de viajes y manifiesto de embarque de pasajeros' 
              : 'Monitoreo, programación de horarios y asignación operacional de flota'}
          </p>
        </div>
        {isAdminOrOperator && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            + Programar Nuevo Viaje
          </button>
        )}
      </div>

      <ProcessFlow />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Bus Patente</th>
              {!isDriver && <th>Conductor</th>}
              <th>Fecha & Hora</th>
              <th>Pasajeros</th>
              <th>Estado</th>
              <th>Acciones Operacionales</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={isDriver ? 6 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay viajes programados asignados.
                </td>
              </tr>
            ) : (
              trips.map((t, idx) => {
                const isRunning = t.status === 'En Curso';
                const isFinished = t.status === 'Finalizado';

                return (
                  <tr key={idx}>
                    <td className="text-bold">{t.route}</td>
                    <td>
                      <strong>{t.bus}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({t.bus_model})</span>
                    </td>
                    {!isDriver && <td>{t.conductor}</td>}
                    <td>{t.date} {t.time}</td>
                    <td>
                      <span className="badge badge-success">
                        {t.actual_passengers || 0} / {t.bus_capacity || 40} reservados
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
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
                          📋 Manifiesto / Check-in
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

      {/* Modal de Programar Nuevo Viaje */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="voucher-modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <span className="brand-logo">🚍 PROGRAMAR NUEVO VIAJE</span>
                <span className="voucher-tag">Asignación Operativa</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTrip} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Seleccionar Ruta *</label>
                <select
                  className="form-input"
                  required
                  value={newTrip.route_id}
                  onChange={e => setNewTrip({ ...newTrip, route_id: e.target.value })}
                >
                  <option value="">Selecciona una ruta activa...</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.origin} ➔ {r.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Asignar Bus</label>
                  <select
                    className="form-input"
                    value={newTrip.bus_id}
                    onChange={e => setNewTrip({ ...newTrip, bus_id: e.target.value })}
                  >
                    <option value="">Selecciona un bus...</option>
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.plate} ({b.brand} {b.model} - {b.capacity} pas.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Asignar Conductor</label>
                  <select
                    className="form-input"
                    value={newTrip.driver_id}
                    onChange={e => setNewTrip({ ...newTrip, driver_id: e.target.value })}
                  >
                    <option value="">Selecciona un conductor...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.license_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Fecha y Hora de Salida *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={newTrip.departure_time}
                    onChange={e => setNewTrip({ ...newTrip, departure_time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Precio por Asiento (S/)</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.5"
                    value={newTrip.price}
                    onChange={e => setNewTrip({ ...newTrip, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '✓ Programar Viaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Manifiesto de Pasajeros */}
      {manifestTrip && (
        <PassengerManifestModal
          trip={manifestTrip}
          onClose={() => setManifestTrip(null)}
        />
      )}
    </div>
  );
};

export default Trips;


