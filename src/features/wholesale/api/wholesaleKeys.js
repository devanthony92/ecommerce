export const wholesaleKeys = {
  all: ['wholesale'],
  levels: () => [...wholesaleKeys.all, 'levels'],
  request: () => [...wholesaleKeys.all, 'request'],
  profile: () => [...wholesaleKeys.all, 'profile'],
}
