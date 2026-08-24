import React from 'react';
import type { User } from '../types';

interface ProfileProps {
  currentUser: User;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  return (
    <div className="content-card">
      <div className="profile-card">
        <div className="profile-avatar-large">{currentUser.name.charAt(0)}</div>
        <div>
          <h2 style={{ color: '#ffffff', marginBottom: '0.25rem' }}>{currentUser.name}</h2>
          <p style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.95rem' }}>{currentUser.role}</p>
        </div>
        
        <div className="profile-details">
          <div className="profile-row">
            <span>Usuario ID</span>
            <span className="text-bold">{currentUser.id || 'U-001'}</span>
          </div>
          <div className="profile-row">
            <span>Correo Corporativo</span>
            <span className="text-bold">{currentUser.email}</span>
          </div>
          <div className="profile-row">
            <span>Estado de la Cuenta</span>
            <span className="text-bold" style={{ color: 'var(--success-color)' }}>Activa</span>
          </div>
          <div className="profile-row">
            <span>Nivel de Permisos (RBAC)</span>
            <span className="text-bold">{currentUser.role === 'Administrador' ? 'Total / Escritura' : 'Operación / Consulta'}</span>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => alert('Funcionalidad Editar Perfil - Disponible en la siguiente etapa.')}>
          Editar Información
        </button>
      </div>
    </div>
  );
};
export default Profile;
