import { showToast, showConfirm, openModal, closeModal } from "./ui.helpers.js";
import { runValidations, notEmpty, validCupo } from "../utils/validators.js";
let sortKey = "id";
let sortDir = "asc";
let currentQuery = "";
let currentEstado = "todos";
let editingId = null;
export function initCursosUI(svcC, svcI) {
    document.getElementById("btn-nuevo-curso")?.addEventListener("click", () => {
        editingId = null;
        resetForm("form-curso");
        document.getElementById("modal-curso-title").textContent = "Nuevo Curso";
        openModal("modal-curso");
    });
    document.getElementById("form-curso")?.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSubmitCurso(svcC);
    });
    document.getElementById("btn-cancel-curso")?.addEventListener("click", () => {
        closeModal("modal-curso");
    });
    document.getElementById("modal-curso")?.addEventListener("click", (e) => {
        if (e.target.id === "modal-curso")
            closeModal("modal-curso");
    });
    document.getElementById("search-curso")?.addEventListener("input", (e) => {
        currentQuery = e.target.value;
        renderTablaCursos(svcC, svcI);
    });
    document.getElementById("filter-estado-curso")?.addEventListener("change", (e) => {
        currentEstado = e.target.value;
        renderTablaCursos(svcC, svcI);
    });
    document.querySelectorAll("#tabla-cursos th[data-col]").forEach((th) => {
        th.addEventListener("click", () => {
            const col = th.dataset["col"];
            if (sortKey === col)
                sortDir = sortDir === "asc" ? "desc" : "asc";
            else {
                sortKey = col;
                sortDir = "asc";
            }
            renderTablaCursos(svcC, svcI);
        });
    });
    renderTablaCursos(svcC, svcI);
}
function handleSubmitCurso(svcC) {
    const nombre = getVal("cur-nombre");
    const sigla = getVal("cur-sigla");
    const docente = getVal("cur-docente");
    const cupoStr = getVal("cur-cupo");
    const estado = getVal("cur-estado");
    const cupo = parseInt(cupoStr, 10);
    const v = runValidations(notEmpty(nombre, "Nombre"), notEmpty(sigla, "Sigla"), notEmpty(docente, "Docente"), notEmpty(cupoStr, "Cupo máximo"), validCupo(isNaN(cupo) ? -1 : cupo));
    if (!v.valid) {
        showToast(v.error, "error");
        return;
    }
    try {
        if (editingId !== null) {
            svcC.update({ id: editingId, nombre, sigla, docente, cupoMaximo: cupo, estado });
            showToast("Curso actualizado correctamente.", "success");
        }
        else {
            svcC.add({ nombre, sigla, docente, cupoMaximo: cupo, estado });
            showToast("Curso registrado correctamente.", "success");
        }
        closeModal("modal-curso");
        document.dispatchEvent(new CustomEvent("sga:data-changed"));
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
export function renderTablaCursos(svcC, svcI) {
    const tbody = document.getElementById("tbody-cursos");
    if (!tbody)
        return;
    let data = svcC.filter(currentQuery, currentEstado);
    data = [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number")
            return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });
    document.querySelectorAll("#tabla-cursos th[data-col]").forEach((th) => {
        const col = th.dataset["col"];
        const icon = th.querySelector(".sort-icon");
        th.classList.toggle("sorted", col === sortKey);
        if (icon)
            icon.textContent = col === sortKey ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";
    });
    if (data.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="table-empty">
          <div class="empty-icon">📚</div>
          <p>No se encontraron cursos.</p>
        </div>
      </td></tr>`;
        return;
    }
    tbody.innerHTML = data.map((c) => {
        const inscritos = svcI.countActivasByCurso(c.id);
        const pct = Math.round((inscritos / c.cupoMaximo) * 100);
        const pctColor = pct >= 90 ? "var(--danger)" : pct >= 70 ? "var(--warning)" : "var(--accent)";
        return `
      <tr>
        <td class="font-mono text-sm">#${c.id}</td>
        <td><strong>${escHtml(c.nombre)}</strong></td>
        <td class="font-mono">${escHtml(c.sigla)}</td>
        <td>${escHtml(c.docente)}</td>
        <td>
          <span style="color:${pctColor};font-weight:600">${inscritos}</span>
          <span style="color:var(--text-muted)">/ ${c.cupoMaximo}</span>
        </td>
        <td><span class="badge badge--${c.estado}">${c.estado}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--icon" title="Editar" data-action="edit-cur" data-id="${c.id}">✏️</button>
            <button class="btn btn--ghost btn--icon" title="${c.estado === 'disponible' ? 'Cerrar' : 'Abrir'}" data-action="toggle-cur" data-id="${c.id}">
              ${c.estado === "disponible" ? "🔒" : "🔓"}
            </button>
            <button class="btn btn--ghost btn--icon" title="Eliminar" data-action="del-cur" data-id="${c.id}">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join("");
    tbody.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const el = e.currentTarget;
            const id = Number(el.dataset["id"]);
            const action = el.dataset["action"];
            if (action === "edit-cur")
                handleEditCurso(id, svcC);
            if (action === "toggle-cur")
                handleToggleCurso(id, svcC);
            if (action === "del-cur")
                handleDeleteCurso(id, svcC, svcI);
        });
    });
}
function handleEditCurso(id, svcC) {
    const c = svcC.getById(id);
    if (!c)
        return;
    editingId = id;
    setVal("cur-nombre", c.nombre);
    setVal("cur-sigla", c.sigla);
    setVal("cur-docente", c.docente);
    setVal("cur-cupo", String(c.cupoMaximo));
    setVal("cur-estado", c.estado);
    document.getElementById("modal-curso-title").textContent = "Editar Curso";
    openModal("modal-curso");
}
function handleToggleCurso(id, svcC) {
    try {
        const c = svcC.toggleEstado(id);
        showToast(`Curso "${c.nombre}" ahora está ${c.estado}.`, "info");
        document.dispatchEvent(new CustomEvent("sga:data-changed"));
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
function handleDeleteCurso(id, svcC, svcI) {
    const c = svcC.getById(id);
    if (!c)
        return;
    showConfirm(`¿Eliminar el curso "${c.nombre}"?`, "Se eliminarán también todas sus inscripciones. Esta acción no se puede deshacer.", () => {
        try {
            svcI.deleteByCurso(id);
            svcC.delete(id);
            showToast("Curso eliminado.", "success");
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
function resetForm(id) {
    document.getElementById(id)?.reset();
}
function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
//# sourceMappingURL=render.cursos.js.map