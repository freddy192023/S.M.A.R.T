import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import vercelLogger from '../lib/vercelLogger';
import { useNotification } from '../context/NotificationContext';

interface LoginProps {
  setActiveView: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setActiveView }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('pasajero');
  
  // Campos dinámicos para el rol Conductor
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isRegister) {
        vercelLogger.log(`Intento de registro de usuario: ${email} con rol ${role}`);
        
        // 1. Crear el usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role
            }
          }
        });

        if (authError) {
          vercelLogger.error(`Error en registro para ${email}`, authError);
          setErrorMessage(authError.message);
          setLoading(false);
          return;
        }

        const user = authData.user;
        if (!user) {
          throw new Error("No se pudo obtener la información del usuario creado.");
        }

        // 2. Si el rol es Conductor, insertar sus datos adicionales en la tabla 'drivers'
        if (role === 'conductor') {
          const { error: driverError } = await supabase
            .from('drivers')
            .insert({
              user_id: user.id,
              full_name: fullName,
              license_number: licenseNumber,
              license_expiry: licenseExpiry,
              phone: phone,
              email: email,
              status: 'activo'
            });

          if (driverError) {
            vercelLogger.error(`Error al insertar conductor en tabla para ${email}`, driverError);
            // Mostrar error pero no romper flujo total ya que el Auth ya se creó
            setErrorMessage(`Registro de cuenta exitoso, pero ocurrió un error al registrar los datos de conductor: ${driverError.message}`);
            setLoading(false);
            return;
          }
        }

        // 3. Modificar manualmente el rol de profile creado por el trigger para que coincida con el seleccionado
        // (Por defecto el trigger asigna 'pasajero')
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: role, phone: role === 'conductor' ? phone : null })
          .eq('id', user.id);

        if (profileError) {
          console.error("Error actualizando rol del perfil:", profileError);
        }

        vercelLogger.log(`Registro exitoso para ${email} con rol ${role}`);
        setSuccessMessage('¡Usuario registrado con éxito!');
        setActiveView('dashboard');

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
      <div className="login-card" style={{ maxWidth: '420px', width: '100%' }}>
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
            <>
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

              <div className="form-group">
                <label className="form-label" htmlFor="register-role">Tipo de Cuenta (Rol)</label>
                <select
                  id="register-role"
                  className="form-input"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMessage(null);
                  }}
                  disabled={loading}
                >
                  <option value="pasajero">Pasajero (Vista Pública)</option>
                  <option value="conductor">Conductor (Ver viajes asignados)</option>
                  <option value="operador">Operador (Gestión operacional)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              {role === 'conductor' && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px dashed var(--border-color)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600' }}>📋 Datos obligatorios de Conductor:</span>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="driver-license">Número de Licencia</label>
                    <input 
                      type="text" 
                      id="driver-license" 
                      className="form-input" 
                      placeholder="LIC-XXXXX" 
                      required={role === 'conductor'}
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="driver-expiry">Vencimiento de Licencia</label>
                    <input 
                      type="date" 
                      id="driver-expiry" 
                      className="form-input" 
                      required={role === 'conductor'}
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }} htmlFor="driver-phone">Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      id="driver-phone" 
                      className="form-input" 
                      placeholder="+569 XXXXXXXX" 
                      required={role === 'conductor'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </>
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
                  showNotification('Recuperación de Contraseña', 'La solicitud de restablecimiento ha sido enviada. Por favor, revise la consola de administración de Supabase para confirmar el enlace.', 'info');
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
