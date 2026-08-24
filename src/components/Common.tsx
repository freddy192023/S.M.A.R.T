import React from 'react';

// Status badge component
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let className = 'badge-secondary';
  const s = status.toLowerCase();
  
  if (s === 'activo' || s === 'activa' || s === 'en curso' || s === 'finalizado') {
    className = 'badge-success';
  } else if (s === 'en mantención' || s === 'programado' || s === 'descanso') {
    className = 'badge-warning';
  } else if (s === 'inactivo' || s === 'inactiva' || s === 'suspendido') {
    className = 'badge-danger';
  }

  return <span className={`badge ${className}`}>{status}</span>;
};

// Role badge component
export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  return <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>;
};

// Process flow component for Trips
export const ProcessFlow: React.FC = () => {
  return (
    <div className="process-flow-container">
      <h3>Flujo del Viaje S.M.A.R.T</h3>
      <div className="flow-steps">
        <div className="flow-step completed"><span>1</span><p>Crear Viaje</p></div>
        <div className="flow-step-arrow">→</div>
        <div className="flow-step completed"><span>2</span><p>Seleccionar Ruta</p></div>
        <div className="flow-step-arrow">→</div>
        <div className="flow-step active"><span>3</span><p>Asignar Bus</p></div>
        <div className="flow-step-arrow">→</div>
        <div className="flow-step active"><span>4</span><p>Conductor</p></div>
        <div className="flow-step-arrow">→</div>
        <div className="flow-step"><span>5</span><p>Iniciar</p></div>
        <div className="flow-step-arrow">→</div>
        <div className="flow-step"><span>6</span><p>Finalizar</p></div>
      </div>
    </div>
  );
};
