import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { paths } from './paths'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página no encontrada" description="La dirección no existe o cambió." />
      <Link to={paths.home}>Volver al inicio</Link>
    </>
  )
}
