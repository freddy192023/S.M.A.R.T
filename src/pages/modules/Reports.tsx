import React from 'react';
import { MOCK_DATA } from '../../mockData';

export const Reports: React.FC = () => {
  const reports = MOCK_DATA.reports;

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>📊 Reportes Operacionales</h2>
          <p>Visualización de métricas de uso de flota y frecuencias</p>
        </div>
      </div>
      <div className="reports-container">
        <div className="report-section">
          <h3>Frecuencia de Viajes Diarios (Mock Chart)</h3>
          <div className="mock-chart-container">
            <div className="chart-y-axis">
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {reports.tripCountByDay.data.map((val, idx) => (
                <div key={idx} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${(val / 60) * 150}px` }}
                  >
                    <span className="bar-tooltip">{val} viajes</span>
                  </div>
                  <span className="bar-label">{reports.tripCountByDay.labels[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Utilización de Buses (Flota Activa)</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bus</th>
                  <th>Viajes Realizados</th>
                  <th>Horas en Operación</th>
                  <th>Uso Estimado</th>
                </tr>
              </thead>
              <tbody>
                {reports.busUtilization.map((u, idx) => (
                  <tr key={idx}>
                    <td className="text-bold">{u.bus}</td>
                    <td>{u.trips}</td>
                    <td>{u.hours} hrs</td>
                    <td>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${Math.min((u.hours / 40) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Reports;
