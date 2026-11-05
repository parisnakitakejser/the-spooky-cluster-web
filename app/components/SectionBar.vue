<script setup lang="ts">
/**
 * Second-level navigation, one row per section the page sits inside. Sections
 * nest, so a page two levels down gets two rows: the outer section with its
 * hub marked, then the inner one. Everything comes from the registry, so a
 * page joins by being listed rather than by wiring anything up.
 */
const route = useRoute()
const chain = computed(() => sectionChain(route.path))
</script>

<template>
  <div v-if="chain.length" class="secbars">
    <div
      v-for="(section, depth) in chain"
      :key="section.hub.to"
      class="secbar"
      :class="{ deep: depth > 0 }"
    >
      <NuxtLink class="secbar-name" :to="section.hub.to">{{ section.hub.label }}</NuxtLink>
      <nav class="secbar-links" :aria-label="`In ${section.hub.label}`">
        <NuxtLink
          class="secbar-link"
          :class="{ on: route.path === section.hub.to }"
          :to="section.hub.to"
        >Overview</NuxtLink>
        <NuxtLink
          v-for="link in section.links"
          :key="link.to"
          class="secbar-link"
          :class="{ on: route.path === link.to, within: route.path !== link.to && isWithin(route.path, link.to) }"
          :to="link.to"
        >{{ link.label }}</NuxtLink>
      </nav>
    </div>
  </div>
</template>
