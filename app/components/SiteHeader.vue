<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <header class="top">
    <div class="top-in">
      <GhostMini />
      <NuxtLink class="top-name" to="/">{{ siteName }}</NuxtLink>
      <nav class="top-scroll" aria-label="Main">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          class="top-link"
          :class="{ within: isWithin(route.path, link.to) }"
          :to="link.to"
          :aria-current="route.path === link.to ? 'page' : (isWithin(route.path, link.to) ? 'location' : undefined)"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
