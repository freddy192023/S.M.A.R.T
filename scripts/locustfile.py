from locust import HttpUser, task, between
import random

class SmartMobilityUser(HttpUser):
    # Tiempo de espera entre tareas (1 a 3 segundos) para simular un usuario real
    wait_time = between(1, 3)

    @task
    def crear_reserva(self):
        # Datos simulados aleatorios
        viaje_id = f"trip-{random.randint(100, 999)}"
        asiento = random.randint(1, 40)
        pasajero = f"Usuario-{random.randint(1000, 9999)}"

        # Hacer la petición POST al endpoint de confirmación
        payload = {
            "viajeId": viaje_id,
            "asiento": asiento,
            "pasajero": pasajero
        }
        
        # Asumiendo que Vercel / frontend local corre en el puerto 3000 o dev
        # Modifica la URL si tu API está en otra ruta. Si usas vite local con funciones api, es /api/confirmar
        with self.client.post("/api/confirmar", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 400 and "ya está ocupado" in response.text:
                # Esto es un error de negocio esperado (asiento 9999), no de servidor
                response.success()
            else:
                response.failure(f"Falló la reserva: {response.status_code} - {response.text}")

    @task(3) # Pesa más, el usuario navega a ver rutas 3 veces más frecuente que reservar
    def ver_rutas(self):
        # Asumiendo que tienes una api de rutas, si no, puedes cambiar el endpoint
        # Si usas Supabase directo, esto es solo para simular tráfico web
        self.client.get("/")
