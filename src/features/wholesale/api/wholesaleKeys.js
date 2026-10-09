export const wholesaleKeys = {
  all: ['wholesale'],
  program: () => [...wholesaleKeys.all, 'program'],
  request: () => [...wholesaleKeys.all, 'request'],
  profile: () => [...wholesaleKeys.all, 'profile'],
  frequent: () => [...wholesaleKeys.all, 'frequent'],
}
