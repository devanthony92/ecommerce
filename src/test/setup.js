import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'

// Tests de integración (páginas lazy + varias peticiones al mock): bajo carga
// de la suite en paralelo, 1 s por defecto se queda corto.
configure({ asyncUtilTimeout: 3000 })

// jsdom no implementa scroll.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
