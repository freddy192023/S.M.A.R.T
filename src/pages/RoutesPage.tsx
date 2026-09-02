import React, { useState, useEffect } from 'react';
import { routeService } from '../services/routeService';
import { useNotification } from '../context/NotificationContext';

export const RoutesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    routeService.getAll()
      .then((data: any[]) => setRoutes(data || []))
      .catch((err: any) => console.error('Error cargando rutas:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRoutes = routes.filter((r: any) => 
    r.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.origin?.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <section className="section-container" style={{ paddingTop: '60px' }}>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>⏳ Cargando rutas...</div>
      </section>
    );
  }

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
          placeholder="Buscar por nombre de ruta u origen (Ej: Ruta Norte...)" 
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => {}}>Buscar Ruta</button>
      </div>

      <div className="routes-cards-grid">
        {filteredRoutes.length > 0 ? filteredRoutes.map((r: any) => (
          <div key={r.id} className="route-public-card">
            <div>
              <div className="route-public-header">
                <span className="route-public-code">{r.name}</span>
                <span className={`badge badge-${r.status === 'activa' ? 'success' : 'warning'}`}>
                  {r.status === 'activa' ? 'Activa' : r.status}
                </span>
              </div>
              <h3 className="route-public-title">{r.name}</h3>
              <p className="route-public-detail">🏁 <strong>Origen:</strong> {r.origin}</p>
              <p className="route-public-detail">📍 <strong>Destino:</strong> {r.destination}</p>
              <p className="route-public-detail" style={{ marginTop: '0.5rem' }}>
                ⏱️ <strong>Duración:</strong> {r.estimated_duration_min ? `${r.estimated_duration_min} mins` : 'N/A'}
              </p>
              {r.distance_km && (
                <p className="route-public-detail">📏 <strong>Distancia:</strong> {r.distance_km} km</p>
              )}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a 
                href="#search-trips"
                className="btn btn-primary btn-sm" 
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
              >
                💺 Reservar Asiento en esta Ruta
              </a>
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }} 
                onClick={() => showNotification(r.name, `Ruta: ${r.name} (${r.origin} ➔ ${r.destination}). Duración estimada: ${r.estimated_duration_min || 45} mins. Salidas diarias activas.`, 'info')}
              >
                Detalles del Recorrido
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
export default RoutesPage;
