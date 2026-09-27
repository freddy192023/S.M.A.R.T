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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '500px', width: '92%', padding: '1.5rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>💺 Selección de Asientos</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {trip.route} · {trip.date} a las {trip.time}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3rem' }}>
          {loadingSeats ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              ⏳ Cargando distribución de asientos del bus...
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

        <div className="modal-footer" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
              ? `Continuar a Pagar ($ ${totalPrice.toLocaleString('es-CL')} CLP) →`
              : 'Elige al menos 1 asiento'}
          </button>
        </div>
      </div>
    </div>
  );
};
