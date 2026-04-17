/** Estados posibles de un curso */
export type EstadoCurso = "disponible" | "cerrado";
/**
 * Interfaz principal del modelo Curso.
 */
export interface Curso {
    id: number;
    nombre: string;
    sigla: string;
    docente: string;
    cupoMaximo: number;
    estado: EstadoCurso;
}
/** DTO de creación */
export type CursoDTO = Omit<Curso, "id">;
/** DTO de actualización */
export type CursoUpdate = Partial<CursoDTO> & {
    id: number;
};
