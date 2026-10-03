import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';
import { NotificationProvider } from '../../context/NotificationContext';

// Mock de Supabase Client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

// Mock de Vercel Logger
vi.mock('../../lib/vercelLogger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

import { supabase } from '../../lib/supabaseClient';

describe('CP-01: Autenticación de Usuario en Login (RF-01)', () => {
  const mockSetActiveView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <NotificationProvider>
        <Login setActiveView={mockSetActiveView} />
      </NotificationProvider>
    );
  };

  it('debe autenticar exitosamente y redirigir al dashboard cuando las credenciales son válidas', async () => {
    // ---- ARRANGE ----
    const mockUser = { id: 'usr-uuid-001', email: 'test@smart.cl' };
    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: mockUser, session: { access_token: 'fake-jwt-token' } },
      error: null,
    });

    renderLogin();
    const user = userEvent.setup();

    // ---- ACT ----
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(emailInput, 'test@smart.cl');
    await user.type(passwordInput, 'Test1234!');
    await user.click(submitBtn);

    // ---- ASSERT ----
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@smart.cl',
        password: 'Test1234!',
      });
      expect(mockSetActiveView).toHaveBeenCalledWith('dashboard');
    });
  });

  it('debe mostrar mensaje de error cuando las credenciales son inválidas', async () => {
    // ---- ARRANGE ----
    (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Credenciales inválidas o correo no registrado.' },
    });

    renderLogin();
    const user = userEvent.setup();

    // ---- ACT ----
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(emailInput, 'erroneo@smart.cl');
    await user.type(passwordInput, 'Incorrecta123');
    await user.click(submitBtn);

    // ---- ASSERT ----
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
      expect(mockSetActiveView).not.toHaveBeenCalledWith('dashboard');
    });
  });
});
