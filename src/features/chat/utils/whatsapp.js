// El número llega del backend (/chat/status) solo con dígitos e indicativo: 573001234567.
const GREETING = 'Hola, vengo del asistente de la tienda Trama y necesito ayuda.'

// El mensaje inicial es fijo: nunca lleva datos de la conversación ni del usuario.
export function whatsappUrl(number) {
  return `https://wa.me/${number}?text=${encodeURIComponent(GREETING)}`
}

// 573001234567 → "+57 300 123 4567". Otros países: "+" y los dígitos.
export function formatWhatsapp(number) {
  const colombia = /^57(\d{3})(\d{3})(\d{4})$/.exec(number)
  return colombia ? `+57 ${colombia[1]} ${colombia[2]} ${colombia[3]}` : `+${number}`
}
