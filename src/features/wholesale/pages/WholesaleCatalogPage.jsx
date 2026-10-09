import { CatalogView } from '@/features/catalog'
import { useWholesaleProfile } from '../hooks/useWholesaleRequest'

// El mismo catálogo, mostrando todas las escalas con el descuento del nivel incluido.
export default function WholesaleCatalogPage() {
  const { data: profile } = useWholesaleProfile()
  const level = profile?.currentLevel

  return (
    <CatalogView
      title="Catálogo mayorista"
      description={
        level
          ? `Precios con tu nivel ${level.name} (−${level.discountPercent}%) ya aplicado, por cantidad.`
          : 'Precios con tu nivel ya aplicado, por cantidad.'
      }
      showTiers
    />
  )
}
