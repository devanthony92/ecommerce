import { useId } from 'react'
import { Link } from 'react-router'
import { PromotionBanners } from '@/features/promotions'
import { paths } from '@/constants/paths'
import { BenefitsStrip } from '../components/benefits-strip/BenefitsStrip'
import { CategoryTiles } from '../components/category-tiles/CategoryTiles'
import { HomeHero } from '../components/home-hero/HomeHero'
import { ProductShelf } from '../components/product-shelf/ProductShelf'
import { VolumeOffers } from '../components/volume-offers/VolumeOffers'
import { WholesaleCta } from '../components/wholesale-cta/WholesaleCta'
import './home-page.scss'

const FEATURED = { tag: 'featured', pageSize: 4 }
const BESTSELLERS = { sort: 'bestsellers', pageSize: 4 }

/**
 * Home orientada a descubrimiento y conversión. La página solo compone:
 * cada sección pide sus propios datos y maneja sus estados.
 */
export default function HomePage() {
  const categoriesTitle = useId()

  return (
    <div className="home-page">
      <HomeHero />
      <PromotionBanners />

      <section className="home-page__section" aria-labelledby={categoriesTitle}>
        <div className="home-page__section-header">
          <h2 className="home-page__section-title" id={categoriesTitle}>
            Categorías
          </h2>
          <Link className="home-page__link" to={paths.catalog}>
            Ver todo
          </Link>
        </div>
        <CategoryTiles />
      </section>

      <ProductShelf
        title="Destacados"
        params={FEATURED}
        action={{ to: paths.catalog, label: 'Ver catálogo' }}
      />
      <VolumeOffers />
      <ProductShelf
        title="Los más vendidos"
        description="Lo que más se llevan nuestras tiendas aliadas."
        params={BESTSELLERS}
        action={{ to: `${paths.catalog}?sort=bestsellers`, label: 'Ver más' }}
      />
      <BenefitsStrip />
      <WholesaleCta />
    </div>
  )
}
