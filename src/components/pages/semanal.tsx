import { useState, type FormEvent } from "react";
import "./semanal.css";
import { useListaSincronizada } from "../../sesion";

const DIAS_SEMANA = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

interface eventoSemanal {
    id: string;
    texto: string;
    dia: number; // 0 = lunes ... 6 = domingo
}

// Valida la lista semanal que llega de localStorage o de Firebase
function aSemanales(dato: unknown): eventoSemanal[] {
    if (!Array.isArray(dato)) return [];
    return dato.map((d) => {
        const ev = (d ?? {}) as Partial<eventoSemanal>;
        return {
            id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
            texto: typeof ev.texto === "string" ? ev.texto : "",
            dia:
                typeof ev.dia === "number" && ev.dia >= 0 && ev.dia <= 6
                    ? ev.dia
                    : 0,
        };
    });
}

function EventosSemanales() {
    const [eventos, setEventos] = useListaSincronizada(
        "semanales",
        "eventos-semanales",
        aSemanales,
    );
    const [texto, setTexto] = useState("");
    const [dia, setDia] = useState(0);

    // Mostrarlos ordenados de lunes a domingo
    const ordenados = [...eventos].sort((a, b) => a.dia - b.dia);

    function agregarEvento(e: FormEvent) {
        e.preventDefault();
        const textoLimpio = texto.trim();
        if (!textoLimpio) return;
        setEventos((prev) => [
            ...prev,
            { id: crypto.randomUUID(), texto: textoLimpio, dia },
        ]);
        setTexto("");
    }

    function borrarEvento(id: string) {
        setEventos((prev) => prev.filter((ev) => ev.id !== id));
    }

    return (
        <section className="semanal">
            <h2>Eventos semanales</h2>

            <form className="semanal-form" onSubmit={agregarEvento}>
                <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Ej: Gimnasio"
                    aria-label="Nombre del evento semanal"
                />
                <select
                    value={dia}
                    onChange={(e) => setDia(Number(e.target.value))}
                    aria-label="Día de la semana"
                >
                    {DIAS_SEMANA.map((nombre, indice) => (
                        <option key={nombre} value={indice}>
                            {nombre}
                        </option>
                    ))}
                </select>
                <button type="submit">Agregar</button>
            </form>

            {ordenados.length === 0 ? (
                <p className="semanal-vacio">
                    No hay eventos semanales. Agrega el que se repite cada
                    semana.
                </p>
            ) : (
                <ul className="semanal-lista">
                    {ordenados.map((ev) => (
                        <li key={ev.id} className="semanal-item">
                            <span className="semanal-dia">
                                {DIAS_SEMANA[ev.dia] ?? ""}
                            </span>
                            <span className="semanal-texto">{ev.texto}</span>
                            <button
                                type="button"
                                className="semanal-borrar"
                                onClick={() => borrarEvento(ev.id)}
                                title="Borrar evento"
                                aria-label={`Borrar "${ev.texto}"`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default EventosSemanales;
