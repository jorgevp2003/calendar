# Calendar

Calendario personal para el día a día de clase: calendario mensual con eventos y deberes, eventos semanales, horario con colores por asignatura y contactos. Los datos se guardan en el navegador y, al iniciar sesión con Google, se sincronizan con Firebase. No necesita servidor propio: toda la parte de backend (autenticación y base de datos) la pone Firebase.

**Ver online:** https://jorgevp2003.github.io/calendar/

## Tecnologías

| Área | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| UI | React 19 |
| Build | Vite 8 |
| Backend | Firebase 12 (Auth + Firestore) |
| Guardado local | localStorage |
| Estilos | CSS moderno (custom properties, flexbox/grid) |
| Linter | oxlint |
| Gestor de paquetes | pnpm |
| Despliegue | GitHub Actions → GitHub Pages |

## ¿Por qué estas tecnologías?

- **React 19** — Toda la interfaz son componentes con estado: el mes del calendario se regenera al navegar, y las listas de eventos, deberes y contactos cambian al añadir o borrar. Al cambiar un dato la UI se actualiza sola, sin manipular el DOM a mano. Es además el framework con el ecosistema y el mercado más grandes.
- **TypeScript** — Los datos tienen forma fija (evento, deber, contacto, asignatura) y llegan de dos sitios que no se pueden fiar: localStorage y Firestore. Al leerlos pasan por funciones `validar` y los tipos hacen que el compilador avise de cualquier forma incorrecta antes de desplegar.
- **Vite 8** — Servidor de desarrollo con recarga instantánea (HMR) y build de producción optimizado con una configuración mínima. Con `base: './'` el build usa rutas relativas, necesarias para servir la app desde `github.io/calendar/`.
- **Firebase Auth + Firestore** — El backend entero sin servidor propio: Auth hace el inicio de sesión con Google mediante popup y Firestore guarda las listas de cada usuario en un documento `usuarios/{uid}`. El plan gratuito cubre de sobra el uso personal de la app.
- **localStorage** — La capa base de guardado: las listas viven en el navegador, así que la app no depende de estar conectado. Al iniciar sesión con la cuenta del propietario, el hook `useListaSincronizada` sincroniza cada lista con Firestore por encima de la copia local.
- **Sin React Router** — La navegación entre calendario, horario y contactos es un menú que cambia el estado de la página: al ser una sola pantalla sin URLs profundas, un enrutador no aporta nada.
- **CSS moderno, sin framework** — Custom properties, grid y flexbox. Para una app de este tamaño, CSS a medida pesa menos que un framework de utilidades y da control total (el color de cada asignatura del horario se calcula del propio nombre).
- **oxlint** — Linter escrito en Rust que revisa el código en busca de errores comunes casi al instante; se ejecuta con `pnpm lint`.
- **pnpm** — Gestor de paquetes con almacén central: instala más rápido que npm y ahorra disco deduplicando dependencias entre proyectos.
- **GitHub Actions → GitHub Pages** — Alojamiento y CI/CD gratuitos: cada push a `main` construye y publica automáticamente. Los valores de Firebase se inyectan en el build desde los secrets del repositorio, así que no van en el código.

## Cosas a saber

- **Es una app personal, no multiusuario.** Solo la cuenta configurada en `VITE_OWNER_EMAIL` ve y guarda datos; cualquier otra sesión (o visitante sin sesión) ve las páginas vacías y no se guarda nada, ni siquiera en el navegador.
- **La configuración de Firebase no va en el código.** En local se pone en `.env` (copia `.env.example`; no se sube a GitHub) y en el despliegue la inyecta el workflow desde los secrets del repositorio.
- **Sin configurar, la app no conecta.** Si faltan las variables de entorno, arranca igual pero `firebaseActivo` es `false` y no intenta conectarse ni sincronizar nada.
- **La `apiKey` de Firebase viaja dentro del build.** Es lo normal en Firebase: esa clave identifica el proyecto, no es un secreto; lo que protege los datos son las reglas de seguridad de Firestore.
- **Al iniciar sesión se carga primero la nube.** El guardado en Firestore solo empieza después de descargar lo ya guardado, para no pisar los datos remotos con lo que hubiera en el navegador.
- **La copia local se puede perder.** Limpiar los datos del navegador borra localStorage; la copia buena está en Firestore cuando inicias sesión.

## Desarrollo

```bash
pnpm install
cp .env.example .env   # valores de Firebase console (opcional en local)
pnpm dev               # servidor de desarrollo
pnpm build             # build de producción en dist/ (base ./)
pnpm lint              # revisión con oxlint
```

## Despliegue

Cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`, que construye el proyecto (inyectando los secrets de Firebase como variables de entorno) y publica `dist/` en GitHub Pages automáticamente.
