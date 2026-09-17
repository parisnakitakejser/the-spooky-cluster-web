<script setup lang="ts">
defineProps<{
  links: SiteLink[]
  /** The hub this section belongs to. */
  hub: SiteLink
}>()

const route = useRoute()
</script>

<template>
  <nav class="subnav" aria-label="In this section">
    <NuxtLink class="chip" :to="hub.to">{{ hub.label }}</NuxtLink>
    <NuxtLink
      v-for="link in links"
      :key="link.to"
      class="chip"
      :class="{ on: route.path === link.to }"
      :to="link.to"
    >{{ link.label }}</NuxtLink>
  </nav>
</template>
