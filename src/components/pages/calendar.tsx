import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./calendar.css";
import { useListaSincronizada } from "../../sesion";

const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

// Empieza en domingo para coincidir con getDay() (0 = domingo)
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface day {
    date: Date;
    isCurrentMonth: boolean;
}

interface week {
    days: day[];
}

interface evento {
    id: string;
    texto: string;
    fecha: string; // clave "YYYY-MM-DD" del día al que pertenece
}

function getWeeks(year: number, month: number): week[] {
    // 1. Calcular cuántas semanas necesita este mes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const numWeeks = Math.ceil((firstWeekday + daysInMonth) / 7);

    // 2. Dónde empezar a contar (el domingo de la semana del día 1)
    const start = new Date(year, month, 2);
    start.setDate(2 - start.getDay());

    // 3. Crear exactamente numWeeks semanas, cada una con 7 días
    const weeks: week[] = [];
    const cursor = new Date(start);

    for (let w = 0; w < numWeeks; w++) {
        const days: day[] = [];
        for (let d = 0; d < 7; d++) {
            days.push({
                date: new Date(cursor),
                isCurrentMonth: cursor.getMonth() === month,
            });
            cursor.setDate(cursor.getDate() + 1); // avanza un día
        }
        weeks.push({ days });
    }
    return weeks;
}

// Clave "YYYY-MM-DD" en horario local (sin pasar por UTC)
function claveDe(date: Date): string {
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mes}-${dia}`;
}

function esMismoDia(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

// Valida la lista de eventos; acepta también el formato viejo agrupado por fecha
function aCalendario(dato: unknown): evento[] {
    if (Array.isArray(dato)) {
        return dato.map((d) => {
            const ev = (d ?? {}) as Partial<evento>;
            return {
                id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
                texto: typeof ev.texto === "string" ? ev.texto : "",
                fecha: typeof ev.fecha === "string" ? ev.fecha : "",
            };
        });
    }

    if (dato && typeof dato === "object") {
        return Object.entries(dato).flatMap(([fecha, lista]) =>
            (Array.isArray(lista) ? lista : []).map((d) => {
                const ev = (d ?? {}) as Partial<evento>;
                return {
                    id: typeof ev.id === "string" ? ev.id : crypto.randomUUID(),
                    texto: typeof ev.texto === "string" ? ev.texto : "",
                    fecha,
                };
            }),
        );
    }

    return [];
}

function Calendar() {
    const hoy = new Date();
    const [visible, setVisible] = useState(
        () => new Date(hoy.getFullYear(), hoy.getMonth(), 1),
    );
    const [eventos, setEventos] = useListaSincronizada(
        "calendario",
        "calendario-eventos",
        aCalendario,
    );
    const [seleccionado, setSeleccionado] = useState<Date | null>(null);
    const [textoNuevo, setTextoNuevo] = useState("");

    const semanas = useMemo(
        () => getWeeks(visible.getFullYear(), visible.getMonth()),
        [visible],
    );

    // Cerrar el modal con Escape
    useEffect(() => {
        if (!seleccionado) return;
        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSeleccionado(null);
        };
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
    }, [seleccionado]);

    const mesAnterior = () =>
        setVisible(new Date(visible.getFullYear(), visible.getMonth() - 1, 1));
    const mesSiguiente = () =>
        setVisible(new Date(visible.getFullYear(), visible.getMonth() + 1, 1));

    function abrirDia(date: Date) {
        setSeleccionado(date);
        setTextoNuevo("");
    }

    function agregarEvento(e: FormEvent) {
        e.preventDefault();
        const texto = textoNuevo.trim();
        if (!seleccionado || !texto) return;
        setEventos((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                texto,
                fecha: claveDe(seleccionado),
            },
        ]);
        setTextoNuevo("");
    }

    function borrarEvento(id: string) {
        setEventos((prev) => prev.filter((ev) => ev.id !== id));
    }

    // Datos del día del modal, calculados fuera del JSX para evitar repetir
    const tituloSeleccionado = seleccionado
        ? `${seleccionado.getDate()} de ${MESES[seleccionado.getMonth()]} de ${seleccionado.getFullYear()}`
        : "";
    const eventosSeleccionado = seleccionado
        ? eventos.filter((ev) => ev.fecha === claveDe(seleccionado))
        : [];

    return (
        <section className="calendario">
            <nav className="cal-nav">
                <button
                    type="button"
                    className="cal-flecha"
                    onClick={mesAnterior}
                    aria-label="Mes anterior"
                >
                    ←
                </button>
                <span className="cal-nav-titulo">
                    {MESES[visible.getMonth()]} {visible.getFullYear()}
                </span>
                <button
                    type="button"
                    className="cal-flecha"
                    onClick={mesSiguiente}
                    aria-label="Mes siguiente"
                >
                    →
                </button>
            </nav>
            <div className="cal-grid">
                {DIAS.map((nombre) => (
                    <div key={nombre} className="cal-dia-nombre">
                        {nombre}
                    </div>
                ))}

                {semanas.map((semana) =>
                    semana.days.map((dia) => {
                        const clave = claveDe(dia.date);
                        const eventosDia = eventos.filter(
                            (ev) => ev.fecha === clave,
                        );
                        const clases = [
                            "cal-dia",
                            dia.isCurrentMonth ? "" : "cal-fuera",
                            esMismoDia(dia.date, hoy) ? "cal-hoy" : "",
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <button
                                key={clave}
                                type="button"
                                className={clases}
                                onClick={() => abrirDia(dia.date)}
                            >
                                <span className="cal-numero">
                                    {dia.date.getDate()}
                                </span>
                                {eventosDia.length > 0 && (
                                    <span className="cal-eventos">
                                        {eventosDia.slice(0, 2).map((ev) => (
                                            <span
                                                key={ev.id}
                                                className="cal-evento"
                                            >
                                                {ev.texto}
                                            </span>
                                        ))}
                                        {eventosDia.length > 2 && (
                                            <span className="cal-mas">
                                                +{eventosDia.length - 2} más
                                            </span>
                                        )}
                                    </span>
                                )}
                            </button>
                        );
                    }),
                )}
            </div>

            {/* Flechas para cambiar de mes, debajo del calendario */}
            

            {seleccionado && (
                <div
                    className="cal-modal-fondo"
                    onClick={() => setSeleccionado(null)}
                >
                    <div
                        className="cal-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="cal-modal-cabecera">
                            <h3>{tituloSeleccionado}</h3>
                            <button
                                type="button"
                                className="cal-cerrar"
                                onClick={() => setSeleccionado(null)}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </header>

                        <form className="cal-form" onSubmit={agregarEvento}>
                            <input
                                value={textoNuevo}
                                onChange={(e) => setTextoNuevo(e.target.value)}
                                placeholder="Nuevo evento…"
                                autoFocus
                            />
                            <button type="submit">Agregar</button>
                        </form>

                        {eventosSeleccionado.length > 0 ? (
                            <ul className="cal-lista">
                                {eventosSeleccionado.map((ev) => (
                                    <li key={ev.id}>
                                        <span className="cal-lista-texto">
                                            {ev.texto}
                                        </span>
                                        <button
                                            type="button"
                                            className="cal-borrar"
                                            onClick={() => borrarEvento(ev.id)}
                                            aria-label="Borrar evento"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="cal-vacio">No hay eventos este día.</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

export default Calendar;
