// Programa mayorista. En el backend real se configura desde el panel.
export const program = {
  // Valor mínimo de los productos por pedido (sin envío).
  minimumOrder: 120000,
  benefits: [
    { code: 'TIER_PRICES', label: 'Precios por volumen desde media docena' },
    { code: 'QUICK_ORDER', label: 'Pedido rápido por referencia' },
    { code: 'LISTS', label: 'Listas de compra y recompra en un clic' },
    { code: 'PRIORITY_SUPPORT', label: 'Asesor comercial' },
  ],
}
