/**
 * Guarda un valor serializado en localStorage.
 * @param key   Clave de almacenamiento
 * @param value Valor a persistir
 */
export declare function saveToStorage<T>(key: string, value: T): void;
/**
 * Recupera y deserializa un valor de localStorage.
 * Retorna `null` si la clave no existe o hay error de parseo.
 */
export declare function loadFromStorage<T>(key: string): T | null;
/**
 * Elimina una clave del localStorage.
 */
export declare function removeFromStorage(key: string): void;
/**
 * Exporta todos los datos del sistema como un objeto JSON descargable.
 */
export declare function exportAllData(students: unknown, courses: unknown, enrollments: unknown): void;
/**
 * Lee un archivo JSON subido por el usuario.
 * Retorna el objeto parseado o lanza un error.
 */
export declare function importFromFile(file: File): Promise<unknown>;
