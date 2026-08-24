import React, { useState } from 'react';
import type { User } from '../types';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, currentUser }) => {
  const [menuActive, setMenuActive] = useState(false);

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMenuActive(false);
  };

  return (
    <header className="public-header">
      <a href="#home" className="brand" onClick={() => handleNavClick('home')}>
        <span className="brand-title">S.M.A.R.T <small style={{ fontSize: '0.6rem', opacity: 0.7, verticalAlign: 'middle', marginLeft: '5px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>v1.0.0</small></span>
        <span className="brand-subtitle">Smart Mobility & Administration Resource Technology</span>
      </a>
      <button className="menu-toggle" onClick={() => setMenuActive(!menuActive)}>☰</button>
      <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
        <li>
          <a
            href="#home"
            className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Inicio
          </a>
        </li>
        <li>
          <a
            href="#about"
            className={`nav-link ${activeView === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick('about')}
          >
            Sobre S.M.A.R.T
          </a>
        </li>
        <li>
          <a
            href="#how-it-works"
            className={`nav-link ${activeView === 'how-it-works' ? 'active' : ''}`}
            onClick={() => handleNavClick('how-it-works')}
          >
            Cómo funciona
          </a>
        </li>
        <li>
          <a
            href="#routes"
            className={`nav-link ${activeView === 'routes' ? 'active' : ''}`}
            onClick={() => handleNavClick('routes')}
          >
            Rutas
          </a>
        </li>
        <li>
          {currentUser ? (
            <a
              href="#dashboard"
              className="btn btn-primary btn-sm"
              onClick={() => handleNavClick('dashboard')}
            >
              Panel Control
            </a>
          ) : (
            <a
              href="#login"
              className="btn btn-primary btn-sm"
              onClick={() => handleNavClick('login')}
            >
              Iniciar Sesión
            </a>
          )}
        </li>
      </ul>
    </header>
  );
};
