import React from 'react';
import type { User } from '../types';
import { useNotification } from '../context/NotificationContext';

interface ProfileProps {
  currentUser: User;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const { showNotification } = useNotification();
  const userName = currentUser.name || currentUser.full_name || 'Usuario';

  return (
    <div className="content-card">
      <div className="profile-card">
        <div className="profile-avatar-large">{userName.charAt(0)}</div>
        <div>
          <h2 style={{ color: '#ffffff', marginBottom: '0.25rem' }}>{userName}</h2>
          <p style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.95rem' }}>
            {currentUser.role?.toUpperCase()}
          </p>
        </div>
        
        <div className="profile-details">
          <div className="profile-row">
            <span>Usuario ID</span>
            <span className="text-bold" style={{ fontSize: '0.85rem' }}>{currentUser.id}</span>
          </div>
          <div className="profile-row">
            <span>Correo Electrónico</span>
            <span className="text-bold">{currentUser.email}</span>
          </div>
          {currentUser.phone && (
            <div className="profile-row">
              <span>Teléfono</span>
              <span className="text-bold">{currentUser.phone}</span>
            </div>
          )}
          <div className="profile-row">
            <span>Estado de la Cuenta</span>
            <span className="text-bold" style={{ color: 'var(--success-color)' }}>Activa</span>
          </div>
          <div className="profile-row">
            <span>Nivel de Permisos (RBAC)</span>
            <span className="text-bold">
              {currentUser.role === 'admin' ? 'Total / Escritura / Auditoría' : 
               currentUser.role === 'operador' ? 'Gestión Operativa' : 
               currentUser.role === 'conductor' ? 'Control de Viajes' : 'Consulta'}
            </span>
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ marginTop: '1rem' }} 
          onClick={() => showNotification('Editar Perfil', 'La edición de información de perfil requiere verificación biométrica o token corporativo adicional. Esta capa de seguridad está en desarrollo.', 'warning')}
        >
          Editar Información
        </button>
      </div>
    </div>
  );
};
export default Profile;
