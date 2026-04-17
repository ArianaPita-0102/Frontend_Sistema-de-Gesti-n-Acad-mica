// ============================================================
// models/inscripcion.ts — Modelo de datos para Inscripcion
// ============================================================

/** Estados posibles de una inscripción */
export type EstadoInscripcion = "activa" | "cancelada";

/**
 * Interfaz principal del modelo Inscripcion.
 */
export interface Inscripcion {
  id: number;
  estudianteId: number;
  cursoId: number;
  fecha: string;       // ISO 8601 date string
  estado: EstadoInscripcion;
}

/** DTO de creación */
export type InscripcionDTO = Omit<Inscripcion, "id" | "fecha" | "estado">;