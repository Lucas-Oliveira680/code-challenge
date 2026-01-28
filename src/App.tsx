import './App.scss'
import { AppRoutes } from './routes/AppRoutes'
import { OfflineBanner } from './shared/components/OfflineBanner/OfflineBanner'

export function App() {

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <div className="app-routes">
        <OfflineBanner />
        <AppRoutes />
      </div>
    </>
  )
}