import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/reservationService';
import { stopService } from '../services/stopService';
import { useNotification } from '../context/NotificationContext';
import type { Reservation } from '../types';

interface PassengerManifestModalProps {
  trip: any;
  onClose: () => void;
}

export const PassengerManifestModal: React.FC<PassengerManifestModalProps> = ({ trip, onClose }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [boardedIds, setBoardedIds] = useState<Set<string>>(new Set());
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allRes = await reservationService.getAll();
        // Filtrar reservas que pertenezcan a este viaje o a esta ruta
        const filtered = allRes.filter(r => 
          (r.status === 'confirmed' || r.status === 'boarded') &&
          (r.trip_id === trip.id || (trip.route_id && r.trip?.route_id === trip.route_id))
        );
        setReservations(filtered);

        // Inicializar abordados desde estado de reserva o localStorage
        const boarded = new Set<string>();
        const savedBoarded = localStorage.getItem(`boarded_res_${trip.id}`);
        if (savedBoarded) {
          const arr: string[] = JSON.parse(savedBoarded);
          arr.forEach(id => boarded.add(id));
        } else {
          filtered.forEach(r => {
            if (r.status === 'boarded') boarded.add(r.id);
          });
        }
        setBoardedIds(boarded);

        // Cargar paraderos de la ruta
        if (trip.route_id) {
          const stopsData = await stopService.getByRoute(trip.route_id);
          setStops(stopsData || []);
        }
      } catch (err) {
        console.error('Error cargando manifiesto de pasajeros:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [trip]);

  const toggleBoarding = (resId: string, passengerName: string) => {
    const next = new Set(boardedIds);
    let isBoarding = false;
    if (next.has(resId)) {
      next.delete(resId);
    } else {
      next.add(resId);
      isBoarding = true;
    }
    setBoardedIds(next);
    localStorage.setItem(`boarded_res_${trip.id}`, JSON.stringify(Array.from(next)));

    if (isBoarding) {
      showNotification('Check-in Exitoso', `Pasajero ${passengerName} marcado como ABORDADO en el bus ${trip.bus}.`, 'success');
    }
  };

  const boardedCount = boardedIds.size;
  const totalCount = reservations.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" style={{ maxWidth: '780px', width: '90%' }} onClick={e => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="voucher-header" style={{ background: 'linear-gradient(135deg, #0d1527 0%, #152238 100%)' }}>
          <div className="voucher-brand">
            <span className="brand-logo">📋 MANIFIESTO DE PASAJEROS</span>
            <span className="voucher-tag">Control de Embarque y Check-In</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Resumen del Viaje */}
        <div style={{ padding: '1.2rem', background: 'rgba(0, 210, 196, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                🚌 Bus {trip.bus} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({trip.bus_model})</span>
              </h3>
              <p style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.95rem' }}>
                📍 Ruta: {trip.route || `${trip.origin} → ${trip.destination}`}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                🕒 Salida: <strong>{trip.date} a las {trip.time}</strong> | Conductor: <strong>{trip.conductor}</strong>
              </p>
            </div>
            
            {/* Medidor de Abordaje */}
            <div style={{ textAlign: 'right', background: 'var(--card-bg)', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pasajeros Abordados</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: boardedCount === totalCount && totalCount > 0 ? 'var(--success-color)' : 'var(--accent-color)' }}>
                {boardedCount} / {totalCount}
              </div>
              <span className={`badge ${boardedCount === totalCount && totalCount > 0 ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>
                {totalCount === 0 ? 'Sin Reservas' : boardedCount === totalCount ? 'Embarque Completo ✓' : 'Embarque en Proceso'}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido Modal */}
        <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Paraderos de la Ruta */}
          {stops.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🗺️ Secuencia de Paraderos de la Ruta:
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {stops.map((st, idx) => (
                  <React.Fragment key={st.id || idx}>
                    <span className="badge badge-secondary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}>
                      📍 {st.stop_order}. {st.name} {st.address ? `(${st.address})` : ''}
                    </span>
                    {idx < stops.length - 1 && <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }}>➔</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de Manifiesto */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>⏳ Cargando manifiesto de pasajeros...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
              <p style={{ fontWeight: 600 }}>No hay reservas confirmadas para este viaje aún.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Los pasajeros que compren su pasaje aparecerán automáticamente en esta lista.</p>
            </div>
          ) : (
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Asiento</th>
                  <th>Pasajero</th>
                  <th>Código Reserva</th>
                  <th>Precio</th>
                  <th>Estado Abordaje</th>
                  <th>Check-In</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => {
                  const isBoarded = boardedIds.has(res.id);
                  return (
                    <tr key={res.id} style={{ background: isBoarded ? 'rgba(62, 207, 142, 0.05)' : undefined }}>
                      <td>
                        <span className="badge badge-success" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          💺 Asiento {res.seat_number}
                        </span>
                      </td>
                      <td className="text-bold">
                        {res.passenger_name || 'Pasajero Registrado'}
                        {res.passenger_email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            {res.passenger_email}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--accent-color)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {res.reservation_code}
                      </td>
                      <td>S/ {Number(res.price || 35).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${isBoarded ? 'badge-success' : 'badge-warning'}`}>
                          {isBoarded ? 'ABORDADO ✓' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn ${isBoarded ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          onClick={() => toggleBoarding(res.id, res.passenger_name || `Asiento ${res.seat_number}`)}
                        >
                          {isBoarded ? '↩ Deshacer' : '✓ Marcar Abordado'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Marcar un pasajero como abordado actualiza la lista de embarque en tiempo real.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar Manifiesto
          </button>
        </div>
      </div>
    </div>
  );
};
