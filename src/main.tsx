import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Calendar from './components/pages/calendar'
import EventosPanel from './components/pages/eventos'
import EventosSemanales from './components/pages/semanal'
import { BarraSesion, SesionProvider } from './sesion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SesionProvider>
      <header className="cabecera">
        <BarraSesion />
      </header>
      <div className="layout">
        <main className="layout-principal">
          <Calendar />
          <EventosSemanales />
        </main>
        <aside className="layout-lateral">
          <EventosPanel />
        </aside>
      </div>
    </SesionProvider>
  </StrictMode>,
)
