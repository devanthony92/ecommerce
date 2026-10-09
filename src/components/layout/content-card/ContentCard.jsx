import { useId } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import './content-card.scss'

/**
 * Tarjeta de sección (dashboards, cuenta). `action`: { to, label } opcional.
 * tone: default | wholesale
 */
export function ContentCard({ title, action, tone = 'default', className, children }) {
  const titleId = useId()

  return (
    <section
      className={clsx('content-card', `content-card--${tone}`, className)}
      aria-labelledby={titleId}
    >
      <header className="content-card__header">
        <h2 className="content-card__title" id={titleId}>
          {title}
        </h2>
        {action && (
          <Link className="content-card__action" to={action.to}>
            {action.label}
          </Link>
        )}
      </header>
      <div className="content-card__body">{children}</div>
    </section>
  )
}
