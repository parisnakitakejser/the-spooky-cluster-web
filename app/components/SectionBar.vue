<script setup lang="ts">
/**
 * Second-level navigation, shown on every page inside a section. It renders
 * itself from the section registry, so a page joins a section by being
 * listed there rather than by wiring anything up.
 */
const route = useRoute()
const section = computed(() => sectionFor(route.path))
</script>

<template>
  <div v-if="section" class="secbar">
    <NuxtLink class="secbar-name" :to="section.hub.to">{{ section.hub.label }}</NuxtLink>
    <nav class="secbar-links" aria-label="In this section">
      <NuxtLink
        class="secbar-link"
        :class="{ on: route.path === section.hub.to }"
        :to="section.hub.to"
      >Overview</NuxtLink>
      <NuxtLink
        v-for="link in section.links"
        :key="link.to"
        class="secbar-link"
        :class="{ on: route.path === link.to }"
        :to="link.to"
      >{{ link.label }}</NuxtLink>
    </nav>
  </div>
</template>
