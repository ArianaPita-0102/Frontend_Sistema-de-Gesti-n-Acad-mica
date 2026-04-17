import { Estudiante, EstadoEstudiante, EstudianteDTO, EstudianteUpdate } from "../models/estudiante.js";
export declare class EstudianteService {
    private estudiantes;
    private nextId;
    constructor();
    private load;
    private save;
    /** Retorna todos los estudiantes */
    getAll(): Estudiante[];
    /** Retorna un estudiante por id, o undefined */
    getById(id: number): Estudiante | undefined;
    /** Filtra por estado */
    getByEstado(estado: EstadoEstudiante): Estudiante[];
    /** Busca por nombre (case-insensitive, parcial) */
    search(query: string): Estudiante[];
    /** Filtra y busca combinado */
    filter(query: string, estado: EstadoEstudiante | "todos"): Estudiante[];
    /**
     * Agrega un nuevo estudiante.
     * @throws Error si el correo ya está registrado
     */
    add(dto: EstudianteDTO): Estudiante;
    /**
     * Actualiza los datos de un estudiante existente.
     * @throws Error si no se encuentra el estudiante
     */
    update(data: EstudianteUpdate): Estudiante;
    /**
     * Elimina un estudiante por id.
     * @throws Error si no se encuentra
     */
    delete(id: number): void;
    /** Cambia el estado activo/inactivo de un estudiante */
    toggleEstado(id: number): Estudiante;
    countActivos(): number;
    countTotal(): number;
    importData(data: Estudiante[]): void;
}
