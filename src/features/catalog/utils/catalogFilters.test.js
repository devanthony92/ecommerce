import { countActiveFilters, parseFilters, serializeFilters } from './catalogFilters'

describe('catalogFilters', () => {
  it('lee filtros de la URL, incluidos parámetros repetidos', () => {
    const filters = parseFilters(
      new URLSearchParams('q=jean&size=M&size=L&color=Negro&minPrice=20000&sort=price_asc&page=2'),
    )
    expect(filters).toEqual({
      q: 'jean',
      sizes: ['M', 'L'],
      colors: ['Negro'],
      minPrice: 20000,
      maxPrice: null,
      sort: 'price_asc',
      page: 2,
    })
  })

  it('ignora valores inválidos', () => {
    const filters = parseFilters(new URLSearchParams('sort=hack&page=-3&minPrice=abc'))
    expect(filters.sort).toBe('relevance')
    expect(filters.page).toBe(1)
    expect(filters.minPrice).toBeNull()
  })

  it('serializa omitiendo valores por defecto (ida y vuelta estable)', () => {
    const query = 'size=M&size=L&color=Negro&sort=newest&page=3'
    expect(serializeFilters(parseFilters(new URLSearchParams(query))).toString()).toBe(query)
    expect(serializeFilters(parseFilters(new URLSearchParams(''))).toString()).toBe('')
  })

  it('cuenta filtros activos (rango de precio cuenta como uno)', () => {
    const filters = parseFilters(
      new URLSearchParams('size=M&color=Negro&minPrice=1&maxPrice=9&q=x'),
    )
    expect(countActiveFilters(filters)).toBe(3)
  })
})
