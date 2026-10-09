// Pedidos de ejemplo del mayorista semilla (historial para el panel y la recompra).
import { buildPriceView } from '../pricing'
import { products } from './products'

const address = {
  id: 'a-seed-1',
  label: 'Tienda',
  recipient: 'Carlos Pérez',
  phone: '3004445566',
  department: 'Antioquia',
  city: 'Medellín',
  line1: 'Carrera 52 # 45-20, local 3',
  line2: null,
  notes: null,
  isDefault: true,
}

// El precio se calcula con el nivel que tenía al comprar (ORO).
const buyer = { role: 'WHOLESALE', wholesale: { levelCode: 'GOLD' } }

function line(slug, colorKey, size, quantity, productUnits = quantity) {
  const product = products.find((item) => item.slug === slug)
  const variant = product.variants.find(
    (item) => item.id === `${slug}-${colorKey}-${size}`.toLowerCase(),
  )
  const view = buildPriceView(product, buyer, productUnits)
  const image = product.images.find((item) => item.color === variant.attributes.color)
  return {
    productId: product.id,
    productSlug: product.slug,
    name: product.name,
    image: { url: image.url, alt: image.alt },
    variant: { id: variant.id, attributes: variant.attributes },
    quantity,
    unitPrice: view.unitPrice,
    listPrice: view.listPrice,
    lineTotal: view.unitPrice * quantity,
  }
}

function order(id, number, createdAt, status, items) {
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const subtotal = items.reduce((sum, item) => sum + item.listPrice * item.quantity, 0)
  return {
    id,
    userId: 'u-wholesale',
    number,
    createdAt,
    status,
    items: items.map(({ listPrice: _listPrice, ...item }) => item),
    summary: {
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discountTotal: subtotal - total,
      shipping: 0,
      total,
    },
    address,
    shipping: { id: 'standard', label: 'Envío estándar', estimatedDays: '3 a 5 días hábiles' },
    payment: { method: 'PSE', label: 'PSE' },
    notes: null,
  }
}

export const seedOrders = () => [
  order('o-seed-1', 'PED-000101', '2026-08-20T15:30:00Z', 'DELIVERED', [
    line('camiseta-basica', 'negro', 'M', 12, 24),
    line('camiseta-basica', 'blanco', 'L', 12, 24),
    line('gorra-beisbol', 'negro', 'Única', 12),
  ]),
  order('o-seed-2', 'PED-000112', '2026-09-12T18:10:00Z', 'DELIVERED', [
    line('jean-slim', 'denim', '32', 6, 12),
    line('jean-slim', 'denim', '30', 6, 12),
    line('camiseta-oversize', 'negro', 'L', 6),
  ]),
  order('o-seed-3', 'PED-000118', '2026-10-03T14:00:00Z', 'SHIPPED', [
    line('camiseta-basica', 'negro', 'M', 24),
    line('medias-pack', 'negro', 'Única', 12),
  ]),
]
