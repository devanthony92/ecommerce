import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuantityStepper } from './QuantityStepper'

function Harness(props) {
  const [value, setValue] = useState(props.initial ?? 5)
  return <QuantityStepper value={value} onChange={setValue} {...props} />
}

describe('QuantityStepper', () => {
  it('aumenta y disminuye respetando min y max', async () => {
    const user = userEvent.setup()
    render(<Harness initial={2} min={1} max={3} />)
    const input = screen.getByRole('spinbutton', { name: 'Cantidad' })

    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    expect(input).toHaveValue('3')
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Disminuir cantidad' }))
    await user.click(screen.getByRole('button', { name: 'Disminuir cantidad' }))
    expect(input).toHaveValue('1')
    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled()
  })

  it('valida lo escrito al salir del campo', async () => {
    const user = userEvent.setup()
    render(<Harness initial={5} max={24} />)
    const input = screen.getByRole('spinbutton', { name: 'Cantidad' })

    await user.clear(input)
    await user.type(input, '99')
    await user.tab()
    expect(input).toHaveValue('24')

    await user.clear(input)
    await user.tab()
    expect(input).toHaveValue('24')
  })
})
