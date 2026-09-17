<script setup lang="ts">
/**
 * The numbered key beside the chart. Hovering an entry here highlights the
 * matching blip, and hovering a blip highlights the entry — the number is the
 * only way to get from one to the other otherwise.
 */
defineProps<{
  blips: PlacedBlip[]
  active?: string | null
  hovered?: string | null
}>()

const emit = defineEmits<{ hover: [slug: string | null] }>()
</script>

<template>
  <ol class="rindex">
    <li
      v-for="b in blips"
      :key="b.entry.slug"
      :class="{
        hot: hovered === b.entry.slug,
        dim: hovered ? hovered !== b.entry.slug : (active !== null && active !== b.quadrant.id),
      }"
    >
      <NuxtLink
        :to="`/radar/${b.entry.slug}`"
        :style="`--zc:var(--${b.quadrant.zone})`"
        @mouseenter="emit('hover', b.entry.slug)"
        @mouseleave="emit('hover', null)"
        @focus="emit('hover', b.entry.slug)"
        @blur="emit('hover', null)"
      >
        <span class="rindex-n">{{ b.n }}</span>
        <span class="rindex-name">{{ b.entry.name }}</span>
      </NuxtLink>
    </li>
  </ol>
</template>
