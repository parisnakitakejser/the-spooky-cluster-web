<script setup lang="ts">
/**
 * The zone chain diagram. Boxes are laid out on a fixed pitch, so adding a
 * zone is one entry here rather than a page of hand-placed coordinates.
 */
const BOX_W = 130
const BOX_H = 86
const BOX_Y = 52
const PITCH = 168

const zones = [
  { title: 'Internet', stroke: '#3B2D63', titleColor: '#F3E8FF', lines: ['untrusted'] },
  { title: 'Edge', stroke: '#F87171', titleColor: '#F87171', lines: ['OPNsense', 'IDS · rate limit'] },
  { title: 'DMZ', stroke: '#F87171', titleColor: '#F87171', lines: ['proxy · WAF', 'vlan 40'] },
  { title: 'Quarantine', stroke: '#FBBF24', titleColor: '#FBBF24', lines: ['scan · sandbox', 'vlan 50'] },
  { title: 'Secure', stroke: '#22D3EE', titleColor: '#22D3EE', lines: ['k8s · ceph', 'vlan 20 · 30 · 35'] },
].map((zone, i) => {
  const x = 14 + i * PITCH
  const single = zone.lines.length === 1
  return {
    ...zone,
    x,
    mid: x + BOX_W / 2,
    titleY: single ? 88 : 82,
    lineYs: single ? [110] : [102, 119],
  }
})

/** Traffic arrows sit in the gap between each pair of boxes. */
const traffic = zones.slice(0, -1).map((zone, i) => ({
  x1: zone.x + BOX_W,
  x2: zones[i + 1]!.x - 4,
}))

/** Log feeds. Every zone but the internet ships one way into the SIEM. */
const logFeeds = [
  'M 247,138 V 200 H 400 V 234',
  'M 415,138 V 234',
  'M 583,138 V 200 H 560 V 234',
  'M 751,138 V 200 H 620 V 234',
]
</script>

<template>
  <div class="diag">
    <svg viewBox="0 0 860 330" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Security zone chain</title>
      <desc>Internet traffic passes through the edge firewall, the DMZ, quarantine, and finally the secure cluster network. Each zone sends logs one way into the SIEM.</desc>
      <defs>
        <marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </marker>
      </defs>

      <g v-for="zone in zones" :key="zone.title">
        <rect :x="zone.x" :y="BOX_Y" :width="BOX_W" :height="BOX_H" rx="8" fill="#150E28" :stroke="zone.stroke" />
        <text
          :x="zone.mid"
          :y="zone.titleY"
          text-anchor="middle"
          :fill="zone.titleColor"
          font-family="IBM Plex Sans,sans-serif"
          font-size="15"
          font-weight="500"
        >{{ zone.title }}</text>
        <text
          v-for="(line, i) in zone.lines"
          :key="line"
          :x="zone.mid"
          :y="zone.lineYs[i]"
          text-anchor="middle"
          :fill="i === 0 && zone.lines.length > 1 ? '#9C8FB5' : '#6B5C8A'"
          font-family="IBM Plex Mono,monospace"
          font-size="11"
        >{{ line }}</text>
      </g>

      <line
        v-for="(arrow, i) in traffic"
        :key="i"
        :x1="arrow.x1"
        y1="95"
        :x2="arrow.x2"
        y2="95"
        stroke="#9C8FB5"
        stroke-width="1.5"
        marker-end="url(#ar)"
      />

      <rect x="350" y="238" width="298" height="70" rx="8" fill="#150E28" stroke="#8B5CF6" />
      <text x="499" y="268" text-anchor="middle" fill="#8B5CF6" font-family="IBM Plex Sans,sans-serif" font-size="15" font-weight="500">SIEM</text>
      <text x="499" y="289" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">wazuh · suricata · loki — vlan 99, receive only</text>

      <path
        v-for="feed in logFeeds"
        :key="feed"
        :d="feed"
        fill="none"
        stroke="#8B5CF6"
        stroke-width="1.2"
        stroke-dasharray="4 4"
        marker-end="url(#ar)"
      />
    </svg>

    <div class="legend">
      <span style="color:#9C8FB5"><i />traffic</span>
      <span style="color:#8B5CF6"><i class="dash" />logs, one way only</span>
    </div>
  </div>
</template>
