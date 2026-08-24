import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="section-container" style={{ paddingTop: '60px' }}>
      <div className="section-header">
        <h2>¿Cómo Funciona S.M.A.R.T?</h2>
        <p>El flujo simplificado que optimiza y da seguimiento a tus operaciones de transporte.</p>
      </div>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Gestiona</h3>
          <p>Administra usuarios, buses, conductores y recursos básicos en el sistema.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Planifica</h3>
          <p>Define las rutas operacionales, origen, destino y paraderos intermedios.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Asigna</h3>
          <p>Relaciona buses y conductores disponibles con los viajes programados.</p>
        </div>
        <div className="step-card">
          <div className="step-number">4</div>
          <h3>Supervisa</h3>
          <p>Controla el estado de los viajes y la flota (Programado, En Curso, Finalizado).</p>
        </div>
        <div className="step-card">
          <div className="step-number">5</div>
          <h3>Consulta</h3>
          <p>Obtén información estratégica y reportes en tiempo real sobre la productividad.</p>
        </div>
      </div>

      {/* Roles explanation */}
      <div className="section-header" style={{ marginTop: '6rem', marginBottom: '3rem' }}>
        <h2>Estructura de Roles de Usuario</h2>
        <p>Acceso y control adaptado a las responsabilidades de cada miembro del equipo.</p>
      </div>
      <div className="roles-overview-grid">
        <div className="role-overview-card admin">
          <h3>Administrador <span>🔴</span></h3>
          <p>Gestiona los usuarios corporativos, configura los roles, permisos base y configuraciones de auditoría total.</p>
        </div>
        <div className="role-overview-card operator">
          <h3>Operador <span>🔵</span></h3>
          <p>Gestiona operacionalmente la flota de buses, rutas de viaje, paraderos, asignaciones de conductores y viajes diarios.</p>
        </div>
        <div className="role-overview-card driver">
          <h3>Conductor <span>🟡</span></h3>
          <p>Consulta su itinerario de viajes asignados, las rutas que debe realizar e informa incidentes del vehículo.</p>
        </div>
        <div className="role-overview-card passenger">
          <h3>Pasajero / Usuario <span>🟢</span></h3>
          <p>Consulta las rutas públicas disponibles, recorridos activos y horarios estimados de paraderos.</p>
        </div>
      </div>
    </section>
  );
};
