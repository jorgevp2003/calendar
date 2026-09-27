import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import "./proximas.css";
import { claveDe, type eventoCalendario } from "../../tipos-calendario";

interface props {
    eventos: eventoCalendario[];
    onBorrar: (id: string) => void;
    onAnadir: () => void; // abre el modal de hoy
}

// Empieza en domingo para coincidir con getDay() (0 = domingo)
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
];
const MESES_COMPLETOS = [
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

// Cuántas tareas se pintan antes de cargar más al hacer scroll
const LOTE = 30;

// Fecha local desde la clave "YYYY-MM-DD" (new Date("…") iría en UTC)
function fechaDe(clave: string): Date {
    const [y, m, d] = clave.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function Proximas({ eventos, onBorrar, onAnadir }: props) {
    const hoy = new Date();
    const claveHoy = claveDe(hoy);
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const claveManana = claveDe(manana);
    // Medianoche de hoy, para contar días exactos al pintar el chip
    const hoyCero = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
    );

    // Vencidas lo más reciente arriba; próximas en orden natural, exámenes primero
    const { proximas, vencidas } = useMemo(() => {
        const validas = eventos.filter((ev) => ev.fecha !== "");
        return {
            vencidas: validas
                .filter((ev) => ev.fecha < claveHoy)
                .sort((a, b) => b.fecha.localeCompare(a.fecha)),
            proximas: validas
                .filter((ev) => ev.fecha >= claveHoy)
                .sort(
                    (a, b) =>
                        a.fecha.localeCompare(b.fecha) ||
                        (b.tipo === "examen" ? 1 : 0) -
                            (a.tipo === "examen" ? 1 : 0),
                ),
        };
    }, [eventos, claveHoy]);

    const [visibles, setVisibles] = useState(LOTE);
    const [verVencidas, setVerVencidas] = useState(false);
    const contRef = useRef<HTMLDivElement | null>(null);
    const finRef = useRef<HTMLDivElement | null>(null);

    // Cargar más tareas cuando el final de la lista entra en pantalla
    useEffect(() => {
        const cont = contRef.current;
        const fin = finRef.current;
        if (!cont || !fin || visibles >= proximas.length) return;
        const obs = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting)
                    setVisibles((v) => Math.min(v + LOTE, proximas.length));
            },
            { root: cont, rootMargin: "100px" },
        );
        obs.observe(fin);
        return () => obs.disconnect();
    }, [visibles, proximas]);

    const numExamenes = proximas.filter((ev) => ev.tipo === "examen").length;

    // Chip de la lista de próximas: relativo si está cerca, fecha si no
    function chipFecha(clave: string): string {
        if (clave === claveHoy) return "Hoy";
        if (clave === claveManana) return "Mañana";
        const f = fechaDe(clave);
        const dias = Math.round((f.getTime() - hoyCero.getTime()) / 86400000);
        if (dias >= 2 && dias <= 6) return `${DIAS[f.getDay()]} ${f.getDate()}`;
        return `${f.getDate()} ${MESES[f.getMonth()]}`;
    }

    // Lista con separador "— Noviembre —" al cambiar de mes
    function listaTareas(items: eventoCalendario[], chipRelativo: boolean) {
        let mesAnterior = -1;
        return items.map((ev) => {
            const f = fechaDe(ev.fecha);
            const esExamen = ev.tipo === "examen";
            const separador =
                f.getMonth() !== mesAnterior ? (
                    <li key={`mes-${ev.id}`} className="proximas-mes">
                        — {MESES_COMPLETOS[f.getMonth()]} —
                    </li>
                ) : null;
            mesAnterior = f.getMonth();
            return (
                <Fragment key={ev.id}>
                    {separador}
                    <li
                        className={`proximas-item${esExamen ? " proximas-item-examen" : ""}`}
                    >
                        <span className="proximas-fecha">
                            {chipRelativo
                                ? chipFecha(ev.fecha)
                                : `${f.getDate()} ${MESES[f.getMonth()]}`}
                        </span>
                        {esExamen && (
                            <span className="proximas-badge">EXAMEN</span>
                        )}
                        <span className="proximas-texto">{ev.texto}</span>
                        <button
                            type="button"
                            className="proximas-borrar"
                            onClick={() => onBorrar(ev.id)}
                            title="Borrar tarea"
                            aria-label={`Borrar "${ev.texto}"`}
                        >
                            ×
                        </button>
                    </li>
                </Fragment>
            );
        });
    }

    return (
        <section className="proximas">
            <header className="proximas-cabecera">
                <h2>Próximas tareas</h2>
                <button
                    type="button"
                    className="proximas-anadir"
                    onClick={onAnadir}
                >
                    + Añadir
                </button>
            </header>
            <p className="proximas-conteo">
                {numExamenes > 0
                    ? `${proximas.length} tareas · ${numExamenes} exámenes`
                    : `${proximas.length} tareas`}
            </p>

            <div className="proximas-scroll" ref={contRef}>
                {proximas.length === 0 && vencidas.length === 0 ? (
                    <p className="proximas-vacio">
                        No hay tareas. Toca un día del calendario para añadir
                        una.
                    </p>
                ) : (
                    <>
                        {proximas.length > 0 && (
                            <ul className="proximas-lista">
                                {listaTareas(proximas.slice(0, visibles), true)}
                            </ul>
                        )}
                        {visibles < proximas.length && (
                            <div ref={finRef} className="proximas-fin" />
                        )}
                        {vencidas.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    className="proximas-vencidas-toggle"
                                    onClick={() => setVerVencidas(!verVencidas)}
                                >
                                    Vencidas ({vencidas.length})
                                </button>
                                {verVencidas && (
                                    <ul className="proximas-lista proximas-vencidas">
                                        {listaTareas(vencidas, false)}
                                    </ul>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
