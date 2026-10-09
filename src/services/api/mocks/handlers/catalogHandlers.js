import { categories } from '../fixtures/categories'
import { ok } from '../router'

export const catalogHandlers = {
  'GET /categories': () => ok(categories),
}
