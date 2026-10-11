import { keywordsSummary } from './keywordsSummary'

const saved = (...keywords) => keywords.map((keyword) => ({ keyword }))

describe('keywordsSummary', () => {
  it('ordena por popularidad y muestra hasta tres', () => {
    expect(keywordsSummary(saved('Verano', 'Denim', 'Denim'))).toBe('Denim y Verano')
    expect(keywordsSummary(saved('A', 'B', 'C'))).toBe('A, B y C')
    expect(keywordsSummary(saved('Denim'))).toBe('Denim')
    expect(keywordsSummary([])).toBe('')
  })

  it('con más de tres muestra las dos primeras y cuántas faltan', () => {
    expect(
      keywordsSummary(
        saved('Naturaleza', 'Yellowstone', 'Naturaleza', 'Lago', 'Yellowstone', 'Río'),
      ),
    ).toBe('Naturaleza, Yellowstone y 2 más')
  })
})
