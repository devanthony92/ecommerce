import { Link } from 'react-router'
import { QueryBoundary } from '@/components/feedback'
import { Button } from '@/components/ui'
import { ProductGrid, ProductGridSkeleton, useProducts } from '@/features/catalog'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { ProgramBenefits } from '../components/program-benefits/ProgramBenefits'
import { useWholesaleCta } from '../hooks/useWholesaleCta'
import { useWholesaleProgram } from '../hooks/useWholesaleRequest'
import './wholesale-landing-page.scss'

const VOLUME_OFFERS = { tag: 'volume-offer', pageSize: 4 }

const STEPS = [
  { title: 'Crea tu cuenta', text: 'Regístrate gratis como comprador.' },
  { title: 'Envía tu solicitud', text: 'Cuéntanos de tu negocio. La revisamos en 2 días hábiles.' },
  { title: 'Compra con tu precio', text: 'Precios por volumen desde media docena.' },
]

// El pedido mínimo viene del backend; mientras carga, la respuesta no da la cifra.
const faqFor = (program) => [
  {
    question: '¿Necesito tener tienda física?',
    answer: 'No. Aceptamos tiendas en línea, venta por catálogo y distribuidores.',
  },
  {
    question: '¿Hay un pedido mínimo?',
    answer: `Sí${program ? `: ${formatMoney(program.minimumOrder)} en productos por pedido` : ''}. Los precios por volumen aplican desde media docena por producto, sumando tallas y colores.`,
  },
  {
    question: '¿Puedo seguir comprando al detal?',
    answer: 'Sí. Con tu cuenta mayorista también puedes comprar una sola unidad.',
  },
]

export default function WholesaleLandingPage() {
  const cta = useWholesaleCta()
  const offers = useProducts(VOLUME_OFFERS)
  const { data: program } = useWholesaleProgram()

  return (
    <div className="wholesale-landing">
      <section className="wholesale-landing__hero" aria-labelledby="wholesale-hero-title">
        <p className="wholesale-landing__eyebrow">Programa mayorista</p>
        <h1 className="wholesale-landing__title" id="wholesale-hero-title">
          Compra por mayor y gana más en tu negocio
        </h1>
        <p className="wholesale-landing__lead">
          Precios por volumen desde media docena, sumando tallas y colores del mismo producto.
        </p>
        <div className="wholesale-landing__actions">
          <Button as={Link} to={cta.to} variant="wholesale" size="lg">
            {cta.label}
          </Button>
          <Button as={Link} to={paths.catalog} variant="secondary" size="lg">
            Ver catálogo
          </Button>
        </div>
      </section>

      <section className="wholesale-landing__section" aria-labelledby="how-title">
        <h2 id="how-title">Cómo funciona</h2>
        <ol className="wholesale-landing__steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="wholesale-landing__step">
              <span className="wholesale-landing__step-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="wholesale-landing__step-title">{step.title}</span>
              <span className="wholesale-landing__step-text">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="wholesale-landing__section" aria-labelledby="benefits-landing-title">
        <h2 id="benefits-landing-title">Beneficios</h2>
        <ProgramBenefits />
      </section>

      <section className="wholesale-landing__section" aria-labelledby="offers-title">
        <h2 id="offers-title">Productos con precio por volumen</h2>
        <QueryBoundary query={offers} loading={<ProductGridSkeleton count={4} />}>
          {(data) => <ProductGrid products={data.items} />}
        </QueryBoundary>
      </section>

      <section className="wholesale-landing__section" aria-labelledby="faq-title">
        <h2 id="faq-title">Preguntas frecuentes</h2>
        <div className="wholesale-landing__faq">
          {faqFor(program).map((item) => (
            <details key={item.question} className="wholesale-landing__question">
              <summary className="wholesale-landing__summary">{item.question}</summary>
              <p className="wholesale-landing__answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
