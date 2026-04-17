import { Curso, EstadoCurso, CursoDTO, CursoUpdate } from "../models/curso.js";
export declare class CursoService {
    private cursos;
    private nextId;
    constructor();
    private load;
    private save;
    getAll(): Curso[];
    getById(id: number): Curso | undefined;
    getByEstado(estado: EstadoCurso): Curso[];
    /** Búsqueda por nombre o sigla */
    filter(query: string, estado: EstadoCurso | "todos"): Curso[];
    /**
     * Agrega un nuevo curso.
     * @throws Error si la sigla ya existe
     */
    add(dto: CursoDTO): Curso;
    /**
     * Actualiza un curso existente.
     * @throws Error si no se encuentra o sigla duplicada
     */
    update(data: CursoUpdate): Curso;
    delete(id: number): void;
    toggleEstado(id: number): Curso;
    countCerrados(): number;
    countTotal(): number;
    importData(data: Curso[]): void;
}
