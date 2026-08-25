import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  setActiveView: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setActiveView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setActiveView('dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
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
          {errorMessage && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.8rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '8px', 
              color: 'var(--danger-color)', 
              fontSize: '0.85rem' 
            }}>
              ⚠️ {errorMessage}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo Electrónico</label>
            <input 
              type="email" 
              id="login-email" 
              className="form-input" 
              placeholder="correo@ejemplo.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
                alert('Funcionalidad de recuperación de contraseña habilitada vía consola de Supabase Auth.');
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="back-to-home">
          <a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};
