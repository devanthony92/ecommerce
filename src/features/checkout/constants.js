// Medios de pago que ofrece la tienda. El backend valida cuáles acepta.
// Mientras no exista pasarela real, todos son simulados: nunca se piden datos de tarjeta.
export const PAYMENT_METHODS = [
  {
    value: 'CARD',
    label: 'Tarjeta débito o crédito',
    description: 'Pago en línea a través de la pasarela.',
  },
  {
    value: 'PSE',
    label: 'PSE',
    description: 'Pago desde tu cuenta bancaria.',
  },
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Pago contra entrega',
    description: 'Pagas en efectivo al recibir el pedido.',
  },
]
