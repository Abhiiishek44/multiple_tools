export type AppRoute =
  | { name: 'dashboard' }
  | { name: 'catalog'; category?: string }
  | { name: 'api-docs' }
  | { name: 'python-sdk' }
  | { name: 'login' }
  | { name: 'tool'; toolName: string }
  | { name: 'job'; jobId: string }

export function routeFromLocation(pathname = window.location.pathname): AppRoute {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 1 && parts[0] === 'dashboard') return { name: 'dashboard' }
  if (parts.length === 1 && parts[0] === 'tools') return { name: 'catalog' }
  if (parts.length === 2 && parts[0] === 'developers' && parts[1] === 'api') return { name: 'api-docs' }
  if (parts.length === 2 && parts[0] === 'developers' && parts[1] === 'python') return { name: 'python-sdk' }
  if (parts.length === 3 && parts[0] === 'tools' && parts[1] === 'category') return { name: 'catalog', category: decodeSegment(parts[2]) }
  if (parts.length === 1 && parts[0] === 'login') return { name: 'login' }
  if (parts.length === 2 && parts[0] === 'tools') return { name: 'tool', toolName: decodeSegment(parts[1]) }
  if (parts.length === 2 && parts[0] === 'jobs') return { name: 'job', jobId: decodeSegment(parts[1]) }
  return { name: 'dashboard' }
}

export function routePath(route: AppRoute) {
  if (route.name === 'login') return '/login'
  if (route.name === 'catalog') return route.category ? `/tools/category/${encodeURIComponent(route.category)}` : '/tools'
  if (route.name === 'api-docs') return '/developers/api'
  if (route.name === 'python-sdk') return '/developers/python'
  if (route.name === 'tool') return `/tools/${encodeURIComponent(route.toolName)}`
  if (route.name === 'job') return `/jobs/${encodeURIComponent(route.jobId)}`
  return '/dashboard'
}

function decodeSegment(value: string) {
  try { return decodeURIComponent(value) } catch { return value }
}
