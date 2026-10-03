// scripts/load_test.js
// Script alternativo a Locust para pruebas de carga usando Node.js nativo.
// Ejecutar con: node scripts/load_test.js

async function enviarReserva(idUsuario) {
  const viajeId = `trip-${Math.floor(Math.random() * 900) + 100}`;
  const asiento = Math.floor(Math.random() * 40) + 1;
  const pasajero = `Usuario-LoadTest-${idUsuario}`;

  const payload = {
    viajeId,
    asiento,
    pasajero
  };

  try {
    // Apuntando a tu servidor real en la nube (Vercel)
    const response = await fetch('https://s-m-a-r-t-six.vercel.app/api/confirmar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ [Éxito] Usuario ${idUsuario} reservó asiento ${asiento}`);
    } else {
      const text = await response.text();
      console.log(`⚠️ [Falló] Usuario ${idUsuario}: ${text}`);
    }
  } catch (error) {
    console.error(`❌ [Error de Red] Usuario ${idUsuario}: ${error.message}`);
  }
}

async function iniciarPruebaDeCarga() {
  const CANTIDAD_USUARIOS = 100; // Cuántas peticiones enviar en total
  const CONCURRENCIA = 10;       // Cuántas peticiones enviar al mismo tiempo

  console.log(`🚀 Iniciando prueba de carga con ${CANTIDAD_USUARIOS} usuarios simulados...`);

  let peticionesActivas = [];
  
  for (let i = 1; i <= CANTIDAD_USUARIOS; i++) {
    peticionesActivas.push(enviarReserva(i));

    // Si llegamos al límite de concurrencia, esperamos a que terminen antes de seguir
    if (peticionesActivas.length >= CONCURRENCIA) {
      await Promise.all(peticionesActivas);
      peticionesActivas = [];
      // Pequeña pausa de 1 segundo entre ráfagas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Esperar a que terminen las últimas peticiones
  if (peticionesActivas.length > 0) {
    await Promise.all(peticionesActivas);
  }

  console.log("🏁 Prueba de carga terminada. Revisa el panel de RabbitMQ.");
}

iniciarPruebaDeCarga();
