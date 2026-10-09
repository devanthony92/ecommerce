export const ordersKeys = {
  all: ['orders'],
  list: (params) => [...ordersKeys.all, 'list', params],
  detail: (id) => [...ordersKeys.all, 'detail', id],
}
