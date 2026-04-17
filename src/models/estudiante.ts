// ============================================================
// models/estudiante.ts — Modelo de datos para Estudiante
// ============================================================

/** Estados posibles de un estudiante */
export type EstadoEstudiante = "activo" | "inactivo";

/**
 * Interfaz principal del modelo Estudiante.
 * Refleja todos los campos mínimos requeridos por el sistema.
 */
export interface Estudiante {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
  carrera: string;
  estado: EstadoEstudiante;
}

/** DTO de creación (sin id, lo asigna el servicio) */
export type EstudianteDTO = Omit<Estudiante, "id">;

/** DTO de actualización (todos los campos opcionales excepto id) */
export type EstudianteUpdate = Partial<EstudianteDTO> & { id: number };