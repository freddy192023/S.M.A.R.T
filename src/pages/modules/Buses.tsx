import React, { useState, useEffect } from 'react';
import { busService } from '../../services/busService';
import { useNotification } from '../../context/NotificationContext';

const statusMap: Record<string, string> = {
  disponible: 'Activo',
  en_mantenimiento: 'En Mantención',
  en_viaje: 'En Viaje',
  inactivo: 'Inactivo'
};

export const Buses: React.FC = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBus, setNewBus] = useState({
    plate: '',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    year: new Date().getFullYear(),
    capacity: 40,
    status: 'disponible'
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const loadBuses = async () => {
    try {
      const data = await busService.getAll();
      setBuses(data || []);
    } catch (err) {
      console.error('Error cargando buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBus.plate.trim()) {
      showNotification('Campo Requerido', 'Por favor ingresa la patente del vehículo.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await busService.create({
        plate: newBus.plate.toUpperCase().trim(),
        brand: newBus.brand.trim(),
        model: newBus.model.trim(),
        year: Number(newBus.year),
        capacity: Number(newBus.capacity),
        status: newBus.status
      });

      setBuses(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewBus({
        plate: '',
        brand: 'Mercedes-Benz',
        model: 'Sprinter',
        year: new Date().getFullYear(),
        capacity: 40,
        status: 'disponible'
      });
      showNotification('Bus Registrado', `Vehículo ${created.plate} agregado exitosamente a la flota.`, 'success');
    } catch (err: any) {
      console.error('Error creando bus:', err);
      showNotification('Error', 'No se pudo registrar el bus en la base de datos.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (bus: any) => {
    const nextStatus = bus.status === 'disponible' ? 'en_mantenimiento' : 'disponible';
    try {
      await busService.update(bus.id, { status: nextStatus });
      setBuses(prev => prev.map(b => b.id === bus.id ? { ...b, status: nextStatus } : b));
      showNotification(
        'Estado Cambiado', 
        `El bus ${bus.plate} ahora está ${nextStatus === 'disponible' ? 'Activo' : 'En Mantención'}.`,
        'info'
      );
    } catch (err) {
      showNotification('Error', 'No se pudo actualizar el estado del bus.', 'danger');
    }
  };

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando flota de buses...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🚌 Gestión de Flota de Buses</h2>
          <p>Administración y registro de vehículos de transporte privado</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          + Agregar Bus a la Flota
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {buses.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay buses registrados.</td></tr>
            ) : (
              buses.map(bus => (
                <tr key={bus.id}>
                  <td className="text-bold">{bus.plate}</td>
                  <td>{bus.brand}</td>
                  <td>{bus.model}</td>
                  <td>{bus.year}</td>
                  <td>{bus.capacity} pasajeros</td>
                  <td>
                    <span className={`badge badge-${bus.status === 'disponible' ? 'success' : bus.status === 'inactivo' ? 'danger' : 'warning'}`}>
                      {statusMap[bus.status] || bus.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleToggleStatus(bus)}
                        title="Cambiar estado de servicio"
                      >
                        🔄 {bus.status === 'disponible' ? 'A Mantención' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear Bus */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="voucher-modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <span className="brand-logo">🚌 AGREGAR NUEVO BUS</span>
                <span className="voucher-tag">Registro de Vehículo</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateBus} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Patente / Placa del Vehículo *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: ABCD-12 o BUS-005"
                  required
                  value={newBus.plate}
                  onChange={e => setNewBus({ ...newBus, plate: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Marca</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Mercedes-Benz, Volvo"
                    value={newBus.brand}
                    onChange={e => setNewBus({ ...newBus, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Modelo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Sprinter, B8RLE"
                    value={newBus.model}
                    onChange={e => setNewBus({ ...newBus, model: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Año de Fabricación</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newBus.year}
                    onChange={e => setNewBus({ ...newBus, year: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Capacidad de Pasajeros</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newBus.capacity}
                    onChange={e => setNewBus({ ...newBus, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Estado Inicial</label>
                <select
                  className="form-input"
                  value={newBus.status}
                  onChange={e => setNewBus({ ...newBus, status: e.target.value })}
                >
                  <option value="disponible">Activo / Disponible</option>
                  <option value="en_mantenimiento">En Mantención</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '✓ Registrar Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buses;

