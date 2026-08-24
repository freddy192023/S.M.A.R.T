import React from 'react';
import { MOCK_DATA } from '../../mockData';
import { RoleBadge } from '../../components/Common';

export const Roles: React.FC = () => {
  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-title-group">
          <h2>🔐 Roles y Permisos (RBAC)</h2>
          <p>Niveles de autorización y permisos del sistema empresarial</p>
        </div>
      </div>
      <div className="roles-grid" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {MOCK_DATA.roles.map(role => (
          <div key={role.code} className="role-card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <div className="role-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <RoleBadge role={role.name} />
              <span className="role-code" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{role.code}</span>
            </div>
            <p className="role-desc" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>{role.desc}</p>
            <div className="role-permissions" style={{ fontSize: '0.85rem' }}>
              <strong>Permiso Clave:</strong> <code style={{ color: 'var(--accent-color)' }}>{role.permissions}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Roles;
