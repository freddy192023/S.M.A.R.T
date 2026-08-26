import React, { useState, useEffect } from 'react';
import { busService } from '../../services/busService';
import { useNotification } from '../../context/NotificationContext';

const statusMap: Record<string, string> = {
  disponible: 'Activo',
  en_mantenimiento: 'En Mantención',
  en_viaje: 'En Viaje',
  inactivo: 'Inactivo'
};

export const Buses: React.FC = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    busService.getAll()
      .then(data => setBuses(data || []))
      .catch(err => console.error('Error cargando buses:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando flota de buses...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🚌 Gestión de Buses</h2>
          <p>Administración y control de vehículos de la flota empresarial</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => showNotification('Gestión de Buses', 'La funcionalidad de Crear Bus se habilitará en la siguiente etapa.', 'info')}
        >
          + Agregar Bus
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {buses.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay buses registrados.</td></tr>
            ) : (
              buses.map(bus => (
                <tr key={bus.id}>
                  <td className="text-bold">{bus.plate}</td>
                  <td>{bus.brand}</td>
                  <td>{bus.model}</td>
                  <td>{bus.year}</td>
                  <td>{bus.capacity} pasajeros</td>
                  <td><span className={`badge badge-${bus.status === 'disponible' ? 'success' : bus.status === 'inactivo' ? 'danger' : 'warning'}`}>{statusMap[bus.status] || bus.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Editar" onClick={() => showNotification('Editar Vehículo', `El formulario para editar la patente ${bus.plate} se encuentra en desarrollo.`, 'warning')}>✏️</button>
                      <button className="btn-icon text-danger" title="Desactivar" onClick={() => showNotification('Desactivar Vehículo', `La acción de desactivar el vehículo ${bus.plate} requiere privilegios elevados de administrador.`, 'danger')}>⚠️</button>
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
export default Buses;
