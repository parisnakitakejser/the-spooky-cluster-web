<script setup lang="ts">
usePageSeo({
  title: 'Lake layers — the spooky cluster',
  description: 'How a row moves from a sensor to a dashboard: a replayable stream buffer, three table layers, and the separation between deciding when a hop runs and doing the work.',
})

const layers: ChainStage[] = [
  { title: 'Sources', lines: ['operational databases', 'devices · app logs'] },
  { title: 'Stream buffer', lines: ['ordered · replayable', 'retention window'], color: '#F472B6' },
  { title: 'Raw layer', lines: ['exactly as received', 'append only'], color: '#FBBF24' },
  { title: 'Cleaned layer', lines: ['typed · deduplicated', 'schema enforced'], color: '#22D3EE' },
  { title: 'Curated layer', lines: ['modelled for a question', 'what gets queried'], color: '#A3E635' },
  { title: 'Consumers', lines: ['dashboards · notebooks', 'ad-hoc queries'], color: '#8B5CF6' },
]

const layerLanes: ChainLane[] = [
  { side: 'top', title: 'Access policy', note: 'row and column rules · masking · audit', color: '#F87171', stages: [2, 3, 4] },
  { side: 'bottom', title: 'Orchestration', note: 'one job per hop · retries · backfill', color: '#FF4FA3', gaps: [1, 2, 3], offset: -9 },
  { side: 'bottom', title: 'Processing', note: 'streaming and batch engines', color: '#22D3EE', gaps: [1, 2, 3], offset: 9 },
]

const layerTable = {
  columns: ['Layer', 'What lands there', 'Rewritten by', 'Who may read it'],
  rows: [
    ['Raw', 'Records exactly as they arrived, nothing dropped', 'Streaming ingest, and batch for the rest', 'Me only'],
    ['Cleaned', 'Typed, deduplicated, late-arriving rows resolved', 'Whichever engine suits the size of the hop', 'Me, and the curated jobs'],
    ['Curated', 'Modelled tables built for a question someone asks', 'Batch, gated on quality before promotion', 'Dashboards and notebooks'],
  ],
}
</script>

<template>
  <PageHead
    crumb="layers"
    heading="How a row gets from a sensor to a dashboard"
    lede="Data runs left to right and never backwards. Policy comes down onto the tables. Orchestration decides when a hop runs; processing does the work — two lanes rather than one, because conflating them is how a scheduler ends up doing computation."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="m">3 layers</ZoneChip>
      <ZoneChip zone="p">replayable ingest</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the flow</p>
    <h2>Six stages, two of which are not storage</h2>
    <FlowChain
      title="Lake layers and the stream"
      desc="Data moves left to right from sources through a replayable stream buffer into a raw layer, a cleaned layer and a curated layer, then out to consumers. Access policy applies to the three table layers. Orchestration and processing act on each hop between them."
      :stages="layers"
      :lanes="layerLanes"
      substrate="one open table format · snapshots · schema evolution · time travel · on object storage"
      :legend="[
        { color: '#9C8FB5', label: 'data, one direction' },
        { color: '#F87171', dash: true, label: 'policy on every table' },
        { color: '#FF4FA3', dash: true, label: 'when a hop runs' },
        { color: '#22D3EE', dash: true, label: 'what runs it' },
      ]"
    />
    <div class="prose spaced">
      <p>The stream buffer exists so that an ingest job can fail for an afternoon without losing the afternoon. It keeps records for a retention window regardless of who has read them, and consumers track their own position — so catching up is a replay rather than a re-collection. Sensor data cannot be re-collected.</p>
      <p>The raw layer exists for the same reason one step later: cleaning is a guess, and keeping the original means a wrong guess costs a re-run.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">layers</p>
    <h2>Three layers, and who is allowed into each</h2>
    <p>The layer boundary and the permission boundary are the same line. That is the only reason the policy stays small enough to read in one sitting.</p>
    <DataTable :columns="layerTable.columns" :rows="layerTable.rows" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the two lanes</p>
    <h2>Deciding when is not the same job as doing it</h2>
    <div class="prose">
      <p>The separation in the diagram is the one structural opinion on this page. A scheduler that also performs the transformation becomes the bottleneck for every pipeline at once, and its failure modes stop being about scheduling — a worker that runs out of memory takes the scheduler with it.</p>
      <p>Keeping them apart means the orchestrator only ever holds a small amount of state about what ran and what failed, and the engine doing the work can be chosen per hop: streaming where the job never ends, batch where the data is large, and a plain process where it is neither. Most hops here are the third kind.</p>
      <p>Next: what stops bad data entering these layers in the first place — <NuxtLink to="/ai-data/data-lake/contracts">quality and contracts</NuxtLink>.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
