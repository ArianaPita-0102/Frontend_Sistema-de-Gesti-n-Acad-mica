export function renderDashboard(svcE, svcC, svcI) {
    // ---- Totales ----
    setText("stat-total-estudiantes", svcE.countTotal());
    setText("stat-total-cursos", svcC.countTotal());
    setText("stat-total-inscripciones", svcI.countTotal());
    setText("stat-estudiantes-activos", svcE.countActivos());
    setText("stat-cursos-cerrados", svcC.countCerrados());
    // ---- Curso más popular ----
    const top = svcI.topCurso();
    const topEl = document.getElementById("stat-top-curso");
    const banner = document.getElementById("top-course-banner");
    if (top && banner) {
        const curso = svcC.getById(top.cursoId);
        if (curso) {
            banner.classList.remove("hidden");
            const nameEl = banner.querySelector(".top-course-banner__name");
            const countEl = banner.querySelector(".top-course-banner__count");
            if (nameEl)
                nameEl.textContent = `${curso.sigla} — ${curso.nombre}`;
            if (countEl)
                countEl.textContent = `${top.count} estudiante${top.count !== 1 ? "s" : ""} inscritos`;
            if (topEl)
                topEl.textContent = `${curso.sigla}`;
        }
    }
    else {
        banner?.classList.add("hidden");
        if (topEl)
            topEl.textContent = "—";
    }
    // ---- Barra de ocupación por curso ----
    renderOcupacionCursos(svcC, svcI);
}
function renderOcupacionCursos(svcC, svcI) {
    const container = document.getElementById("cursos-ocupacion-list");
    if (!container)
        return;
    const cursos = svcC.getAll();
    if (cursos.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;text-align:center;padding:1rem 0">Sin cursos registrados.</p>`;
        return;
    }
    container.innerHTML = cursos
        .sort((a, b) => {
        const ia = svcI.countActivasByCurso(a.id);
        const ib = svcI.countActivasByCurso(b.id);
        return ib - ia;
    })
        .map((c) => {
        const ins = svcI.countActivasByCurso(c.id);
        const pct = Math.round((ins / c.cupoMaximo) * 100);
        const color = pct >= 90 ? "var(--danger)" :
            pct >= 70 ? "var(--warning)" :
                "var(--accent)";
        return `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:.8125rem;font-weight:600;color:var(--text-primary)">${escHtml(c.sigla)} — ${escHtml(c.nombre)}</span>
            <span style="font-size:.75rem;color:var(--text-muted)">${ins}/${c.cupoMaximo}</span>
          </div>
          <div style="height:6px;background:var(--surface-alt);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${color};border-radius:99px;transition:width .4s ease"></div>
          </div>
        </div>`;
    })
        .join("");
}
function setText(id, value) {
    const el = document.getElementById(id);
    if (el)
        el.textContent = String(value);
}
function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
//# sourceMappingURL=render.dashboard.js.map