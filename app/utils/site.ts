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
  { to: '/ai-data/data-lake/layers', label: 'Lake layers' },
  { to: '/ai-data/data-lake/contracts', label: 'Data contracts' },
  { to: '/ai-data/data-lake/schema', label: 'Schema registry' },
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

/** The data lake, which is three flows rather than one. */
export const dataLakePages: SiteLink[] = [
  { to: '/ai-data/data-lake/layers', label: 'Layers' },
  { to: '/ai-data/data-lake/contracts', label: 'Contracts' },
  { to: '/ai-data/data-lake/schema', label: 'Schema' },
]

export interface SiteSection {
  hub: SiteLink
  /** Pages under the hub, in reading order. */
  links: SiteLink[]
}

/**
 * Sections are registered here rather than wired up per page, so the
 * breadcrumb, the section bar and the parent highlight in the top nav all
 * agree without anybody remembering to pass a prop.
 */
export const sections: SiteSection[] = [
  { hub: { to: '/ai-data', label: 'AI & Data' }, links: aiDataPages },
  { hub: { to: '/ai-data/data-lake', label: 'Data lake' }, links: dataLakePages },
]

/**
 * Every section a path sits inside, outermost first. Sections nest, so a page
 * two levels down belongs to both — and gets a bar and a breadcrumb entry for
 * each.
 */
export function sectionChain(path: string): SiteSection[] {
  return sections
    .filter(s => path === s.hub.to || path.startsWith(`${s.hub.to}/`))
    .sort((a, b) => a.hub.to.length - b.hub.to.length)
}

/** The innermost section a path belongs to, hub included. */
export function sectionFor(path: string): SiteSection | undefined {
  return sectionChain(path).at(-1)
}

/** True when a nav link is the current page, or an ancestor of it. */
export function isWithin(path: string, to: string): boolean {
  return path === to || path.startsWith(`${to}/`)
}

export const siteName = 'the spooky cluster'

/** Canonical origin. No trailing slash — everything below appends a path. */
export const siteUrl = 'https://spooky.rest'
export const footerLine = 'the spooky cluster · rack 01 · Aarhus'
