import { Link } from 'react-router'
import clsx from 'clsx'
import { Icon } from '@/components/ui'
import { usePromotions } from '../../hooks/usePromotions'
import './promotion-banners.scss'

const ICONS = { SEASON: 'tag', VOLUME: 'bag', SHIPPING: 'check' }

// Promociones vigentes. Si fallan o no hay, no ocupan espacio (no son críticas).
// `exclude`: un tipo o una lista de tipos que la página ya comunica por su cuenta.
export function PromotionBanners({ exclude = [], className }) {
  const { data: promotions = [] } = usePromotions()
  const excluded = [exclude].flat()
  const visible = promotions.filter((promo) => !excluded.includes(promo.type))
  if (!visible.length) return null

  return (
    <ul className={clsx('promotion-banners', className)} role="list" aria-label="Promociones">
      {visible.map((promo) => (
        <li key={promo.id}>
          <Link
            to={promo.link}
            className={clsx(
              'promotion-banners__item',
              `promotion-banners__item--${promo.type.toLowerCase()}`,
            )}
          >
            <Icon name={ICONS[promo.type] ?? 'info'} className="promotion-banners__icon" />
            <span className="promotion-banners__text">
              <span className="promotion-banners__title">{promo.title}</span>
              <span className="promotion-banners__description">{promo.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
