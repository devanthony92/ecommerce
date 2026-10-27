import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { useWholesaleCta } from '@/features/wholesale'
import { paths } from '@/constants/paths'
import './wholesale-cta.scss'

export function WholesaleCta() {
  const cta = useWholesaleCta()

  return (
    <section className="wholesale-cta" aria-labelledby="wholesale-cta-title">
      <div className="wholesale-cta__copy">
        <p className="wholesale-cta__eyebrow">MAYORISTAS // PROGRAMA DE ALIADOS COMERCIALES</p>
        <h2 className="wholesale-cta__title" id="wholesale-cta-title">
          ¿Revendes nuestros productos?
        </h2>
        <p className="wholesale-cta__text">
          Solicita tu cuenta mayorista y compra con precios por volumen, pedidos rápidos y listas de
          recompra.
        </p>
      </div>

      <div className="wholesale-cta__panel">
        <dl className="wholesale-cta__metrics">
          <div className="wholesale-cta__metric">
            <dt className="wholesale-cta__metric-label">Escala inicial</dt>
            <dd className="wholesale-cta__metric-value">6+ UNDS</dd>
          </div>
          <div className="wholesale-cta__metric">
            <dt className="wholesale-cta__metric-label">Margen mayorista</dt>
            <dd className="wholesale-cta__metric-value">HASTA -31%</dd>
          </div>
        </dl>
        <div className="wholesale-cta__actions">
          <Button as={Link} to={cta.to} variant="wholesale" size="lg">
            {cta.kind === 'apply' ? 'Convertirme en mayorista' : cta.label}
          </Button>
          <Button as={Link} to={paths.wholesaleLanding} variant="inverse" size="lg">
            Cómo funciona
          </Button>
        </div>
      </div>
    </section>
  )
}
