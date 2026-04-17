import { EstudianteService } from "../services/estudiante.service.js";
import { CursoService } from "../services/curso.service.js";
import { InscripcionService } from "../services/inscripcion.service.js";
export declare function initInscripcionesUI(svcE: EstudianteService, svcC: CursoService, svcI: InscripcionService): void;
export declare function renderTablaInscripciones(svcE: EstudianteService, svcC: CursoService, svcI: InscripcionService): void;
export declare function initRelacionesUI(svcE: EstudianteService, svcC: CursoService, svcI: InscripcionService): void;
export declare function refreshRelacionesSelects(svcE: EstudianteService, svcC: CursoService): void;
