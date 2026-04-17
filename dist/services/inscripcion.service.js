import { saveToStorage, loadFromStorage } from "../utils/storage.js";
const STORAGE_KEY = "sga_inscripciones";
export class InscripcionService {
    constructor(estudianteService, cursoService) {
        this.estudianteService = estudianteService;
        this.cursoService = cursoService;
        this.inscripciones = [];
        this.nextId = 1;
        this.load();
    }
    // ---- Persistencia ----
    load() {
        const data = loadFromStorage(STORAGE_KEY);
        if (data && Array.isArray(data)) {
            this.inscripciones = data;
            this.nextId = data.length > 0
                ? Math.max(...data.map((i) => i.id)) + 1
                : 1;
        }
    }
    save() {
        saveToStorage(STORAGE_KEY, this.inscripciones);
    }
    // ---- Consultas ----
    getAll() {
        return [...this.inscripciones];
    }
    getById(id) {
        return this.inscripciones.find((i) => i.id === id);
    }
    /** Retorna todas las inscripciones de un estudiante */
    getByEstudiante(estudianteId) {
        return this.inscripciones.filter((i) => i.estudianteId === estudianteId && i.estado === "activa");
    }
    /** Retorna todas las inscripciones de un curso */
    getByCurso(cursoId) {
        return this.inscripciones.filter((i) => i.cursoId === cursoId && i.estado === "activa");
    }
    /** Cuenta inscripciones activas en un curso */
    countActivasByCurso(cursoId) {
        return this.getByCurso(cursoId).length;
    }
    // ---- Mutaciones ----
    /**
     * Inscribe un estudiante en un curso, aplicando todas las reglas de negocio.
     * @throws Error descriptivo para cada regla violada
     */
    inscribir(dto) {
        const estudiante = this.estudianteService.getById(dto.estudianteId);
        if (!estudiante) {
            throw new Error("El estudiante seleccionado no existe.");
        }
        if (estudiante.estado === "inactivo") {
            throw new Error(`El estudiante "${estudiante.nombre}" está inactivo y no puede inscribirse.`);
        }
        const curso = this.cursoService.getById(dto.cursoId);
        if (!curso) {
            throw new Error("El curso seleccionado no existe.");
        }
        if (curso.estado === "cerrado") {
            throw new Error(`El curso "${curso.nombre}" está cerrado y no admite inscripciones.`);
        }
        // Verificar duplicado
        const yaInscrito = this.inscripciones.find((i) => i.estudianteId === dto.estudianteId &&
            i.cursoId === dto.cursoId &&
            i.estado === "activa");
        if (yaInscrito) {
            throw new Error(`El estudiante "${estudiante.nombre}" ya está inscrito en "${curso.nombre}".`);
        }
        // Verificar cupo
        const inscritos = this.countActivasByCurso(dto.cursoId);
        if (inscritos >= curso.cupoMaximo) {
            throw new Error(`El curso "${curso.nombre}" ha alcanzado su cupo máximo (${curso.cupoMaximo}).`);
        }
        const nueva = {
            id: this.nextId++,
            estudianteId: dto.estudianteId,
            cursoId: dto.cursoId,
            fecha: new Date().toISOString().slice(0, 10),
            estado: "activa",
        };
        this.inscripciones.push(nueva);
        this.save();
        return nueva;
    }
    /** Cancela una inscripción activa */
    cancelar(id) {
        const ins = this.inscripciones.find((i) => i.id === id);
        if (!ins)
            throw new Error(`Inscripción con id ${id} no encontrada.`);
        ins.estado = "cancelada";
        this.save();
        return { ...ins };
    }
    /** Elimina definitivamente una inscripción */
    delete(id) {
        const idx = this.inscripciones.findIndex((i) => i.id === id);
        if (idx === -1)
            throw new Error(`Inscripción con id ${id} no encontrada.`);
        this.inscripciones.splice(idx, 1);
        this.save();
    }
    /**
     * Elimina todas las inscripciones de un estudiante.
     * Usado al eliminar un estudiante.
     */
    deleteByEstudiante(estudianteId) {
        this.inscripciones = this.inscripciones.filter((i) => i.estudianteId !== estudianteId);
        this.save();
    }
    /**
     * Elimina todas las inscripciones de un curso.
     * Usado al eliminar un curso.
     */
    deleteByCurso(cursoId) {
        this.inscripciones = this.inscripciones.filter((i) => i.cursoId !== cursoId);
        this.save();
    }
    // ---- Estadísticas ----
    countTotal() {
        return this.inscripciones.filter((i) => i.estado === "activa").length;
    }
    /**
     * Retorna { cursoId, count } del curso con más inscripciones activas.
     */
    topCurso() {
        const activas = this.inscripciones.filter((i) => i.estado === "activa");
        if (activas.length === 0)
            return null;
        const map = {};
        for (const ins of activas) {
            map[ins.cursoId] = (map[ins.cursoId] ?? 0) + 1;
        }
        let topId = -1;
        let topCount = 0;
        for (const [id, count] of Object.entries(map)) {
            if (count > topCount) {
                topCount = count;
                topId = Number(id);
            }
        }
        return topId === -1 ? null : { cursoId: topId, count: topCount };
    }
    // ---- Import ----
    importData(data) {
        this.inscripciones = data;
        this.nextId = data.length > 0
            ? Math.max(...data.map((i) => i.id)) + 1
            : 1;
        this.save();
    }
}
//# sourceMappingURL=inscripcion.service.js.map