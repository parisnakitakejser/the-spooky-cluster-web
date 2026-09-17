<script setup lang="ts">
/**
 * The chart, its numbered key and the tooltip, sharing one hover state.
 * Blips are placed once here so both halves agree on the numbering.
 *
 * The key sits below the chart rather than beside it: the chart is square-ish
 * and wants the width, and sixty-six names read better as sector columns than
 * as one tall list.
 */
const props = withDefaults(defineProps<{ active?: string | null }>(), { active: null })

const blips = placeBlips()
const hovered = ref<string | null>(null)

const current = computed(() => blips.find(b => b.entry.slug === hovered.value))

const g = radarGeometry

/** One column per sector, in the order they appear on the chart. */
const groups = computed(() =>
  radarQuadrants
    .filter(q => !props.active || q.id === props.active)
    .map(quadrant => ({
      quadrant,
      items: blips.filter(b => b.quadrant.id === quadrant.id),
    }))
    .filter(group => group.items.length),
)

/**
 * The SVG scales to its box and keeps its aspect, so a viewBox coordinate is
 * a percentage of the stage — accounting for the horizontal padding the
 * viewBox reserves for the sector labels. Flip the card away from whichever
 * edge is close.
 */
const tip = computed(() => {
  const b = current.value
  if (!b) return null
  const vbWidth = g.size + g.padX * 2
  const xPct = ((b.x + g.padX) / vbWidth) * 100
  const yPct = (b.y / g.size) * 100
  return {
    blip: b,
    below: yPct < 30,
    side: xPct < 26 ? 'left' : xPct > 74 ? 'right' : 'centre',
    style: { left: `${xPct}%`, top: `${yPct}%` },
  }
})

function setHover(slug: string | null) {
  hovered.value = slug
}
</script>

<template>
  <div class="board">
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
          <RadarMark :n="tip.blip.n" :movement="tip.blip.entry.movement" :zone="tip.blip.quadrant.zone" />
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

    <div class="rgroups">
      <div
        v-for="group in groups"
        :key="group.quadrant.id"
        class="rgroup"
      >
        <p class="rgroup-head" :style="`--zc:var(--${group.quadrant.zone})`">
          {{ group.quadrant.name }}
          <span>{{ group.items.length }}</span>
        </p>
        <RadarIndex
          :blips="group.items"
          :hovered="hovered"
          @hover="setHover"
        />
      </div>
    </div>
  </div>
</template>
