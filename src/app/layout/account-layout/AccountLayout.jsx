import { Outlet } from 'react-router'
import { SectionNav } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth, usePermission } from '@/features/auth'
import { PERMISSIONS } from '@/constants/permissions'
import { paths } from '@/constants/paths'
import './account-layout.scss'

const BASE_ITEMS = [
  { to: paths.account, label: 'Resumen', icon: 'user', end: true },
  { to: paths.orders, label: 'Pedidos', icon: 'bag' },
  { to: paths.favorites, label: 'Favoritos', icon: 'heart' },
  { to: paths.lists, label: 'Listas de compra', icon: 'inbox' },
  { to: paths.addresses, label: 'Direcciones', icon: 'info' },
  { to: paths.profile, label: 'Perfil', icon: 'user' },
]

export function AccountLayout() {
  const { logout } = useAuth()
  const canRequestWholesale = usePermission(PERMISSIONS.WHOLESALE_REQUEST)

  const items = canRequestWholesale
    ? [...BASE_ITEMS, { to: paths.wholesaleRequest, label: 'Ser mayorista', icon: 'chevron-right' }]
    : BASE_ITEMS

  return (
    <div className="account-layout">
      <aside className="account-layout__sidebar">
        <SectionNav items={items} label="Mi cuenta" />
        <Button variant="ghost" size="sm" className="account-layout__logout" onClick={logout}>
          Cerrar sesión
        </Button>
      </aside>
      <div className="account-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
