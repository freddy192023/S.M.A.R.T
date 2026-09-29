import React from 'react';

interface EventsPromosProps {
  setActiveView?: (view: string) => void;
}

export const EventsPromos: React.FC<EventsPromosProps> = ({ setActiveView }) => {
  const handleBookEvent = (_destination: string) => {
    if (setActiveView) {
      setActiveView('search-trips');
    }
  };

  const promos = [
    {
      id: 'lolla',
      tag: '🎤 MÚSICA & FESTIVALES',
      tagColor: '#e040fb',
      title: 'Lollapalooza Chile 2026',
      location: 'Parque Cerrillos · Santiago',
      date: 'Próxima Fecha Especial',
      discount: '15% OFF en Viaje Grupal',
      image: '🎵',
      description: 'Viaja con tu grupo de amigos al festival más importante del año. Buses especiales directos con retorno post-evento.',
      targetDest: 'Santiago Centro'
    },
    {
      id: 'vina',
      tag: '🌊 ESCAPADA COSTERA',
      tagColor: '#00e5ff',
      title: 'Festival de Viña del Mar',
      location: 'Quinta Vergara · Viña del Mar / Valparaíso',
      date: 'Temporada de Eventos',
      discount: 'Ida y Vuelta con Descuento',
      image: '🎪',
      description: 'Asegura tu ida y regreso seguro desde Santiago a la V Región. Asientos ejecutivos garantizados.',
      targetDest: 'Valparaíso'
    },
    {
      id: 'pucon',
      tag: '🏔️ NATURALEZA Y TURISMO',
      tagColor: '#00e676',
      title: 'Escapada al Sur: Pucón & Villarrica',
      location: 'Zona Sur · Región de la Araucanía',
      date: 'Todo el año',
      discount: '20% OFF Reservando 3+ Asientos',
      image: '🌋',
      description: 'Disfruta de los mejores paisajes del sur de Chile. Reserva múltiples asientos para toda tu familia en un solo clic.',
      targetDest: 'San Bernardo'
    },
    {
      id: 'estadio',
      tag: '⚽ EVENTOS DEPORTIVOS',
      tagColor: '#ff9100',
      title: 'Partidos en Estadio Nacional',
      location: 'Ñuñoa / Providencia · Santiago',
      date: 'Fines de semana',
      discount: 'Retorno Nocturno Asegurado',
      image: '🏟️',
      description: 'Asiste a los partidos decisivos del campeonato sin preocuparte por el transporte nocturno de regreso.',
      targetDest: 'Providencia'
    }
  ];

  return (
    <div className="events-container" style={{ paddingBottom: '2rem' }}>
      {/* Hero Banner Promocional */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(112,0,255,0.2) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 2 }}>
          <span className="badge badge-success" style={{ fontSize: '0.85rem', marginBottom: '0.75rem', padding: '0.4rem 0.8rem' }}>
            🎉 Eventos & Promociones Exclusivas S.M.A.R.T
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            ¡Viaja a tus eventos favoritos y ahorra con S.M.A.R.T!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Descubre los mejores destinos, conciertos y escapadas de fin de semana en Chile. 
            Reserva múltiples asientos para ti y tus acompañantes con tarifas preferenciales en pesos chilenos ($ CLP).
          </p>
        </div>
      </div>

      {/* Grid de Eventos y Promociones */}
      <div className="section-title-group" style={{ marginBottom: '1.25rem' }}>
        <h3>🔥 Promociones & Destinos Populares</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Selecciona una experiencia y reserva tu bus al instante</p>
      </div>

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {promos.map(promo => (
          <div
            key={promo.id}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: promo.tagColor, 
                    background: `${promo.tagColor}15`, 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: 'var(--radius-sm)' 
                  }}
                >
                  {promo.tag}
                </span>
                <span className="badge badge-primary">{promo.discount}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{promo.image}</span>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{promo.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {promo.location}</p>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                {promo.description}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              onClick={() => handleBookEvent(promo.targetDest)}
            >
              🚌 Reservar Viaje a este Evento →
            </button>
          </div>
        ))}
      </div>

      {/* Ventajas de la Plataforma S.M.A.R.T */}
      <div 
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem'
        }}
      >
        <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>🌟 ¿Por qué elegir S.M.A.R.T para viajar?</h3>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>💺</span>
            <strong style={{ fontSize: '0.95rem' }}>Reserva Multi-Asiento</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Elige 1 o más asientos en nuestro modal emergente interactivo sin complicaciones.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>💳</span>
            <strong style={{ fontSize: '0.95rem' }}>Medios de Pago Chilenos</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Paga con Webpay Plus, Mercado Pago, CuentaRUT o Transferencia en CLP.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⚡</span>
            <strong style={{ fontSize: '0.95rem' }}>Voucher Digital Instantáneo</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Obtén tu comprobante listo con código QR y detalles para abordar el bus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPromos;
