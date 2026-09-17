<script setup lang="ts">
defineProps<{
  /** Breadcrumb leaf, e.g. "rack". */
  crumb: string
  heading: string
  lede: string
}>()
</script>

<template>
  <div class="phead">
    <slot name="ghost" />
    <p class="crumb">
      <NuxtLink to="/">home</NuxtLink>
      <span class="sep">/</span>
      {{ crumb }}
    </p>
    <h1>{{ heading }}</h1>
    <p class="lede">{{ lede }}</p>
    <div v-if="$slots.tags" class="tagline">
      <slot name="tags" />
    </div>
  </div>
</template>
