import { useId, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router'
import { Button, Icon } from '@/components/ui'
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
const REEL_POSTER =
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=960&q=80'

/**
 * Home orientada a descubrimiento y conversión con composición editorial asimétrica.
 * La página solo compone: cada sección pide sus propios datos y maneja sus estados.
 * El h1 queda para lectores de pantalla y preserva la jerarquía semántica.
 */
export default function HomePage() {
  const categoriesTitle = useId()
  const [reelPlaying, setReelPlaying] = useState(true)

  return (
    <div className="home-page">
      <h1 className="home-page__title">Ropa para ti y para tu negocio</h1>

      <div className="home-page__showcase">
        <div className="home-page__manifesto">
          <div className="home-page__eyebrow">
            <span className="home-page__pulse" aria-hidden="true" />
            <span>COLECCIÓN 04 // ARCHIVO EDITORIAL URBANO</span>
          </div>

          <p className="home-page__display">
            Siluetas de arquitectura urbana{' '}
            <span className="home-page__display-accent">y escala comercial.</span>
          </p>

          <p className="home-page__lead">
            Prendas de alto gramaje, corte preciso y estética minimalista oscura. Adquiere desde una
            sola unidad o activa precios automáticos por volumen para tu marca o boutique.
          </p>

          <div className="home-page__funnel">
            <Button as={Link} to={paths.catalog} size="lg">
              Explorar colección
            </Button>
            <Button as={Link} to={paths.wholesaleLanding} variant="secondary" size="lg">
              Programa mayorista
            </Button>
          </div>

          <dl className="home-page__telemetry">
            <div className="home-page__telemetry-item">
              <dt className="home-page__telemetry-label">Gramaje textil</dt>
              <dd className="home-page__telemetry-value">240 g/m²</dd>
            </div>
            <div className="home-page__telemetry-item">
              <dt className="home-page__telemetry-label">Modalidad</dt>
              <dd className="home-page__telemetry-value">DETAL + MAYOR</dd>
            </div>
            <div className="home-page__telemetry-item">
              <dt className="home-page__telemetry-label">Despacho</dt>
              <dd className="home-page__telemetry-value">24/7</dd>
            </div>
          </dl>
        </div>

        <div
          className={clsx('home-page__reel', {
            'home-page__reel--playing': reelPlaying,
          })}
        >
          <img
            src={REEL_POSTER}
            alt="Editorial lookbook de temporada en estudio nocturno"
            className="home-page__reel-media"
            loading="eager"
            decoding="async"
          />
          <div className="home-page__reel-hud">
            <span className="home-page__reel-badge">VIDEO DE TEMPORADA // 4K 60 FPS</span>
            <span className="home-page__reel-time">
              {reelPlaying ? 'EN VIVO 00:18' : 'EN PAUSA'}
            </span>
          </div>

          <div className="home-page__reel-footer">
            <button
              type="button"
              className="home-page__reel-toggle"
              aria-label={reelPlaying ? 'Pausar video editorial' : 'Reproducir video editorial'}
              aria-pressed={reelPlaying}
              onClick={() => setReelPlaying((prev) => !prev)}
            >
              <Icon name={reelPlaying ? 'pause' : 'play'} size="sm" />
              <span>{reelPlaying ? 'Pausar video' : 'Reproducir video'}</span>
            </button>

            <Link className="home-page__reel-spotlight" to={paths.product('chaqueta-jean')}>
              <span className="home-page__reel-kicker">PIEZA EN ESCENA</span>
              <span className="home-page__reel-product">Chaqueta de jean →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="home-page__intro">
        <section className="home-page__section" aria-labelledby={categoriesTitle}>
          <div className="home-page__section-header">
            <div>
              <p className="home-page__section-kicker">01 // SILUETAS SELECCIONADAS</p>
              <h2 className="home-page__section-title" id={categoriesTitle}>
                Categorías
              </h2>
            </div>
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
        description="Selección curada de rotación continua con acabados de estudio y disponibilidad inmediata."
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
