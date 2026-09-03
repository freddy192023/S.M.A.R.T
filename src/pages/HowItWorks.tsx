import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="section-container" style={{ paddingTop: '60px' }}>
      <div className="section-header">
        <h2>¿Cómo Funciona S.M.A.R.T?</h2>
        <p>Guía de uso y flujo operacional paso a paso para conectar Buses, Conductores, Rutas y Viajes.</p>
      </div>

      {/* Manual de Flujo Operacional Conectado */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-glow)', borderRadius: '16px', padding: '2rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-success" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            📖 MANUAL DE FLUJO OPERACIONAL CONECTADO
          </span>
          <h3 style={{ fontSize: '1.6rem', marginTop: '0.6rem', color: 'var(--text-primary)' }}>
            Secuencia Lógica para Programar y Operar un Viaje
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.4rem auto 0' }}>
            Sigue estos 6 pasos en orden para que toda la información quede vinculada en la plataforma:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.4rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🚌</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>PASO 1</span>
            <h4 style={{ fontSize: '1.1rem', marginTop: '0.4rem', color: 'var(--accent-color)' }}>1. Registrar Buses</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              En el módulo <strong>Buses</strong>, registra los vehículos con su Patente, Marca, Modelo, Año y Capacidad (ej. 40 pasajeros).
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.4rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>👨‍✈️</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>PASO 2</span>
            <h4 style={{ fontSize: '1.1rem', marginTop: '0.4rem', color: 'var(--accent-color)' }}>2. Registrar Conductores</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              En <strong>Conductores</strong>, da de alta a los choferes autorizados (Nombre, Licencia, Vencimiento y Teléfono) con estado Activo.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.4rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🗺️</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>PASO 3</span>
            <h4 style={{ fontSize: '1.1rem', marginTop: '0.4rem', color: 'var(--accent-color)' }}>3. Crear Rutas</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              En <strong>Rutas</strong>, configura los trayectos especificando Origen (Santiago), Destino (Valparaíso), KM y Duración.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.4rem' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📍</span>
            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>PASO 4</span>
            <h4 style={{ fontSize: '1.1rem', marginTop: '0.4rem', color: 'var(--accent-color)' }}>4. Asignar Paraderos</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              En <strong>Paraderos</strong>, crea las paradas intermedias asignándolas a la Ruta creada en el Paso 3 y su número de secuencia.
            </p>
          </div>

          <div style={{ background: 'rgba(0, 210, 196, 0.08)', border: '1px solid var(--border-active)', borderRadius: '12px', padding: '1.4rem', gridColumn: 'span 2' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🚍</span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>PASO 5: CONEXIÓN FINAL</span>
            <h4 style={{ fontSize: '1.2rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>5. Programar el Viaje</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              En <strong>Viajes</strong>, el operador selecciona la <strong>Ruta</strong> (Paso 3), le asigna un <strong>Bus</strong> (Paso 1), asigna un <strong>Conductor</strong> (Paso 2), elige la Fecha/Hora de Salida y establece el Precio. ¡El viaje se publica automáticamente para reserva!
            </p>
          </div>
        </div>
      </div>

      {/* Flujo por Pasos para el Usuario */}
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Flujo General del Sistema</h2>
        <p>Ciclo continuo de gestión, asignación y supervisión de salidas corporativas.</p>
      </div>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>1. Gestiona Flota</h3>
          <p>Administra buses, patentes y estado de mantenimiento de los vehículos.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>2. Configura Rutas</h3>
          <p>Define los trayectos operacionales, origen, destino y paraderos intermedios.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>3. Asigna Recursos</h3>
          <p>Relaciona buses y conductores habilitados con los viajes programados.</p>
        </div>
        <div className="step-card">
          <div className="step-number">4</div>
          <h3>4. Opera y Monitorea</h3>
          <p>El conductor inicia el viaje, consulta paraderos y hace check-in de pasajeros.</p>
        </div>
        <div className="step-card">
          <div className="step-number">5</div>
          <h3>5. Reserva Asientos</h3>
          <p>Los pasajeros seleccionan su asiento en 2D y obtienen su comprobante digital.</p>
        </div>
      </div>

      {/* Roles explanation */}
      <div className="section-header" style={{ marginTop: '5rem', marginBottom: '2.5rem' }}>
        <h2>Estructura de Roles de Usuario</h2>
        <p>Acceso y control adaptado a las responsabilidades de cada miembro del equipo.</p>
      </div>
      <div className="roles-overview-grid">
        <div className="role-overview-card admin">
          <h3>Administrador <span>🔴</span></h3>
          <p>Gestiona los usuarios corporativos, configura los roles, permisos base y auditoría total del sistema.</p>
        </div>
        <div className="role-overview-card operator">
          <h3>Operador <span>🔵</span></h3>
          <p>Gestiona la flota de buses, rutas, paraderos, asignaciones de conductores y programación de viajes.</p>
        </div>
        <div className="role-overview-card driver">
          <h3>Conductor <span>🟡</span></h3>
          <p>Inicia/finaliza viajes, consulta su hoja de ruta con paraderos y realiza el check-in de pasajeros.</p>
        </div>
        <div className="role-overview-card passenger">
          <h3>Pasajero / Usuario <span>🟢</span></h3>
          <p>Busca salidas disponibles, selecciona su asiento favorito en el bus y descarga su boleto digital.</p>
        </div>
      </div>
    </section>
  );
};

