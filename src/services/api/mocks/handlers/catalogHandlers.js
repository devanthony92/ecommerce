import { categories } from '../fixtures/categories'
import { products } from '../fixtures/products'
import { buildPriceView } from '../pricing'
import { fail, ok } from '../router'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

// Query params repetidos (?size=M&size=L) llegan como string o array.
const toArray = (value) => (value === undefined ? [] : [].concat(value))

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Con filtro de color, la imagen principal es la de ese color.
function toSummary(product, user, colorFilter = []) {
  const category = categories.find((c) => c.id === product.categoryId)
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: { id: category.id, slug: category.slug, name: category.name },
    image:
      product.images[product.colors.findIndex((color) => colorFilter.includes(color.name))] ??
      product.images[0],
    colors: product.colors.map(({ name, hex }) => ({ name, hex })),
    tags: product.tags,
    inStock: product.variants.some((variant) => variant.available),
    pricing: buildPriceView(product, user, 1),
  }
}

function toDetail(product, user) {
  return {
    ...toSummary(product, user),
    description: product.description,
    images: product.images,
    options: [
      { name: 'color', label: 'Color', values: product.colors.map((color) => color.name) },
      { name: 'size', label: 'Talla', values: product.sizes },
    ],
    variants: product.variants,
  }
}

function buildFacets(items) {
  const sizes = new Map()
  const colors = new Map()
  for (const { product } of items) {
    product.sizes.forEach((size) => sizes.set(size, (sizes.get(size) ?? 0) + 1))
    product.colors.forEach((color) => {
      const entry = colors.get(color.name) ?? { value: color.name, hex: color.hex, count: 0 }
      entry.count += 1
      colors.set(color.name, entry)
    })
  }
  const prices = items.map((item) => item.summary.pricing.unitPrice)
  return {
    sizes: [...sizes].map(([value, count]) => ({ value, count })),
    colors: [...colors.values()],
    priceRange: prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 },
  }
}

const SORTERS = {
  relevance: (a, b) =>
    Number(b.product.tags.includes('featured')) - Number(a.product.tags.includes('featured')) ||
    b.product.sold - a.product.sold,
  price_asc: (a, b) => a.summary.pricing.unitPrice - b.summary.pricing.unitPrice,
  price_desc: (a, b) => b.summary.pricing.unitPrice - a.summary.pricing.unitPrice,
  newest: (a, b) => b.product.createdAt.localeCompare(a.product.createdAt),
  bestsellers: (a, b) => b.product.sold - a.product.sold,
}

export const catalogHandlers = {
  'GET /categories': () => ok(categories),

  // Pedido rápido: busca variantes por SKU o por nombre. Va antes de /products/:slug.
  'GET /products/lookup': ({ query, user }) => {
    const q = normalize(query.q ?? '').trim()
    if (q.length < 2) return ok([])
    const results = []
    for (const product of products) {
      const nameMatches = normalize(product.name).includes(q)
      for (const variant of product.variants) {
        if (!nameMatches && !normalize(variant.sku).includes(q)) continue
        const image =
          product.images.find((item) => item.color === variant.attributes.color) ??
          product.images[0]
        results.push({
          variantId: variant.id,
          sku: variant.sku,
          productSlug: product.slug,
          productName: product.name,
          attributes: variant.attributes,
          available: variant.available,
          stock: variant.stock,
          image: { url: image.url, alt: image.alt },
          pricing: buildPriceView(product, user, 1),
        })
        if (results.length >= 12) return ok(results)
      }
    }
    return ok(results)
  },

  'GET /products/:slug': ({ params, user }) => {
    const product = products.find((item) => item.slug === params.slug)
    return product
      ? ok(toDetail(product, user))
      : fail(404, 'PRODUCT_NOT_FOUND', 'El producto no existe o ya no está disponible.')
  },

  'GET /products': ({ query, user }) => {
    const q = normalize(query.q ?? '').trim()
    const category = categories.find((c) => c.slug === query.category)
    const sizes = toArray(query.size)
    const colors = toArray(query.color)
    const minPrice = Number(query.minPrice) || 0
    const maxPrice = Number(query.maxPrice) || Infinity
    const tag = query.tag
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(MAX_PAGE_SIZE, Number(query.pageSize) || DEFAULT_PAGE_SIZE)

    // Base: búsqueda + categoría + tag. Las facetas se calculan sobre esta base
    // para que las opciones no desaparezcan al seleccionar una.
    const base = products
      .filter((product) => !category || product.categoryId === category.id)
      .filter((product) => !tag || product.tags.includes(tag))
      .filter((product) => {
        if (!q) return true
        const categoryName = categories.find((c) => c.id === product.categoryId).name
        return normalize(`${product.name} ${categoryName}`).includes(q)
      })
      .map((product) => ({ product, summary: toSummary(product, user, colors) }))

    const filtered = base
      .filter(({ product }) => !sizes.length || product.sizes.some((s) => sizes.includes(s)))
      .filter(
        ({ product }) => !colors.length || product.colors.some((c) => colors.includes(c.name)),
      )
      .filter(({ summary }) => {
        const price = summary.pricing.unitPrice
        return price >= minPrice && price <= maxPrice
      })
      .sort(SORTERS[query.sort] ?? SORTERS.relevance)

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize

    return ok({
      items: filtered.slice(start, start + pageSize).map((item) => item.summary),
      page,
      pageSize,
      total,
      totalPages,
      facets: buildFacets(base),
    })
  },
}
