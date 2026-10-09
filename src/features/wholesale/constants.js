export const BUSINESS_TYPES = [
  { value: 'PHYSICAL_STORE', label: 'Tienda física' },
  { value: 'ONLINE_STORE', label: 'Tienda en línea' },
  { value: 'CATALOG', label: 'Venta por catálogo' },
  { value: 'DISTRIBUTOR', label: 'Distribuidor' },
  { value: 'OTHER', label: 'Otro' },
]

export const MONTHLY_VOLUMES = [
  { value: 'UNDER_1M', label: 'Menos de $1.000.000' },
  { value: '1M_5M', label: '$1.000.000 a $5.000.000' },
  { value: '5M_10M', label: '$5.000.000 a $10.000.000' },
  { value: 'OVER_10M', label: 'Más de $10.000.000' },
]

export const labelOf = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value
