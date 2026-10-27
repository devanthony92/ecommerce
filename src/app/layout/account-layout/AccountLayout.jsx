import { Outlet } from 'react-router'
import { SectionNav } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { ROLES } from '@/constants/statuses'
import { paths } from '@/constants/paths'
import './account-layout.scss'

const BASE_ITEMS = [
  { to: paths.account, label: 'Resumen', icon: 'user', end: true },
  { to: paths.orders, label: 'Pedidos', icon: 'bag' },
  { to: paths.favorites, label: 'Favoritos', icon: 'heart' },
  { to: paths.lists, label: 'Listas de compra', icon: 'inbox' },
  { to: paths.savedInspirations, label: 'Inspiraciones guardadas', icon: 'bookmark' },
  { to: paths.addresses, label: 'Direcciones', icon: 'info' },
  { to: paths.profile, label: 'Perfil', icon: 'user' },
]

export function AccountLayout() {
  const { logout, currentUser: user } = useAuth()
  // Compradores: acceso a su solicitud (o a pedirla). El mayorista tiene su propio panel.
  const requestLabel = user.wholesale?.requestStatus ? 'Solicitud mayorista' : 'Ser mayorista'
  const items =
    user.role === ROLES.WHOLESALE
      ? BASE_ITEMS
      : [...BASE_ITEMS, { to: paths.wholesaleRequest, label: requestLabel, icon: 'chevron-right' }]

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
