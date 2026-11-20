/**
 * Funciones de validación para el sistema S.M.A.R.T.
 * (Smart Mobility & Administration Resource Technology)
 */

// Valida si un número de asiento está en el rango permitido (1 a 40)
function validarAsiento(numeroAsiento) {
  return typeof numeroAsiento === 'number' && numeroAsiento >= 1 && numeroAsiento <= 40;
}

// Valida si un string tiene un formato de correo electrónico válido
function validarEmail(email) {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

describe('Pruebas unitarias de S.M.A.R.T.', () => {
  // Pruebas de Asientos
  test('Prueba 1: Validar que el asiento 15 es válido (debe dar true)', () => {
    expect(validarAsiento(15)).toBe(true);
  });

  test('Prueba 2: Validar que el asiento 50 no es válido (debe dar false)', () => {
    expect(validarAsiento(50)).toBe(false);
  });

  // Pruebas de Email
  test('Prueba 3: Validar que el email "pasajero@smart.com" es válido (debe dar true)', () => {
    expect(validarEmail('pasajero@smart.com')).toBe(true);
  });

  test('Prueba 4: Validar que el email "correo-invalido" no es válido (debe dar false)', () => {
    expect(validarEmail('correo-invalido')).toBe(false);
  });
});
