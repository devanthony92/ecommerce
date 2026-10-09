// Validación de UX; el backend valida de nuevo.
const NIT_RE = /^\d{6,10}(-\d)?$/
const PHONE_RE = /^3\d{9}$/

export function validateWholesaleRequest(values) {
  const errors = {}
  const text = (value) => value?.trim() ?? ''
  if (!text(values.tradeName)) errors.tradeName = 'Ingresa el nombre de tu negocio.'
  if (!text(values.legalName)) errors.legalName = 'Ingresa la razón social o tu nombre completo.'
  if (!NIT_RE.test(text(values.nit))) errors.nit = 'NIT o cédula sin puntos (ej. 900123456-7).'
  if (!PHONE_RE.test(text(values.phone))) errors.phone = 'Celular de 10 dígitos que empiece por 3.'
  if (!text(values.city)) errors.city = 'Ingresa la ciudad.'
  if (text(values.address).length < 5) errors.address = 'Ingresa la dirección del negocio.'
  if (!values.businessType) errors.businessType = 'Elige el tipo de negocio.'
  if (!values.estimatedMonthlyVolume) {
    errors.estimatedMonthlyVolume = 'Elige un volumen estimado.'
  }
  if (!values.categoriesOfInterest?.length) {
    errors.categoriesOfInterest = 'Elige al menos una categoría.'
  }
  return errors
}
