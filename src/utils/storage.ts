
/**
 * Guarda un valor serializado en localStorage.
 * @param key   Clave de almacenamiento
 * @param value Valor a persistir
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Storage] Error guardando "${key}":`, err);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[Storage] Error leyendo "${key}":`, err);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}

export function exportAllData(
  students: unknown,
  courses: unknown,
  enrollments: unknown
): void {
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

export async function importFromFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        resolve(parsed);
      } catch {
        reject(new Error("El archivo no es un JSON válido."));
      }
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
    reader.readAsText(file);
  });
}