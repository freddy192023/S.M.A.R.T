import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/tripService';
import { StatusBadge, ProcessFlow } from '../../components/Common';
import { useNotification } from '../../context/NotificationContext';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    tripService.getAllWithDetails()
      .then(data => setTrips(data || []))
      .catch(err => console.error('Error cargando viajes:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando programación de viajes...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🚍 Planificación de Viajes</h2>
          <p>Monitoreo, estado y asignación operacional en tiempo real</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => showNotification('Planificar Viaje', 'El programador de itinerarios y asignación de buses por GPS estará disponible en la siguiente etapa.', 'info')}
        >
          + Programar Viaje
        </button>
      </div>

      <ProcessFlow />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Bus Patente</th>
              <th>Conductor</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay viajes programados.</td></tr>
            ) : (
              trips.map((t, idx) => (
                <tr key={idx}>
                  <td className="text-bold">{t.route}</td>
                  <td>{t.bus}</td>
                  <td>{t.conductor}</td>
                  <td>{t.date}</td>
                  <td>{t.time}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => showNotification('Control Operacional', `Cargando consola de control satelital para el recorrido ${t.route}... (Funcionalidad de Monitoreo en Desarrollo)`, 'info')}
                      >
                        Ver Control
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Trips;
