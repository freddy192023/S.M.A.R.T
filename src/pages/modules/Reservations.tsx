import React, { useState, useEffect } from 'react';
import type { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import { VoucherModal } from '../../components/VoucherModal';
import { useNotification } from '../../context/NotificationContext';

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Reservation | null>(null);
  const { showNotification } = useNotification();

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      console.error('Error cargando reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCancel = async (res: Reservation) => {
    const confirmCancel = window.confirm(`¿Seguro que deseas cancelar administrativamente la reserva ${res.reservation_code}?`);
    if (!confirmCancel) return;

    await reservationService.cancel(res.id);
    showNotification('Reserva Cancelada', `La reserva ${res.reservation_code} fue anulada.`, 'info');
    loadAll();
  };

  const filtered = reservations.filter(r => {
    const q = query.toLowerCase();
    return (
      r.reservation_code?.toLowerCase().includes(q) ||
      r.passenger_name?.toLowerCase().includes(q) ||
      r.passenger_email?.toLowerCase().includes(q) ||
      r.trip?.route?.toLowerCase().includes(q) ||
      r.trip?.origin?.toLowerCase().includes(q) ||
      r.trip?.destination?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  if (loading) {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>⏳ Cargando registro general de reservas...</p>
      </div>
    );
  }

  return (
    <div className="reservations-admin-module">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--accent-color)' }}>🎫</span>
          <div className="stat-info">
            <span className="stat-value">{reservations.length}</span>
            <span className="stat-label">Total Reservas</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--success-color)' }}>✅</span>
          <div className="stat-info">
            <span className="stat-value">{reservations.filter(r => r.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmadas</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--danger-color)' }}>🚫</span>
          <div className="stat-info">
            <span className="stat-value">{reservations.filter(r => r.status === 'cancelled').length}</span>
            <span className="stat-label">Canceladas</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon" style={{ color: 'var(--primary-color)' }}>💰</span>
          <div className="stat-info">
            <span className="stat-value">S/ {totalRevenue.toFixed(2)}</span>
            <span className="stat-label">Ingresos Registrados</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div className="card-title-group">
            <h2>📑 Registro Central de Reservas de Pasajeros</h2>
            <p>Control operacional de boletos emitidos, estado de pagos y asignación de asientos</p>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por código (SMART-XXX), pasajero, email o ruta..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Pasajero</th>
                <th>Ruta / Itinerario</th>
                <th>Fecha Viaje</th>
                <th>Asiento</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No se encontraron reservas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map(res => (
                  <tr key={res.id}>
                    <td className="text-bold" style={{ color: 'var(--accent-color)' }}>{res.reservation_code}</td>
                    <td>
                      <div>{res.passenger_name || 'Pasajero'}</div>
                      <small style={{ color: 'var(--text-muted)' }}>{res.passenger_email}</small>
                    </td>
                    <td>{res.trip?.route || `${res.trip?.origin || 'Origen'} → ${res.trip?.destination || 'Destino'}`}</td>
                    <td>{res.trip?.date} {res.trip?.time}</td>
                    <td>
                      <span className="badge badge-secondary">N° {res.seat_number}</span>
                    </td>
                    <td className="text-bold">S/ {Number(res.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${res.status === 'confirmed' ? 'badge-success' : res.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {res.status === 'confirmed' ? 'Confirmada' : res.status === 'cancelled' ? 'Cancelada' : res.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedVoucher(res)}
                          title="Ver Comprobante"
                        >
                          📄
                        </button>
                        {res.status === 'confirmed' && (
                          <button
                            className="btn btn-sm text-danger"
                            style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            onClick={() => handleCancel(res)}
                            title="Cancelar Reserva"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVoucher && (
        <VoucherModal
          reservation={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
};

export default Reservations;
