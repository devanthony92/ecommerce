import { CatalogView } from '@/features/catalog'

// El mismo catálogo, mostrando todas las escalas por cantidad.
export default function WholesaleCatalogPage() {
  return (
    <CatalogView
      title="Catálogo mayorista"
      description="Tu precio por cantidad, sumando tallas y colores del mismo producto."
      showTiers
    />
  )
}
