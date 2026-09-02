import React, { useState, useEffect } from 'react';
import type { Trip, Seat, Reservation } from '../../types';
import { tripService } from '../../services/tripService';
import { seatService } from '../../services/seatService';
import { SeatSelector } from '../../components/SeatSelector';
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
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Modales
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
    setSelectedSeatNumber(null);
    loadTrips(origin, destination, date);
  };

  const handleQuickFilter = (dest: string) => {
    setDestination(dest);
    setSelectedTrip(null);
    setSelectedSeatNumber(null);
    loadTrips(origin, dest, date);
  };

  const handleResetFilters = () => {
    setOrigin('');
    setDestination('');
    setDate('');
    setSelectedTrip(null);
    setSelectedSeatNumber(null);
    loadTrips('', '', '');
  };

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeatNumber(null);
    setLoadingSeats(true);
    try {
      const tripSeats = await seatService.getSeatsByTrip(
        trip.id,
        trip.bus_capacity || 40,
        trip.price || 35.00
      );
      setSeats(tripSeats);
    } catch (err) {
      console.error('Error cargando asientos:', err);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!selectedSeatNumber) {
      showNotification('Selección Requerida', 'Por favor selecciona un asiento disponible en el diagrama del bus.', 'warning');
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (reservation: Reservation) => {
    setShowCheckout(false);
    setSelectedSeatNumber(null);
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

      {/* Grid Principal: Listado de Viajes vs Selector de Asientos */}
      <div className="booking-workspace-grid">
        {/* Columna Izquierda: Resultados de Viajes */}
        <div className="trips-results-column">
          <div className="results-header">
            <h3>Itinerarios Disponibles ({trips.length})</h3>
            {(origin || destination || date) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                  setDate('');
                  setTimeout(loadTrips, 0);
                }}
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
            </div>
          ) : (
            <div className="available-trips-list">
              {trips.map(trip => {
                const isSelected = selectedTrip?.id === trip.id;
                const price = trip.price || 35.00;

                return (
                  <div
                    key={trip.id}
                    className={`trip-booking-card ${isSelected ? 'active-selection' : ''}`}
                    onClick={() => handleSelectTrip(trip)}
                  >
                    <div className="trip-card-header">
                      <span className="trip-route-badge">{trip.route}</span>
                      <span className="trip-price-tag">S/ {price.toFixed(2)}</span>
                    </div>

                    <div className="trip-card-body">
                      <div className="route-endpoints">
                        <div className="endpoint origin">
                          <span className="point-dot"></span>
                          <div>
                            <span className="point-city">{trip.origin}</span>
                            <span className="point-time">{trip.date} · {trip.time}</span>
                          </div>
                        </div>

                        <div className="endpoint-separator">
                          <span className="arrow-line">──────►</span>
                        </div>

                        <div className="endpoint destination">
                          <span className="point-dot destination-dot"></span>
                          <div>
                            <span className="point-city">{trip.destination}</span>
                            <span className="point-time">Llegada estimada</span>
                          </div>
                        </div>
                      </div>

                      <div className="trip-card-meta">
                        <span>🚌 Bus: <strong>{trip.bus}</strong> ({trip.bus_model})</span>
                        <span>👨‍✈️ Chofer: <strong>{trip.conductor}</strong></span>
                        <span className="seats-avail-badge">
                          💺 {trip.available_seats} asientos libres
                        </span>
                      </div>
                    </div>

                    <div className="trip-card-footer">
                      <button
                        type="button"
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTrip(trip);
                        }}
                      >
                        {isSelected ? '✓ Viaje Seleccionado' : 'Elegir Asiento →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Diagrama de Asientos & Checkout */}
        <div className="seats-selection-column">
          {selectedTrip ? (
            <div className="content-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <div className="selected-trip-mini-banner">
                <div>
                  <span className="mini-label">Viaje Seleccionado:</span>
                  <h4>{selectedTrip.route}</h4>
                  <p>{selectedTrip.date} a las {selectedTrip.time}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="mini-price">S/ {(selectedTrip.price || 35.00).toFixed(2)}</span>
                </div>
              </div>

              {loadingSeats ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ⏳ Cargando distribución de asientos...
                </div>
              ) : (
                <>
                  <SeatSelector
                    seats={seats}
                    selectedSeatNumber={selectedSeatNumber}
                    onSelectSeat={(seatNum) => setSelectedSeatNumber(seatNum)}
                    price={selectedTrip.price || 35.00}
                  />

                  <div style={{ marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
                      disabled={!selectedSeatNumber}
                      onClick={handleProceedToCheckout}
                    >
                      {selectedSeatNumber
                        ? `Continuar con Asiento N° ${selectedSeatNumber} →`
                        : 'Selecciona un asiento arriba'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="content-card seat-placeholder-card">
              <span className="placeholder-icon">💺</span>
              <h3>Selecciona un Viaje</h3>
              <p>Elige un itinerario de la lista para ver la distribución de asientos y reservar tu lugar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pago / Checkout */}
      {showCheckout && selectedTrip && selectedSeatNumber && profile && (
        <CheckoutModal
          trip={selectedTrip}
          selectedSeat={selectedSeatNumber}
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
