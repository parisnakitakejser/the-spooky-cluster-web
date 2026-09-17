<script setup lang="ts">
const props = withDefaults(defineProps<{
  entries?: RadarEntry[]
  /** Dim everything outside this quadrant. Null shows all of them evenly. */
  active?: string | null
}>(), {
  entries: () => radarEntries,
  active: null,
})

const g = radarGeometry
const blips = computed(() => placeBlips(props.entries))

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

/** Quadrant names, pushed outside the circle at the middle of their arc. */
const quadrantLabels = computed(() =>
  radarQuadrants.map((quadrant, i) => {
    const a = -Math.PI / 2 + (i + 0.5) * slice
    const r = g.radius + 30
    const x = g.center + r * Math.cos(a)
    const y = g.center + r * Math.sin(a)
    return {
      quadrant,
      x,
      y,
      anchor: Math.abs(Math.cos(a)) < 0.1 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end'),
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
  return props.active !== null && props.active !== b.quadrant.id
}
</script>

<template>
  <div class="radar">
    <svg
      :viewBox="`0 0 ${g.size} ${g.size}`"
      class="radar-svg"
      role="img"
      aria-labelledby="radar-title radar-desc"
    >
      <title id="radar-title">The tech radar</title>
      <desc id="radar-desc">
        {{ entries.length }} tools placed in {{ radarQuadrants.length }} {{ sectorNoun }} and
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
            :class="{ dim: dim(b) }"
            :href="href"
            :style="`--zc:var(--${b.quadrant.zone})`"
            @click="navigate"
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

    <p class="radar-key">
      <span><svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" /></svg>unchanged</span>
      <span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1 L11 10 L1 10 Z" /></svg>new, or moved inward</span>
      <span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 11 L11 2 L1 2 Z" /></svg>moved outward</span>
    </p>
  </div>
</template>
