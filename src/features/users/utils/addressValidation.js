// Validación de UX (mensajes inmediatos). El backend vuelve a validar todo.
const PHONE_RE = /^3\d{9}$/

export function validateAddress(values) {
  const errors = {}
  if (!values.label?.trim()) errors.label = 'Ponle un nombre, por ejemplo "Casa" o "Tienda".'
  if (!values.recipient?.trim()) errors.recipient = 'Ingresa quién recibe.'
  if (!PHONE_RE.test(values.phone?.trim() ?? '')) {
    errors.phone = 'Celular de 10 dígitos que empiece por 3.'
  }
  if (!values.department) errors.department = 'Elige un departamento.'
  if (!values.city?.trim()) errors.city = 'Ingresa la ciudad o municipio.'
  if ((values.line1?.trim().length ?? 0) < 5) errors.line1 = 'Ingresa la dirección completa.'
  return errors
}

export const formatAddress = (address) =>
  [address.line1, address.line2, `${address.city}, ${address.department}`]
    .filter(Boolean)
    .join(' · ')
