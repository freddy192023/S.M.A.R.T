import React from 'react';
import { MOCK_DATA } from '../../mockData';

export const Stops: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>📍 Paraderos y Paradas</h2>
          <p>Configuración de paraderos intermedios y terminales</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Funcionalidad Crear Parada - Disponible en la siguiente etapa.')}
        >
          + Agregar Parada
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Dirección / Geolocalización</th>
              <th>Tipo de Paradero</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.stops.map(p => (
              <tr key={p.code}>
                <td className="text-bold">{p.code}</td>
                <td>{p.name}</td>
                <td>{p.address}</td>
                <td><span className="stop-type">{p.type}</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar" onClick={() => alert(`Editar ${p.code}`)}>✏️</button>
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
export default Stops;
