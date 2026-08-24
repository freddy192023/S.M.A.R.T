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
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['Administrador', 'Operador', 'Conductor', 'Pasajero'] },
    { key: 'users', label: 'Usuarios', icon: '👥', roles: ['Administrador'] },
    { key: 'roles', label: 'Roles y Permisos', icon: '🔐', roles: ['Administrador'] },
    { key: 'buses', label: 'Buses', icon: '🚌', roles: ['Administrador', 'Operador'] },
    { key: 'drivers', label: 'Conductores', icon: '👨‍✈️', roles: ['Administrador', 'Operador'] },
    { key: 'routes-admin', label: 'Rutas', icon: '🗺️', roles: ['Administrador', 'Operador', 'Conductor', 'Pasajero'] },
    { key: 'stops', label: 'Paraderos', icon: '📍', roles: ['Administrador', 'Operador', 'Conductor'] },
    { key: 'trips', label: 'Viajes', icon: '🚍', roles: ['Administrador', 'Operador', 'Conductor', 'Pasajero'] },
    { key: 'reports', label: 'Reportes', icon: '📊', roles: ['Administrador', 'Operador'] },
    { key: 'profile', label: 'Mi Perfil', icon: '👤', roles: ['Administrador', 'Operador', 'Conductor', 'Pasajero'] }
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
