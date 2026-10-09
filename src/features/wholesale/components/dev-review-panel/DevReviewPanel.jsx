import { useToast } from '@/components/feedback'
import { Button } from '@/components/ui'
import { useSimulateReview } from '../../hooks/useWholesaleRequest'
import './dev-review-panel.scss'

const ACTIONS = [
  { status: 'UNDER_REVIEW', label: 'Pasar a revisión' },
  { status: 'APPROVED', label: 'Aprobar' },
  { status: 'REJECTED', label: 'Rechazar' },
  { status: 'SUSPENDED', label: 'Suspender' },
]

/**
 * SOLO DEMO: con el backend simulado no hay administrador que revise solicitudes.
 * Este panel simula su decisión. No se renderiza con VITE_USE_MOCKS=false.
 */
export function DevReviewPanel({ currentStatus }) {
  const toast = useToast()
  const simulate = useSimulateReview()

  if (import.meta.env.VITE_USE_MOCKS !== 'true') return null

  async function handle(status) {
    try {
      await simulate.mutateAsync(status)
      toast.show({ tone: 'info', title: 'Demo: solicitud actualizada' })
    } catch (error) {
      toast.show({ tone: 'danger', title: 'No se pudo simular', description: error.message })
    }
  }

  return (
    <aside className="dev-review-panel" aria-label="Simulador de revisión (demo)">
      <p className="dev-review-panel__title">Demo · Simular revisión del administrador</p>
      <p className="dev-review-panel__text">
        En producción esta decisión la toma un administrador. Aquí puedes simularla.
      </p>
      <div className="dev-review-panel__actions">
        {ACTIONS.filter((action) => action.status !== currentStatus).map((action) => (
          <Button
            key={action.status}
            size="sm"
            variant="secondary"
            disabled={simulate.isPending}
            onClick={() => handle(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </aside>
  )
}
