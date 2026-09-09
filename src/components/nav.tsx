import { useState } from "react";

export type Pagina = "calendario" | "horario" | "contactos";

const OPCIONES: { id: Pagina; nombre: string }[] = [
    { id: "calendario", nombre: "Calendario" },
    { id: "horario", nombre: "Horario" },
    { id: "contactos", nombre: "Contactos" },
];

interface NavProps {
    pagina: Pagina;
    alCambiar: (pagina: Pagina) => void;
}

// Menú de la esquina superior izquierda: se expande al pulsarlo
function Nav({ pagina, alCambiar }: NavProps) {
    const [abierto, setAbierto] = useState(false);

    return (
        <nav className="nav">
            <button
                type="button"
                className="nav-boton"
                onClick={() => setAbierto(!abierto)}
                aria-expanded={abierto}
                aria-label="Abrir menú"
            >
                ☰
            </button>

            {abierto && (
                <>
                    {/* Fondo invisible para cerrar al hacer clic fuera */}
                    <div
                        className="nav-fondo"
                        onClick={() => setAbierto(false)}
                    />
                    <ul className="nav-menu">
                        {OPCIONES.map((opcion) => (
                            <li key={opcion.id}>
                                <button
                                    type="button"
                                    className={`nav-opcion${pagina === opcion.id ? " nav-activa" : ""}`}
                                    onClick={() => {
                                        alCambiar(opcion.id);
                                        setAbierto(false);
                                    }}
                                >
                                    {opcion.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </nav>
    );
}

export default Nav;
