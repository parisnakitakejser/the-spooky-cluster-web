<script setup lang="ts">
/**
 * The numbered key beside the chart. Hovering an entry here highlights the
 * matching blip, and hovering a blip highlights the entry — the number and
 * the shape are the only way to get from one to the other otherwise.
 */
// Defaults matter here: an omitted prop is undefined, and `undefined !== null`
// is true — which dimmed every row on any page that did not pass `active`.
withDefaults(defineProps<{
  blips: PlacedBlip[]
  active?: string | null
  hovered?: string | null
  /** The entry this page is about, marked but not at the expense of the rest. */
  current?: string | null
}>(), {
  active: null,
  hovered: null,
  current: null,
})

const emit = defineEmits<{ hover: [slug: string | null] }>()
</script>

<template>
  <ol class="rindex">
    <li
      v-for="b in blips"
      :key="b.entry.slug"
      :class="{
        hot: hovered ? hovered === b.entry.slug : current === b.entry.slug,
        dim: hovered ? hovered !== b.entry.slug : (active !== null && active !== b.quadrant.id),
      }"
    >
      <NuxtLink
        :to="`/radar/${b.entry.slug}`"
        @mouseenter="emit('hover', b.entry.slug)"
        @mouseleave="emit('hover', null)"
        @focus="emit('hover', b.entry.slug)"
        @blur="emit('hover', null)"
      >
        <RadarMark :n="b.n" :movement="b.entry.movement" :zone="b.quadrant.zone" />
        <span class="rindex-name">{{ b.entry.name }}</span>
      </NuxtLink>
    </li>
  </ol>
</template>
