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
  { to: '/radar', label: 'Radar' },
  { to: '/log', label: 'Log' },
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
  { to: '/radar', label: 'Tech radar' },
  { to: '/log', label: 'Build log' },
]

export const siteName = 'the spooky cluster'
export const footerLine = 'the spooky cluster · rack 01 · Aarhus'
