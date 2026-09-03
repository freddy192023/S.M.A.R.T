import React, { useState, useEffect } from 'react';
import { routeService } from '../services/routeService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const RoutesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: '',
    origin: '',
    destination: '',
    distance_km: 45,
    estimated_duration_min: 45,
    status: 'activa'
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const { profile } = useAuth();
  const isAdminOrOperator = profile?.role === 'admin' || profile?.role === 'operador';

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAll();
      setRoutes(data || []);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.name.trim() || !newRoute.origin.trim() || !newRoute.destination.trim()) {
      showNotification('Campos Requeridos', 'Por favor completa el nombre, origen y destino de la ruta.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await routeService.create({
        name: newRoute.name.trim(),
        origin: newRoute.origin.trim(),
        destination: newRoute.destination.trim(),
        distance_km: Number(newRoute.distance_km) || 45,
        estimated_duration_min: Number(newRoute.estimated_duration_min) || 45,
        status: newRoute.status
      });

      setRoutes(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewRoute({
        name: '',
        origin: '',
        destination: '',
        distance_km: 45,
        estimated_duration_min: 45,
        status: 'activa'
      });
      showNotification('Ruta Creada', `Ruta "${created.name}" configurada exitosamente en el sistema.`, 'success');
    } catch (err: any) {
      console.error('Error creando ruta:', err);
      showNotification('Error', 'No se pudo registrar la ruta en la base de datos.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoutes = routes.filter((r: any) => 
    r.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.origin?.toLowerCase().includes(query.toLowerCase()) ||
    r.destination?.toLowerCase().includes(query.toLowerCase())
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
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🗺️ Control y Consulta de Rutas</h2>
          <p>Itinerarios y trayectos interurbanos del sistema S.M.A.R.T.</p>
        </div>
        {isAdminOrOperator && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Crear Nueva Ruta
          </button>
        )}
      </div>

      <div className="search-widget" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar por nombre de ruta, origen o destino (Ej: San Bernardo, Ruta Sur...)" 
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="routes-cards-grid" style={{ marginTop: '2rem' }}>
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
                ⏱️ <strong>Duración:</strong> {r.estimated_duration_min ? `${r.estimated_duration_min} mins` : '45 mins'}
              </p>
              {r.distance_km && (
                <p className="route-public-detail">📏 <strong>Distancia:</strong> {r.distance_km} km</p>
              )}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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

      {/* Modal de Crear Ruta */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="voucher-modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <span className="brand-logo">🗺️ CREAR NUEVA RUTA</span>
                <span className="voucher-tag">Trayecto Interurbano</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateRoute} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Nombre de la Ruta *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Ruta Costa Expreso"
                  required
                  value={newRoute.name}
                  onChange={e => setNewRoute({ ...newRoute, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Origen *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Santiago Central"
                    required
                    value={newRoute.origin}
                    onChange={e => setNewRoute({ ...newRoute, origin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Destino *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Valparaíso"
                    required
                    value={newRoute.destination}
                    onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Distancia (KM)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoute.distance_km}
                    onChange={e => setNewRoute({ ...newRoute, distance_km: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Duración Estimada (Minutos)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoute.estimated_duration_min}
                    onChange={e => setNewRoute({ ...newRoute, estimated_duration_min: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '✓ Crear Ruta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoutesPage;

