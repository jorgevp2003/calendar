import { useState, type FormEvent } from "react";
import "./eventos.css";
import { useListaSincronizada } from "../../sesion";

type colorEvento = "rojo" | "verde" | "amarillo";

const COLOR_EVENTOS: colorEvento[] = ["rojo", "verde", "amarillo"];

interface evento {
    id: string;
    texto: string;
    color: colorEvento;
    importancia: 1 | 2 | 3;
}

// Valida la lista de deberes que llega de localStorage o de Firebase
function aDeberes(dato: unknown): evento[] {
    if (!Array.isArray(dato)) return [];
    return dato.map((d) => {
        const ev = (d ?? {}) as Partial<evento>;
        return {
            id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
            texto: typeof ev.texto === "string" ? ev.texto : "",
            color: COLOR_EVENTOS.includes(ev.color as colorEvento)
                ? (ev.color as colorEvento)
                : "rojo",
            importancia:
                ev.importancia === 2 || ev.importancia === 3
                    ? ev.importancia
                    : 1,
        };
    });
}

function EventosPanel() {
    const [eventos, setEventos] = useListaSincronizada(
        "deberes",
        "eventos-deberes",
        aDeberes,
    );
    const [textoNuevo, setTextoNuevo] = useState("");

    // Los más importantes arriba; a igual importancia, el orden de creación
    const ordenados = [...eventos].sort(
        (a, b) => b.importancia - a.importancia,
    );

    function agregarEvento(e: FormEvent) {
        e.preventDefault();
        const texto = textoNuevo.trim();
        if (!texto) return;
        setEventos((prev) => [
            ...prev,
            { id: crypto.randomUUID(), texto, color: "rojo", importancia: 1 },
        ]);
        setTextoNuevo("");
    }

    function actualizarEvento(id: string, cambios: Partial<evento>) {
        setEventos((prev) =>
            prev.map((ev) => (ev.id === id ? { ...ev, ...cambios } : ev)),
        );
    }

    // Recorre rojo → verde → amarillo → rojo
    function cambiarColor(ev: evento) {
        const indice = COLOR_EVENTOS.indexOf(ev.color);
        actualizarEvento(ev.id, {
            color: COLOR_EVENTOS[(indice + 1) % COLOR_EVENTOS.length],
        });
    }

    // Recorre 1 → 2 → 3 → 1
    function cambiarImportancia(ev: evento) {
        actualizarEvento(ev.id, {
            importancia: ((ev.importancia % 3) + 1) as 1 | 2 | 3,
        });
    }

    function borrarEvento(id: string) {
        setEventos((prev) => prev.filter((e) => e.id !== id));
    }

    return (
        <section className="panel-eventos">
            <h2>Eventos</h2>

            <form className="panel-form" onSubmit={agregarEvento}>
                <input
                    value={textoNuevo}
                    onChange={(e) => setTextoNuevo(e.target.value)}
                    placeholder="Ej: Deberes de mates"
                    aria-label="Nombre del evento"
                />
                <button type="submit">Agregar</button>
            </form>

            {ordenados.length === 0 ? (
                <p className="panel-vacio">Todavía no hay eventos.</p>
            ) : (
                <ul className="panel-lista">
                    {ordenados.map((ev) => (
                        <li key={ev.id} className="panel-item">
                            {/* Clic a la izquierda: cambia el color */}
                            <button
                                type="button"
                                className={`panel-color panel-color-${ev.color}`}
                                onClick={() => cambiarColor(ev)}
                                title="Cambiar color (rojo → verde → amarillo)"
                                aria-label={`Cambiar color de "${ev.texto}"`}
                            />
                            <span className="panel-texto">{ev.texto}</span>
                            <button
                                type="button"
                                className="panel-importancia"
                                onClick={() => cambiarImportancia(ev)}
                                title={`Importancia ${ev.importancia} de 3 (clic para cambiar)`}
                                aria-label={`Cambiar importancia de "${ev.texto}"`}
                            >
                                {ev.importancia}
                            </button>
                            {/* Clic a la derecha: borra el evento */}
                            <button
                                type="button"
                                className="panel-borrar"
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

export default EventosPanel;
