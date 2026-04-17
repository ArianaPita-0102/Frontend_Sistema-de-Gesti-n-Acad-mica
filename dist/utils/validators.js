// ============================================================
// utils/validators.ts — Funciones de validación tipadas
// ============================================================
/** Verifica que un string no sea vacío */
export function notEmpty(value, label) {
    if (!value || value.trim() === "") {
        return { valid: false, error: `El campo "${label}" es requerido.` };
    }
    return { valid: true };
}
/** Valida formato de correo electrónico */
export function validEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) {
        return { valid: false, error: "El correo electrónico no es válido." };
    }
    return { valid: true };
}
/** Valida que la edad sea un número entero positivo razonable */
export function validAge(edad) {
    if (!Number.isInteger(edad) || edad < 14 || edad > 100) {
        return { valid: false, error: "La edad debe ser un número entero entre 14 y 100." };
    }
    return { valid: true };
}
/** Valida que el cupo máximo sea un entero positivo */
export function validCupo(cupo) {
    if (!Number.isInteger(cupo) || cupo < 1 || cupo > 500) {
        return { valid: false, error: "El cupo máximo debe ser un entero entre 1 y 500." };
    }
    return { valid: true };
}
/**
 * Ejecuta múltiples validaciones en orden y retorna el primer error,
 * o { valid: true } si todas pasan.
 */
export function runValidations(...checks) {
    for (const check of checks) {
        if (!check.valid)
            return check;
    }
    return { valid: true };
}
//# sourceMappingURL=validators.js.map