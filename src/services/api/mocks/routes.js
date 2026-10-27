import { addressHandlers } from './handlers/addressHandlers'
import { authHandlers } from './handlers/authHandlers'
import { cartHandlers } from './handlers/cartHandlers'
import { catalogHandlers } from './handlers/catalogHandlers'
import { chatHandlers } from './handlers/chatHandlers'
import { inspirationHandlers } from './handlers/inspirationHandlers'
import { listHandlers } from './handlers/listHandlers'
import { orderHandlers } from './handlers/orderHandlers'
import { pricingHandlers } from './handlers/pricingHandlers'
import { promotionHandlers } from './handlers/promotionHandlers'
import { wholesaleHandlers } from './handlers/wholesaleHandlers'
import { defineRoutes } from './router'

// Cada fase agrega aquí los handlers de su dominio.
export const routes = defineRoutes({
  ...authHandlers,
  ...addressHandlers,
  ...catalogHandlers,
  ...pricingHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...wholesaleHandlers,
  ...listHandlers,
  ...promotionHandlers,
  ...inspirationHandlers,
  ...chatHandlers,
})
