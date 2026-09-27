export type tipoTarea = "tarea" | "examen";

export interface eventoCalendario {
    id: string;
    texto: string;
    fecha: string; // clave "YYYY-MM-DD" del día al que pertenece
    tipo: tipoTarea;
}

// Clave "YYYY-MM-DD" en horario local (sin pasar por UTC)
export function claveDe(date: Date): string {
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mes}-${dia}`;
}

// Valida la lista de eventos; acepta también el formato viejo agrupado por fecha
export function aCalendario(dato: unknown): eventoCalendario[] {
    if (Array.isArray(dato)) {
        return dato.map((d) => {
            const ev = (d ?? {}) as Partial<eventoCalendario>;
            return {
                id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
                texto: typeof ev.texto === "string" ? ev.texto : "",
                fecha:
                    typeof ev.fecha === "string" &&
                    /^\d{4}-\d{2}-\d{2}$/.test(ev.fecha)
                        ? ev.fecha
                        : "",
                tipo: ev.tipo === "examen" ? "examen" : "tarea",
            };
        });
    }

    if (dato && typeof dato === "object") {
        return Object.entries(dato).flatMap(([fecha, lista]) =>
            (Array.isArray(lista) ? lista : []).map((d) => {
                const ev = (d ?? {}) as Partial<eventoCalendario>;
                return {
                    id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
                    texto: typeof ev.texto === "string" ? ev.texto : "",
                    fecha: /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : "",
                    tipo: ev.tipo === "examen" ? "examen" : "tarea",
                };
            }),
        );
    }

    return [];
}
