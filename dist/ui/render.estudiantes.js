import { showToast, showConfirm, openModal, closeModal, setBadge } from "./ui.helpers.js";
import { runValidations, notEmpty, validEmail, validAge } from "../utils/validators.js";
let sortKey = "id";
let sortDir = "asc";
let currentQuery = "";
let currentEstado = "todos";
let editingId = null;
export function initEstudiantesUI(svcE, svcI) {
    // ---- Botón Nuevo ----
    document.getElementById("btn-nuevo-estudiante")?.addEventListener("click", () => {
        editingId = null;
        resetForm("form-estudiante");
        document.getElementById("modal-estudiante-title").textContent = "Nuevo Estudiante";
        openModal("modal-estudiante");
    });
    // ---- Formulario submit ----
    document.getElementById("form-estudiante")?.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSubmitEstudiante(svcE);
    });
    // ---- Cancelar modal ----
    document.getElementById("btn-cancel-estudiante")?.addEventListener("click", () => {
        closeModal("modal-estudiante");
    });
    document.getElementById("modal-estudiante")?.addEventListener("click", (e) => {
        if (e.target.id === "modal-estudiante")
            closeModal("modal-estudiante");
    });
    // ---- Búsqueda y filtros ----
    document.getElementById("search-estudiante")?.addEventListener("input", (e) => {
        currentQuery = e.target.value;
        renderTablaEstudiantes(svcE, svcI);
    });
    document.getElementById("filter-estado-estudiante")?.addEventListener("change", (e) => {
        currentEstado = e.target.value;
        renderTablaEstudiantes(svcE, svcI);
    });
    // ---- Ordenamiento ----
    document.querySelectorAll("#tabla-estudiantes th[data-col]").forEach((th) => {
        th.addEventListener("click", () => {
            const col = th.dataset["col"];
            if (sortKey === col) {
                sortDir = sortDir === "asc" ? "desc" : "asc";
            }
            else {
                sortKey = col;
                sortDir = "asc";
            }
            renderTablaEstudiantes(svcE, svcI);
        });
    });
    renderTablaEstudiantes(svcE, svcI);
}
function handleSubmitEstudiante(svcE) {
    clearFormErrors("form-estudiante");
    const nombre = getVal("est-nombre");
    const correo = getVal("est-correo");
    const edadStr = getVal("est-edad");
    const carrera = getVal("est-carrera");
    const estado = getVal("est-estado");
    const edad = parseInt(edadStr, 10);
    const validation = runValidations(notEmpty(nombre, "Nombre completo"), notEmpty(correo, "Correo"), validEmail(correo), notEmpty(edadStr, "Edad"), validAge(isNaN(edad) ? -1 : edad), notEmpty(carrera, "Carrera"));
    if (!validation.valid) {
        showToast(validation.error, "error");
        return;
    }
    try {
        if (editingId !== null) {
            svcE.update({ id: editingId, nombre, correo, edad, carrera, estado });
            showToast("Estudiante actualizado correctamente.", "success");
        }
        else {
            svcE.add({ nombre, correo, edad, carrera, estado });
            showToast("Estudiante registrado correctamente.", "success");
        }
        closeModal("modal-estudiante");
        // dispara re-render global
        document.dispatchEvent(new CustomEvent("sga:data-changed"));
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
export function renderTablaEstudiantes(svcE, svcI) {
    const tbody = document.getElementById("tbody-estudiantes");
    if (!tbody)
        return;
    let data = svcE.filter(currentQuery, currentEstado);
    // Ordenar
    data = [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number") {
            return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });
    // Actualizar iconos de sort
    document.querySelectorAll("#tabla-estudiantes th[data-col]").forEach((th) => {
        const col = th.dataset["col"];
        const icon = th.querySelector(".sort-icon");
        th.classList.toggle("sorted", col === sortKey);
        if (icon)
            icon.textContent = col === sortKey ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";
    });
    if (data.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="table-empty">
          <div class="empty-icon">👤</div>
          <p>No se encontraron estudiantes.</p>
        </div>
      </td></tr>`;
        return;
    }
    tbody.innerHTML = data
        .map((e) => {
        const cursos = svcI.getByEstudiante(e.id).length;
        return `
      <tr>
        <td class="font-mono text-sm">#${e.id}</td>
        <td><strong>${escHtml(e.nombre)}</strong></td>
        <td>${escHtml(e.correo)}</td>
        <td>${e.edad}</td>
        <td>${escHtml(e.carrera)}</td>
        <td>
          <span class="badge badge--${e.estado}">${e.estado}</span>
        </td>
        <td>${cursos} curso${cursos !== 1 ? "s" : ""}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--icon" title="Editar"
              data-action="edit-est" data-id="${e.id}">✏️</button>
            <button class="btn btn--ghost btn--icon" title="${e.estado === 'activo' ? 'Desactivar' : 'Activar'}"
              data-action="toggle-est" data-id="${e.id}">
              ${e.estado === "activo" ? "🔒" : "🔓"}
            </button>
            <button class="btn btn--ghost btn--icon" title="Eliminar"
              data-action="del-est" data-id="${e.id}">🗑️</button>
          </div>
        </td>
      </tr>`;
    })
        .join("");
    // Bind table actions (event delegation)
    tbody.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const el = e.currentTarget;
            const id = Number(el.dataset["id"]);
            const action = el.dataset["action"];
            if (action === "edit-est")
                handleEditEstudiante(id, svcE);
            if (action === "toggle-est")
                handleToggleEstudiante(id, svcE);
            if (action === "del-est")
                handleDeleteEstudiante(id, svcE, svcI);
        });
    });
}
function handleEditEstudiante(id, svcE) {
    const e = svcE.getById(id);
    if (!e)
        return;
    editingId = id;
    setVal("est-nombre", e.nombre);
    setVal("est-correo", e.correo);
    setVal("est-edad", String(e.edad));
    setVal("est-carrera", e.carrera);
    setVal("est-estado", e.estado);
    document.getElementById("modal-estudiante-title").textContent = "Editar Estudiante";
    openModal("modal-estudiante");
}
function handleToggleEstudiante(id, svcE) {
    try {
        const e = svcE.toggleEstado(id);
        showToast(`Estudiante ${e.estado === "activo" ? "activado" : "desactivado"}.`, "info");
        document.dispatchEvent(new CustomEvent("sga:data-changed"));
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
function handleDeleteEstudiante(id, svcE, svcI) {
    const e = svcE.getById(id);
    if (!e)
        return;
    showConfirm(`¿Eliminar al estudiante "${e.nombre}"?`, "Se eliminarán también sus inscripciones. Esta acción no se puede deshacer.", () => {
        try {
            svcI.deleteByEstudiante(id);
            svcE.delete(id);
            showToast("Estudiante eliminado.", "success");
            document.dispatchEvent(new CustomEvent("sga:data-changed"));
        }
        catch (err) {
            showToast(err.message, "error");
        }
    });
}
// ---- Helpers ----
function getVal(id) {
    return document.getElementById(id)?.value ?? "";
}
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el)
        el.value = val;
}
function resetForm(formId) {
    document.getElementById(formId)?.reset();
    clearFormErrors(formId);
}
function clearFormErrors(formId) {
    document.querySelectorAll(`#${formId} .form-group.form--error`).forEach((g) => {
        g.classList.remove("form--error");
    });
}
function escHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
// re-export for badge counter
export { setBadge };
//# sourceMappingURL=render.estudiantes.js.map