import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import vercelLogger from '../lib/vercelLogger';

interface LoginProps {
  setActiveView: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setActiveView }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isRegister) {
        vercelLogger.log(`Intento de registro de usuario: ${email}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (error) {
          vercelLogger.error(`Error en registro para ${email}`, error);
          setErrorMessage(error.message);
        } else {
          vercelLogger.log(`Registro exitoso para ${email}`);
          setSuccessMessage('¡Usuario registrado con éxito!');
          setActiveView('dashboard');
        }
      } else {
        vercelLogger.log(`Intento de inicio de sesión: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          vercelLogger.error(`Error de inicio de sesión para ${email}`, error);
          setErrorMessage(error.message);
        } else {
          vercelLogger.log(`Inicio de sesión exitoso para ${email}`, data.user);
          setActiveView('dashboard');
        }
      }
    } catch (err: any) {
      vercelLogger.error(`Error inesperado de auth para ${email}`, err);
      setErrorMessage(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 style={{ color: '#ffffff' }}>S.M.A.R.T</h2>
          <p>{isRegister ? 'Crear una nueva cuenta' : 'Plataforma de Control de Transporte'}</p>
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

          {successMessage && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.8rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '8px', 
              color: 'var(--success-color)', 
              fontSize: '0.85rem' 
            }}>
              ✅ {successMessage}
            </div>
          )}

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Nombre Completo</label>
              <input 
                type="text" 
                id="register-name" 
                className="form-input" 
                placeholder="Juan Pérez" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
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

          {!isRegister && (
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
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: isRegister ? '1rem' : '0' }}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegister ? '¿Ya tienes una cuenta? ' : '¿No tienes cuenta aún? '}
          </span>
          <button 
            type="button" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-color)', 
              cursor: 'pointer', 
              fontWeight: '600',
              textDecoration: 'underline',
              padding: 0
            }}
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            disabled={loading}
          >
            {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
          </button>
        </div>

        <div className="back-to-home" style={{ marginTop: '1.5rem' }}>
          <a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};
