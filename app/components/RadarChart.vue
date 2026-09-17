<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Placed once by the parent, so the chart and the index agree. */
  blips: PlacedBlip[]
  /** Dim everything outside this sector. Null shows all of them evenly. */
  active?: string | null
  /** Slug currently hovered or focused, anywhere on the page. */
  hovered?: string | null
}>(), {
  active: null,
  hovered: null,
})

const emit = defineEmits<{ hover: [slug: string | null] }>()

const g = radarGeometry

/** Outer edge of every ring, for the concentric guides. */
const rings = computed(() =>
  radarRings.map((ring, i) => ({
    ring,
    r: g.ringStops[i]! * g.radius,
    // Halfway into the band, for the label on the upward axis.
    mid: ((i === 0 ? 0 : g.ringStops[i - 1]!) + g.ringStops[i]!) / 2 * g.radius,
  })),
)

const slice = (Math.PI * 2) / radarQuadrants.length

/** One spoke per quadrant boundary. */
const spokes = computed(() =>
  radarQuadrants.map((_, i) => {
    const a = -Math.PI / 2 + i * slice
    return {
      x2: g.center + g.radius * Math.cos(a),
      y2: g.center + g.radius * Math.sin(a),
    }
  }),
)

/**
 * Sector names, centred just outside the circle on the middle of their arc.
 * Always centred rather than start/end anchored: an anchored label grows away
 * from the chart and off the canvas, a centred one grows both ways and stays
 * inside the padding the viewBox reserves for it.
 */
const quadrantLabels = computed(() =>
  radarQuadrants.map((quadrant, i) => {
    const a = -Math.PI / 2 + (i + 0.5) * slice
    const r = g.radius + 26
    return {
      quadrant,
      x: g.center + r * Math.cos(a),
      y: g.center + r * Math.sin(a),
    }
  }),
)

function blipPath(b: PlacedBlip): string {
  const s = g.blipRadius + 2
  if (b.entry.movement === 'out') {
    return `M ${b.x} ${b.y + s} L ${b.x + s} ${b.y - s * 0.7} L ${b.x - s} ${b.y - s * 0.7} Z`
  }
  return `M ${b.x} ${b.y - s} L ${b.x + s} ${b.y + s * 0.7} L ${b.x - s} ${b.y + s * 0.7} Z`
}

function dim(b: PlacedBlip): boolean {
  if (props.hovered) return props.hovered !== b.entry.slug
  return props.active !== null && props.active !== b.quadrant.id
}
</script>

<template>
  <svg
    :viewBox="`${-g.padX} 0 ${g.size + g.padX * 2} ${g.size}`"
    class="radar-svg"
    role="img"
    aria-labelledby="radar-title radar-desc"
  >
    <title id="radar-title">The tech radar</title>
    <desc id="radar-desc">
      {{ blips.length }} tools placed in {{ radarQuadrants.length }} {{ sectorNoun }} and
      {{ radarRings.length }} rings, from Adopt at the centre to Hold at the edge.
      The same entries are listed as text below the chart.
    </desc>

    <g class="radar-grid">
      <circle
        v-for="r in rings"
        :key="r.ring.id"
        :cx="g.center"
        :cy="g.center"
        :r="r.r"
      />
      <line
        v-for="(s, i) in spokes"
        :key="i"
        :x1="g.center"
        :y1="g.center"
        :x2="s.x2"
        :y2="s.y2"
      />
    </g>

    <g class="radar-ring-labels">
      <text
        v-for="r in rings"
        :key="r.ring.id"
        :x="g.center + 8"
        :y="g.center - r.mid"
      >{{ r.ring.name }}</text>
    </g>

    <g class="radar-quadrant-labels">
      <text
        v-for="q in quadrantLabels"
        :key="q.quadrant.id"
        :x="q.x"
        :y="q.y"
        :text-anchor="q.anchor"
        :style="`--zc:var(--${q.quadrant.zone})`"
      >{{ q.quadrant.name }}</text>
    </g>

    <NuxtLink
      v-for="b in blips"
      :key="b.entry.slug"
      :to="`/radar/${b.entry.slug}`"
      custom
    >
      <template #default="{ href, navigate }">
        <a
          class="blip"
          :class="{ dim: dim(b), hot: hovered === b.entry.slug }"
          :href="href"
          :style="`--zc:var(--${b.quadrant.zone})`"
          @click="navigate"
          @mouseenter="emit('hover', b.entry.slug)"
          @mouseleave="emit('hover', null)"
          @focus="emit('hover', b.entry.slug)"
          @blur="emit('hover', null)"
        >
          <title>{{ b.entry.name }} — {{ b.ring.name }}, {{ b.quadrant.name }}</title>
          <circle
            v-if="b.entry.movement === 'none'"
            :cx="b.x"
            :cy="b.y"
            :r="g.blipRadius"
          />
          <path v-else :d="blipPath(b)" />
          <text :x="b.x" :y="b.y + 3.5" text-anchor="middle">{{ b.n }}</text>
        </a>
        </template>
    </NuxtLink>
  </svg>
</template>
