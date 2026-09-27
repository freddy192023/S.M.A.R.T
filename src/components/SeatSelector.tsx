import React from 'react';
import type { Seat } from '../types';

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
  price: number;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  price
}) => {
  const unitPrice = price < 500 ? price * 300 : price;
  const totalPrice = unitPrice * selectedSeats.length;

  // Organizar asientos en filas de 4 (2 izquierda, pasillo, 2 derecha)
  const rows: Seat[][] = [];
  const chunkSize = 4;
  for (let i = 0; i < seats.length; i += chunkSize) {
    rows.push(seats.slice(i, i + chunkSize));
  }

  return (
    <div className="seat-selector-wrapper">
      <div className="seat-selector-header">
        <h3>💺 Distribución del Bus</h3>
        <p>Puedes seleccionar <strong>uno o varios asientos</strong> para tu reserva</p>
      </div>

      {/* Leyenda de Asientos */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-sample available"></span>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample selected"></span>
          <span>Seleccionado ({selectedSeats.length})</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample reserved"></span>
          <span>Ocupado</span>
        </div>
      </div>

      {/* Carrocería del Autobús */}
      <div className="bus-chassis">
        {/* Cabina del conductor */}
        <div className="bus-cabin">
          <div className="bus-windshield"></div>
          <div className="driver-area">
            <span className="driver-icon" title="Cabina del Conductor">👨‍✈️ Volante</span>
            <span className="bus-entry">🚪 Puerta</span>
          </div>
        </div>

        {/* Pasillo y Asientos */}
        <div className="bus-seats-grid">
          {rows.map((row, rowIndex) => {
            const leftPair = row.slice(0, 2);
            const rightPair = row.slice(2, 4);

            return (
              <div key={`row-${rowIndex}`} className="bus-row">
                <div className="seat-pair">
                  {leftPair.map(seat => {
                    const isSelected = selectedSeats.includes(seat.seat_number);
                    const isReserved = seat.status === 'reserved';

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isReserved}
                        className={`bus-seat ${isReserved ? 'seat-reserved' : isSelected ? 'seat-selected' : 'seat-available'}`}
                        onClick={() => onToggleSeat(seat.seat_number)}
                        title={isReserved ? `Asiento ${seat.seat_number} (Ocupado)` : `Asiento ${seat.seat_number} - $ ${unitPrice.toLocaleString('es-CL')} CLP`}
                      >
                        <span className="seat-num">{seat.seat_number < 10 ? `0${seat.seat_number}` : seat.seat_number}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bus-aisle">
                  <span className="aisle-indicator"></span>
                </div>

                <div className="seat-pair">
                  {rightPair.map(seat => {
                    const isSelected = selectedSeats.includes(seat.seat_number);
                    const isReserved = seat.status === 'reserved';

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isReserved}
                        className={`bus-seat ${isReserved ? 'seat-reserved' : isSelected ? 'seat-selected' : 'seat-available'}`}
                        onClick={() => onToggleSeat(seat.seat_number)}
                        title={isReserved ? `Asiento ${seat.seat_number} (Ocupado)` : `Asiento ${seat.seat_number} - $ ${unitPrice.toLocaleString('es-CL')} CLP`}
                      >
                        <span className="seat-num">{seat.seat_number < 10 ? `0${seat.seat_number}` : seat.seat_number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Parte trasera del bus */}
        <div className="bus-rear">
          <span>PARTE POSTERIOR</span>
        </div>
      </div>

      {/* Resumen de Selección */}
      <div className="seat-selection-summary">
        <div>
          <span className="summary-label">Asientos Elegidos ({selectedSeats.length}):</span>
          <span className="summary-value">
            {selectedSeats.length > 0 
              ? selectedSeats.sort((a, b) => a - b).map(n => `N° ${n}`).join(', ') 
              : 'Ninguno'}
          </span>
        </div>
        <div>
          <span className="summary-label">Precio Total:</span>
          <span className="summary-price">
            {selectedSeats.length > 0 
              ? `$ ${totalPrice.toLocaleString('es-CL')} CLP` 
              : '$ 0 CLP'}
          </span>
        </div>
      </div>
    </div>
  );
};
