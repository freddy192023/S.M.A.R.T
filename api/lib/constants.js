// api/lib/constants.js — Centralized RabbitMQ constants for Vercel Serverless Functions
export const RABBIT_CONFIG = {
  EXCHANGE: 's.m.a.r.t_exchange',
  DLX_EXCHANGE: 'smart_dlx',
  ROUTING_KEYS: {
    RESERVA_CREADA: 'reserva.creada',
    RESERVA_CANCELADA: 'reserva.cancelada',
    VIAJE_PROGRAMADO: 'viaje.programado',
    SEAT_CHECK: 'seat.check',
    LOG_INFO: 'log.info',
    LOG_WARNING: 'log.warning',
    LOG_ERROR: 'log.error'
  },
  QUEUES: {
    RESERVA_CREADA: 'reserva_creada_queue',
    SMART_EMAIL: 'smart.reserva.email',
    RESERVA_CANCELADA: 'reserva_cancelada_queue',
    VIAJE_PROGRAMADO: 'viaje_programado_queue',
    LOGS: 'logs_queue',
    ERRORS_ONLY: 'errors_only_queue',
    DLQ: 'smart_dlq'
  }
};
