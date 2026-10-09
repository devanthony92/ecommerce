import { authHandlers } from './handlers/authHandlers'
import { cartHandlers } from './handlers/cartHandlers'
import { catalogHandlers } from './handlers/catalogHandlers'
import { pricingHandlers } from './handlers/pricingHandlers'
import { defineRoutes } from './router'

// Cada fase agrega aquí los handlers de su dominio.
export const routes = defineRoutes({
  ...authHandlers,
  ...catalogHandlers,
  ...pricingHandlers,
  ...cartHandlers,
})
