import { claveDe } from "./tipos-calendario";

// Festivos de la Comunidad de Madrid más los locales de Madrid capital.
// La clave es "AAAA-MM-DD", el mismo formato que saca claveDe().
// Los de 2026 salen del decreto aprobado el 24-sep-2025. Cuando se publique
// otro año (el 2027 todavía no está), se añaden sus líneas aquí y ya está.
const FESTIVOS: Record<string, string> = {
    // 2026, autonómicos
    "2026-01-01": "Año Nuevo",
    "2026-01-06": "Epifanía",
    "2026-04-02": "Jueves Santo",
    "2026-04-03": "Viernes Santo",
    "2026-05-01": "Día del Trabajador",
    "2026-05-02": "Fiesta de la Comunidad de Madrid",
    "2026-08-15": "Asunción",
    "2026-10-12": "Fiesta Nacional",
    "2026-11-02": "Todos los Santos (trasladado)",
    "2026-12-07": "Constitución (trasladada)",
    "2026-12-08": "Inmaculada",
    "2026-12-25": "Navidad",
    // 2026, locales de Madrid capital
    "2026-05-15": "San Isidro",
    "2026-11-09": "Virgen de la Almudena",
};

// El nombre del festivo de esa fecha, o undefined si no lo es
export function festivoDe(clave: string): string | undefined {
    return FESTIVOS[clave];
}

// Lectivo: de lunes a viernes y que no sea festivo
export function esDiaLectivo(date: Date): boolean {
    const diaSemana = date.getDay(); // 0 = domingo, 6 = sábado
    if (diaSemana === 0 || diaSemana === 6) return false;
    return festivoDe(claveDe(date)) === undefined;
}
