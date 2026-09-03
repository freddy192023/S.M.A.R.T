import React, { useState, useEffect } from 'react';
import { driverService } from '../../services/driverService';
import { busService } from '../../services/busService';
import { useNotification } from '../../context/NotificationContext';

const statusMap: Record<string, string> = {
  activo: 'Activo',
  en_viaje: 'En Viaje',
  descanso: 'Descanso',
  inactivo: 'Inactivo'
};

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    full_name: '',
    license_number: '',
    license_expiry: '2028-12-31',
    phone: '',
    assigned_bus_id: '',
    status: 'activo'
  });
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const loadData = async () => {
    try {
      const [drvData, busData] = await Promise.all([
        driverService.getAll(),
        busService.getAll()
      ]);
      setDrivers(drvData || []);
      setBuses(busData || []);
    } catch (err) {
      console.error('Error cargando conductores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.full_name.trim() || !newDriver.license_number.trim()) {
      showNotification('Campos Incompletos', 'Por favor ingresa el nombre y número de licencia del conductor.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await driverService.create({
        full_name: newDriver.full_name.trim(),
        license_number: newDriver.license_number.toUpperCase().trim(),
        license_expiry: newDriver.license_expiry,
        phone: newDriver.phone.trim() || '+56912345678',
        status: newDriver.status
      });

      setDrivers(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewDriver({
        full_name: '',
        license_number: '',
        license_expiry: '2028-12-31',
        phone: '',
        assigned_bus_id: '',
        status: 'activo'
      });
      showNotification('Conductor Registrado', `Conductor ${created.full_name} asignado al sistema.`, 'success');
    } catch (err: any) {
      console.error('Error registrando conductor:', err);
      showNotification('Error', 'No se pudo guardar el conductor en la base de datos.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (drv: any) => {
    const nextStatus = drv.status === 'activo' ? 'descanso' : 'activo';
    try {
      await driverService.update(drv.id, { status: nextStatus });
      setDrivers(prev => prev.map(d => d.id === drv.id ? { ...d, status: nextStatus } : d));
      showNotification('Estado Cambiado', `El conductor ${drv.full_name} pasa a estado: ${nextStatus.toUpperCase()}.`, 'info');
    } catch (err) {
      showNotification('Error', 'No se pudo actualizar el estado del conductor.', 'danger');
    }
  };

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando registro de conductores...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>👨‍✈️ Gestión y Asignación de Conductores</h2>
          <p>Registro de conductores autorizados, licencias y vehículos asignados</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)}
        >
          + Registrar Nuevo Conductor
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>N° Licencia</th>
              <th>Vencimiento</th>
              <th>Teléfono Contacto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay conductores registrados.</td></tr>
            ) : (
              drivers.map(drv => (
                <tr key={drv.id}>
                  <td className="text-bold">{drv.full_name}</td>
                  <td><span className="license-tag">{drv.license_number}</span></td>
                  <td>{drv.license_expiry}</td>
                  <td>{drv.phone}</td>
                  <td>
                    <span className={`badge badge-${drv.status === 'activo' ? 'success' : drv.status === 'inactivo' ? 'danger' : 'warning'}`}>
                      {statusMap[drv.status] || drv.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleStatus(drv)}
                      >
                        🔄 {drv.status === 'activo' ? 'Poner en Descanso' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear Conductor */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="voucher-modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <div className="voucher-brand">
                <span className="brand-logo">👨‍✈️ REGISTRAR CONDUCTOR</span>
                <span className="voucher-tag">Asignación Operacional</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateDriver} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Nombre Completo del Conductor *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Pedro Valenzuela"
                  required
                  value={newDriver.full_name}
                  onChange={e => setNewDriver({ ...newDriver, full_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Número de Licencia *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: LIC-009922"
                    required
                    value={newDriver.license_number}
                    onChange={e => setNewDriver({ ...newDriver, license_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Vencimiento Licencia</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newDriver.license_expiry}
                    onChange={e => setNewDriver({ ...newDriver, license_expiry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Teléfono de Contacto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: +56912345678"
                    value={newDriver.phone}
                    onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Bus Asignado</label>
                  <select
                    className="form-input"
                    value={newDriver.assigned_bus_id}
                    onChange={e => setNewDriver({ ...newDriver, assigned_bus_id: e.target.value })}
                  >
                    <option value="">Seleccionar Bus (Opcional)...</option>
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.plate} ({b.brand} {b.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Estado Operacional</label>
                <select
                  className="form-input"
                  value={newDriver.status}
                  onChange={e => setNewDriver({ ...newDriver, status: e.target.value })}
                >
                  <option value="activo">Activo / Disponible</option>
                  <option value="descanso">En Descanso</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : '✓ Registrar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;

