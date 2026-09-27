import React, { useState } from 'react';
import type { Trip, User, Reservation } from '../types';
import { reservationService } from '../services/reservationService';
import { useNotification } from '../context/NotificationContext';
import { publicarReservaCreada, publicarLog } from '../lib/eventService';

interface CheckoutModalProps {
  trip: Trip;
  selectedSeats: number[];
  currentUser: User;
  onClose: () => void;
  onSuccess: (reservation: Reservation) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  trip,
  selectedSeats,
  currentUser,
  onClose,
  onSuccess
}) => {
  const { showNotification } = useNotification();
  const [passengerName, setPassengerName] = useState(currentUser.full_name || currentUser.name || '');
  const [passengerEmail, setPassengerEmail] = useState(currentUser.email || '');
  const [passengerPhone, setPassengerPhone] = useState(currentUser.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('Webpay Plus (Débito / Crédito)');
  const [isProcessing, setIsProcessing] = useState(false);

  const unitPrice = (trip.price || 12000) < 500 ? (trip.price || 35) * 300 : trip.price || 12000;
  const totalPrice = unitPrice * selectedSeats.length;
  const sortedSeats = [...selectedSeats].sort((a, b) => a - b);
  const seatsFormattedStr = sortedSeats.map(n => `N° ${n}`).join(', ');

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengerName.trim() || !passengerEmail.trim()) {
      showNotification('Datos Requeridos', 'Por favor completa tu nombre y correo para emitir los boletos.', 'warning');
      return;
    }

    if (selectedSeats.length === 0) {
      showNotification('Sin Asientos', 'Debes seleccionar al menos un asiento.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Simular tiempo de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1200));

      const createdReservations: Reservation[] = [];

      for (const seatNum of sortedSeats) {
        const newRes = await reservationService.create({
          passenger_id: currentUser.id,
          trip_id: trip.id,
          seat_number: seatNum,
          price: unitPrice,
          payment_method: paymentMethod,
          passenger_name: passengerName,
          passenger_email: passengerEmail,
          passenger_phone: passengerPhone
        });

        createdReservations.push(newRes);

        // 🟢 Publicar evento asíncrono a RabbitMQ por cada asiento reservado
        publicarReservaCreada({
          viajeId: trip.id,
          asiento: seatNum,
          pasajero: passengerName,
          reservaCode: newRes.reservation_code
        });

        publicarLog('info', `Reserva ${newRes.reservation_code} (Asiento N° ${seatNum}) confirmada para ${passengerName}`);
      }

      const primaryRes = createdReservations[0];
      // Adjuntar resumen de asientos múltiples y precio total para el comprobante
      (primaryRes as any).combined_seats_str = seatsFormattedStr;
      (primaryRes as any).total_price_calculated = totalPrice;

      showNotification(
        '¡Reserva Exitosa!',
        `Se han confirmado ${selectedSeats.length} asiento(s) (${seatsFormattedStr}) satisfactoriamente.`,
        'success'
      );

      onSuccess(primaryRes);
    } catch (error: any) {
      console.error('Error al procesar reserva:', error);
      showNotification('Error', 'No se pudo completar la reserva. Intenta nuevamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
        <div className="checkout-header">
          <div className="checkout-title-group">
            <h2>💳 Confirmación y Pago de Reserva</h2>
            <p>Revisa los datos de tu viaje antes de confirmar</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleConfirmPayment}>
          <div className="checkout-grid">
            {/* Resumen del Viaje */}
            <div className="checkout-summary-card">
              <h3>🚍 Resumen del Itinerario</h3>
              <div className="summary-trip-details">
                <div className="summary-item">
                  <span className="label">Ruta:</span>
                  <span className="value text-bold">{trip.route || `${trip.origin} → ${trip.destination}`}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Origen:</span>
                  <span className="value">{trip.origin}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Destino:</span>
                  <span className="value">{trip.destination}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Fecha y Hora:</span>
                  <span className="value text-accent">{trip.date} a las {trip.time}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Bus:</span>
                  <span className="value">{trip.bus} ({trip.bus_model})</span>
                </div>
                <div className="summary-item">
                  <span className="label">Asiento(s) Seleccionado(s):</span>
                  <span className="value badge badge-success" style={{ fontSize: '0.9rem' }}>
                    {seatsFormattedStr} ({selectedSeats.length})
                  </span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item total-row">
                  <span className="total-label">Total a Pagar:</span>
                  <span className="total-price">$ {totalPrice.toLocaleString('es-CL')} CLP</span>
                </div>
              </div>
            </div>

            {/* Datos del Pasajero y Pago */}
            <div className="checkout-form-section">
              <h3>👤 Datos del Pasajero</h3>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    value={passengerEmail}
                    onChange={e => setPassengerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+56 9 1234 5678"
                    value={passengerPhone}
                    onChange={e => setPassengerPhone(e.target.value)}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '1.5rem' }}>💰 Método de Pago (Chile)</h3>
              <div className="payment-methods-grid">
                {[
                  { id: 'card', name: 'Webpay Plus (Débito / Crédito)', icon: '💳' },
                  { id: 'wallet', name: 'Mercado Pago / CuentaRUT', icon: '📱' },
                  { id: 'transfer', name: 'Transferencia (BancoEstado / Mach)', icon: '🏦' }
                ].map(method => (
                  <label 
                    key={method.id} 
                    className={`payment-method-option ${paymentMethod === method.name ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.name}
                      checked={paymentMethod === method.name}
                      onChange={() => setPaymentMethod(method.name)}
                    />
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                  </label>
                ))}
              </div>

              <div className="simulated-payment-alert">
                <span>🛡️ Entorno Académico: El cobro se procesará como transacción digital simulada y se emitirá el boleto de inmediato.</span>
              </div>
            </div>
          </div>

          <div className="checkout-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing}
              style={{ minWidth: '220px' }}
            >
              {isProcessing ? '🔄 Procesando Pago...' : `Confirmar y Pagar $ ${totalPrice.toLocaleString('es-CL')} CLP`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
