<script setup lang="ts">
/**
 * A chain diagram: boxes on a fixed pitch with lanes above and below that
 * reach into them. Same visual language as the security zone chain, made
 * reusable because the data platform needs several of them.
 *
 * Deliberately unbranded. These describe shapes, not products — the tool
 * that fills each role is on the tech radar, and swapping one should not
 * mean redrawing a diagram.
 */
export interface ChainStage {
  title: string
  lines?: string[]
  /** Border and title colour. Defaults to the neutral line colour. */
  color?: string
}

export interface ChainLane {
  side: 'top' | 'bottom'
  title: string
  note?: string
  color: string
  /** Stage indices this lane points at. */
  stages?: number[]
  /** Gap indices — the space between stage i and i+1 — this lane points at. */
  gaps?: number[]
  /** 'from' reverses the arrows, for a lane that receives rather than governs. */
  direction?: 'to' | 'from'
  /** Nudge every landing point, so two lanes can share a gap. */
  offset?: number
  width?: number
}

const props = withDefaults(defineProps<{
  stages: ChainStage[]
  lanes?: ChainLane[]
  /** Dashed band behind the stages, for whatever they all sit on. */
  substrate?: string
  title: string
  desc: string
  legend?: { color: string, dash?: boolean, label: string }[]
}>(), {
  lanes: () => [],
  legend: () => [],
})

const VIEW_W = 1200
const MARGIN = 45
const GAP = 30
const BOX_H = 96
const LANE_H = 62
const NEUTRAL = '#3B2D63'

const top = computed(() => props.lanes.filter(l => l.side === 'top'))
const bottom = computed(() => props.lanes.filter(l => l.side === 'bottom'))

const boxW = computed(() => {
  const available = VIEW_W - MARGIN * 2 - GAP * (props.stages.length - 1)
  return Math.min(210, available / props.stages.length)
})

const stageY = computed(() => (top.value.length ? 170 : 40))
const substrateTop = computed(() => stageY.value - 14)
const substrateBottom = computed(() => stageY.value + BOX_H + 26)
const bottomLaneY = computed(() => substrateBottom.value + 78)
const viewH = computed(() =>
  bottom.value.length ? bottomLaneY.value + LANE_H + 18 : substrateBottom.value + 20,
)
const flowY = computed(() => stageY.value + 48)

const boxes = computed(() => {
  const total = props.stages.length * boxW.value + (props.stages.length - 1) * GAP
  const start = (VIEW_W - total) / 2
  return props.stages.map((stage, i) => {
    const x = start + i * (boxW.value + GAP)
    return { ...stage, x, mid: x + boxW.value / 2, color: stage.color ?? NEUTRAL }
  })
})

const flow = computed(() =>
  boxes.value.slice(0, -1).map((box, i) => ({
    x1: box.x + boxW.value,
    x2: boxes.value[i + 1]!.x - 4,
    mid: (box.x + boxW.value + boxes.value[i + 1]!.x) / 2,
  })),
)

/** Lanes share their side of the diagram evenly. */
function laneBoxes(lanes: ChainLane[], y: number) {
  const gap = 40
  const widths = lanes.map(l => l.width ?? Math.min(340, (VIEW_W - MARGIN * 2 - gap * (lanes.length - 1)) / lanes.length))
  const total = widths.reduce((a, b) => a + b, 0) + gap * (lanes.length - 1)
  let x = (VIEW_W - total) / 2
  return lanes.map((lane, i) => {
    const w = widths[i]!
    const box = { lane, x, y, w, mid: x + w / 2 }
    x += w + gap
    return box
  })
}

const topBoxes = computed(() => laneBoxes(top.value, 16))
const bottomBoxes = computed(() => laneBoxes(bottom.value, bottomLaneY.value))

/** Where a lane's arrows land, given what it points at. */
function targets(lane: ChainLane) {
  const offset = lane.offset ?? 0
  return [
    ...(lane.stages ?? []).map(i => boxes.value[i]!.mid + offset),
    ...(lane.gaps ?? []).map(i => flow.value[i]!.mid + offset),
  ]
}

interface Arrow { d: string, color: string }

