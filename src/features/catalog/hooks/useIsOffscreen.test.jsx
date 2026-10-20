import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useIsOffscreen } from './useIsOffscreen'

function Probe() {
  const ref = useRef(null)
  const isOffscreen = useIsOffscreen(ref)
  return <p ref={ref}>{isOffscreen ? 'fuera' : 'visible'}</p>
}

describe('useIsOffscreen', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('se asume visible sin IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByText('visible')).toBeInTheDocument()
  })

  it('sigue lo que reporta el observador y se desconecta al desmontar', () => {
    let notify
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback) {
          notify = callback
        }
        observe() {}
        disconnect = disconnect
      },
    )

    const { unmount } = render(<Probe />)
    act(() => notify([{ isIntersecting: false }]))
    expect(screen.getByText('fuera')).toBeInTheDocument()
    act(() => notify([{ isIntersecting: true }]))
    expect(screen.getByText('visible')).toBeInTheDocument()

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
