// ============================================================
// ui/ui.helpers.ts — Componentes de UI reutilizables
// ============================================================
const TOAST_ICONS = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
};
let toastContainer = null;
function getToastContainer() {
    if (!toastContainer) {
        toastContainer = document.querySelector(".toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.className = "toast-container";
            document.body.appendChild(toastContainer);
        }
    }
    return toastContainer;
}
export function showToast(message, type = "info", duration = 3500) {
    const container = getToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
    <span class="toast__icon">${TOAST_ICONS[type]}</span>
    <span class="toast__msg">${escHtml(message)}</span>
  `;
    container.appendChild(toast);
    // Auto-remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(16px)";
        toast.style.transition = "opacity 250ms, transform 250ms";
        setTimeout(() => toast.remove(), 260);
    }, duration);
}
// ---- Modal ----
export function openModal(modalId) {
    const overlay = document.getElementById(modalId);
    overlay?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    // Focus first input
    setTimeout(() => {
        const first = overlay?.querySelector("input:not([type=hidden]), select, textarea");
        first?.focus();
    }, 50);
}
export function closeModal(modalId) {
    document.getElementById(modalId)?.classList.add("hidden");
    document.body.style.overflow = "";
}
// ---- Confirm Dialog ----
export function showConfirm(title, message, onConfirm, onCancel) {
    // Remove any existing confirm
    document.getElementById("confirm-overlay")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "confirm-overlay";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-dialog__icon">⚠️</div>
      <div class="confirm-dialog__title">${escHtml(title)}</div>
      <p class="confirm-dialog__msg">${escHtml(message)}</p>
      <div class="confirm-dialog__actions">
        <button class="btn btn--secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn--danger"    id="confirm-ok">Eliminar</button>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    const close = () => {
        overlay.remove();
        document.body.style.overflow = "";
    };
    document.getElementById("confirm-ok")?.addEventListener("click", () => {
        close();
        onConfirm();
    });
    document.getElementById("confirm-cancel")?.addEventListener("click", () => {
        close();
        onCancel?.();
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            close();
            onCancel?.();
        }
    });
}
// ---- Nav / Sections ----
export function showSection(sectionId) {
    document.querySelectorAll(".page-section").forEach((s) => {
        s.classList.toggle("active", s.id === sectionId);
    });
    document.querySelectorAll(".nav-item").forEach((btn) => {
        const b = btn;
        b.classList.toggle("active", b.dataset["section"] === sectionId);
    });
}
// ---- Badge counter on nav ----
export function setBadge(navSection, count) {
    const el = document.querySelector(`[data-section="${navSection}"] .nav-badge`);
    if (!el)
        return;
    el.textContent = String(count);
    el.style.display = count > 0 ? "inline-flex" : "none";
}
// ---- Dark mode ----
export function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    localStorage.setItem("sga_dark_mode", isDark ? "1" : "0");
    return isDark;
}
export function loadDarkMode() {
    if (localStorage.getItem("sga_dark_mode") === "1") {
        document.documentElement.classList.add("dark-mode");
    }
}
// ---- Escape helper ----
function escHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
//# sourceMappingURL=ui.helpers.js.map