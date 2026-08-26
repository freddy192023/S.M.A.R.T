import React, { useState, useEffect } from 'react';
import { driverService } from '../../services/driverService';
import { useNotification } from '../../context/NotificationContext';

const statusMap: Record<string, string> = {
  activo: 'Activo',
  en_viaje: 'En Viaje',
  descanso: 'Descanso',
  inactivo: 'Inactivo'
};

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    driverService.getAll()
      .then(data => setDrivers(data || []))
      .catch(err => console.error('Error cargando conductores:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando conductores...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>👨‍✈️ Gestión de Conductores</h2>
          <p>Registro y asignación de licencias de conductores autorizados</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => showNotification('Gestión de Conductores', 'Para registrar un nuevo Conductor, por favor use el formulario de registro de la pantalla principal con la opción del Rol Conductor seleccionada.', 'info')}
        >
          + Agregar Conductor
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Licencia</th>
              <th>Vencimiento</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay conductores registrados.</td></tr>
            ) : (
              drivers.map(drv => (
                <tr key={drv.id}>
                  <td className="text-bold">{drv.full_name}</td>
                  <td><span className="license-tag">{drv.license_number}</span></td>
                  <td>{drv.license_expiry}</td>
                  <td>{drv.phone}</td>
                  <td><span className={`badge badge-${drv.status === 'activo' ? 'success' : drv.status === 'inactivo' ? 'danger' : 'warning'}`}>{statusMap[drv.status] || drv.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Editar" onClick={() => showNotification('Editar Conductor', `El formulario para editar a ${drv.full_name} estará disponible en la siguiente actualización.`, 'warning')}>✏️</button>
                      <button className="btn-icon text-danger" title="Desactivar" onClick={() => showNotification('Desactivar Conductor', `No se puede desactivar al conductor ${drv.full_name} debido a que se encuentra con asignaciones operacionales activas.`, 'danger')}>⚠️</button>
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
export default Drivers;
