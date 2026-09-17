<script setup lang="ts">
/**
 * The data lake pipeline. Same idea as the security zone chain: boxes on a
 * fixed pitch, so adding a stage is one entry rather than a page of
 * hand-placed coordinates.
 *
 * Four directions carry meaning, and that is the whole point of drawing it:
 *   → data runs left to right
 *   ↓ Ranger applies policy to the tables
 *   ↓ Soda gates each promotion on quality
 *   ↑ Airflow triggers the engines, and the engines do the hops
 */
const BOX_W = 155
const BOX_H = 96
const BOX_Y = 170
const GAP = 30
const VIEW_W = 1200
const FLOW_Y = BOX_Y + 48

const stages = [
  { title: 'Sources', stroke: '#3B2D63', titleColor: '#F3E8FF', lines: ['postgres · mqtt', 'sensors · app logs'] },
  { title: 'Kafka / NATS', stroke: '#F472B6', titleColor: '#F472B6', lines: ['streaming buffer', 'replay window'] },
  { title: 'Bronze', stroke: '#FBBF24', titleColor: '#FBBF24', lines: ['raw, as it landed', 'append only'] },
  { title: 'Silver', stroke: '#22D3EE', titleColor: '#22D3EE', lines: ['typed · deduplicated', 'schema enforced'] },
  { title: 'Gold', stroke: '#A3E635', titleColor: '#A3E635', lines: ['modelled · aggregated', 'what gets queried'] },
  { title: 'Consumers', stroke: '#8B5CF6', titleColor: '#8B5CF6', lines: ['duckdb · grafana', 'notebooks'] },
]

const startX = (VIEW_W - (stages.length * BOX_W + (stages.length - 1) * GAP)) / 2

const boxes = stages.map((stage, i) => {
  const x = startX + i * (BOX_W + GAP)
  return { ...stage, x, mid: x + BOX_W / 2 }
})

const flow = boxes.slice(0, -1).map((box, i) => ({
  x1: box.x + BOX_W,
  x2: boxes[i + 1]!.x - 4,
  mid: (box.x + BOX_W + boxes[i + 1]!.x) / 2,
}))

/** The three hops where a transformation actually runs. */
const hops = [flow[1]!, flow[2]!, flow[3]!]

/** Ranger governs the tables, so it reaches the three lake layers. */
const RANGER_X = 425
const policy = [boxes[2]!, boxes[3]!, boxes[4]!].map(box =>
  `M ${RANGER_X},78 V 116 H ${box.mid} V 166`,
)

/** Soda gates each promotion, so it reaches the hops rather than the tables. */
const SODA_X = 775
const quality = hops.map(hop => `M ${SODA_X},78 V 132 H ${hop.mid - 8} V 206`)

/** The engines do the hops. Airflow only decides when. */
const ENGINE_X = 730
const compute = hops.map(hop => `M ${ENGINE_X},370 V 330 H ${hop.mid + 8} V 232`)
</script>

<template>
  <div class="diag">
    <svg viewBox="0 0 1200 450" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Data lake pipeline</title>
      <desc>
        Data moves left to right from sources through a Kafka or NATS buffer into bronze,
        silver and gold tables, and out to consumers. Apache Ranger applies access policy to
        the three table layers. Soda gates each promotion on data quality. Airflow triggers
        Flink, Spark and PyIceberg, which perform the transformations. Every layer is an open
        table format table on object storage.
      </desc>
      <defs>
        <marker id="lake-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </marker>
      </defs>

      <!-- The substrate every table stage actually lives on. -->
      <rect x="45" y="156" width="1110" height="136" rx="10" fill="#120B22" stroke="#3B2D63" stroke-dasharray="5 5" />
      <text x="600" y="284" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">
        one open table format · snapshots, schema evolution, time travel · on Ceph RGW (S3)
      </text>

      <g v-for="box in boxes" :key="box.title">
        <rect :x="box.x" :y="BOX_Y" :width="BOX_W" :height="BOX_H" rx="8" fill="#150E28" :stroke="box.stroke" />
        <text
          :x="box.mid"
          :y="BOX_Y + 32"
          text-anchor="middle"
          :fill="box.titleColor"
          font-family="IBM Plex Sans,sans-serif"
          font-size="15"
          font-weight="500"
        >{{ box.title }}</text>
        <text
          v-for="(line, i) in box.lines"
          :key="line"
          :x="box.mid"
          :y="BOX_Y + 52 + i * 17"
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
        :y1="FLOW_Y"
        :x2="arrow.x2"
        :y2="FLOW_Y"
        stroke="#9C8FB5"
        stroke-width="1.5"
        marker-end="url(#lake-ar)"
      />

      <!-- governance and quality, above -->
      <rect x="290" y="16" width="270" height="62" rx="8" fill="#150E28" stroke="#F87171" />
      <text x="425" y="42" text-anchor="middle" fill="#F87171" font-family="IBM Plex Sans,sans-serif" font-size="15" font-weight="500">Apache Ranger</text>
      <text x="425" y="62" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">row and column policy · masking · audit</text>

      <rect x="640" y="16" width="270" height="62" rx="8" fill="#150E28" stroke="#FBBF24" />
      <text x="775" y="42" text-anchor="middle" fill="#FBBF24" font-family="IBM Plex Sans,sans-serif" font-size="15" font-weight="500">Soda</text>
      <text x="775" y="62" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">quality checks · a failed hop does not promote</text>

      <path
        v-for="(d, i) in policy"
        :key="`p${i}`"
        :d="d"
        fill="none"
        stroke="#F87171"
        stroke-width="1.2"
        stroke-dasharray="4 4"
        marker-end="url(#lake-ar)"
      />
      <path
        v-for="(d, i) in quality"
        :key="`q${i}`"
        :d="d"
        fill="none"
        stroke="#FBBF24"
        stroke-width="1.2"
        stroke-dasharray="4 4"
        marker-end="url(#lake-ar)"
      />

      <!-- orchestration and compute, below -->
      <rect x="250" y="370" width="250" height="62" rx="8" fill="#150E28" stroke="#FF4FA3" />
      <text x="375" y="396" text-anchor="middle" fill="#FF4FA3" font-family="IBM Plex Sans,sans-serif" font-size="15" font-weight="500">Apache Airflow</text>
      <text x="375" y="416" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">one DAG per hop · retries · backfill</text>

      <rect x="560" y="370" width="340" height="62" rx="8" fill="#150E28" stroke="#22D3EE" />
      <text x="730" y="396" text-anchor="middle" fill="#22D3EE" font-family="IBM Plex Sans,sans-serif" font-size="15" font-weight="500">Flink · Spark · PyIceberg</text>
      <text x="730" y="416" text-anchor="middle" fill="#6B5C8A" font-family="IBM Plex Mono,monospace" font-size="11">streaming · batch · the small jobs</text>

      <line x1="500" y1="401" x2="556" y2="401" stroke="#9C8FB5" stroke-width="1.5" marker-end="url(#lake-ar)" />

      <path
        v-for="(d, i) in compute"
        :key="`c${i}`"
        :d="d"
        fill="none"
        stroke="#22D3EE"
        stroke-width="1.2"
        stroke-dasharray="4 4"
        marker-end="url(#lake-ar)"
      />
    </svg>

    <div class="legend">
      <span style="color:#9C8FB5"><i />data, one direction</span>
      <span style="color:#F87171"><i class="dash" />policy on every table</span>
      <span style="color:#FBBF24"><i class="dash" />quality gate before promotion</span>
      <span style="color:#22D3EE"><i class="dash" />the engine that runs the hop</span>
    </div>
  </div>
</template>
