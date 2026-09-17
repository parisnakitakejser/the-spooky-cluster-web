type SeoValue = string | (() => string | undefined)

/**
 * Page metadata in one call. Sets the title and description, then mirrors
 * them into Open Graph and Twitter so a shared link says something useful.
 * Values may be getters — dynamic pages pass them so the tags follow the
 * route. The canonical URL and the site-wide tags live in app.vue.
 */
export function usePageSeo(meta: { title: SeoValue, description: SeoValue }) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    twitterTitle: meta.title,
    twitterDescription: meta.description,
  })
}
