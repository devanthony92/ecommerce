import { Component } from 'react'
import { Button } from '@/components/ui'
import './route-error-boundary.scss'

// Atrapa errores de render y de carga de chunks (deploy nuevo, red caída).
export class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="route-error-boundary" role="alert">
        <h1 className="route-error-boundary__title">Algo salió mal</h1>
        <p className="route-error-boundary__text">No pudimos cargar esta página.</p>
        <Button iconStart="refresh" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
    )
  }
}
