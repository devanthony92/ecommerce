import { Icon } from '@/components/ui'
import './benefits-strip.scss'

const BENEFITS = [
  { icon: 'bag', title: 'Envíos a todo el país', text: 'Gratis desde $120.000.' },
  { icon: 'check', title: 'Pago seguro', text: 'Con Mercado Pago o contra entrega.' },
  { icon: 'refresh', title: 'Cambios y garantía', text: '30 días para cambios.' },
  { icon: 'user', title: 'Precios mayoristas', text: 'Precios por volumen desde media docena.' },
]

export function BenefitsStrip() {
  return (
    <section className="benefits-strip" aria-label="Beneficios">
      <ul className="benefits-strip__list" role="list">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="benefits-strip__item">
            <span className="benefits-strip__icon" aria-hidden="true">
              <Icon name={benefit.icon} />
            </span>
            <span className="benefits-strip__title">{benefit.title}</span>
            <span className="benefits-strip__text">{benefit.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
