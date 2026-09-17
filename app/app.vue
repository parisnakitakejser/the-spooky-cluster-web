<script setup lang="ts">
const route = useRoute()

/** Canonical URL for the page being rendered. */
const canonical = computed(() => `${siteUrl}${route.path === '/' ? '/' : route.path}`)

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})

useSeoMeta({
  ogUrl: canonical,
  ogType: 'website',
  ogSiteName: siteName,
  ogLocale: 'en',
  twitterCard: 'summary',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
