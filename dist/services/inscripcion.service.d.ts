import { Inscripcion, InscripcionDTO } from "../models/inscripcion.js";
import { EstudianteService } from "./estudiante.service.js";
import { CursoService } from "./curso.service.js";
export declare class InscripcionService {
    private readonly estudianteService;
    private readonly cursoService;
    private inscripciones;
    private nextId;
    constructor(estudianteService: EstudianteService, cursoService: CursoService);
    private load;
    private save;
    getAll(): Inscripcion[];
    getById(id: number): Inscripcion | undefined;
    /** Retorna todas las inscripciones de un estudiante */
    getByEstudiante(estudianteId: number): Inscripcion[];
    /** Retorna todas las inscripciones de un curso */
    getByCurso(cursoId: number): Inscripcion[];
    /** Cuenta inscripciones activas en un curso */
    countActivasByCurso(cursoId: number): number;
    /**
     * Inscribe un estudiante en un curso, aplicando todas las reglas de negocio.
     * @throws Error descriptivo para cada regla violada
     */
    inscribir(dto: InscripcionDTO): Inscripcion;
    /** Cancela una inscripción activa */
    cancelar(id: number): Inscripcion;
    /** Elimina definitivamente una inscripción */
    delete(id: number): void;
    /**
     * Elimina todas las inscripciones de un estudiante.
     * Usado al eliminar un estudiante.
     */
    deleteByEstudiante(estudianteId: number): void;
    /**
     * Elimina todas las inscripciones de un curso.
     * Usado al eliminar un curso.
     */
    deleteByCurso(cursoId: number): void;
    countTotal(): number;
    /**
     * Retorna { cursoId, count } del curso con más inscripciones activas.
     */
    topCurso(): {
        cursoId: number;
        count: number;
    } | null;
    importData(data: Inscripcion[]): void;
}
