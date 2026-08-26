import React, { useState, useEffect } from 'react';
import { stopService } from '../../services/stopService';
import { useNotification } from '../../context/NotificationContext';

export const Stops: React.FC = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    stopService.getAll()
      .then(data => setStops(data || []))
      .catch(err => console.error('Error cargando paraderos:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando paraderos...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>📍 Paraderos y Paradas</h2>
          <p>Configuración de paraderos intermedios y terminales</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => showNotification('Agregar Parada', 'La creación y mapeo geográfico de nuevos paraderos se habilitará en la siguiente actualización.', 'info')}
        >
          + Agregar Parada
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Ruta Asociada</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stops.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay paraderos registrados.</td></tr>
            ) : (
              stops.map(p => (
                <tr key={p.id}>
                  <td className="text-bold">{p.name}</td>
                  <td>{p.address || 'Sin dirección'}</td>
                  <td>{p.routes?.name || 'Sin ruta'}</td>
                  <td>{p.stop_order}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Editar" onClick={() => showNotification('Editar Parada', `El editor de geolocalización para la parada ${p.name} está en desarrollo.`, 'warning')}>✏️</button>
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
export default Stops;
