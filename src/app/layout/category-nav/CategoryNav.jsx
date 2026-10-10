import { NavLink } from 'react-router'
import clsx from 'clsx'
import { Skeleton } from '@/components/feedback'
import { useCategories } from '@/features/catalog'
import { paths } from '@/constants/paths'
import './category-nav.scss'

const linkClass = ({ isActive }) =>
  clsx('category-nav__link', isActive && 'category-nav__link--active')

// Navegación de categorías en desktop. Si falla la carga, quedan los enlaces fijos.
export function CategoryNav({ className }) {
  const { data: categories, isPending } = useCategories()

  return (
    <nav className={clsx('category-nav', className)} aria-label="Categorías">
      <ul className="category-nav__list" role="list">
        <li>
          <NavLink className={linkClass} to={paths.catalog} end>
            Todo
          </NavLink>
        </li>

        {isPending &&
          Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="category-nav__placeholder">
              <Skeleton width="5rem" />
            </li>
          ))}

        {categories?.map((category) => (
          <li key={category.id}>
            <NavLink className={linkClass} to={paths.category(category.slug)}>
              {category.name}
            </NavLink>
          </li>
        ))}

        <li>
          <NavLink className={linkClass} to={paths.promotions}>
            Ofertas
          </NavLink>
        </li>
        <li>
          <NavLink className={linkClass} to={paths.inspiration}>
            Inspiración
          </NavLink>
        </li>
        <li className="category-nav__highlight">
          <NavLink
            className={({ isActive }) =>
              clsx(
                'category-nav__link',
                'category-nav__link--wholesale',
                isActive && 'category-nav__link--active',
              )
            }
            to={paths.wholesaleLanding}
          >
            Compra por mayor
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
