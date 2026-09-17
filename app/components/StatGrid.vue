<script setup lang="ts">
defineProps<{
  items: { value: string, label: string }[]
  /** Short zone suffix applied to every tile: p s m c d. */
  zone: string
}>()
</script>

<template>
  <div class="stats">
    <div v-for="item in items" :key="item.label" class="stat" :class="zone">
      <b>{{ item.value }}</b>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>
