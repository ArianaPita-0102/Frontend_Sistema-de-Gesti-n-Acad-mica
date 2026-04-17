import { showToast, showConfirm, openModal, closeModal } from "./ui.helpers.js";
export function initInscripcionesUI(svcE, svcC, svcI) {
    document.getElementById("btn-nueva-inscripcion")?.addEventListener("click", () => {
        populateSelects(svcE, svcC);
        document.getElementById("form-inscripcion")?.reset();
        openModal("modal-inscripcion");
    });
    document.getElementById("form-inscripcion")?.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSubmitInscripcion(svcI);
    });
    document.getElementById("btn-cancel-inscripcion")?.addEventListener("click", () => {
        closeModal("modal-inscripcion");
    });
    document.getElementById("modal-inscripcion")?.addEventListener("click", (e) => {
        if (e.target.id === "modal-inscripcion")
            closeModal("modal-inscripcion");
    });
    renderTablaInscripciones(svcE, svcC, svcI);
    initRelacionesUI(svcE, svcC, svcI);
}
function populateSelects(svcE, svcC) {
    const selEst = document.getElementById("ins-estudiante");
    const selCur = document.getElementById("ins-curso");
    if (!selEst || !selCur)
        return;
    const activos = svcE.getByEstado("activo");
    selEst.innerHTML = `<option value="">— Selecciona estudiante —</option>` +
        activos.map((e) => `<option value="${e.id}">${escHtml(e.nombre)}</option>`).join("");
    const disponibles = svcC.getByEstado("disponible");
    selCur.innerHTML = `<option value="">— Selecciona curso —</option>` +
        disponibles.map((c) => {
            return `<option value="${c.id}">${escHtml(c.sigla)} — ${escHtml(c.nombre)}</option>`;
        }).join("");
}
function handleSubmitInscripcion(svcI) {
    const estId = Number(document.getElementById("ins-estudiante").value);
    const curId = Number(document.getElementById("ins-curso").value);
    if (!estId || !curId) {
        showToast("Debes seleccionar un estudiante y un curso.", "error");
        return;
    }
    try {
        svcI.inscribir({ estudianteId: estId, cursoId: curId });
        showToast("Inscripción realizada correctamente.", "success");
        closeModal("modal-inscripcion");
        document.dispatchEvent(new CustomEvent("sga:data-changed"));
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
export function renderTablaInscripciones(svcE, svcC, svcI) {
    const tbody = document.getElementById("tbody-inscripciones");
    if (!tbody)
        return;
    const data = svcI.getAll().sort((a, b) => b.id - a.id);
    if (data.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="table-empty">
          <div class="empty-icon">📋</div>
          <p>No hay inscripciones registradas.</p>
        </div>
      </td></tr>`;
        return;
    }
    tbody.innerHTML = data.map((ins) => {
        const est = svcE.getById(ins.estudianteId);
        const cur = svcC.getById(ins.cursoId);
        return `
      <tr>
        <td class="font-mono text-sm">#${ins.id}</td>
        <td>${est ? escHtml(est.nombre) : `<span class="text-muted">[eliminado]</span>`}</td>
        <td>${cur ? escHtml(cur.nombre) : `<span class="text-muted">[eliminado]</span>`}</td>
        <td class="font-mono text-sm">${cur ? escHtml(cur.sigla) : "—"}</td>
        <td>${ins.fecha}</td>
        <td><span class="badge badge--${ins.estado}">${ins.estado}</span></td>
        <td>
          <div class="table-actions">
            ${ins.estado === "activa"
            ? `<button class="btn btn--ghost btn--icon" title="Cancelar inscripción" data-action="cancel-ins" data-id="${ins.id}">❌</button>`
            : ""}
            <button class="btn btn--ghost btn--icon" title="Eliminar" data-action="del-ins" data-id="${ins.id}">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join("");
    tbody.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const el = e.currentTarget;
            const id = Number(el.dataset["id"]);
            if (el.dataset["action"] === "cancel-ins")
                handleCancelInscripcion(id, svcI);
            if (el.dataset["action"] === "del-ins")
                handleDeleteInscripcion(id, svcI);
        });
    });
}
function handleCancelInscripcion(id, svcI) {
    showConfirm("¿Cancelar esta inscripción?", "La inscripción pasará a estado 'cancelada' pero permanecerá en el historial.", () => {
        try {
            svcI.cancelar(id);
            showToast("Inscripción cancelada.", "info");
            document.dispatchEvent(new CustomEvent("sga:data-changed"));
        }
        catch (err) {
            showToast(err.message, "error");
        }
    });
}
function handleDeleteInscripcion(id, svcI) {
    showConfirm("¿Eliminar esta inscripción?", "Esta acción no se puede deshacer.", () => {
        try {
            svcI.delete(id);
            showToast("Inscripción eliminada.", "success");
            document.dispatchEvent(new CustomEvent("sga:data-changed"));
        }
        catch (err) {
            showToast(err.message, "error");
        }
    });
}
// ---- Sección de Relaciones ----
export function initRelacionesUI(svcE, svcC, svcI) {
    // Populate selects
    const selEstRel = document.getElementById("rel-select-estudiante");
    const selCurRel = document.getElementById("rel-select-curso");
    if (selEstRel) {
        selEstRel.innerHTML = `<option value="">— Selecciona un estudiante —</option>` +
            svcE.getAll().map((e) => `<option value="${e.id}">${escHtml(e.nombre)}</option>`).join("");
        selEstRel.addEventListener("change", () => {
            const id = Number(selEstRel.value);
            renderCursosDeEstudiante(id, svcC, svcI);
        });
    }
    if (selCurRel) {
        selCurRel.innerHTML = `<option value="">— Selecciona un curso —</option>` +
            svcC.getAll().map((c) => `<option value="${c.id}">${escHtml(c.sigla)} — ${escHtml(c.nombre)}</option>`).join("");
        selCurRel.addEventListener("change", () => {
            const id = Number(selCurRel.value);
            renderEstudiantesEnCurso(id, svcE, svcI);
        });
    }
}
export function refreshRelacionesSelects(svcE, svcC) {
    const selEst = document.getElementById("rel-select-estudiante");
    const selCur = document.getElementById("rel-select-curso");
    if (selEst) {
        const prev = selEst.value;
        selEst.innerHTML = `<option value="">— Selecciona un estudiante —</option>` +
            svcE.getAll().map((e) => `<option value="${e.id}">${escHtml(e.nombre)}</option>`).join("");
        selEst.value = prev;
    }
    if (selCur) {
        const prev = selCur.value;
        selCur.innerHTML = `<option value="">— Selecciona un curso —</option>` +
            svcC.getAll().map((c) => `<option value="${c.id}">${escHtml(c.sigla)} — ${escHtml(c.nombre)}</option>`).join("");
        selCur.value = prev;
    }
}
function renderCursosDeEstudiante(estudianteId, svcC, svcI) {
    const list = document.getElementById("rel-cursos-de-estudiante");
    if (!list)
        return;
    if (!estudianteId) {
        list.innerHTML = "";
        return;
    }
    const inscripciones = svcI.getByEstudiante(estudianteId);
    if (inscripciones.length === 0) {
        list.innerHTML = `<li class="relation-list--empty">Este estudiante no tiene cursos activos.</li>`;
        return;
    }
    list.innerHTML = inscripciones.map((ins) => {
        const c = svcC.getById(ins.cursoId);
        return `<li>
      <span class="rel-icon">📚</span>
      <div>
        <strong>${c ? escHtml(c.nombre) : "[eliminado]"}</strong>
        ${c ? `<span class="text-sm text-muted" style="margin-left:8px">${escHtml(c.sigla)}</span>` : ""}
        <div class="text-sm text-muted">Inscrito: ${ins.fecha}</div>
      </div>
    </li>`;
    }).join("");
}
function renderEstudiantesEnCurso(cursoId, svcE, svcI) {
    const list = document.getElementById("rel-estudiantes-en-curso");
    if (!list)
        return;
    if (!cursoId) {
        list.innerHTML = "";
        return;
    }
    const inscripciones = svcI.getByCurso(cursoId);
    if (inscripciones.length === 0) {
        list.innerHTML = `<li class="relation-list--empty">No hay estudiantes inscritos en este curso.</li>`;
        return;
    }
    list.innerHTML = inscripciones.map((ins) => {
        const e = svcE.getById(ins.estudianteId);
        return `<li>
      <span class="rel-icon">👤</span>
      <div>
        <strong>${e ? escHtml(e.nombre) : "[eliminado]"}</strong>
        ${e ? `<span class="text-sm text-muted" style="margin-left:8px">${escHtml(e.carrera)}</span>` : ""}
        <div class="text-sm text-muted">Inscrito: ${ins.fecha}</div>
      </div>
    </li>`;
    }).join("");
}
function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
//# sourceMappingURL=render.inscripciones.js.map