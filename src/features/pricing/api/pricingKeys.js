export const pricingKeys = {
  all: ['pricing'],
  quote: (variantId, quantity) => [...pricingKeys.all, 'quote', variantId, quantity],
}
