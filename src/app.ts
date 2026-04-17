// ============================================================
// app.ts — Punto de entrada principal de la aplicación
// Orquesta todos los servicios y módulos de UI
// ============================================================
import { EstudianteService }   from "./services/estudiante.service.js";
import { CursoService }        from "./services/curso.service.js";
import { InscripcionService }  from "./services/inscripcion.service.js";

import { initEstudiantesUI,  renderTablaEstudiantes }   from "./ui/render.estudiantes.js";
import { initCursosUI,       renderTablaCursos }        from "./ui/render.cursos.js";
import {
  initInscripcionesUI,
  renderTablaInscripciones,
  refreshRelacionesSelects,
} from "./ui/render.inscripciones.js";
import { renderDashboard }     from "./ui/render.dashboard.js";
import {
  showSection,
  toggleDarkMode,
  loadDarkMode,
  showToast,
} from "./ui/ui.helpers.js";
import { exportAllData, importFromFile } from "./utils/storage.js";

// ============================================================
// 1. Instanciar servicios (singleton por módulo)
// ============================================================
const svcE = new EstudianteService();
const svcC = new CursoService();
const svcI = new InscripcionService(svcE, svcC);

// ============================================================
// 2. Carga de datos iniciales desde JSON (fetch simulado)
//    Solo cuando localStorage está vacío la primera vez
// ============================================================
async function loadInitialData(): Promise<void> {
  // Si ya hay datos en localStorage no cargamos el JSON inicial
  if (
    localStorage.getItem("sga_estudiantes") ||
    localStorage.getItem("sga_cursos")
  ) return;

  try {
    const res = await fetch("./data/initial-data.json");
    if (!res.ok) return;
    const json = await res.json() as {
      estudiantes: Parameters<EstudianteService["importData"]>[0];
      cursos:      Parameters<CursoService["importData"]>[0];
      inscripciones: Parameters<InscripcionService["importData"]>[0];
    };
    if (json.estudiantes)   svcE.importData(json.estudiantes);
    if (json.cursos)        svcC.importData(json.cursos);
    if (json.inscripciones) svcI.importData(json.inscripciones);
    console.info("[SGA] Datos iniciales cargados desde JSON.");
  } catch {
    // No hay archivo de datos iniciales — arranca limpio
  }
}

// ============================================================
// 3. Render global — re-renderiza todo al cambiar datos
// ============================================================
function renderAll(): void {
  renderDashboard(svcE, svcC, svcI);
  renderTablaEstudiantes(svcE, svcI);
  renderTablaCursos(svcC, svcI);
  renderTablaInscripciones(svcE, svcC, svcI);
  refreshRelacionesSelects(svcE, svcC);
}

// Escucha el evento personalizado que disparan los módulos UI
document.addEventListener("sga:data-changed", renderAll);

// ============================================================
// 4. Navegación por secciones (sidebar)
// ============================================================
function initNavigation(): void {
  document.querySelectorAll<HTMLButtonElement>(".nav-item[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset["section"] ?? "section-dashboard";
      showSection(section);
      // Cerrar sidebar en mobile
      document.querySelector(".sidebar")?.classList.remove("open");
      document.querySelector(".sidebar-backdrop")?.classList.remove("visible");
    });
  });

  // Menú hamburguesa (mobile)
  document.getElementById("btn-menu")?.addEventListener("click", () => {
    document.querySelector(".sidebar")?.classList.toggle("open");
    document.querySelector(".sidebar-backdrop")?.classList.toggle("visible");
  });
  document.querySelector(".sidebar-backdrop")?.addEventListener("click", () => {
    document.querySelector(".sidebar")?.classList.remove("open");
    document.querySelector(".sidebar-backdrop")?.classList.remove("visible");
  });
}

// ============================================================
// 5. Modo oscuro
// ============================================================
function initDarkMode(): void {
  loadDarkMode();
  document.getElementById("btn-dark-mode")?.addEventListener("click", () => {
    toggleDarkMode();
  });
}

// ============================================================
// 6. Export / Import de datos
// ============================================================
function initIO(): void {
  // Exportar
  document.getElementById("btn-export")?.addEventListener("click", () => {
    exportAllData(svcE.getAll(), svcC.getAll(), svcI.getAll());
    showToast("Datos exportados correctamente.", "success");
  });

  // Importar — dispara el input file oculto
  document.getElementById("btn-import")?.addEventListener("click", () => {
    document.getElementById("input-import")?.click();
  });

  document.getElementById("input-import")?.addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const raw = await importFromFile(file) as {
        estudiantes?: Parameters<EstudianteService["importData"]>[0];
        cursos?:      Parameters<CursoService["importData"]>[0];
        inscripciones?: Parameters<InscripcionService["importData"]>[0];
      };

      if (raw.estudiantes)   svcE.importData(raw.estudiantes);
      if (raw.cursos)        svcC.importData(raw.cursos);
      if (raw.inscripciones) svcI.importData(raw.inscripciones);

      showToast("Datos importados correctamente.", "success");
      renderAll();
    } catch (err) {
      showToast((err as Error).message, "error");
    }

    // Reset input para poder volver a importar el mismo archivo
    (e.target as HTMLInputElement).value = "";
  });
}

// ============================================================
// 7. Inicialización
// ============================================================
async function init(): Promise<void> {
  // Cargar datos iniciales desde JSON si es primera vez
  await loadInitialData();

  // Inicializar módulos de UI (registran sus event listeners)
  initEstudiantesUI(svcE, svcI);
  initCursosUI(svcC, svcI);
  initInscripcionesUI(svcE, svcC, svcI);

  // Navegación, dark mode, IO
  initNavigation();
  initDarkMode();
  initIO();

  // Render inicial
  renderAll();

  // Mostrar dashboard por defecto
  showSection("section-dashboard");
}

// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  void init();
});