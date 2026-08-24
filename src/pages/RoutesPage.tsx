import React, { useState } from 'react';
import { MOCK_DATA } from '../mockData';
import { StatusBadge } from '../components/Common';

export const RoutesPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredRoutes = MOCK_DATA.routes.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="section-container" style={{ paddingTop: '60px' }}>
      <div className="section-header">
        <h2>Consulta de Rutas Públicas</h2>
        <p>Busca e infórmate sobre los recorridos activos del sistema corporativo S.M.A.R.T.</p>
      </div>

      <div className="search-widget">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar por código o nombre de ruta (Ej: Ruta 210...)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => {}}>Buscar Ruta</button>
      </div>

      <div className="routes-cards-grid">
        {filteredRoutes.length > 0 ? filteredRoutes.map(r => (
          <div key={r.code} className="route-public-card">
            <div>
              <div className="route-public-header">
                <span className="route-public-code">{r.code}</span>
                <StatusBadge status={r.status} />
              </div>
              <h3 className="route-public-title">{r.name}</h3>
              <p className="route-public-detail">🏁 <strong>Origen:</strong> {r.origin}</p>
              <p className="route-public-detail">📍 <strong>Destino:</strong> {r.destination}</p>
              <p className="route-public-detail" style={{ marginTop: '0.5rem' }}>⏱️ <strong>Duración:</strong> {r.duration}</p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }} 
                onClick={() => alert(`Detalles de paradas interactivas para ${r.name} - En desarrollo.`)}
              >
                Ver recorrido completo
              </button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron rutas con el criterio buscado.
          </div>
        )}
      </div>
    </section>
  );
};
