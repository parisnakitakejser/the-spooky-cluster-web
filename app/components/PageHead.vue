<script setup lang="ts">
defineProps<{
  /** Breadcrumb leaf, e.g. "rack". */
  crumb: string
  heading: string
  lede: string
}>()

const route = useRoute()

/** Every hub above this page, outermost first, so the trail is complete. */
const parents = computed(() =>
  sectionChain(route.path)
    .filter(s => s.hub.to !== route.path)
    .map(s => s.hub),
)
</script>

<template>
  <div class="phead">
    <slot name="ghost" />
    <p class="crumb">
      <NuxtLink to="/">home</NuxtLink>
      <span class="sep">/</span>
      <template v-for="p in parents" :key="p.to">
        <NuxtLink :to="p.to">{{ p.label.toLowerCase() }}</NuxtLink>
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
