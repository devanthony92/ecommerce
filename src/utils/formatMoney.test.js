import { formatMoney } from './formatMoney'

// Intl usa espacio duro entre símbolo y número.
const normalize = (text) => text.replace(/\s/g, ' ')

describe('formatMoney', () => {
  it('formatea enteros COP con separador de miles y sin decimales', () => {
    expect(normalize(formatMoney(35000))).toBe('$ 35.000')
    expect(normalize(formatMoney(8450000))).toBe('$ 8.450.000')
  })

  it('trata null/undefined como 0', () => {
    expect(normalize(formatMoney(undefined))).toBe('$ 0')
  })
})
