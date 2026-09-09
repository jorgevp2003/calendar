// Inicio de sesión con Google y sincronización de las listas con Firestore.
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseActivo } from "./firebase";

interface Sesion {
    usuario: User | null;
    cargando: boolean;
    iniciar: () => void;
    cerrar: () => void;
}

const SesionContexto = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [cargando, setCargando] = useState(firebaseActivo);

    // Mantiene la sesión al recargar la página
    useEffect(() => {
        if (!auth) return;
        return onAuthStateChanged(auth, (u) => {
            setUsuario(u);
            setCargando(false);
        });
    }, []);

    function iniciar() {
        if (!auth) {
            alert(
                "Falta completar la configuración de Firebase en src/firebase.ts",
            );
            return;
        }
        signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
            // El usuario puede haber cerrado la ventana; otros errores
            // (p. ej. Google sin habilitar en la consola) se muestran
            if ((error as { code?: string }).code !== "auth/popup-closed-by-user") {
                console.error("Error al iniciar sesión", error);
            }
        });
    }

    function cerrar() {
        if (!auth) return;
        signOut(auth).catch(() => {});
    }

    return (
        <SesionContexto.Provider
            value={{ usuario, cargando, iniciar, cerrar }}
        >
            {children}
        </SesionContexto.Provider>
    );
}

export function useSesion(): Sesion {
    const sesion = useContext(SesionContexto);
    if (!sesion) {
        throw new Error("useSesion debe usarse dentro de SesionProvider");
    }
    return sesion;
}

// Lista de elementos (eventos, deberes, semanales) que se guarda siempre en
// localStorage y, con la sesión iniciada, también en Firestore: se carga al
// iniciar sesión y se guarda en cada cambio.
export function useListaSincronizada<T>(
    campo: string,
    claveLocal: string,
    validar: (dato: unknown) => T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
    const { usuario } = useSesion();
    const [lista, setLista] = useState<T[]>(() =>
        cargarLocal(claveLocal, validar),
    );
    // Marca si la lista del usuario ya cargó de la nube; evita guardar en
    // Firestore antes de cargar y pisar los datos remotos con los locales
    const nubeLista = useRef(false);

    // Al iniciar sesión: cargar la lista guardada del usuario
    useEffect(() => {
        nubeLista.current = false;
        if (!usuario || !db) return;
        let cancelado = false;
        getDoc(doc(db, "usuarios", usuario.uid))
            .then((snap) => {
                if (cancelado) return;
                nubeLista.current = true;
                setLista(validar(snap.data()?.[campo]));
            })
            .catch((error) =>
                console.error("Error al cargar de Firebase", error),
            );
        return () => {
            cancelado = true;
        };
    }, [usuario, campo, validar]);

    // En cada cambio: guardar en localStorage, y en la nube si ya cargó
    useEffect(() => {
        guardarLocal(claveLocal, lista);
        if (!usuario || !db || !nubeLista.current) return;
        setDoc(
            doc(db, "usuarios", usuario.uid),
            { [campo]: lista },
            { merge: true },
        ).catch((error) =>
            console.error("Error al guardar en Firebase", error),
        );
    }, [lista, usuario, campo, claveLocal]);

    return [lista, setLista];
}

function cargarLocal<T>(clave: string, validar: (dato: unknown) => T[]): T[] {
    try {
        const guardado = localStorage.getItem(clave);
        if (!guardado) return [];
        return validar(JSON.parse(guardado));
    } catch {
        return [];
    }
}

function guardarLocal<T>(clave: string, lista: T[]): void {
    try {
        localStorage.setItem(clave, JSON.stringify(lista));
    } catch {
        // sin almacenamiento disponible
    }
}

// Botonera de la barra superior: "Iniciar sesión" a la derecha
export function BarraSesion() {
    const { usuario, cargando, iniciar, cerrar } = useSesion();

    if (cargando) return <div className="barra-sesion" />;

    return (
        <div className="barra-sesion">
            {usuario ? (
                <>
                    {usuario.photoURL && (
                        <img
                            className="sesion-foto"
                            src={usuario.photoURL}
                            alt=""
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <span className="sesion-nombre">
                        {usuario.displayName ?? usuario.email}
                    </span>
                    <button
                        type="button"
                        className="sesion-boton"
                        onClick={cerrar}
                    >
                        Cerrar sesión
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    className="sesion-boton"
                    onClick={iniciar}
                >
                    Iniciar sesión
                </button>
            )}
        </div>
    );
}
