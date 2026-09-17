<script setup lang="ts">
/** `zone` is the short suffix the stylesheet keys colours off: p s m c d. */
defineProps<{ zone: string, to?: string }>()
</script>

<template>
  <NuxtLink v-if="to" class="chip" :class="zone" :to="to"><i /><slot /></NuxtLink>
  <span v-else class="chip" :class="zone"><i /><slot /></span>
</template>
