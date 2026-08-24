import React, { useState, useEffect } from 'react';
import type { User } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Public views
import { Home } from './pages/Home';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { RoutesPage } from './pages/RoutesPage';
import { Login } from './pages/Login';

// Private views
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Users } from './pages/modules/Users';
import { Roles } from './pages/modules/Roles';
import { Buses } from './pages/modules/Buses';
import { Drivers } from './pages/modules/Drivers';
import { Stops } from './pages/modules/Stops';
import { Trips } from './pages/modules/Trips';
import { Reports } from './pages/modules/Reports';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync state from hash and sessionStorage
  useEffect(() => {
    const savedUser = sessionStorage.getItem('smart_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    const initialHash = window.location.hash.replace('#', '') || 'home';
    setActiveView(initialHash);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeView changes programmatically
  const changeView = (view: string) => {
    setActiveView(view);
    window.location.hash = `#${view}`;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('smart_user');
    changeView('home');
  };

  const simulateRoleChange = (newRole: User['role']) => {
    if (!currentUser) return;
    
    let matchedName = "Carlos Administrador";
    if (newRole === 'Operador') matchedName = "Laura Operadora";
    else if (newRole === 'Conductor') matchedName = "Juan Pérez";
    else if (newRole === 'Pasajero') matchedName = "María González";

    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name: matchedName
    };
    setCurrentUser(updatedUser);
    sessionStorage.setItem('smart_user', JSON.stringify(updatedUser));
  };

  // Views classifications
  const publicViews = ['home', 'about', 'how-it-works', 'routes', 'login'];
  const isPublic = publicViews.includes(activeView);

  // Auth Guard
  useEffect(() => {
    if (!isPublic && !currentUser) {
      changeView('login');
    }
  }, [activeView, currentUser, isPublic]);

  // Page titles lookup
  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard General',
    users: 'Gestión de Usuarios',
    roles: 'Roles y Permisos',
    buses: 'Gestión de Flota de Buses',
    drivers: 'Registro de Conductores',
    'routes-admin': 'Control de Rutas',
    stops: 'Gestión de Paraderos',
    trips: 'Programación de Viajes',
    reports: 'Reportes y Métricas',
    profile: 'Perfil de Usuario'
  };

  // Render sub-content for private modules
  const renderPrivateContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={changeView} />;
      case 'users':
        return <Users />;
      case 'roles':
        return <Roles />;
      case 'buses':
        return <Buses />;
      case 'drivers':
        return <Drivers />;
      case 'stops':
        return <Stops />;
      case 'trips':
        return <Trips />;
      case 'reports':
        return <Reports />;
      case 'profile':
        if (currentUser) return <Profile currentUser={currentUser} />;
        return null;
      default:
        // Módulo en desarrollo fallback
        return (
          <div className="fallback-view">
            <span className="fallback-icon">🛠️</span>
            <h2>Módulo en Desarrollo</h2>
            <p>La vista seleccionada se encuentra actualmente en fase de prototipado inicial. Los controles CRUD y enlaces persistentes se habilitarán en la siguiente etapa del proyecto.</p>
            <button className="btn btn-primary" onClick={() => changeView('dashboard')}>
              Volver al Dashboard
            </button>
          </div>
        );
    }
  };

  if (isPublic) {
    return (
      <>
        <div className="glow-ambient"></div>
        <Header 
          activeView={activeView} 
          setActiveView={changeView} 
          currentUser={currentUser} 
        />
        
        <main style={{ marginTop: 'var(--header-height)' }}>
          {activeView === 'home' && <Home setActiveView={changeView} currentUser={currentUser} />}
          {activeView === 'about' && <About />}
          {activeView === 'how-it-works' && <HowItWorks />}
          {activeView === 'routes' && <RoutesPage />}
          {activeView === 'login' && <Login setActiveView={changeView} setCurrentUser={setCurrentUser} />}
        </main>

        <footer className="public-footer">
          <div className="public-footer-brand">S.M.A.R.T<span>.</span></div>
          <p>Smart Mobility & Administration Resource Technology - Plataforma Inteligente de Gestión de Transporte.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
            © 2026 Asignatura Técnicas de Calidad de Software. Primera Etapa de Presentación React TS.
          </p>
        </footer>
      </>
    );
  }

  // Private view rendering wrapper
  if (!currentUser) return null;

  return (
    <div className={`dashboard-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={changeView} 
        currentUser={currentUser} 
      />

      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>☰</button>
            <span className="topbar-title">{viewTitles[activeView] || 'S.M.A.R.T'}</span>
          </div>

          <div className="topbar-right">
            {/* Simulated RBAC selector */}
            <div className="role-tester">
              <span className="role-tester-label">Simular Rol:</span>
              <select 
                className="role-select" 
                value={currentUser.role}
                onChange={(e) => simulateRoleChange(e.target.value as User['role'])}
              >
                <option value="Administrador">Administrador</option>
                <option value="Operador">Operador</option>
                <option value="Conductor">Conductor</option>
                <option value="Pasajero">Pasajero/Usuario</option>
              </select>
            </div>

            <div className="user-profile-menu" onClick={() => changeView('profile')}>
              <div className="user-avatar">{currentUser.name.charAt(0)}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <main className="workspace">
          {renderPrivateContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
