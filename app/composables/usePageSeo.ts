/**
 * Page metadata in one call. Sets the title and description, then mirrors
 * them into Open Graph and Twitter so a shared link says something useful.
 * The canonical URL and the site-wide tags live in app.vue.
 */
export function usePageSeo(meta: { title: string, description: string }) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    twitterTitle: meta.title,
    twitterDescription: meta.description,
  })
}
