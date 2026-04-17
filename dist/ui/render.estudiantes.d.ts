import { EstudianteService } from "../services/estudiante.service.js";
import { InscripcionService } from "../services/inscripcion.service.js";
import { setBadge } from "./ui.helpers.js";
export declare function initEstudiantesUI(svcE: EstudianteService, svcI: InscripcionService): void;
export declare function renderTablaEstudiantes(svcE: EstudianteService, svcI: InscripcionService): void;
export { setBadge };
