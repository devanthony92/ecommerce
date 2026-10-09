import { Link } from 'react-router'
import { ResponsiveImage } from '@/components/ui'
import { paths } from '@/constants/paths'
import { formatDate } from '@/utils/formatDate'
import { AddListToCartButton } from '../add-list-to-cart-button/AddListToCartButton'
import './list-card.scss'

export function ListCard({ list }) {
  return (
    <article className="list-card">
      <ul className="list-card__previews" aria-hidden="true">
        {list.previews.map((preview, index) => (
          <li key={index} className="list-card__preview">
            <ResponsiveImage src={preview.url} alt="" ratio="1 / 1" />
          </li>
        ))}
      </ul>
      <h2 className="list-card__name">
        <Link className="list-card__link" to={paths.list(list.id)}>
          {list.name}
        </Link>
      </h2>
      <p className="list-card__meta">
        {list.itemsCount} {list.itemsCount === 1 ? 'producto' : 'productos'} · {list.unitsCount}{' '}
        unidades · Actualizada {formatDate(list.updatedAt)}
      </p>
      {list.itemsCount > 0 && <AddListToCartButton list={list} />}
    </article>
  )
}
