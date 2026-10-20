import { Link } from 'react-router'
import { ResponsiveImage } from '@/components/ui'
import { useProducts } from '@/features/catalog'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'

// Mismos parámetros que la vitrina "Los más vendidos": comparten la caché.
const STALL = { sort: 'bestsellers', pageSize: 4 }

// Puesto de mercado: las prendas más vendidas colgadas, cada una con su letrero de precio.
export function HeroStall() {
  const { data } = useProducts(STALL)
  const items = data?.items ?? []

  if (!items.length) {
    return (
      <div className="home-hero__stall" aria-hidden="true">
        {Array.from({ length: STALL.pageSize }, (_, index) => (
          <div key={index} className="home-hero__hanger home-hero__hanger--placeholder" />
        ))}
      </div>
    )
  }

  return (
    <ul className="home-hero__stall" role="list" aria-label="Lo más vendido">
      {items.map((product, index) => (
        <li key={product.id} className="home-hero__hanger">
          <Link className="home-hero__item" to={paths.product(product.slug)}>
            <ResponsiveImage
              src={product.image.url}
              alt=""
              priority={index === 0}
              className="home-hero__item-image"
            />
            <span className="home-hero__item-name">{product.name}</span>
            <span className="home-hero__price-tag">{formatMoney(product.pricing.unitPrice)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
