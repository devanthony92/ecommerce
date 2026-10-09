import { Link } from 'react-router'
import { QueryBoundary } from '@/components/feedback'
import { ContentCard, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { useCart } from '@/features/cart'
import { ProductGrid, ProductGridSkeleton, useProducts } from '@/features/catalog'
import { RecentOrders } from '@/features/orders'
import { WholesaleStatusCard } from '@/features/wholesale'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { useAddresses } from '../hooks/useAddresses'
import { formatAddress } from '../utils/addressValidation'
import './buyer-dashboard-page.scss'

const RECOMMENDED = { tag: 'featured', pageSize: 4 }

function CartCard() {
  const { cart, itemsCount } = useCart()
  const shipping = cart?.incentives.find((incentive) => incentive.type === 'FREE_SHIPPING')

  return (
    <ContentCard title="Tu carrito" action={{ to: paths.cart, label: 'Ver carrito' }}>
      {itemsCount > 0 && cart ? (
        <>
          <p>
            {itemsCount} {itemsCount === 1 ? 'unidad' : 'unidades'} ·{' '}
            <strong>{formatMoney(cart.summary.total)}</strong>
          </p>
          {shipping && !shipping.achieved && (
            <p className="buyer-dashboard__muted">
              Te faltan {formatMoney(shipping.remaining)} para el envío gratis.
            </p>
          )}
          <Button as={Link} to={paths.checkout} size="sm">
            Finalizar compra
          </Button>
        </>
      ) : (
        <p className="buyer-dashboard__muted">Tu carrito está vacío.</p>
      )}
    </ContentCard>
  )
}

function AccountCard({ user }) {
  const { data: addresses } = useAddresses()
  const defaultAddress = addresses?.find((address) => address.isDefault)

  return (
    <ContentCard title="Datos de la cuenta" action={{ to: paths.profile, label: 'Editar' }}>
      <dl className="buyer-dashboard__data">
        <div>
          <dt className="buyer-dashboard__label">Correo</dt>
          <dd className="buyer-dashboard__value">{user.email}</dd>
        </div>
        <div>
          <dt className="buyer-dashboard__label">Celular</dt>
          <dd className="buyer-dashboard__value">{user.phone ?? 'Sin registrar'}</dd>
        </div>
        <div>
          <dt className="buyer-dashboard__label">Dirección principal</dt>
          <dd className="buyer-dashboard__value">
            {defaultAddress ? (
              formatAddress(defaultAddress)
            ) : (
              <Link to={paths.addresses}>Agregar dirección</Link>
            )}
          </dd>
        </div>
      </dl>
    </ContentCard>
  )
}

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const recommended = useProducts(RECOMMENDED)

  return (
    <div className="buyer-dashboard">
      <PageHeader
        title={`Hola, ${user.name}`}
        description="Tus pedidos, tu carrito y tus datos en un solo lugar."
      />

      <div className="buyer-dashboard__grid">
        <ContentCard
          title="Pedidos recientes"
          action={{ to: paths.orders, label: 'Ver todos' }}
          className="buyer-dashboard__orders"
        >
          <RecentOrders />
        </ContentCard>
        <CartCard />
        <AccountCard user={user} />
        <ContentCard title="Favoritos" action={{ to: paths.favorites, label: 'Ver favoritos' }}>
          <p className="buyer-dashboard__muted">
            Guarda productos para comprarlos después o armar tus listas de compra.
          </p>
        </ContentCard>
        <WholesaleStatusCard />
      </div>

      <section className="buyer-dashboard__recommended" aria-labelledby="recommended-title">
        <h2 id="recommended-title">Te puede interesar</h2>
        <QueryBoundary query={recommended} loading={<ProductGridSkeleton count={4} />}>
          {(data) => <ProductGrid products={data.items} />}
        </QueryBoundary>
      </section>
    </div>
  )
}
