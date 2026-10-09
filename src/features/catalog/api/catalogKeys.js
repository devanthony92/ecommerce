export const catalogKeys = {
  all: ['catalog'],
  categories: () => [...catalogKeys.all, 'categories'],
  products: (params) => [...catalogKeys.all, 'products', params],
  product: (slug) => [...catalogKeys.all, 'product', slug],
  lookup: (q) => [...catalogKeys.all, 'lookup', q],
}
