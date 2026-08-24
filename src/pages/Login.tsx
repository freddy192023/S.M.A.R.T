import React, { useState } from 'react';
import { MOCK_DATA } from '../mockData';
import type { User } from '../types';

interface LoginProps {
  setActiveView: (view: string) => void;
  setCurrentUser: (user: User | null) => void;
}

export const Login: React.FC<LoginProps> = ({ setActiveView, setCurrentUser }) => {
  const [email, setEmail] = useState('admin@smart.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = MOCK_DATA.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      sessionStorage.setItem('smart_user', JSON.stringify(matchedUser));
      setActiveView('dashboard');
    } else {
      alert("Usuario no registrado. Favor utilizar las credenciales indicadas.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 style={{ color: '#ffffff' }}>S.M.A.R.T</h2>
          <p>Plataforma de Control de Transporte</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo Electrónico o Usuario</label>
            <input 
              type="email" 
              id="login-email" 
              className="form-input" 
              placeholder="ejemplo@smart.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="login-password" 
                className="form-input" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                👁️
              </button>
            </div>
          </div>
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" id="remember-me" defaultChecked /> Recordarme
            </label>
            <a 
              href="#" 
              className="forgot-password" 
              onClick={(e) => {
                e.preventDefault();
                alert('Restablecer contraseña - Enlace enviado al correo electrónico mock.');
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Iniciar Sesión</button>
        </form>
        
        <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: 'rgba(0,210,196,0.05)', border: '1px solid rgba(0,210,196,0.15)', borderRadius: '8px', fontSize: '0.8rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.2rem' }}>Credenciales de prueba:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li>🔑 Admin: <strong>admin@smart.com</strong> / admin123</li>
            <li>🔑 Operador: <strong>operator@smart.com</strong> / operator123</li>
            <li>🔑 Conductor: <strong>driver@smart.com</strong> / driver123</li>
            <li>🔑 Pasajero: <strong>user@smart.com</strong> / user123</li>
          </ul>
        </div>

        <div className="back-to-home">
          <a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};
