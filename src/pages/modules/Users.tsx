import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.getAll()
      .then(data => setUsers(data || []))
      .catch(err => console.error('Error cargando usuarios:', err))
      .finally(() => setLoading(false));
  }, []);

  const roleColors: Record<string, string> = {
    admin: 'var(--danger-color)',
    operador: 'var(--primary-color)',
    conductor: 'var(--warning-color)',
    pasajero: 'var(--success-color)'
  };

  if (loading) {
    return <div className="content-card" style={{ textAlign: 'center', padding: '4rem' }}><p style={{ color: 'var(--text-muted)' }}>⏳ Cargando usuarios...</p></div>;
  }

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>👥 Control de Usuarios</h2>
          <p>Administración de cuentas internas de la plataforma</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Para crear usuarios, registrarse vía Supabase Auth.')}
        >
          + Nuevo Usuario
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol Asignado</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay usuarios registrados.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td className="text-bold">{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge" style={{ 
                      background: `${roleColors[u.role] || 'var(--text-muted)'}22`,
                      color: roleColors[u.role] || 'var(--text-muted)',
                      border: `1px solid ${roleColors[u.role] || 'var(--text-muted)'}44`
                    }}>
                      {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                    </span>
                  </td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Editar Rol" onClick={() => alert(`Asignar Rol a ${u.full_name}`)}>🔑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Users;
