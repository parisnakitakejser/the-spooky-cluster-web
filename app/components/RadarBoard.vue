<script setup lang="ts">
/**
 * The chart, its numbered key and the tooltip, sharing one hover state.
 * Blips are placed once here so both halves agree on the numbering.
 */
const props = withDefaults(defineProps<{ active?: string | null }>(), { active: null })

const blips = placeBlips()
const hovered = ref<string | null>(null)

/**
 * The key lists what is actually highlighted. With a sector selected, a
 * sixty-six line index of mostly dimmed entries is noise — the chart still
 * shows the rest, greyed, for context.
 */
const indexBlips = computed(() =>
  props.active ? blips.filter(b => b.quadrant.id === props.active) : blips,
)

const current = computed(() => blips.find(b => b.entry.slug === hovered.value))

const g = radarGeometry

/**
 * The SVG scales to its box and keeps its aspect, so a viewBox coordinate is
 * a percentage of the stage. Flip the card away from whichever edge is close.
 */
const tip = computed(() => {
  const b = current.value
  if (!b) return null
  const xPct = (b.x / g.size) * 100
  const yPct = (b.y / g.size) * 100
  const below = yPct < 30
  const side = xPct < 26 ? 'left' : xPct > 74 ? 'right' : 'centre'
  return {
    blip: b,
    below,
    side,
    style: {
      left: `${xPct}%`,
      top: `${yPct}%`,
    },
  }
})

function setHover(slug: string | null) {
  hovered.value = slug
}
</script>

<template>
  <div class="board">
    <div class="board-chart">
      <div class="radar-stage">
        <RadarChart
          :blips="blips"
          :active="props.active"
          :hovered="hovered"
          @hover="setHover"
        />

        <div
          v-if="tip"
          class="radar-tip"
          :class="[`is-${tip.side}`, { below: tip.below }]"
          :style="tip.style"
          aria-hidden="true"
        >
          <p class="radar-tip-head">
            <span class="radar-tip-n" :style="`--zc:var(--${tip.blip.quadrant.zone})`">{{ tip.blip.n }}</span>
            {{ tip.blip.entry.name }}
          </p>
          <p class="radar-tip-meta">
            {{ tip.blip.ring.name }} · {{ tip.blip.quadrant.name }}
            <template v-if="tip.blip.entry.movement !== 'none'">
              · {{ tip.blip.entry.movement === 'out' ? 'moved outward' : tip.blip.entry.movement === 'in' ? 'moved inward' : 'new' }}
            </template>
          </p>
          <p class="radar-tip-tag">{{ tip.blip.entry.tagline }}</p>
        </div>
      </div>

      <p class="radar-key">
        <span><svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" /></svg>unchanged</span>
        <span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1 L11 10 L1 10 Z" /></svg>new, or moved inward</span>
        <span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 11 L11 2 L1 2 Z" /></svg>moved outward</span>
      </p>
    </div>

    <div class="board-index">
      <p class="board-index-head">
        the numbers<template v-if="props.active"> · {{ indexBlips.length }} shown</template>
      </p>
      <RadarIndex
        :blips="indexBlips"
        :active="props.active"
        :hovered="hovered"
        @hover="setHover"
      />
    </div>
  </div>
</template>
