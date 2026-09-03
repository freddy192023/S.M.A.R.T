import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/tripService';
import { StatusBadge, ProcessFlow } from '../../components/Common';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { PassengerManifestModal } from '../../components/PassengerManifestModal';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manifestTrip, setManifestTrip] = useState<any | null>(null);
  const { showNotification } = useNotification();
  const { profile } = useAuth();
  
  const role = profile?.role || 'pasajero';
  const isDriver = role === 'conductor';
  const isAdminOrOperator = role === 'admin' || role === 'operador';

  useEffect(() => {
    tripService.getAllWithDetails()
      .then(data => setTrips(data || []))
      .catch(err => console.error('Error cargando viajes:', err))
      .finally(() => setLoading(false));
  }, []);

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
          <h2>{isDriver ? '🚍 Mis Viajes y Consola Operacional' : '🚍 Planificación y Control de Viajes'}</h2>
          <p>
            {isDriver 
              ? 'Consola de inicio/fin de viajes y manifiesto de embarque de pasajeros' 
              : 'Monitoreo, estado y asignación operacional en tiempo real'}
          </p>
        </div>
        {isAdminOrOperator && (
          <button 
            className="btn btn-primary" 
            onClick={() => showNotification('Planificar Viaje', 'El programador de itinerarios y asignación de buses por GPS estará disponible en la siguiente etapa.', 'info')}
          >
            + Programar Viaje
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

