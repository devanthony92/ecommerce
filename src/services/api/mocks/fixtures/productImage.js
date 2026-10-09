// Ilustraciones SVG generadas en el mock (sin archivos ni servicios externos).
// Se devuelven como data URI, igual que una URL de imagen real.

const SHAPES = {
  tshirt:
    '<path d="M150 95 108 112 62 172l42 26 20-20v232h152V178l20 20 42-26-46-60-42-17c-12 22-30 32-50 32s-38-10-50-32Z"/>',
  shirt:
    '<path d="M150 90 106 110 58 300l40 12 26-120v218h152V202l26 120 40-12-48-190-44-20-50 40-50-40Z"/><path d="M200 130v280M150 90l50 40 50-40" fill="none"/>',
  pants:
    '<path d="M128 80h144l18 340h-74l-16-220-16 220h-74l18-340Z"/><path d="M128 110h144" fill="none"/>',
  jacket:
    '<path d="M148 88 104 108 66 330l40 8 22-140v232h144V206l22 132 40-8-38-222-44-20-26 30h-52l-26-30Z"/><path d="M200 120v310" fill="none"/>',
  cap: '<path d="M108 300c0-80 40-134 92-134s92 54 92 134H108Z"/><path d="M108 300c-30 2-52 14-60 30 70 6 160 0 244-30H108Z"/><circle cx="200" cy="168" r="8"/>',
  bag: '<path d="M110 190h180l14 230H96l14-230Z"/><path d="M160 190v-30a40 40 0 0 1 80 0v30" fill="none"/>',
}

function darken(hex, amount = 0.25) {
  const value = Number.parseInt(hex.slice(1), 16)
  const channel = (shift) => Math.round(((value >> shift) & 255) * (1 - amount))
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`
}

export function productImage(shape, hex) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#f1f0ec"/><g fill="${hex}" stroke="${darken(hex)}" stroke-width="4" stroke-linejoin="round">${SHAPES[shape]}</g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
