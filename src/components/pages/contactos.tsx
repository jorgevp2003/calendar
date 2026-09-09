import { useState, type FormEvent } from "react";
import "./contactos.css";
import { useListaSincronizada } from "../../sesion";

interface contacto {
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
}

// Valida la lista de contactos que llega de localStorage o de Firebase
function aContactos(dato: unknown): contacto[] {
    if (!Array.isArray(dato)) return [];
    return dato.map((d) => {
        const c = (d ?? {}) as Partial<contacto>;
        return {
            id: typeof c.id === "string" ? c.id : crypto.randomUUID(),
            nombre: typeof c.nombre === "string" ? c.nombre : "",
            correo: typeof c.correo === "string" ? c.correo : "",
            telefono: typeof c.telefono === "string" ? c.telefono : "",
        };
    });
}

function Contactos() {
    const [contactos, setContactos] = useListaSincronizada(
        "contactos",
        "contactos",
        aContactos,
    );
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");

    function agregarContacto(e: FormEvent) {
        e.preventDefault();
        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) return;
        setContactos((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                nombre: nombreLimpio,
                correo: correo.trim(),
                telefono: telefono.trim(),
            },
        ]);
        setNombre("");
        setCorreo("");
        setTelefono("");
    }

    function borrarContacto(id: string) {
        setContactos((prev) => prev.filter((c) => c.id !== id));
    }

    return (
        <section className="contactos">
            <h2>Contactos</h2>

            <form className="contactos-form" onSubmit={agregarContacto}>
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                    aria-label="Nombre del contacto"
                />
                <input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Correo"
                    type="email"
                    aria-label="Correo del contacto"
                />
                <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono"
                    aria-label="Teléfono del contacto"
                />
                <button type="submit">Agregar</button>
            </form>

            {contactos.length === 0 ? (
                <p className="contactos-vacio">Todavía no hay contactos.</p>
            ) : (
                <ul className="contactos-lista">
                    {contactos.map((c) => (
                        <li key={c.id} className="contactos-item">
                            <span className="contactos-nombre">{c.nombre}</span>
                            <span className="contactos-dato">{c.correo}</span>
                            <span className="contactos-dato">{c.telefono}</span>
                            <button
                                type="button"
                                className="contactos-borrar"
                                onClick={() => borrarContacto(c.id)}
                                title="Borrar contacto"
                                aria-label={`Borrar a ${c.nombre}`}
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

export default Contactos;
