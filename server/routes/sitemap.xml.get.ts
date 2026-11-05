import { projects } from '../../app/utils/projects'
import { radarEntries } from '../../app/utils/radar'
import { readingOrder, siteUrl } from '../../app/utils/site'

/**
 * Built from the same lists the navigation uses, so a new page appears here
 * by existing rather than by being remembered.
 */
export default defineEventHandler((event) => {
  const paths = [
    ...readingOrder.map(p => p.to),
    ...radarEntries.map(e => `/radar/${e.slug}`),
    ...projects.map(p => `/projects/${p.slug}`),
  ]

  const urls = paths
    .map(path => `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc></url>`)
    .join('\n')

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})
