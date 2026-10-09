import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { AccountLayout, MainLayout, WholesaleLayout } from '@/app/layout'
import { PERMISSIONS } from '@/constants/permissions'
import { RequireAuth } from './RequireAuth'
import { RequirePermission } from './RequirePermission'
import { paths } from '@/constants/paths'

// Code splitting por página. Cada fase reemplaza sus ComingSoonPage (ver docs/ARCHITECTURE.md §4).
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const ProductPage = lazy(() => import('@/features/catalog/pages/ProductPage'))
const SearchPage = lazy(() => import('@/features/catalog/pages/SearchPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/features/orders/pages/OrderConfirmationPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))
const BuyerDashboardPage = lazy(() => import('@/features/users/pages/BuyerDashboardPage'))
const ProfilePage = lazy(() => import('@/features/users/pages/ProfilePage'))
const AddressesPage = lazy(() => import('@/features/users/pages/AddressesPage'))
const WholesaleLandingPage = lazy(() => import('@/features/wholesale/pages/WholesaleLandingPage'))
const WholesaleRequestPage = lazy(() => import('@/features/wholesale/pages/WholesaleRequestPage'))
const WholesaleDashboardPage = lazy(
  () => import('@/features/wholesale/pages/WholesaleDashboardPage'),
)
const ComingSoonPage = lazy(() => import('./ComingSoonPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

// Catálogo de componentes: solo en desarrollo, no entra al build de producción.
const DesignSystemPage = import.meta.env.DEV
  ? lazy(() => import('@/app/dev/DesignSystemPage'))
  : null

const soon = (title, phase) => <ComingSoonPage title={title} phase={phase} />

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
        <Route path={paths.promotions} element={soon('Ofertas', 14)} />
        <Route path={paths.wholesaleLanding} element={<WholesaleLandingPage />} />
        <Route path={paths.cart} element={<CartPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.resetPassword} element={<ResetPasswordPage />} />

        <Route element={<RequireAuth />}>
          <Route path={paths.checkout} element={<CheckoutPage />} />
          <Route path={paths.orderConfirmation(':orderId')} element={<OrderConfirmationPage />} />

          {/* Comprador */}
          <Route path={paths.account} element={<AccountLayout />}>
            <Route index element={<BuyerDashboardPage />} />
            <Route path={paths.orders} element={soon('Pedidos', 12)} />
            <Route path={paths.order(':orderId')} element={soon('Detalle del pedido', 12)} />
            <Route path={paths.favorites} element={soon('Favoritos', 13)} />
            <Route path={paths.lists} element={soon('Listas de compra', 13)} />
            <Route path={paths.list(':listId')} element={soon('Lista de compra', 13)} />
            <Route path={paths.addresses} element={<AddressesPage />} />
            <Route path={paths.profile} element={<ProfilePage />} />
            <Route path={paths.wholesaleRequest} element={<WholesaleRequestPage />} />
          </Route>

          {/* Mayorista */}
          <Route element={<RequirePermission permission={PERMISSIONS.WHOLESALE_ACCESS} />}>
            <Route path={paths.wholesale} element={<WholesaleLayout />}>
              <Route index element={<WholesaleDashboardPage />} />
              <Route path={paths.wholesaleCatalog} element={soon('Catálogo mayorista', 11)} />
              <Route path={paths.quickOrder} element={soon('Pedido rápido', 12)} />
              <Route path={paths.frequentProducts} element={soon('Productos frecuentes', 12)} />
              <Route path={paths.benefits} element={soon('Beneficios', 11)} />
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
