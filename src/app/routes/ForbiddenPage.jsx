import { Link } from 'react-router'
import { PageHeader } from '@/components/layout'
import { Can } from '@/features/auth'
import { PERMISSIONS } from '@/constants/permissions'
import { paths } from './paths'

export function ForbiddenPage() {
  return (
    <>
      <PageHeader title="No tienes acceso a esta sección" />
      <Can
        permission={PERMISSIONS.WHOLESALE_REQUEST}
        fallback={<Link to={paths.home}>Volver al inicio</Link>}
      >
        <Link to={paths.wholesaleRequest}>Solicitar cuenta mayorista</Link>
      </Can>
    </>
  )
}
