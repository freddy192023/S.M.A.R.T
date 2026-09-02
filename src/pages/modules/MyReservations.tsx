import React, { useState, useEffect } from 'react';
import type { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import { VoucherModal } from '../../components/VoucherModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface MyReservationsProps {
  setActiveView?: (view: string) => void;
}

export const MyReservations: React.FC<MyReservationsProps> = ({ setActiveView }) => {
  const { profile } = useAuth();
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Reservation | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'cancelled'>('all');

  const loadReservations = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await reservationService.getByPassengerId(profile.id);
      setReservations(data);
    } catch (err) {
      console.error('Error cargando reservas del pasajero:', err);
      showNotification('Error', 'No se pudieron cargar tus reservas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [profile]);

  const handleCancelReservation = async (reservation: Reservation) => {
    const confirmCancel = window.confirm(`¿Estás seguro de que deseas cancelar la reserva ${reservation.reservation_code}? Tu asiento quedará liberado.`);
    if (!confirmCancel) return;

    try {
      await reservationService.cancel(reservation.id);
      showNotification('Reserva Cancelada', `La reserva ${reservation.reservation_code} fue cancelada exitosamente y el asiento ha sido liberado.`, 'info');
      loadReservations();
    } catch (err) {
      console.error('Error cancelando reserva:', err);
      showNotification('Error', 'No se pudo cancelar la reserva.', 'error');
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filterTab === 'active') return r.status === 'confirmed' || r.status === 'pending';
    if (filterTab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  return (
    <div className="my-reservations-module">
      <div className="card-header" style={{ padding: '0 0 1.5rem 0', borderBottom: 'none' }}>
        <div className="card-title-group">
          <h2>🎫 Mis Reservas y Boletos</h2>
          <p>Consulta el historial de tus boletos adquiridos, descarga tus comprobantes y gestiona tus viajes</p>
        </div>
        {setActiveView && (
          <button className="btn btn-primary" onClick={() => setActiveView('search-trips')}>
            + Reservar Nuevo Viaje
          </button>
        )}
      </div>

      {/* Tabs de Filtro */}
      <div className="reservations-tabs">
        <button
          type="button"
          className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          Todas las Reservas ({reservations.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterTab === 'active' ? 'active' : ''}`}
          onClick={() => setFilterTab('active')}
        >
          Próximos / Activos ({reservations.filter(r => r.status === 'confirmed').length})
        </button>
        <button
          type="button"
          className={`tab-btn ${filterTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterTab('cancelled')}
        >
          Cancelados ({reservations.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {loading ? (
        <div className="content-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>⏳ Cargando tus reservas...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="content-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🎟️</span>
          <h3 style={{ marginTop: '1rem' }}>No tienes reservas en esta sección</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            Explora los viajes disponibles en la plataforma y asegura tu asiento para viajar de forma cómoda y puntual.
          </p>
          {setActiveView && (
            <button className="btn btn-primary" onClick={() => setActiveView('search-trips')}>
              Buscar y Reservar Viaje Ahora
            </button>
          )}
        </div>
      ) : (
        <div className="reservations-cards-grid">
          {filteredReservations.map(res => {
            const trip = res.trip;
            const isConfirmed = res.status === 'confirmed';
            const isCancelled = res.status === 'cancelled';

            return (
              <div key={res.id} className={`my-reservation-card ${isCancelled ? 'card-cancelled' : ''}`}>
                <div className="reservation-card-header">
                  <span className="res-code">{res.reservation_code}</span>
                  <span className={`badge ${isConfirmed ? 'badge-success' : isCancelled ? 'badge-danger' : 'badge-warning'}`}>
                    {isConfirmed ? 'Confirmada ✅' : isCancelled ? 'Cancelada' : res.status}
                  </span>
                </div>

                <div className="reservation-card-body">
                  <h3 className="res-route-title">
                    {trip?.route || `${trip?.origin || 'Origen'} → ${trip?.destination || 'Destino'}`}
                  </h3>

                  <div className="res-meta-grid">
                    <div className="res-meta-item">
                      <span className="label">📅 Fecha de Salida:</span>
                      <span className="value">{trip?.date || 'N/A'}</span>
                    </div>
                    <div className="res-meta-item">
                      <span className="label">⏰ Hora:</span>
                      <span className="value text-accent">{trip?.time || '08:00'}</span>
                    </div>
                    <div className="res-meta-item">
                      <span className="label">💺 Asiento:</span>
                      <span className="value seat-tag">N° {res.seat_number < 10 ? `0${res.seat_number}` : res.seat_number}</span>
                    </div>
                    <div className="res-meta-item">
                      <span className="label">🚌 Vehículo:</span>
                      <span className="value">{trip?.bus || 'Asignado'}</span>
                    </div>
                    <div className="res-meta-item">
                      <span className="label">💰 Monto:</span>
                      <span className="value text-bold">S/ {Number(res.price).toFixed(2)}</span>
                    </div>
                    <div className="res-meta-item">
                      <span className="label">💳 Pago:</span>
                      <span className="value">{res.payment_method || 'Digital'}</span>
                    </div>
                  </div>
                </div>

                <div className="reservation-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedVoucher(res)}
                  >
                    📄 Ver Comprobante
                  </button>

                  {isConfirmed && (
                    <button
                      type="button"
                      className="btn btn-sm text-danger"
                      style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      onClick={() => handleCancelReservation(res)}
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Comprobante / Voucher */}
      {selectedVoucher && (
        <VoucherModal
          reservation={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
};

export default MyReservations;
