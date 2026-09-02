import React from 'react';
import type { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, currentUser, collapsed }) => {
  const role = currentUser.role;

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'operador', 'conductor', 'pasajero'] },
    { key: 'search-trips', label: 'Buscar y Reservar', icon: '🔍', roles: ['pasajero', 'admin', 'operador'] },
    { key: 'my-reservations', label: 'Mis Reservas', icon: '🎫', roles: ['pasajero'] },
    { key: 'reservations', label: 'Gestión Reservas', icon: '📑', roles: ['admin', 'operador'] },
    { key: 'buses', label: 'Buses', icon: '🚌', roles: ['admin', 'operador'] },
    { key: 'drivers', label: 'Conductores', icon: '👨‍✈️', roles: ['admin', 'operador'] },
    { key: 'routes-admin', label: 'Rutas', icon: '🗺️', roles: ['admin', 'operador', 'conductor', 'pasajero'] },
    { key: 'stops', label: 'Paraderos', icon: '📍', roles: ['admin', 'operador', 'conductor'] },
    { key: 'trips', label: 'Viajes', icon: '🚍', roles: ['admin', 'operador', 'conductor'] },
    { key: 'reports', label: 'Reportes', icon: '📊', roles: ['admin', 'operador'] },
    { key: 'users', label: 'Usuarios', icon: '👥', roles: ['admin'] },
    { key: 'roles', label: 'Roles y Permisos', icon: '🔐', roles: ['admin'] },
    { key: 'profile', label: 'Mi Perfil', icon: '👤', roles: ['admin', 'operador', 'conductor', 'pasajero'] }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <a href="#dashboard" className="brand" onClick={() => setActiveView('dashboard')}>
          {collapsed ? (
            <span className="brand-title" style={{ fontSize: '1rem' }}>S.</span>
          ) : (
            <>
              <span className="brand-title">
                S.M.A.R.T 
                <small style={{ 
                  fontSize: '0.55rem', 
                  opacity: 0.8, 
                  verticalAlign: 'middle', 
                  marginLeft: '6px', 
                  padding: '2px 5px', 
                  background: 'var(--accent-glow)', 
                  border: '1px solid var(--border-active)', 
                  borderRadius: '4px',
                  color: 'var(--accent-color)'
                }}>
                  v2.0
                </small>
              </span>
              <span className="brand-subtitle">Smart Mobility</span>
            </>
          )}
        </a>
      </div>
      <ul className="sidebar-menu">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map(item => (
            <li key={item.key} className={`sidebar-item ${activeView === item.key ? 'active' : ''}`}>
              <a href={`#${item.key}`} onClick={() => setActiveView(item.key)} title={collapsed ? item.label : undefined}>
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            </li>
          ))}
      </ul>
      <div className="sidebar-footer" style={{ padding: collapsed ? '0.5rem' : '1rem' }}>
        <a 
          href="#home" 
          className="btn btn-secondary btn-sm" 
          style={{ width: '100%', justifyContent: 'center', padding: collapsed ? '0.5rem 0' : '0.5rem 1rem' }} 
          onClick={() => setActiveView('home')}
          title={collapsed ? "Volver al sitio público" : undefined}
        >
          {collapsed ? '🏠' : '🏠 Volver al sitio público'}
        </a>
      </div>
    </aside>
  );
};
