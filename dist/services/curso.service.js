import { saveToStorage, loadFromStorage } from "../utils/storage.js";
const STORAGE_KEY = "sga_cursos";
export class CursoService {
    constructor() {
        this.cursos = [];
        this.nextId = 1;
        this.load();
    }
    // ---- Persistencia ----
    load() {
        const data = loadFromStorage(STORAGE_KEY);
        if (data && Array.isArray(data)) {
            this.cursos = data;
            this.nextId = data.length > 0
                ? Math.max(...data.map((c) => c.id)) + 1
                : 1;
        }
    }
    save() {
        saveToStorage(STORAGE_KEY, this.cursos);
    }
    // ---- Consultas ----
    getAll() {
        return [...this.cursos];
    }
    getById(id) {
        return this.cursos.find((c) => c.id === id);
    }
    getByEstado(estado) {
        return this.cursos.filter((c) => c.estado === estado);
    }
    /** Búsqueda por nombre o sigla */
    filter(query, estado) {
        const q = query.toLowerCase().trim();
        return this.cursos.filter((c) => {
            const matchQuery = q === "" ||
                c.nombre.toLowerCase().includes(q) ||
                c.sigla.toLowerCase().includes(q);
            const matchEstado = estado === "todos" || c.estado === estado;
            return matchQuery && matchEstado;
        });
    }
    // ---- Mutaciones ----
    /**
     * Agrega un nuevo curso.
     * @throws Error si la sigla ya existe
     */
    add(dto) {
        const dup = this.cursos.find((c) => c.sigla.toUpperCase() === dto.sigla.toUpperCase());
        if (dup) {
            throw new Error(`Ya existe un curso con la sigla "${dto.sigla}".`);
        }
        const nuevo = {
            id: this.nextId++,
            ...dto,
            sigla: dto.sigla.toUpperCase(),
        };
        this.cursos.push(nuevo);
        this.save();
        return nuevo;
    }
    /**
     * Actualiza un curso existente.
     * @throws Error si no se encuentra o sigla duplicada
     */
    update(data) {
        const idx = this.cursos.findIndex((c) => c.id === data.id);
        if (idx === -1)
            throw new Error(`Curso con id ${data.id} no encontrado.`);
        if (data.sigla) {
            const dup = this.cursos.find((c) => c.sigla.toUpperCase() === data.sigla.toUpperCase() &&
                c.id !== data.id);
            if (dup)
                throw new Error(`La sigla "${data.sigla}" ya está en uso.`);
        }
        this.cursos[idx] = {
            ...this.cursos[idx],
            ...data,
            sigla: data.sigla ? data.sigla.toUpperCase() : this.cursos[idx].sigla,
        };
        this.save();
        return this.cursos[idx];
    }
    delete(id) {
        const idx = this.cursos.findIndex((c) => c.id === id);
        if (idx === -1)
            throw new Error(`Curso con id ${id} no encontrado.`);
        this.cursos.splice(idx, 1);
        this.save();
    }
    toggleEstado(id) {
        const c = this.cursos.find((x) => x.id === id);
        if (!c)
            throw new Error(`Curso con id ${id} no encontrado.`);
        c.estado = c.estado === "disponible" ? "cerrado" : "disponible";
        this.save();
        return { ...c };
    }
    // ---- Estadísticas ----
    countCerrados() {
        return this.cursos.filter((c) => c.estado === "cerrado").length;
    }
    countTotal() {
        return this.cursos.length;
    }
    // ---- Import ----
    importData(data) {
        this.cursos = data;
        this.nextId = data.length > 0
            ? Math.max(...data.map((c) => c.id)) + 1
            : 1;
        this.save();
    }
}
//# sourceMappingURL=curso.service.js.map