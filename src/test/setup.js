import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// jsdom no implementa scroll.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
