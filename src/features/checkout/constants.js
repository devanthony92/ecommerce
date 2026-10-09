// Medios de pago que ofrece la tienda. El backend valida cuáles acepta.
// Con Mercado Pago el pago se hace en su sitio: la tienda nunca pide datos bancarios.
export const PAYMENT_METHODS = [
  {
    value: 'MERCADO_PAGO',
    label: 'Mercado Pago',
    description: 'Tarjeta, PSE, Nequi o efectivo. Te llevamos a Mercado Pago para pagar.',
  },
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Pago contra entrega',
    description: 'Pagas en efectivo al recibir el pedido.',
  },
]
