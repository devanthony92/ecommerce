import { Outlet } from 'react-router'
import { SectionNav } from '@/components/layout'
import { Badge } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { paths } from '@/constants/paths'
import './wholesale-layout.scss'

const ITEMS = [
  { to: paths.wholesale, label: 'Panel', end: true },
  { to: paths.wholesaleCatalog, label: 'Catálogo mayorista' },
  { to: paths.quickOrder, label: 'Pedido rápido' },
  { to: paths.frequentProducts, label: 'Frecuentes' },
  { to: paths.benefits, label: 'Beneficios' },
]

export function WholesaleLayout() {
  const { currentUser: user } = useAuth()

  return (
    <div className="wholesale-layout">
      <div className="wholesale-layout__banner">
        <Badge tone="wholesale">Cuenta mayorista</Badge>
        <p className="wholesale-layout__greeting">{user.name}</p>
      </div>
      <SectionNav items={ITEMS} label="Panel mayorista" tone="wholesale" orientation="horizontal" />
      <div className="wholesale-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
