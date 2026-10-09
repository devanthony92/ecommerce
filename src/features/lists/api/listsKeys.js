export const listsKeys = {
  all: ['lists'],
  list: () => [...listsKeys.all, 'list'],
  detail: (id) => [...listsKeys.all, 'detail', id],
}
