import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { AccountLayout, MainLayout, WholesaleLayout } from '@/app/layout'
import { PERMISSIONS } from '@/constants/permissions'
import { ProtectedRoute } from './ProtectedRoute'
import { RequirePermission } from './RequirePermission'
import { paths } from '@/constants/paths'

// Code splitting por página (ver docs/ARCHITECTURE.md §4).
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const ProductPage = lazy(() => import('@/features/catalog/pages/ProductPage'))
const SearchPage = lazy(() => import('@/features/catalog/pages/SearchPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const FavoritesPage = lazy(() => import('@/features/favorites/pages/FavoritesPage'))
const ListsPage = lazy(() => import('@/features/lists/pages/ListsPage'))
const ListDetailPage = lazy(() => import('@/features/lists/pages/ListDetailPage'))
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'))
const QuickOrderPage = lazy(() => import('@/features/wholesale/pages/QuickOrderPage'))
const FrequentProductsPage = lazy(() => import('@/features/wholesale/pages/FrequentProductsPage'))
const OrderConfirmationPage = lazy(() => import('@/features/orders/pages/OrderConfirmationPage'))
const AuthEntryPage = lazy(() => import('@/features/auth/pages/AuthEntryPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))
const BuyerDashboardPage = lazy(() => import('@/features/users/pages/BuyerDashboardPage'))
const ProfilePage = lazy(() => import('@/features/users/pages/ProfilePage'))
const AddressesPage = lazy(() => import('@/features/users/pages/AddressesPage'))
const WholesaleLandingPage = lazy(() => import('@/features/wholesale/pages/WholesaleLandingPage'))
const WholesaleRequestPage = lazy(() => import('@/features/wholesale/pages/WholesaleRequestPage'))
const WholesaleCatalogPage = lazy(() => import('@/features/wholesale/pages/WholesaleCatalogPage'))
const BenefitsPage = lazy(() => import('@/features/wholesale/pages/BenefitsPage'))
const WholesaleDashboardPage = lazy(
  () => import('@/features/wholesale/pages/WholesaleDashboardPage'),
)
const PromotionsPage = lazy(() => import('@/features/promotions/pages/PromotionsPage'))
const InspirationPage = lazy(() => import('@/features/inspiration/pages/InspirationPage'))
const SavedInspirationsPage = lazy(
  () => import('@/features/inspiration/pages/SavedInspirationsPage'),
)
const NotFoundPage = lazy(() => import('./NotFoundPage'))

// Catálogo de componentes: solo en desarrollo, no entra al build de producción.
const DesignSystemPage = import.meta.env.DEV
  ? lazy(() => import('@/app/dev/DesignSystemPage'))
  : null

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Públicas */}
        <Route index element={<HomePage />} />
        <Route path={paths.catalog} element={<CatalogPage />} />
        <Route path={paths.category(':categorySlug')} element={<CatalogPage />} />
        <Route path={paths.product(':slug')} element={<ProductPage />} />
        <Route path={paths.search} element={<SearchPage />} />
        <Route path={paths.promotions} element={<PromotionsPage />} />
        <Route path={paths.inspiration} element={<InspirationPage />} />
        <Route path={paths.wholesaleLanding} element={<WholesaleLandingPage />} />
        <Route path={paths.cart} element={<CartPage />} />
        <Route path={paths.login} element={<AuthEntryPage mode="login" />} />
        <Route path={paths.register} element={<AuthEntryPage mode="register" />} />
        <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.resetPassword} element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={paths.checkout} element={<CheckoutPage />} />
          <Route path={paths.savedInspirations} element={<SavedInspirationsPage />} />
          <Route path={paths.orderConfirmation(':orderId')} element={<OrderConfirmationPage />} />

          {/* Comprador */}
          <Route path={paths.account} element={<AccountLayout />}>
            <Route index element={<BuyerDashboardPage />} />
            <Route path={paths.orders} element={<OrdersPage />} />
            <Route path={paths.order(':orderId')} element={<OrderDetailPage />} />
            <Route path={paths.favorites} element={<FavoritesPage />} />
            <Route path={paths.lists} element={<ListsPage />} />
            <Route path={paths.list(':listId')} element={<ListDetailPage />} />
            <Route path={paths.addresses} element={<AddressesPage />} />
            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path={paths.wholesaleRequest} element={<WholesaleRequestPage />} />
          </Route>

          {/* Mayorista */}
          <Route element={<RequirePermission permission={PERMISSIONS.WHOLESALE_ACCESS} />}>
            <Route path={paths.wholesale} element={<WholesaleLayout />}>
              <Route index element={<WholesaleDashboardPage />} />
              <Route path={paths.wholesaleCatalog} element={<WholesaleCatalogPage />} />
              <Route path={paths.quickOrder} element={<QuickOrderPage />} />
              <Route path={paths.frequentProducts} element={<FrequentProductsPage />} />
              <Route path={paths.benefits} element={<BenefitsPage />} />
            </Route>
          </Route>

          {/* Admin (futuro): <Route element={<RequirePermission permission={PERMISSIONS.ADMIN_ACCESS} />}> */}
        </Route>

        {DesignSystemPage && <Route path="/_ds" element={<DesignSystemPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
