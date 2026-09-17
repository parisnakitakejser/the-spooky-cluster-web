<script setup lang="ts">
/**
 * A numbered blip, at any size. The chart draws these into the SVG itself;
 * everything else — the key, the legend, the tooltip — uses this, so a shape
 * means the same thing wherever it appears.
 *
 *   circle          unchanged
 *   triangle up     new, or moved toward adopt
 *   triangle down   moved away from adopt
 */
const props = defineProps<{
  n: number
  movement: Movement
  /** Zone colour token for the sector. */
  zone: string
}>()

const up = computed(() => props.movement === 'new' || props.movement === 'in')

/** Baselines differ per shape, because the room inside them is in a different place. */
const baseline = computed(() =>
  props.movement === 'none' ? 15.6 : (up.value ? 17 : 14.2),
)
</script>

<template>
  <svg
    class="rmark"
    viewBox="0 0 24 24"
    aria-hidden="true"
    :style="`--zc:var(--${zone})`"
  >
    <circle v-if="movement === 'none'" cx="12" cy="12" r="11" />
    <path v-else-if="up" d="M12 0.8 L23.2 20.2 L0.8 20.2 Z" />
    <path v-else d="M12 23.2 L23.2 3.8 L0.8 3.8 Z" />
    <text x="12" :y="baseline" text-anchor="middle">{{ n }}</text>
  </svg>
</template>
