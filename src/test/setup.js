import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

// jsdom no implementa scroll.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
