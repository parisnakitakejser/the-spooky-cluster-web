<script setup lang="ts">
defineProps<{
  /** Breadcrumb leaf, e.g. "rack". */
  crumb: string
  heading: string
  lede: string
}>()

const route = useRoute()

/** A page inside a section gets its hub in the trail, between home and itself. */
const parent = computed(() => {
  const section = sectionFor(route.path)
  return section && section.hub.to !== route.path ? section.hub : undefined
})
</script>

<template>
  <div class="phead">
    <slot name="ghost" />
    <p class="crumb">
      <NuxtLink to="/">home</NuxtLink>
      <span class="sep">/</span>
      <template v-if="parent">
        <NuxtLink :to="parent.to">{{ parent.label.toLowerCase() }}</NuxtLink>
        <span class="sep">/</span>
      </template>
      {{ crumb }}
    </p>
    <h1>{{ heading }}</h1>
    <p class="lede">{{ lede }}</p>
    <div v-if="$slots.tags" class="tagline">
      <slot name="tags" />
    </div>
  </div>
</template>
