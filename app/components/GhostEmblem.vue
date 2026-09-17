<script setup lang="ts">
/**
 * The emblem. Draws itself once on load, then the LEDs idle.
 *
 * The ring dots and the three tick rows used to be hand-written SVG; they are
 * generated here so the geometry stays correct when the counts change. If you
 * change RING_DOTS, change the chase spacing in _animation.scss with it.
 */
const RING_DOTS = 20
const RING_R = 168
const CENTER = { x: 340, y: 240 }
const RING_COLORS = ['#22D3EE', '#FF4FA3', '#A3E635', '#FBBF24', '#8B5CF6']

const dots = Array.from({ length: RING_DOTS }, (_, i) => {
  const angle = (i / RING_DOTS) * Math.PI * 2
  return {
    i,
    cx: +(CENTER.x + RING_R * Math.cos(angle)).toFixed(1),
    cy: +(CENTER.y + RING_R * Math.sin(angle)).toFixed(1),
    fill: RING_COLORS[i % RING_COLORS.length],
    pulse: i % 4 === 0,
  }
})

/** Rack units inside the ghost, top to bottom. */
const rackRows = [
  { led: '#22D3EE', dim: '#164E63', body: 'ticks' },
  { led: '#A3E635', dim: '#3F6212', body: 'ticks' },
  { led: '#FBBF24', dim: '#78350F', body: 'ticks' },
  { led: '#8B5CF6', dim: '#4C1D95', body: 'ports' },
  { led: '#F87171', dim: '#7F1D1D', body: 'wave' },
].map((row, i) => ({ ...row, i, y: 218 + i * 22 }))

const ticks = Array.from({ length: 8 }, (_, i) => 304 + i * 6)
const ports = [310, 326, 342]

/** The ghost outline, reused for both the fill and the stroke-on pass. */
const ghostPath = 'M 258,330 V 210 A 82 82 0 0 1 422,210 V 330 l -20.5,15 l -20.5,-15 l -20.5,15 l -20.5,-15 l -20.5,15 l -20.5,-15 l -20.5,15 l -20.5,-15 Z'

const hexes = [
  { i: 0, lead: 'M 190,168 L 160,150', points: '140,128 158,138 158,158 140,168 122,158 122,138', cx: 140, cy: 148, fill: '#22D3EE' },
  { i: 1, lead: 'M 490,168 L 520,150', points: '540,128 558,138 558,158 540,168 522,158 522,138', cx: 540, cy: 148, fill: '#A3E635' },
  { i: 2, lead: 'M 190,312 L 160,330', points: '140,312 158,322 158,342 140,352 122,342 122,322', cx: 140, cy: 332, fill: '#FBBF24' },
  { i: 3, lead: 'M 490,312 L 520,330', points: '540,312 558,322 558,342 540,352 522,342 522,322', cx: 540, cy: 332, fill: '#8B5CF6' },
]
</script>

<template>
  <svg id="emblem" width="100%" viewBox="0 0 680 500" role="img" xmlns="http://www.w3.org/2000/svg">
    <title>The Spooky Cluster emblem</title>
    <desc>A ghost shaped like a server cabinet, ringed with LED dots, holding five tagged rack units.</desc>

    <circle class="gfill" cx="340" cy="240" r="180" fill="#100C1C" />
    <circle class="ring1" cx="340" cy="240" r="180" fill="none" stroke="#FF4FA3" stroke-width="1.5" />
    <circle class="ring2" cx="340" cy="240" r="152" fill="#1A1330" stroke="#8B5CF6" stroke-width="0.5" />

    <circle
      v-for="dot in dots"
      :key="dot.i"
      class="dot"
      :class="{ pulse: dot.pulse }"
      :style="`--i:${dot.i}`"
      :cx="dot.cx"
      :cy="dot.cy"
      r="4"
      :fill="dot.fill"
    />

    <g class="ghost">
      <path class="gfill" :d="ghostPath" fill="#FF4FA3" />
      <path class="gline" :d="ghostPath" fill="none" stroke="#FFB3D9" stroke-width="2" />

      <g class="eye" style="--i:0">
        <circle cx="308" cy="182" r="17" fill="#120B22" />
        <circle cx="308" cy="182" r="7" fill="#22D3EE" />
        <circle cx="305" cy="178" r="2.5" fill="#CFFAFE" />
      </g>
      <g class="eye" style="--i:1">
        <circle cx="372" cy="182" r="17" fill="#120B22" />
        <circle cx="372" cy="182" r="7" fill="#22D3EE" />
        <circle cx="369" cy="178" r="2.5" fill="#CFFAFE" />
      </g>

      <rect class="panel" x="272" y="212" width="136" height="112" rx="8" fill="#150E28" stroke="#3B2D63" stroke-width="0.5" />

      <g v-for="row in rackRows" :key="row.i" class="rrow" :style="`--i:${row.i}`">
        <rect x="278" :y="row.y" width="124" height="17" rx="3" fill="#241A3F" />
        <circle class="pulse" :style="`--i:${row.i * 2 + 1}`" cx="286" :cy="row.y + 8.5" r="2.5" :fill="row.led" />
        <circle cx="294" :cy="row.y + 8.5" r="2.5" :fill="row.dim" />

        <template v-if="row.body === 'ticks'">
          <rect v-for="x in ticks" :key="x" :x="x" :y="row.y + 4" width="2" height="9" fill="#3B2D63" />
        </template>
        <template v-else-if="row.body === 'ports'">
          <circle v-for="x in ports" :key="x" :cx="x" :cy="row.y + 8.5" r="5.5" fill="none" stroke="#8B5CF6" stroke-width="1.5" />
        </template>
        <path
          v-else
          d="M 306,314.5 h 10 l 4,-5 l 6,10 l 5,-8 l 4,3 h 20"
          fill="none"
          stroke="#F87171"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <rect x="392" :y="row.y + 2" width="6" height="13" rx="2" :fill="row.led" />
      </g>

      <g class="railbits">
        <rect x="262" y="212" width="6" height="112" rx="3" fill="#C92A70" />
        <rect x="412" y="212" width="6" height="112" rx="3" fill="#C92A70" />
        <circle cx="265" cy="222" r="1.5" fill="#FFB3D9" /><circle cx="265" cy="268" r="1.5" fill="#FFB3D9" /><circle cx="265" cy="314" r="1.5" fill="#FFB3D9" />
        <circle cx="415" cy="222" r="1.5" fill="#FFB3D9" /><circle cx="415" cy="268" r="1.5" fill="#FFB3D9" /><circle cx="415" cy="314" r="1.5" fill="#FFB3D9" />
      </g>
    </g>

    <g v-for="hex in hexes" :key="hex.i" class="hex" :style="`--i:${hex.i}`">
      <path :d="hex.lead" stroke="#8B5CF6" stroke-width="0.5" stroke-dasharray="3 3" fill="none" />
      <polygon :points="hex.points" :fill="hex.fill" />
      <circle :cx="hex.cx" :cy="hex.cy" r="5" fill="#100C1C" />
    </g>
  </svg>
</template>
