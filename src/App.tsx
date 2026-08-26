import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  // Sync state from hash
  useEffect(() => {
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

  const handleLogout = async () => {
    await signOut();
    changeView('home');
  };

  // Views classifications
  const publicViews = ['home', 'about', 'how-it-works', 'routes', 'login'];
  const isPublic = publicViews.includes(activeView);

  // Auth Guard
  useEffect(() => {
    if (!loading) {
      if (!isPublic && !user) {
        changeView('login');
      } else if (activeView === 'login' && user) {
        changeView('dashboard');
      }
    }
  }, [activeView, user, isPublic, loading]);

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

  // Role-based access map: which roles can see which views
  const roleAccess: Record<string, string[]> = {
    dashboard: ['admin', 'operador', 'conductor', 'pasajero'],
    users: ['admin'],
    roles: ['admin'],
    buses: ['admin', 'operador'],
    drivers: ['admin', 'operador'],
    'routes-admin': ['admin', 'operador', 'conductor', 'pasajero'],
    stops: ['admin', 'operador', 'conductor'],
    trips: ['admin', 'operador', 'conductor', 'pasajero'],
    reports: ['admin', 'operador'],
    profile: ['admin', 'operador', 'conductor', 'pasajero']
  };

  // Render sub-content for private modules
  const renderPrivateContent = () => {
    // Role guard: if user doesn't have access to this view, redirect to dashboard
    const allowedRoles = roleAccess[activeView];
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      // Use a setTimeout to avoid state update during render
      setTimeout(() => changeView('dashboard'), 0);
      return null;
    }

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
        if (profile) return <Profile currentUser={profile} />;
        return null;
      default:
        // Módulo en desarrollo fallback
        return (
          <div className="fallback-view">
            <span className="fallback-icon">🛠️</span>
            <h2>Módulo en Desarrollo</h2>
            <p>La vista seleccionada se encuentra actualmente en fase de prototipado inicial. Los controles CRUD y enlaces de Supabase se habilitarán en la siguiente etapa del proyecto.</p>
            <button className="btn btn-primary" onClick={() => changeView('dashboard')}>
              Volver al Dashboard
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        color: '#ffffff',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{
          border: '4px solid rgba(0, 210, 196, 0.1)',
          borderLeftColor: 'var(--accent-color)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        <p style={{ letterSpacing: '2px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>INICIANDO S.M.A.R.T...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isPublic) {
    return (
      <>
        <div className="glow-ambient"></div>
        <Header 
          activeView={activeView} 
          setActiveView={changeView} 
          currentUser={profile} 
        />
        
        <main style={{ marginTop: 'var(--header-height)' }}>
          {activeView === 'home' && <Home setActiveView={changeView} currentUser={profile} />}
          {activeView === 'about' && <About />}
          {activeView === 'how-it-works' && <HowItWorks />}
          {activeView === 'routes' && <RoutesPage />}
          {activeView === 'login' && <Login setActiveView={changeView} />}
        </main>

        <footer className="public-footer">
          <div className="public-footer-brand">S.M.A.R.T<span>.</span></div>
          <p>Smart Mobility & Administration Resource Technology - Plataforma Inteligente de Gestión de Transporte.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
            © 2026 Asignatura Técnicas de Calidad de Software. Conectado a Supabase en Tiempo Real.
          </p>
        </footer>
      </>
    );
  }

  // Private view rendering wrapper
  if (!profile) return null;

  return (
    <div className={`dashboard-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={changeView} 
        currentUser={profile} 
        collapsed={sidebarCollapsed}
      />

      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>☰</button>
            <span className="topbar-title">{viewTitles[activeView] || 'S.M.A.R.T'}</span>
          </div>

          <div className="topbar-right">
            <div className="user-profile-menu" onClick={() => changeView('profile')}>
              <div className="user-avatar">{(profile.name || profile.full_name || '?').charAt(0)}</div>
              <div className="user-info">
                <span className="user-name">{profile.name || profile.full_name || 'Usuario'}</span>
                <span className="user-role">{profile.role}</span>
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
