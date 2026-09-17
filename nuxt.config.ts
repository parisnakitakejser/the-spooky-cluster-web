export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // Every page is pre-rendered at build time. The node-server preset then
  // serves those files itself, so the container needs no web server config:
  // clean URLs, 404s and headers are all decided here.
  ssr: true,
  nitro: {
    preset: 'node-server',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      failOnError: true,
    },
  },

  routeRules: {
    // The headers the reverse proxy used to add. An API gateway in front of
    // this may set its own; these make the pod correct on its own terms.
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'no-referrer-when-downgrade',
      },
    },
    // Nuxt fingerprints everything under /_nuxt/, so it can be cached forever.
    '/_nuxt/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/favicon.svg': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
  },

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // Tokens are available in every component <style lang="scss"> block.
          additionalData: '@use "~/assets/scss/tokens" as *;',
        },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap',
        },
      ],
    },
  },

  devtools: { enabled: true },
})
