import React from 'react';
import type { Reservation } from '../types';

interface VoucherModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  const trip = reservation.trip;
  const isCancelled = reservation.status === 'cancelled';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
        {/* Cabecera del Voucher */}
        <div className="voucher-header">
          <div className="voucher-brand">
            <span className="brand-logo">🚍 S.M.A.R.T</span>
            <span className="voucher-tag">COMPROBANTE DE RESERVA</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Cuerpo del Ticket Digital */}
        <div className="voucher-ticket" id="printable-voucher">
          <div className="ticket-top-badge">
            <span className={`badge ${isCancelled ? 'badge-danger' : 'badge-success'}`}>
              {isCancelled ? 'RESERVA CANCELADA' : 'RESERVA CONFIRMADA ✅'}
            </span>
            <span className="ticket-code">{reservation.reservation_code}</span>
          </div>

          <div className="ticket-route-banner">
            <div className="ticket-station">
              <span className="station-type">ORIGEN</span>
              <span className="station-name">{trip?.origin || 'Origen Central'}</span>
            </div>
            <div className="ticket-arrow">
              <span>✈️ ──────── 🚍</span>
            </div>
            <div className="ticket-station">
              <span className="station-type">DESTINO</span>
              <span className="station-name">{trip?.destination || 'Destino'}</span>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-field">
              <span className="field-label">Pasajero</span>
              <span className="field-value">{reservation.passenger_name || 'Pasajero S.M.A.R.T'}</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Fecha del Viaje</span>
              <span className="field-value">{trip?.date || new Date().toLocaleDateString()}</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Hora de Salida</span>
              <span className="field-value text-accent">{trip?.time || '08:00'}</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Asiento N°</span>
              <span className="field-value seat-highlight">
                {reservation.seat_number < 10 ? `0${reservation.seat_number}` : reservation.seat_number}
              </span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Bus Asignado</span>
              <span className="field-value">{trip?.bus || 'Placa B-001'} ({trip?.bus_model || 'Standard'})</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Conductor</span>
              <span className="field-value">{trip?.conductor || 'Asignado en estación'}</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Monto Pagado</span>
              <span className="field-value price-highlight">S/ {Number(reservation.price).toFixed(2)}</span>
            </div>
            <div className="ticket-field">
              <span className="field-label">Método de Pago</span>
              <span className="field-value">{reservation.payment_method || 'Pago Digital Simulado'}</span>
            </div>
          </div>

          {/* Código QR / Barras de Seguridad */}
          <div className="ticket-footer-security">
            <div className="qr-simulated">
              <div className="qr-box">
                <span>[ ■ █ ■ ]</span>
                <small>QR SMART PASS</small>
              </div>
            </div>
            <div className="security-notice">
              <p>💡 Presenta este comprobante digital o impreso al abordar el autobús.</p>
              <small>Emitido el: {new Date(reservation.reservation_date || Date.now()).toLocaleString()}</small>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="voucher-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨️ Imprimir / Guardar PDF
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
