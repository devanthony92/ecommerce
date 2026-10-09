import { CatalogView } from '@/features/catalog'
import { PromotionBanners } from '../components/promotion-banners/PromotionBanners'

const ON_SALE = { onSale: true }

// Productos con precio de temporada, con los mismos filtros del catálogo.
export default function PromotionsPage() {
  return (
    <CatalogView
      title="Ofertas"
      description="Precios de temporada por tiempo limitado. Para mayoristas, se suman a los precios por volumen."
      baseParams={ON_SALE}
      intro={<PromotionBanners exclude="SEASON" />}
    />
  )
}
