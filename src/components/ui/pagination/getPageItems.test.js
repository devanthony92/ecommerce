import { getPageItems } from './getPageItems'

describe('getPageItems', () => {
  it('muestra todas si son pocas', () => {
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('agrega saltos alrededor de la página actual', () => {
    expect(getPageItems(5, 10)).toEqual([1, 'gap-4', 4, 5, 6, 'gap-10', 10])
    expect(getPageItems(1, 10)).toEqual([1, 2, 'gap-10', 10])
  })
})
