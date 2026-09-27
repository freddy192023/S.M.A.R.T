import React from 'react';
import type { Trip, Seat } from '../types';
import { SeatSelector } from './SeatSelector';

interface SeatSelectionModalProps {
  trip: Trip;
  seats: Seat[];
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  loadingSeats: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  trip,
  seats,
  selectedSeats,
  onToggleSeat,
  loadingSeats,
  onClose,
  onConfirm
}) => {
  const unitPrice = (trip.price || 12000) < 500 ? (trip.price || 35) * 300 : trip.price || 12000;
  const totalPrice = unitPrice * selectedSeats.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="checkout-modal-content" 
        style={{ maxWidth: '580px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="checkout-header">
          <div className="checkout-title-group">
            <h2>💺 Distribución y Selección de Asientos</h2>
            <p>{trip.route || `${trip.origin} → ${trip.destination}`} · {trip.date} a las {trip.time}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {loadingSeats ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ⏳ Cargando disponibilidad del bus...
            </div>
          ) : (
            <SeatSelector
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={onToggleSeat}
              price={trip.price || 12000}
            />
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', background: 'var(--bg-secondary)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={selectedSeats.length === 0 || loadingSeats}
            onClick={onConfirm}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {selectedSeats.length > 0
              ? `Continuar a Pagar (${selectedSeats.length} asiento${selectedSeats.length > 1 ? 's' : ''} - $ ${totalPrice.toLocaleString('es-CL')} CLP) →`
              : 'Elige al menos 1 asiento'}
          </button>
        </div>
      </div>
    </div>
  );
};
