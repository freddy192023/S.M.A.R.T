import React, { useState, useEffect } from 'react';
import { stopService } from '../../services/stopService';
import { routeService } from '../../services/routeService';
import { useNotification } from '../../context/NotificationContext';

export const Stops: React.FC = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStop, setNewStop] = useState({
    name: '',
    address: '',
    route_id: '',
    stop_order: 1
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const loadData = async () => {
    try {
      const [stopsData, routesData] = await Promise.all([
        stopService.getAll(),
        routeService.getAll()
      ]);
      setStops(stopsData || []);
      setRoutes(routesData || []);
      if (routesData && routesData.length > 0) {
        setNewStop(prev => ({ ...prev, route_id: routesData[0].id }));
      }
    } catch (err) {
      console.error('Error cargando paraderos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStop.name.trim()) {
      showNotification('Campo Requerido', 'Por favor ingresa el nombre del paradero.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await stopService.create({
        name: newStop.name.trim(),
        address: newStop.address.trim(),
        route_id: newStop.route_id || null,
        stop_order: Number(newStop.stop_order) || 1
      });

      const matchedRoute = routes.find(r => r.id === created.route_id);
      const fullCreated = {
        ...created,
        routes: matchedRoute ? { name: matchedRoute.name } : undefined
      };

      setStops(prev => [...prev, fullCreated]);
      setShowAddModal(false);
      setNewStop({
        name: '',
        address: '',
        route_id: routes[0]?.id || '',
        stop_order: stops.length + 1
      });
      showNotification('Paradero Creado', `Parada "${created.name}" registrada con éxito.`, 'success');
    } catch (err: any) {
      console.error('Error creando paradero:', err);
      showNotification('Error', 'No se pudo guardar la parada en la base de datos.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando paraderos e itinerarios...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>📍 Gestión de Paraderos y Paradas Intermedias</h2>
          <p>Configuración de puntos de recojo y descenso de pasajeros asociados a cada ruta</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          + Registrar Nueva Parada
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre de Parada</th>
              <th>Dirección / Ubicación</th>
              <th>Ruta Asociada</th>
              <th>Orden de Secuencia</th>
            </tr>
          </thead>
          <tbody>
            {stops.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay paraderos registrados.</td></tr>
            ) : (
              stops.map(p => (
                <tr key={p.id}>
                  <td className="text-bold">{p.name}</td>
                  <td>{p.address || 'Sin dirección registrada'}</td>
                  <td>
                    <span className="badge badge-success">{p.routes?.name || 'Ruta General'}</span>
                  </td>
                  <td>
                    <strong>N° {p.stop_order}</strong>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear Parada */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="voucher-modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <span className="brand-logo">📍 REGISTRAR PARADERO</span>
                <span className="voucher-tag">Parada Intermedia</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateStop} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Nombre de la Parada *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Paradero Estación Pajaritos"
                  required
                  value={newStop.name}
                  onChange={e => setNewStop({ ...newStop, name: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Dirección o Referencia</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Av. Gladys Marín 6500"
                  value={newStop.address}
                  onChange={e => setNewStop({ ...newStop, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Ruta Asociada</label>
                  <select
                    className="form-input"
                    value={newStop.route_id}
                    onChange={e => setNewStop({ ...newStop, route_id: e.target.value })}
                  >
                    <option value="">Ruta General / Sin asignar</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.origin} ➔ {r.destination})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Orden en el Recorrido</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={newStop.stop_order}
                    onChange={e => setNewStop({ ...newStop, stop_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '✓ Crear Paradero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stops;

