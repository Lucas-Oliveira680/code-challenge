import './App.scss'
import { AppRoutes } from './routes/AppRoutes'
import { OfflineBanner } from './shared/components/OfflineBanner/OfflineBanner'

export function App() {

  return (
    <div className="app-routes">
      <OfflineBanner />
      <AppRoutes />
    </div>
  )
}