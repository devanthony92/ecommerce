export const SESSION_STATUS = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  ANONYMOUS: 'ANONYMOUS',
  AUTHENTICATED: 'AUTHENTICATED',
})

export const ROLES = Object.freeze({
  BUYER: 'BUYER',
  WHOLESALE: 'WHOLESALE',
  ADMIN: 'ADMIN',
})

// `badge` es el modificador BEM que usará el componente Badge (fase 2).
export const WHOLESALE_REQUEST_STATUS = Object.freeze({
  PENDING: { value: 'PENDING', label: 'Pendiente', badge: 'warning' },
  UNDER_REVIEW: { value: 'UNDER_REVIEW', label: 'En revisión', badge: 'warning' },
  APPROVED: { value: 'APPROVED', label: 'Aprobada', badge: 'success' },
  REJECTED: { value: 'REJECTED', label: 'Rechazada', badge: 'danger' },
  SUSPENDED: { value: 'SUSPENDED', label: 'Suspendida', badge: 'danger' },
})

export const ORDER_STATUS = Object.freeze({
  PENDING_PAYMENT: { value: 'PENDING_PAYMENT', label: 'Pendiente de pago', badge: 'warning' },
  PAID: { value: 'PAID', label: 'Pagado', badge: 'success' },
  PROCESSING: { value: 'PROCESSING', label: 'En preparación', badge: 'info' },
  SHIPPED: { value: 'SHIPPED', label: 'Enviado', badge: 'info' },
  DELIVERED: { value: 'DELIVERED', label: 'Entregado', badge: 'success' },
  CANCELLED: { value: 'CANCELLED', label: 'Cancelado', badge: 'danger' },
})
