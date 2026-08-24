import React from 'react';
import { MOCK_DATA } from '../../mockData';
import { StatusBadge, ProcessFlow } from '../../components/Common';

export const Trips: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🚍 Planificación de Viajes</h2>
          <p>Monitoreo, estado y asignación operacional en tiempo real</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Funcionalidad Programar Viaje - Disponible en la siguiente etapa.')}
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
            {MOCK_DATA.trips.map((t, idx) => (
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
                      onClick={() => alert(`Detalle operacional para viaje en ${t.route}`)}
                    >
                      Ver Control
                    </button>
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
export default Trips;
