<script setup lang="ts">
defineProps<{ blips: PlacedBlip[] }>()
</script>

<template>
  <ol class="legend-list">
    <li v-for="b in blips" :key="b.entry.slug">
      <span class="legend-n" :style="`--zc:var(--${b.quadrant.zone})`">{{ b.n }}</span>
      <NuxtLink class="legend-name" :to="`/radar/${b.entry.slug}`">{{ b.entry.name }}</NuxtLink>
      <span v-if="b.entry.movement !== 'none'" class="legend-move" :data-move="b.entry.movement">
        {{ b.entry.movement === 'new' ? 'new' : b.entry.movement === 'in' ? 'moved in' : 'moved out' }}
      </span>
      <span class="legend-tag">{{ b.entry.tagline }}</span>
    </li>
  </ol>
</template>
