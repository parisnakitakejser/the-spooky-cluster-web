<script setup lang="ts">
const route = useRoute()

/** Position in the reading order decides both arrows, so pages carry no link tables. */
const index = computed(() => readingOrder.findIndex(p => p.to === route.path))
const back = computed(() => readingOrder.at((index.value - 1) % readingOrder.length))
const next = computed(() => readingOrder[(index.value + 1) % readingOrder.length])
</script>

<template>
  <nav v-if="index >= 0" class="pager" aria-label="Pagination">
    <NuxtLink v-if="back" :to="back.to"><span>back</span>{{ back.label }}</NuxtLink>
    <NuxtLink v-if="next" :to="next.to"><span>next</span>{{ next.label }}</NuxtLink>
  </nav>
</template>
