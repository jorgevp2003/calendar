import { Fragment } from "react";
import "./horario.css";
import { useListaSincronizada } from "../../sesion";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const TRAMOS = 7; // filas del horario

// Valida las casillas que llegan de localStorage o de Firebase (35 textos)
function aHorario(dato: unknown): string[] {
    const casillas = Array.isArray(dato) ? dato : [];
    return Array.from({ length: DIAS.length * TRAMOS }, (_, i) =>
        typeof casillas[i] === "string" ? casillas[i] : "",
    );
}

function Horario() {
    const [casillas, setCasillas] = useListaSincronizada(
        "horario",
        "horario",
        aHorario,
    );

    function cambiarCasilla(indice: number, texto: string) {
        setCasillas((prev) => prev.map((c, i) => (i === indice ? texto : c)));
    }

    return (
        <section className="horario">
            <h2>Horario</h2>
            <p className="horario-ayuda">
                Haz clic en una casilla y escribe el nombre. Se guarda solo.
            </p>

            <div className="horario-grid">
                <div className="horario-cabecera" />
                {DIAS.map((dia) => (
                    <div key={dia} className="horario-cabecera">
                        {dia}
                    </div>
                ))}

                {Array.from({ length: TRAMOS }, (_, fila) => (
                    <Fragment key={fila}>
                        <div className="horario-hora">{fila + 1}</div>
                        {DIAS.map((dia, col) => {
                            const indice = fila * DIAS.length + col;
                            return (
                                <input
                                    key={dia}
                                    type="text"
                                    className="horario-celda"
                                    value={casillas[indice] ?? ""}
                                    onChange={(e) =>
                                        cambiarCasilla(indice, e.target.value)
                                    }
                                    aria-label={`${dia}, tramo ${fila + 1}`}
                                />
                            );
                        })}
                    </Fragment>
                ))}
            </div>
        </section>
    );
}

export default Horario;
