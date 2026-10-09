import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { MainLayout } from '@/components/layout'
import { PERMISSIONS } from '@/constants/permissions'
import { RequireAuth } from './RequireAuth'
import { RequirePermission } from './RequirePermission'
import { paths } from './paths'

// Code splitting por página. Cada fase agrega aquí sus rutas (ver docs/ARCHITECTURE.md §4).
const HomePage = lazy(() => import('@/features/home/pages/HomePage'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage'))
const ProductPage = lazy(() => import('@/features/catalog/pages/ProductPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const BuyerDashboardPage = lazy(() => import('@/features/users/pages/BuyerDashboardPage'))
const WholesaleDashboardPage = lazy(
  () => import('@/features/wholesale/pages/WholesaleDashboardPage'),
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
        <Route path={paths.cart} element={<CartPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />

        {/* Comprador */}
        <Route element={<RequireAuth />}>
          <Route path={paths.account} element={<BuyerDashboardPage />} />

          {/* Mayorista */}
          <Route element={<RequirePermission permission={PERMISSIONS.WHOLESALE_ACCESS} />}>
            <Route path={paths.wholesale} element={<WholesaleDashboardPage />} />
          </Route>

          {/* Admin (futuro): <Route element={<RequirePermission permission={PERMISSIONS.ADMIN_ACCESS} />}> */}
        </Route>

        {DesignSystemPage && <Route path="/_ds" element={<DesignSystemPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
