import { passwordError, validateLogin, validateRegister } from './authValidation'

describe('authValidation', () => {
  it('exige correo válido y contraseña en el login', () => {
    expect(validateLogin({ email: 'x', password: '' })).toEqual({
      email: 'Ingresa un correo válido.',
      password: 'Ingresa tu contraseña.',
    })
    expect(validateLogin({ email: 'a@b.co', password: '1' })).toEqual({})
  })

  it('contraseña: 8+ caracteres con letras y números', () => {
    expect(passwordError('abc')).toBe('Mínimo 8 caracteres.')
    expect(passwordError('abcdefgh')).toBe('Usa letras y números.')
    expect(passwordError('trama2026')).toBeNull()
  })

  it('registro: confirma contraseña y términos', () => {
    const errors = validateRegister({
      name: 'Ana',
      email: 'ana@mail.com',
      password: 'trama2026',
      confirmPassword: 'trama2027',
      acceptTerms: false,
    })
    expect(Object.keys(errors)).toEqual(['confirmPassword', 'acceptTerms'])
  })
})
