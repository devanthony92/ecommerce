import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { useWholesaleCta } from '@/features/wholesale'
import { paths } from '@/constants/paths'
import './home-hero.scss'

// Las dos propuestas desde el primer vistazo: compra individual y compra por volumen.
export function HomeHero() {
  const wholesaleCta = useWholesaleCta()

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <h1 className="home-hero__title" id="home-hero-title">
        Ropa para ti y para tu negocio
      </h1>
      <div className="home-hero__options">
        <article className="home-hero__option home-hero__option--retail">
          <p className="home-hero__eyebrow">Compra individual</p>
          <h2 className="home-hero__option-title">Desde una sola prenda</h2>
          <p className="home-hero__text">
            Camisetas, jeans y más con envío a todo el país. Lleva media docena y paga menos por
            unidad.
          </p>
          <Button as={Link} to={paths.catalog} size="lg">
            Ver catálogo
          </Button>
        </article>
        <article className="home-hero__option home-hero__option--wholesale">
          <p className="home-hero__eyebrow">Compra por volumen</p>
          <h2 className="home-hero__option-title">Precios mayoristas para tu tienda</h2>
          <p className="home-hero__text">
            Escalas por cantidad y hasta 15% adicional según tu nivel. Pedidos rápidos y recompra en
            un clic.
          </p>
          <Button as={Link} to={wholesaleCta.to} variant="wholesale" size="lg">
            {wholesaleCta.label}
          </Button>
        </article>
      </div>
    </section>
  )
}
