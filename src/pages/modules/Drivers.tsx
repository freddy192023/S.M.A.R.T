import React from 'react';
import { MOCK_DATA } from '../../mockData';
import { StatusBadge } from '../../components/Common';

export const Drivers: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>👨‍✈️ Gestión de Conductores</h2>
          <p>Registro y asignación de licencias de conductores autorizados</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Funcionalidad Crear Conductor - Disponible en la siguiente etapa.')}
        >
          + Agregar Conductor
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Licencia</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.drivers.map(drv => (
              <tr key={drv.code}>
                <td className="text-bold">{drv.code}</td>
                <td className="text-bold">{drv.name}</td>
                <td><span className="license-tag">{drv.license}</span></td>
                <td>{drv.phone}</td>
                <td><StatusBadge status={drv.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar" onClick={() => alert(`Editar ${drv.name}`)}>✏️</button>
                    <button className="btn-icon text-danger" title="Desactivar" onClick={() => alert(`Cambiar estado de ${drv.name}`)}>⚠️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Drivers;
