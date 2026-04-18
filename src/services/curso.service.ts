import { Curso, EstadoCurso, CursoDTO, CursoUpdate } from "../models/curso.js";
import { saveToStorage, loadFromStorage } from "../utils/storage.js";

const STORAGE_KEY = "sga_cursos";

export class CursoService {
  private cursos: Curso[] = [];
  private nextId: number = 1;

  constructor() {
    this.load();
  }

  private load(): void {
    const data = loadFromStorage<Curso[]>(STORAGE_KEY);
    if (data && Array.isArray(data)) {
      this.cursos = data;
      this.nextId = data.length > 0
        ? Math.max(...data.map((c) => c.id)) + 1
        : 1;
    }
  }

  private save(): void {
    saveToStorage(STORAGE_KEY, this.cursos);
  }

  getAll(): Curso[] {
    return [...this.cursos];
  }

  getById(id: number): Curso | undefined {
    return this.cursos.find((c) => c.id === id);
  }

  getByEstado(estado: EstadoCurso): Curso[] {
    return this.cursos.filter((c) => c.estado === estado);
  }

  filter(query: string, estado: EstadoCurso | "todos"): Curso[] {
    const q = query.toLowerCase().trim();
    return this.cursos.filter((c) => {
      const matchQuery =
        q === "" ||
        c.nombre.toLowerCase().includes(q) ||
        c.sigla.toLowerCase().includes(q);
      const matchEstado = estado === "todos" || c.estado === estado;
      return matchQuery && matchEstado;
    });
  }

  add(dto: CursoDTO): Curso {
    const dup = this.cursos.find(
      (c) => c.sigla.toUpperCase() === dto.sigla.toUpperCase()
    );
    if (dup) {
      throw new Error(`Ya existe un curso con la sigla "${dto.sigla}".`);
    }

    const nuevo: Curso = {
      id: this.nextId++,
      ...dto,
      sigla: dto.sigla.toUpperCase(),
    };
    this.cursos.push(nuevo);
    this.save();
    return nuevo;
  }

  update(data: CursoUpdate): Curso {
    const idx = this.cursos.findIndex((c) => c.id === data.id);
    if (idx === -1) throw new Error(`Curso con id ${data.id} no encontrado.`);

    if (data.sigla) {
      const dup = this.cursos.find(
        (c) =>
          c.sigla.toUpperCase() === data.sigla!.toUpperCase() &&
          c.id !== data.id
      );
      if (dup) throw new Error(`La sigla "${data.sigla}" ya está en uso.`);
    }

    this.cursos[idx] = {
      ...this.cursos[idx],
      ...data,
      sigla: data.sigla ? data.sigla.toUpperCase() : this.cursos[idx].sigla,
    };
    this.save();
    return this.cursos[idx];
  }

  delete(id: number): void {
    const idx = this.cursos.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Curso con id ${id} no encontrado.`);
    this.cursos.splice(idx, 1);
    this.save();
  }

  toggleEstado(id: number): Curso {
    const c = this.cursos.find((x) => x.id === id);
    if (!c) throw new Error(`Curso con id ${id} no encontrado.`);
    c.estado = c.estado === "disponible" ? "cerrado" : "disponible";
    this.save();
    return { ...c };
  }

  countCerrados(): number {
    return this.cursos.filter((c) => c.estado === "cerrado").length;
  }

  countTotal(): number {
    return this.cursos.length;
  }

  importData(data: Curso[]): void {
    this.cursos = data;
    this.nextId = data.length > 0
      ? Math.max(...data.map((c) => c.id)) + 1
      : 1;
    this.save();
  }
}