import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryBoundary } from './QueryBoundary'

const base = {
  isPending: false,
  isError: false,
  isFetching: false,
  data: undefined,
  refetch: vi.fn(),
}

function renderBoundary(query) {
  return render(
    <QueryBoundary query={{ ...base, ...query }} isEmpty={(data) => data.length === 0}>
      {(data) => <p>{data.length} productos</p>}
    </QueryBoundary>,
  )
}

describe('QueryBoundary', () => {
  it('muestra loading', () => {
    renderBoundary({ isPending: true })
    expect(screen.getByRole('status')).toHaveTextContent('Cargando')
  })

  it('muestra error con reintentar', async () => {
    const refetch = vi.fn()
    renderBoundary({ isError: true, error: { message: 'Sin conexión' }, refetch })
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('muestra vacío', () => {
    renderBoundary({ data: [] })
    expect(
      screen.getByRole('heading', { name: 'No hay nada por aquí todavía' }),
    ).toBeInTheDocument()
  })

  it('muestra datos y los mantiene si falla un refetch', () => {
    renderBoundary({ data: [1, 2], isError: true, error: { message: 'x' } })
    expect(screen.getByText('2 productos')).toBeInTheDocument()
  })
})
