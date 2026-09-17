export interface SiteLink {
  to: string
  label: string
}

/** The top bar, left to right. */
export const navLinks: SiteLink[] = [
  { to: '/rack', label: 'Rack' },
  { to: '/compute', label: 'Compute' },
  { to: '/storage', label: 'Storage' },
  { to: '/security', label: 'Security' },
  { to: '/network', label: 'Network' },
  { to: '/ai-data', label: 'AI & Data' },
  { to: '/observability', label: 'Observability' },
  { to: '/radar', label: 'Radar' },
  { to: '/log', label: 'Log' },
  { to: '/about', label: 'About' },
]

/**
 * Reading order for the back/next pager. It wraps, so the last page
 * points at the first and nothing ever dead-ends.
 */
export const readingOrder: SiteLink[] = [
  { to: '/', label: 'Home' },
  { to: '/rack', label: 'The rack' },
  { to: '/compute', label: 'Compute' },
  { to: '/storage', label: 'Storage' },
  { to: '/security', label: 'Security' },
  { to: '/network', label: 'Network' },
  { to: '/ai-data', label: 'AI & Data' },
  { to: '/observability', label: 'Observability' },
  { to: '/radar', label: 'Tech radar' },
  { to: '/log', label: 'Build log' },
  { to: '/about', label: 'About' },
]

export const siteName = 'the spooky cluster'

/** Canonical origin. No trailing slash — everything below appends a path. */
export const siteUrl = 'https://spooky.rest'
export const footerLine = 'the spooky cluster · rack 01 · Aarhus'
