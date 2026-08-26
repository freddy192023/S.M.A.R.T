import React from 'react';
import type { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser }) => {
  const role = currentUser.role;

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'operador', 'conductor', 'pasajero'] },
    { key: 'users', label: 'Usuarios', icon: '👥', roles: ['admin'] },
    { key: 'roles', label: 'Roles y Permisos', icon: '🔐', roles: ['admin'] },
    { key: 'buses', label: 'Buses', icon: '🚌', roles: ['admin', 'operador'] },
    { key: 'drivers', label: 'Conductores', icon: '👨‍✈️', roles: ['admin', 'operador'] },
    { key: 'routes-admin', label: 'Rutas', icon: '🗺️', roles: ['admin', 'operador', 'conductor', 'pasajero'] },
    { key: 'stops', label: 'Paraderos', icon: '📍', roles: ['admin', 'operador', 'conductor'] },
    { key: 'trips', label: 'Viajes', icon: '🚍', roles: ['admin', 'operador', 'conductor', 'pasajero'] },
    { key: 'reports', label: 'Reportes', icon: '📊', roles: ['admin', 'operador'] },
    { key: 'profile', label: 'Mi Perfil', icon: '👤', roles: ['admin', 'operador', 'conductor', 'pasajero'] }
  ];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <a href="#dashboard" className="brand" onClick={() => setActiveView('dashboard')}>
          <span className="brand-title">S.M.A.R.T <small style={{ fontSize: '0.6rem', opacity: 0.7, verticalAlign: 'middle', marginLeft: '5px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>v1.0.0</small></span>
          <span className="brand-subtitle">Smart Mobility</span>
        </a>
      </div>
      <ul className="sidebar-menu">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map(item => (
            <li key={item.key} className={`sidebar-item ${activeView === item.key ? 'active' : ''}`}>
              <a href={`#${item.key}`} onClick={() => setActiveView(item.key)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
      </ul>
      <div className="sidebar-footer">
        <a href="#home" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveView('home')}>
          🏠 Volver al sitio público
        </a>
      </div>
    </aside>
  );
};
