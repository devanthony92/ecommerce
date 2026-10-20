import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { useWholesaleCta } from '@/features/wholesale'
import { paths } from '@/constants/paths'
import { HeroStall } from './HeroStall'
import './home-hero.scss'

// Las dos propuestas desde el primer vistazo: compra individual y compra por volumen.
export function HomeHero() {
  const wholesaleCta = useWholesaleCta()

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__lead">
        <h1 className="home-hero__title" id="home-hero-title">
          Ropa para ti y para tu negocio
        </h1>
        <HeroStall />
      </div>
      <div className="home-hero__options">
        <article className="home-hero__option home-hero__option--retail">
          <h2 className="home-hero__option-title">Desde una sola prenda</h2>
          <p className="home-hero__text">
            Camisetas, jeans, camisas y chaquetas para el día a día.
          </p>
          <Button as={Link} to={paths.catalog} variant="inverse" size="lg">
            Ver catálogo
          </Button>
        </article>
        <article className="home-hero__option home-hero__option--wholesale">
          <h2 className="home-hero__option-title">Precios mayoristas para tu tienda</h2>
          <p className="home-hero__text">
            Precios por volumen desde media docena, pedidos rápidos y recompra en un clic.
          </p>
          <Button as={Link} to={wholesaleCta.to} variant="inverse" size="lg">
            {wholesaleCta.label}
          </Button>
        </article>
      </div>
    </section>
  )
}
