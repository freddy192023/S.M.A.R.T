import React, { useState } from 'react';

interface OperationalGuideModalProps {
  onClose: () => void;
}

export const OperationalGuideModal: React.FC<OperationalGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const steps = [
    {
      step: 1,
      icon: '🚌',
      title: 'Paso 1: Registrar Buses en Flota',
      module: 'Módulo Buses',
      description: 'El operador debe ingresar primero los vehículos disponibles en la empresa.',
      details: [
        'Ingresa al módulo "Buses" desde el menú lateral.',
        'Haz clic en "+ Agregar Bus a la Flota".',
        'Ingresa Patente (ej: ABCD-12), Marca, Modelo, Año y Capacidad (ej: 40 pasajeros).',
        'Estado inicial: Activo / Disponible.'
      ],
      tip: 'Sin buses registrados, no podrás asignar vehículos a las salidas de los viajes.'
    },
    {
      step: 2,
      icon: '👨‍✈️',
      title: 'Paso 2: Registrar Conductores Autorizados',
      module: 'Módulo Conductores',
      description: 'Dar de alta la nómina de conductores habilitados para manejar los buses.',
      details: [
        'Ingresa al módulo "Conductores".',
        'Haz clic en "+ Registrar Nuevo Conductor".',
        'Registra Nombre completo, Número de Licencia, Vencimiento y Teléfono.',
        'Opcionalmente puedes asignarle un Bus por defecto.'
      ],
      tip: 'Asegúrate de que el estado del chofer sea "Activo" para poder asignarle salidas.'
    },
    {
      step: 3,
      icon: '🗺️',
      title: 'Paso 3: Crear Rutas y Trayectos',
      module: 'Módulo Rutas',
      description: 'Definir los itinerarios y recorridos entre terminales u orígenes y destinos.',
      details: [
        'Ingresa al módulo "Rutas".',
        'Haz clic en "+ Crear Nueva Ruta".',
        'Ingresa Nombre de la Ruta (ej: Ruta Costa Expreso), Origen (Santiago) y Destino (Valparaíso).',
        'Establece la distancia estimada en KM y duración en minutos.'
      ],
      tip: 'Las rutas creadas estarán listas para conectarse con salidas y paraderos.'
    },
    {
      step: 4,
      icon: '📍',
      title: 'Paso 4: Asignar Paraderos e Intermedios',
      module: 'Módulo Paraderos',
      description: 'Configurar paradas intermedias para rutas largas o urbanas.',
      details: [
        'Ingresa al módulo "Paraderos".',
        'Haz clic en "+ Registrar Nueva Parada".',
        'Escribe el nombre del paradero (ej: Estación Pajaritos), dirección o referencia.',
        'Selecciona la Ruta Asociada y asigna su número de orden (N° 1, N° 2, etc.).'
      ],
      tip: 'Estos paraderos se verán automáticamente en las tarjetas de ruta y en la consola del conductor.'
    },
    {
      step: 5,
      icon: '🚍',
      title: 'Paso 5: Programar el Viaje (Conexión Total)',
      module: 'Módulo Viajes',
      description: 'El operador une todos los elementos previos para crear una salida disponible.',
      details: [
        'Ingresa al módulo "Viajes" y presiona "+ Programar Nuevo Viaje".',
        'Selecciona la Ruta creada en el Paso 3.',
        'Asigna un Bus registrado en el Paso 1.',
        'Asigna el Conductor habilitado en el Paso 2.',
        'Define la Fecha y Hora exacta de salida y el Precio del boleto (S/).'
      ],
      tip: '¡Listo! Al guardar, el viaje aparecerá automáticamente en la plataforma para venta de pasajes.'
    },
    {
      step: 6,
      icon: '🎮',
      title: 'Paso 6: Operación del Conductor y Check-in',
      module: 'Consola Conductor',
      description: 'El chofer gestiona la partida de su bus y valida los pasajeros.',
      details: [
        'El conductor ingresa a su Dashboard o Módulo de Viajes.',
        'Presiona "▶ Iniciar Viaje" al salir del terminal.',
        'Abre "📋 Manifiesto de Pasajeros" para ver la lista de abordaje.',
        'Marca "✓ Marcar Abordado" conforme suben los pasajeros al bus.'
      ],
      tip: 'El conductor también puede consultar la secuencia de paraderos intermedios durante el viaje.'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" style={{ maxWidth: '820px', width: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="voucher-header" style={{ background: 'linear-gradient(135deg, #0d1527 0%, #172a45 100%)' }}>
          <div className="voucher-brand">
            <span className="brand-logo">📖 MANUAL DE FLUJO OPERACIONAL</span>
            <span className="voucher-tag">Guía de Conexión de Módulos S.M.A.R.T.</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Subtítulo descriptivo */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(0, 210, 196, 0.06)', borderBottom: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>
            Para que un viaje funcione de forma totalmente conectada en el sistema, sigue esta secuencia lógica de 6 pasos.
          </p>
        </div>

        {/* Selector de Pasos en Pestañas */}
        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {steps.map(s => (
            <button
              key={s.step}
              className={`btn btn-sm ${activeTab === s.step ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
              onClick={() => setActiveTab(s.step)}
            >
              {s.icon} Paso {s.step}
            </button>
          ))}
        </div>

        {/* Contenido del Paso Seleccionado */}
        {(() => {
          const current = steps.find(s => s.step === activeTab) || steps[0];
          return (
            <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{current.icon}</span>
                <div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', display: 'inline-block' }}>
                    {current.module}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{current.title}</h3>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
                {current.description}
              </p>

              <div style={{ background: 'var(--card-bg)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📌 Acciones a realizar en este paso:
                </h4>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {current.details.map((d, i) => (
                    <li key={i} style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{d}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.9rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--warning-color)', fontWeight: 'bold' }}>
                  💡 Recomendación clave: {current.tip}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Footer del Modal */}
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={activeTab === 1}
              onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
            >
              ← Paso Anterior
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={activeTab === 6}
              onClick={() => setActiveTab(prev => Math.min(6, prev + 1))}
            >
              Paso Siguiente →
            </button>
          </div>

          <button className="btn btn-primary" onClick={onClose}>
            Entendido, Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
