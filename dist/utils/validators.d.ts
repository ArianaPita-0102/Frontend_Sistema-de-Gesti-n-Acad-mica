/** Resultado de una validación */
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
/** Verifica que un string no sea vacío */
export declare function notEmpty(value: string, label: string): ValidationResult;
/** Valida formato de correo electrónico */
export declare function validEmail(email: string): ValidationResult;
/** Valida que la edad sea un número entero positivo razonable */
export declare function validAge(edad: number): ValidationResult;
/** Valida que el cupo máximo sea un entero positivo */
export declare function validCupo(cupo: number): ValidationResult;
/**
 * Ejecuta múltiples validaciones en orden y retorna el primer error,
 * o { valid: true } si todas pasan.
 */
export declare function runValidations(...checks: ValidationResult[]): ValidationResult;
