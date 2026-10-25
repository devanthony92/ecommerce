import { useId } from 'react'
import { Link } from 'react-router'
import { Can } from '@/features/auth'
import { PromotionBanners } from '@/features/promotions'
import { paths } from '@/constants/paths'
import { PERMISSIONS } from '@/constants/permissions'
import { BenefitsStrip } from '../components/benefits-strip/BenefitsStrip'
import { CategoryCarousel } from '../components/category-carousel/CategoryCarousel'
import { ProductShelf } from '../components/product-shelf/ProductShelf'
import { VolumeOffers } from '../components/volume-offers/VolumeOffers'
import { WholesaleCta } from '../components/wholesale-cta/WholesaleCta'
import './home-page.scss'

const FEATURED = { tag: 'featured', pageSize: 4 }

/**
 * Home orientada a descubrimiento y conversión. La página solo compone:
 * cada sección pide sus propios datos y maneja sus estados.
 * Ritmo: abre el carrusel de categorías con sus garantías; después, capítulos
 * con aire (destacados, ofertas) y cierra la invitación mayorista.
 * El h1 queda solo para lectores de pantalla: las categorías hablan por sí solas.
 */
export default function HomePage() {
  const categoriesTitle = useId()

  return (
    <div className="home-page">
      <h1 className="home-page__title">Ropa para ti y para tu negocio</h1>

      <div className="home-page__intro">
        <section className="home-page__section" aria-labelledby={categoriesTitle}>
          <div className="home-page__section-header">
            <h2 className="home-page__section-title" id={categoriesTitle}>
              Categorías
            </h2>
            <Link className="home-page__link" to={paths.catalog}>
              Ver todo
            </Link>
          </div>
          <CategoryCarousel labelledBy={categoriesTitle} />
        </section>
        <BenefitsStrip />
      </div>

      <ProductShelf
        title="Destacados"
        params={FEATURED}
        action={{ to: paths.catalog, label: 'Ver catálogo' }}
      />

      <div className="home-page__offers">
        {/* Envío gratis y precio por volumen ya están en la banda de garantías. */}
        <PromotionBanners exclude={['VOLUME', 'SHIPPING']} />
        {/* Las escalas por cantidad solo existen para cuentas mayoristas. */}
        <Can permission={PERMISSIONS.WHOLESALE_ACCESS}>
          <VolumeOffers />
        </Can>
      </div>

      <WholesaleCta />
    </div>
  )
}
