import { authHandlers } from './handlers/authHandlers'
import { catalogHandlers } from './handlers/catalogHandlers'
import { defineRoutes } from './router'

// Cada fase agrega aquí los handlers de su dominio.
export const routes = defineRoutes({
  ...authHandlers,
  ...catalogHandlers,
})
