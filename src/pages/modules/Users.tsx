import React from 'react';
import { MOCK_DATA } from '../../mockData';
import { StatusBadge, RoleBadge } from '../../components/Common';

export const Users: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>👥 Control de Usuarios</h2>
          <p>Administración de cuentas internas de la plataforma</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => alert('Funcionalidad Crear Usuario - Disponible en la siguiente etapa.')}
        >
          + Nuevo Usuario
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol Asignado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="text-bold">{u.name}</td>
                <td>{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td><StatusBadge status={u.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar Rol" onClick={() => alert(`Asignar Rol a ${u.name}`)}>🔑</button>
                    <button className="btn-icon text-danger" title="Desactivar" onClick={() => alert(`Desactivar cuenta de ${u.name}`)}>⚠️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Users;
