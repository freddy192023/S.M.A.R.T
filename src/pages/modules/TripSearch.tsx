import React, { useState, useEffect } from 'react';
import type { Trip, Seat, Reservation } from '../../types';
import { tripService } from '../../services/tripService';
import { seatService } from '../../services/seatService';
import { SeatSelector } from '../../components/SeatSelector';
import { SeatSelectionModal } from '../../components/SeatSelectionModal';
import { CheckoutModal } from '../../components/CheckoutModal';
import { VoucherModal } from '../../components/VoucherModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface TripSearchProps {
  setActiveView?: (view: string) => void;
}

export const TripSearch: React.FC<TripSearchProps> = ({ setActiveView }) => {
  const { profile } = useAuth();
  const { showNotification } = useNotification();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del flujo de reserva
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Modales
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);

  // Cargar viajes disponibles
  const loadTrips = async (filterOrigin = origin, filterDest = destination, filterDate = date) => {
    setLoading(true);
    try {
      const data = await tripService.getAvailableForBooking(filterOrigin, filterDest, filterDate);
      
      setTrips(data);
      
      // Guardar lista maestra para sugerencias
      if (allTrips.length === 0) {
        const fullList = await tripService.getAllWithDetails();
        setAllTrips(fullList);
        const origins = Array.from(new Set(fullList.map((t: any) => t.origin).filter(Boolean))) as string[];
        const destinations = Array.from(new Set(fullList.map((t: any) => t.destination).filter(Boolean))) as string[];
        setAvailableOrigins(origins);
        setAvailableDestinations(destinations);
      }
    } catch (error) {
      console.error('Error cargando viajes disponibles:', error);
      showNotification('Aviso', 'Cargando viajes disponibles...', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips('', '', '');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedTrip(null);
    setSelectedSeats([]);
    loadTrips(origin, destination, date);
  };

  const handleQuickFilter = (dest: string) => {
    setDestination(dest);
    setSelectedTrip(null);
    setSelectedSeats([]);
    loadTrips(origin, dest, date);
  };

  const handleResetFilters = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setSelectedTrip(null);
    setSelectedSeats([]);
    loadTrips('', '', '');
  };

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setLoadingSeats(true);
    setShowSeatModal(true); // Abrir directamente en ventana emergente (modal)

    try {
      const tripSeats = await seatService.getSeatsByTrip(
        trip.id,
        trip.bus_capacity || 40,
        trip.price || 12000
      );
      setSeats(tripSeats);

      // Calcular asientos libres reales basados en la matriz de asientos
      const freeSeatsCount = tripSeats.filter(s => s.status === 'available').length;
      const occupiedSeatsCount = tripSeats.filter(s => s.status === 'reserved').length;
      
      const updated = {
        ...trip,
        available_seats: freeSeatsCount,
        actual_passengers: occupiedSeatsCount
      };

      setSelectedTrip(updated);
      setTrips(prev => prev.map(t => t.id === trip.id ? updated : t));
    } catch (err) {
      console.error('Error cargando asientos:', err);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleToggleSeat = (seatNumber: number) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(s => s !== seatNumber) 
        : [...prev, seatNumber]
    );
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      showNotification('Selección Requerida', 'Por favor selecciona al menos un asiento disponible en el bus.', 'warning');
      return;
    }
    setShowSeatModal(false);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (reservation: Reservation) => {
    setShowCheckout(false);
    setSelectedSeats([]);
    setSelectedTrip(null);
    setCompletedReservation(reservation);
    // Recargar viajes y disponibilidad
    loadTrips();
  };

  return (
    <div className="booking-container">
      {/* Encabezado del Módulo */}
      <div className="card-header" style={{ padding: '0 0 1.5rem 0', borderBottom: 'none' }}>
        <div className="card-title-group">
          <h2>🔍 Buscar y Reservar Viajes</h2>
          <p>Consulta los itinerarios disponibles, elige tu asiento y asegura tu viaje al instante</p>
        </div>
      </div>

      {/* Barra de Búsqueda Avanzada */}
      <div className="trip-search-widget">
        <form onSubmit={handleSearch} className="search-form-grid">
          <div className="search-field">
            <label className="field-label">🏁 Origen</label>
            <input
              type="text"
              list="origins-list"
              className="form-input"
              placeholder="Buscar origen..."
              value={origin}
              onChange={e => setOrigin(e.target.value)}
            />
            <datalist id="origins-list">
              {availableOrigins.map((orig, i) => (
                <option key={i} value={orig} />
              ))}
            </datalist>
          </div>

          <div className="search-field">
            <label className="field-label">📍 Destino</label>
            <input
              type="text"
              list="destinations-list"
              className="form-input"
              placeholder="Buscar destino..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
            <datalist id="destinations-list">
              {availableDestinations.map((dest, i) => (
                <option key={i} value={dest} />
              ))}
            </datalist>
          </div>

          <div className="search-field">
            <label className="field-label">📅 Fecha de Viaje</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="search-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '42px' }}>
              🔍 Buscar
            </button>
            {(origin || destination || date) && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ height: '42px', padding: '0 0.8rem' }}
                onClick={handleResetFilters}
                title="Limpiar filtros"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Chips de Destinos Rápidos */}
        {availableDestinations.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destinos frecuentes:</span>
            <button
              type="button"
              className={`badge ${!destination ? 'badge-success' : 'badge-secondary'}`}
              style={{ cursor: 'pointer', background: !destination ? 'var(--accent-glow)' : undefined }}
              onClick={() => handleQuickFilter('')}
            >
              Todos ({allTrips.length})
            </button>
            {availableDestinations.map((dest, idx) => (
              <button
                key={idx}
                type="button"
                className={`badge ${destination === dest ? 'badge-success' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', background: destination === dest ? 'var(--accent-glow)' : undefined }}
                onClick={() => handleQuickFilter(dest)}
              >
                📍 {dest}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Listado de Viajes Disponibles */}
      <div className="results-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Itinerarios Disponibles ({trips.length})</h3>
        {(origin || destination || date) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="content-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>⏳ Buscando viajes disponibles en el sistema...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="content-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>🚍</span>
          <h3 style={{ marginTop: '1rem' }}>No se encontraron viajes</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            No hay viajes programados que coincidan con tu búsqueda. Prueba con otras fechas u orígenes.
          </p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleResetFilters}>
            Ver Todos los Viajes Disponibles
          </button>
        </div>
      ) : (
        <div className="trips-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {trips.map(trip => {
            const isSelected = selectedTrip?.id === trip.id;
            const price = trip.price || 12000;
            const unitPrice = price < 500 ? price * 300 : price;

            return (
              <div
                key={trip.id}
                className={`trip-booking-card ${isSelected ? 'active-selection' : ''}`}
                style={{
                  background: 'var(--bg-secondary)',
                  border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="trip-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">{trip.route}</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                    $ {unitPrice.toLocaleString('es-CL')} CLP
                  </span>
                </div>

                <div className="trip-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ORIGEN</span>
                      <strong>{trip.origin}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginTop: '2px' }}>{trip.date} · {trip.time}</div>
                    </div>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>➔</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DESTINO</span>
                      <strong>{trip.destination}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Estimada</div>
                    </div>
                  </div>

                  <div className="trip-card-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>🚌 {trip.bus} ({trip.bus_model})</span>
                    <span className="badge badge-success">
                      💺 {trip.available_seats} asientos libres
                    </span>
                  </div>
                </div>

                <div className="trip-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem 1rem', fontSize: '0.95rem' }}
                    onClick={() => handleSelectTrip(trip)}
                  >
                    💺 Elegir Asientos →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Emergente de Selección de Asientos (Pop-Up Window) */}
      {showSeatModal && selectedTrip && (
        <SeatSelectionModal
          trip={selectedTrip}
          seats={seats}
          selectedSeats={selectedSeats}
          onToggleSeat={handleToggleSeat}
          loadingSeats={loadingSeats}
          onClose={() => setShowSeatModal(false)}
          onConfirm={handleProceedToCheckout}
        />
      )}

      {/* Modal de Pago / Checkout */}
      {showCheckout && selectedTrip && selectedSeats.length > 0 && profile && (
        <CheckoutModal
          trip={selectedTrip}
          selectedSeats={selectedSeats}
          currentUser={profile}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Modal de Comprobante / Voucher Exitoso */}
      {completedReservation && (
        <VoucherModal
          reservation={completedReservation}
          onClose={() => {
            setCompletedReservation(null);
            if (setActiveView) {
              setActiveView('my-reservations');
            }
          }}
        />
      )}
    </div>
  );
};

export default TripSearch;
