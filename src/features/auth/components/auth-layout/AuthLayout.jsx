import { useId } from 'react'
import { Icon } from '@/components/ui'
import './auth-layout.scss'

const BENEFITS = [
  'Guarda tu carrito y tus direcciones',
  'Sigue tus pedidos y repite compras',
  'Solicita precios mayoristas para tu negocio',
]

// Página de acceso: tarjeta con el formulario y, desde lg, beneficios al lado.
export function AuthLayout({ title, description, notice, footer, children }) {
  const titleId = useId()

  return (
    <div className="auth-layout">
      <section className="auth-layout__card" aria-labelledby={titleId}>
        <header className="auth-layout__header">
          <h1 className="auth-layout__title" id={titleId}>
            {title}
          </h1>
          {description && <p className="auth-layout__description">{description}</p>}
        </header>
        {notice && (
          <p className="auth-layout__notice" role="status">
            <Icon name="info" size="sm" />
            {notice}
          </p>
        )}
        {children}
        {footer && <div className="auth-layout__footer">{footer}</div>}
      </section>

      <aside className="auth-layout__aside" aria-label="Beneficios de tener cuenta">
        <p className="auth-layout__aside-title">Con tu cuenta Trama</p>
        <ul className="auth-layout__benefits" role="list">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="auth-layout__benefit">
              <Icon name="check" size="sm" />
              {benefit}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