const topArrows = computed<Arrow[]>(() =>
  topBoxes.value.flatMap(({ lane, mid }) => {
    const laneBottom = 16 + LANE_H
    const bend = laneBottom + 38
    const land = stageY.value - 4
    return targets(lane).map(x => ({
      color: lane.color,
      d: lane.direction === 'from'
        ? `M ${x},${land} V ${bend} H ${mid} V ${laneBottom + 4}`
        : (Math.abs(x - mid) < 1
            ? `M ${mid},${laneBottom} V ${land}`
            : `M ${mid},${laneBottom} V ${bend} H ${x} V ${land}`),
    }))
  }),
)

const bottomArrows = computed<Arrow[]>(() =>
  bottomBoxes.value.flatMap(({ lane, mid }) => {
    const laneTop = bottomLaneY.value
    const bend = laneTop - 40
    const land = stageY.value + BOX_H + 4
    return targets(lane).map(x => ({
      color: lane.color,
      d: lane.direction === 'from'
        ? `M ${x},${land} V ${bend} H ${mid} V ${laneTop - 4}`
        : (Math.abs(x - mid) < 1
            ? `M ${mid},${laneTop} V ${land}`
            : `M ${mid},${laneTop} V ${bend} H ${x} V ${land}`),
    }))
  }),
)

const markerId = useId()
</script>

<template>
  <div class="diag">
    <svg :viewBox="`0 0 ${VIEW_W} ${viewH}`" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>{{ title }}</title>
      <desc>{{ desc }}</desc>
      <defs>
        <marker :id="markerId" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </marker>
      </defs>

      <template v-if="substrate">
        <rect
          :x="MARGIN"
          :y="substrateTop"
          :width="VIEW_W - MARGIN * 2"
          :height="substrateBottom - substrateTop"
          rx="10"
          fill="#120B22"
          stroke="#3B2D63"
          stroke-dasharray="5 5"
        />
        <text
          :x="VIEW_W / 2"
          :y="substrateBottom - 8"
          text-anchor="middle"
          fill="#6B5C8A"
          font-family="IBM Plex Mono,monospace"
          font-size="11"
        >{{ substrate }}</text>
      </template>

      <g v-for="box in boxes" :key="box.title">
        <rect :x="box.x" :y="stageY" :width="boxW" :height="BOX_H" rx="8" fill="#150E28" :stroke="box.color" />
        <text
          :x="box.mid"
          :y="stageY + 32"
          text-anchor="middle"
          :fill="box.color === NEUTRAL ? '#F3E8FF' : box.color"
          font-family="IBM Plex Sans,sans-serif"
          font-size="15"
          font-weight="500"
        >{{ box.title }}</text>
        <text
          v-for="(line, i) in box.lines ?? []"
          :key="line"
          :x="box.mid"
          :y="stageY + 52 + i * 17"
          text-anchor="middle"
          :fill="i === 0 ? '#9C8FB5' : '#6B5C8A'"
          font-family="IBM Plex Mono,monospace"
          font-size="11"
        >{{ line }}</text>
      </g>

      <line
        v-for="(arrow, i) in flow"
        :key="i"
        :x1="arrow.x1"
        :y1="flowY"
        :x2="arrow.x2"
        :y2="flowY"
        stroke="#9C8FB5"
        stroke-width="1.5"
        :marker-end="`url(#${markerId})`"
      />

      <g v-for="box in [...topBoxes, ...bottomBoxes]" :key="box.lane.title">
        <rect :x="box.x" :y="box.y" :width="box.w" :height="LANE_H" rx="8" fill="#150E28" :stroke="box.lane.color" />
        <text
          :x="box.mid"
          :y="box.y + 26"
          text-anchor="middle"
          :fill="box.lane.color"
          font-family="IBM Plex Sans,sans-serif"
          font-size="15"
          font-weight="500"
        >{{ box.lane.title }}</text>
        <text
          v-if="box.lane.note"
          :x="box.mid"
          :y="box.y + 46"
          text-anchor="middle"
          fill="#6B5C8A"
          font-family="IBM Plex Mono,monospace"
          font-size="11"
        >{{ box.lane.note }}</text>
      </g>

      <path
        v-for="(arrow, i) in [...topArrows, ...bottomArrows]"
        :key="i"
        :d="arrow.d"
        fill="none"
        :stroke="arrow.color"
        stroke-width="1.2"
        stroke-dasharray="4 4"
        :marker-end="`url(#${markerId})`"
      />
    </svg>

    <div v-if="legend.length" class="legend">
      <span v-for="item in legend" :key="item.label" :style="`color:${item.color}`">
        <i :class="{ dash: item.dash }" />{{ item.label }}
      </span>
    </div>
  </div>
</template>
