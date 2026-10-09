// Salida a un sitio externo (p. ej. la pasarela de pago). Aislado para poder simularlo en tests.
export function redirectTo(url) {
  window.location.assign(url)
}
