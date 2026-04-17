// ============================================================
// utils/storage.ts — Capa de abstracción sobre localStorage
// ============================================================
/**
 * Guarda un valor serializado en localStorage.
 * @param key   Clave de almacenamiento
 * @param value Valor a persistir
 */
export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (err) {
        console.error(`[Storage] Error guardando "${key}":`, err);
    }
}
/**
 * Recupera y deserializa un valor de localStorage.
 * Retorna `null` si la clave no existe o hay error de parseo.
 */
export function loadFromStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null)
            return null;
        return JSON.parse(raw);
    }
    catch (err) {
        console.error(`[Storage] Error leyendo "${key}":`, err);
        return null;
    }
}
/**
 * Elimina una clave del localStorage.
 */
export function removeFromStorage(key) {
    localStorage.removeItem(key);
}
/**
 * Exporta todos los datos del sistema como un objeto JSON descargable.
 */
export function exportAllData(students, courses, enrollments) {
    const data = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        estudiantes: students,
        cursos: courses,
        inscripciones: enrollments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sga-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
/**
 * Lee un archivo JSON subido por el usuario.
 * Retorna el objeto parseado o lanza un error.
 */
export async function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target?.result);
                resolve(parsed);
            }
            catch {
                reject(new Error("El archivo no es un JSON válido."));
            }
        };
        reader.onerror = () => reject(new Error("Error leyendo el archivo."));
        reader.readAsText(file);
    });
}
//# sourceMappingURL=storage.js.map