// ============================================================
// services/estudiante.service.ts — CRUD y reglas de negocio
// ============================================================
import { Estudiante, EstadoEstudiante, EstudianteDTO, EstudianteUpdate } from "../models/estudiante.js";
import { saveToStorage, loadFromStorage } from "../utils/storage.js";

const STORAGE_KEY = "sga_estudiantes";

export class EstudianteService {
  private estudiantes: Estudiante[] = [];
  private nextId: number = 1;

  constructor() {
    this.load();
  }

  // ---- Persistencia ----

  private load(): void {
    const data = loadFromStorage<Estudiante[]>(STORAGE_KEY);
    if (data && Array.isArray(data)) {
      this.estudiantes = data;
      this.nextId = data.length > 0
        ? Math.max(...data.map((e) => e.id)) + 1
        : 1;
    }
  }

  private save(): void {
    saveToStorage(STORAGE_KEY, this.estudiantes);
  }

  // ---- Consultas ----

  /** Retorna todos los estudiantes */
  getAll(): Estudiante[] {
    return [...this.estudiantes];
  }

  /** Retorna un estudiante por id, o undefined */
  getById(id: number): Estudiante | undefined {
    return this.estudiantes.find((e) => e.id === id);
  }

  /** Filtra por estado */
  getByEstado(estado: EstadoEstudiante): Estudiante[] {
    return this.estudiantes.filter((e) => e.estado === estado);
  }

  /** Busca por nombre (case-insensitive, parcial) */
  search(query: string): Estudiante[] {
    const q = query.toLowerCase().trim();
    return this.estudiantes.filter((e) =>
      e.nombre.toLowerCase().includes(q)
    );
  }

  /** Filtra y busca combinado */
  filter(query: string, estado: EstadoEstudiante | "todos"): Estudiante[] {
    return this.estudiantes.filter((e) => {
      const matchQuery = query === "" || e.nombre.toLowerCase().includes(query.toLowerCase().trim());
      const matchEstado = estado === "todos" || e.estado === estado;
      return matchQuery && matchEstado;
    });
  }

  // ---- Mutaciones ----

  /**
   * Agrega un nuevo estudiante.
   * @throws Error si el correo ya está registrado
   */
  add(dto: EstudianteDTO): Estudiante {
    const duplicate = this.estudiantes.find(
      (e) => e.correo.toLowerCase() === dto.correo.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Ya existe un estudiante con el correo "${dto.correo}".`);
    }

    const nuevo: Estudiante = { id: this.nextId++, ...dto };
    this.estudiantes.push(nuevo);
    this.save();
    return nuevo;
  }

  /**
   * Actualiza los datos de un estudiante existente.
   * @throws Error si no se encuentra el estudiante
   */
  update(data: EstudianteUpdate): Estudiante {
    const idx = this.estudiantes.findIndex((e) => e.id === data.id);
    if (idx === -1) throw new Error(`Estudiante con id ${data.id} no encontrado.`);

    // Si cambia el correo, verificar que no esté en uso por otro
    if (data.correo) {
      const dup = this.estudiantes.find(
        (e) => e.correo.toLowerCase() === data.correo!.toLowerCase() && e.id !== data.id
      );
      if (dup) throw new Error(`El correo "${data.correo}" ya está en uso.`);
    }

    this.estudiantes[idx] = { ...this.estudiantes[idx], ...data };
    this.save();
    return this.estudiantes[idx];
  }

  /**
   * Elimina un estudiante por id.
   * @throws Error si no se encuentra
   */
  delete(id: number): void {
    const idx = this.estudiantes.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Estudiante con id ${id} no encontrado.`);
    this.estudiantes.splice(idx, 1);
    this.save();
  }

  /** Cambia el estado activo/inactivo de un estudiante */
  toggleEstado(id: number): Estudiante {
    const e = this.estudiantes.find((s) => s.id === id);
    if (!e) throw new Error(`Estudiante con id ${id} no encontrado.`);
    e.estado = e.estado === "activo" ? "inactivo" : "activo";
    this.save();
    return { ...e };
  }

  // ---- Estadísticas ----

  countActivos(): number {
    return this.estudiantes.filter((e) => e.estado === "activo").length;
  }

  countTotal(): number {
    return this.estudiantes.length;
  }

  // ---- Import/Export ----

  importData(data: Estudiante[]): void {
    this.estudiantes = data;
    this.nextId = data.length > 0
      ? Math.max(...data.map((e) => e.id)) + 1
      : 1;
    this.save();
  }
}