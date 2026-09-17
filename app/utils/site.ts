export interface SiteLink {
  to: string
  label: string
}

/** The top bar, left to right. */
export const navLinks: SiteLink[] = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/rack', label: 'Rack' },
  { to: '/compute', label: 'Compute' },
  { to: '/storage', label: 'Storage' },
  { to: '/security', label: 'Security' },
  { to: '/network', label: 'Network' },
  { to: '/ai-data', label: 'AI & Data' },
  { to: '/observability', label: 'Observability' },
  { to: '/radar', label: 'Radar' },
  { to: '/log', label: 'Log' },
]

/**
 * Reading order for the back/next pager. It wraps, so the last page
 * points at the first and nothing ever dead-ends.
 */
export const readingOrder: SiteLink[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/rack', label: 'The rack' },
  { to: '/compute', label: 'Compute' },
  { to: '/storage', label: 'Storage' },
  { to: '/security', label: 'Security' },
  { to: '/network', label: 'Network' },
  { to: '/ai-data', label: 'AI & Data' },
  { to: '/ai-data/models', label: 'Local models' },
  { to: '/ai-data/data-lake', label: 'Data lake' },
  { to: '/ai-data/agents', label: 'Agents' },
  { to: '/ai-data/mcp', label: 'MCP' },
  { to: '/ai-data/stores', label: 'Data stores' },
  { to: '/observability', label: 'Observability' },
  { to: '/radar', label: 'Tech radar' },
  { to: '/log', label: 'Build log' },
]

/** The AI & Data section. The hub at /ai-data links to each of these. */
export const aiDataPages: SiteLink[] = [
  { to: '/ai-data/models', label: 'Local models' },
  { to: '/ai-data/data-lake', label: 'Data lake' },
  { to: '/ai-data/agents', label: 'Agents' },
  { to: '/ai-data/mcp', label: 'MCP' },
  { to: '/ai-data/stores', label: 'Data stores' },
]

export const siteName = 'the spooky cluster'

/** Canonical origin. No trailing slash — everything below appends a path. */
export const siteUrl = 'https://spooky.rest'
export const footerLine = 'the spooky cluster · rack 01 · Aarhus'
