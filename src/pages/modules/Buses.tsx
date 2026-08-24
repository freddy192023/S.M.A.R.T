import React from 'react';
import { MOCK_DATA } from '../../mockData';
import { StatusBadge } from '../../components/Common';

export const Buses: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🚌 Gestión de Buses</h2>
          <p>Administración y control de vehículos de la flota empresarial</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Funcionalidad Crear Bus - Disponible en la siguiente etapa.')}
        >
          + Agregar Bus
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Patente</th>
              <th>Modelo</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.buses.map(bus => (
              <tr key={bus.code}>
                <td className="text-bold">{bus.code}</td>
                <td>{bus.plate}</td>
                <td>{bus.model}</td>
                <td>{bus.capacity} pasajeros</td>
                <td><StatusBadge status={bus.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar" onClick={() => alert(`Editar ${bus.code}`)}>✏️</button>
                    <button className="btn-icon text-danger" title="Desactivar" onClick={() => alert(`Desactivar ${bus.code}`)}>⚠️</button>
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
export default Buses;
