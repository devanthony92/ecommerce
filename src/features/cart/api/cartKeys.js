export const cartKeys = {
  all: ['cart'],
  server: () => [...cartKeys.all, 'server'],
  guest: (items) => [...cartKeys.all, 'guest', items],
}
