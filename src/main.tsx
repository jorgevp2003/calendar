import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Calendar from './components/pages/calendar'
import EventosPanel from './components/pages/eventos'
import EventosSemanales from './components/pages/semanal'
import Horario from './components/pages/horario'
import Semanal from './components/pages/weekly'
import Tareas from './components/pages/task'
import Contactos from './components/pages/contactos'
import Nav, { type Pagina } from './components/nav'
import { BarraSesion, SesionProvider } from './sesion'

function Aplicacion() {
  const [pagina, setPagina] = useState<Pagina>('calendario')

  return (
    <>
      <header className="cabecera">
        <Nav pagina={pagina} alCambiar={setPagina} />
        <BarraSesion />
      </header>

      <div className="layout">
        {pagina === 'calendario' && (
          <>
            <main className="layout-principal">
              <Calendar />
              <EventosSemanales />
            </main>
            <aside className="layout-lateral">
              <EventosPanel />
            </aside>
          </>
        )}
        {pagina === 'horario' && <Horario />}
        {pagina === 'semanal' && <Semanal />}
        {pagina === 'tareas' && <Tareas />}
        {pagina === 'contactos' && <Contactos />}
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SesionProvider>
      <Aplicacion />
    </SesionProvider>
  </StrictMode>,
)
