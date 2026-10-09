// Deben coincidir con los que devuelve el backend en /users/me (permissions[]).
export const PERMISSIONS = Object.freeze({
  CART_MANAGE: 'cart.manage',
  CHECKOUT_CREATE: 'checkout.create',
  ORDERS_VIEW: 'orders.view',
  FAVORITES_MANAGE: 'favorites.manage',
  LISTS_MANAGE: 'lists.manage',
  WHOLESALE_REQUEST: 'wholesale.request',
  WHOLESALE_ACCESS: 'wholesale.access',
  WHOLESALE_QUICK_ORDER: 'wholesale.quick-order',
  ADMIN_ACCESS: 'admin.access',
})
