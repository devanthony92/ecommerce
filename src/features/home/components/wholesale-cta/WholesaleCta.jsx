import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { useWholesaleCta } from '@/features/wholesale'
import { paths } from '@/constants/paths'
import './wholesale-cta.scss'

export function WholesaleCta() {
  const cta = useWholesaleCta()

  return (
    <section className="wholesale-cta" aria-labelledby="wholesale-cta-title">
      <h2 className="wholesale-cta__title" id="wholesale-cta-title">
        ¿Revendes nuestros productos?
      </h2>
      <p className="wholesale-cta__text">
        Solicita tu cuenta mayorista y compra con precios por nivel, pedidos rápidos y listas de
        recompra.
      </p>
      <div className="wholesale-cta__actions">
        <Button as={Link} to={cta.to} variant="wholesale" size="lg">
          {cta.kind === 'apply' ? 'Convertirme en mayorista' : cta.label}
        </Button>
        <Button as={Link} to={paths.wholesaleLanding} variant="secondary" size="lg">
          Cómo funciona
        </Button>
      </div>
    </section>
  )
}
