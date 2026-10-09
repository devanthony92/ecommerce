import { NavLink } from 'react-router'
import clsx from 'clsx'
import { Icon } from '@/components/ui'
import './section-nav.scss'

/**
 * Navegación secundaria de una sección (cuenta, panel mayorista).
 * Móvil: pestañas con scroll horizontal.
 * orientation: auto (desde lg pasa a lista vertical) | horizontal (siempre pestañas).
 * items: [{ to, label, icon?, end? }]
 */
export function SectionNav({ items, label, tone = 'primary', orientation = 'auto', className }) {
  return (
    <nav
      className={clsx(
        'section-nav',
        `section-nav--${tone}`,
        `section-nav--${orientation}`,
        className,
      )}
      aria-label={label}
    >
      <ul className="section-nav__list" role="list">
        {items.map((item) => (
          <li key={item.to} className="section-nav__item">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx('section-nav__link', isActive && 'section-nav__link--active')
              }
            >
              {item.icon && <Icon name={item.icon} size="sm" className="section-nav__icon" />}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
