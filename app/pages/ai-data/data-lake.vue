<script setup lang="ts">
usePageSeo({
  title: 'Data lake — the spooky cluster',
  description: 'Three diagrams: how a row moves through the lake layers, how a data contract keeps quality honest, and how schema stays compatible between publisher and consumer.',
})

// The diagrams describe shapes, not products. Which tool fills each role is
// on the radar, and swapping one should not mean redrawing a diagram.

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

const contract: ChainStage[] = [
  { title: 'Producer', lines: ['owns the data', 'owns the fix'] },
  { title: 'Contract check', lines: ['shape · types', 'required fields'], color: '#FBBF24' },
  { title: 'Raw layer', lines: ['accepted records only'], color: '#FBBF24' },
  { title: 'Quality gate', lines: ['volume · nulls · ranges', 'freshness'], color: '#22D3EE' },
  { title: 'Curated layer', lines: ['promoted only when green'], color: '#A3E635' },
]

const contractLanes: ChainLane[] = [
  { side: 'top', title: 'Data contract', note: 'schema · semantics · ownership · freshness promise', color: '#A3E635', stages: [1, 3] },
  { side: 'bottom', title: 'Rejected records', note: 'quarantined and attributed, never silently dropped', color: '#F87171', stages: [1, 3], direction: 'from' },
]

const schema: ChainStage[] = [
  { title: 'Publisher', lines: ['writes a record'] },
  { title: 'Compatibility check', lines: ['may this version', 'replace the last?'], color: '#FBBF24' },
  { title: 'Stream or table', lines: ['payload + schema id'], color: '#F472B6' },
  { title: 'Schema resolution', lines: ['read with the', "writer's schema"], color: '#22D3EE' },
  { title: 'Consumer', lines: ['reads without being', 'redeployed'], color: '#8B5CF6' },
]

const schemaLanes: ChainLane[] = [
  { side: 'top', title: 'Schema registry', note: 'versioned subjects · one source of truth', color: '#8B5CF6', stages: [1, 3] },
  { side: 'bottom', title: 'Compatibility policy', note: 'what a new version may change', color: '#FBBF24', stages: [1], offset: -12 },
  { side: 'bottom', title: 'Rejected publish', note: 'a breaking change never reaches a consumer', color: '#F87171', stages: [1], direction: 'from', offset: 12 },
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
    crumb="data lake"
    heading="Three diagrams, because the layers are the boring part"
    lede="What makes a lake work is not the layers, it is what governs each hop between them. These are drawn without product names on purpose — the shape outlives whichever engine is currently filling each role."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="m">3 layers</ZoneChip>
      <ZoneChip zone="p">contract first</ZoneChip>
      <ZoneChip zone="c">schema versioned</ZoneChip>
    </template>
  </PageHead>

  <SectionNav :hub="{ to: '/ai-data', label: 'Overview' }" :links="aiDataPages" />

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">flow · one</p>
    <h2>How a row moves through the layers</h2>
    <p>Data runs left to right and never backwards. Policy comes down onto the tables. Orchestration decides when a hop runs; processing does the work — two lanes rather than one, because conflating them is how a scheduler ends up doing computation.</p>
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
      <p>The raw layer exists for the same reason one step later: cleaning is a guess, and keeping the original means a wrong guess costs a re-run. Everything from raw onward is the same kind of table in the same object store, which is what makes a bad transformation a rollback to yesterday's snapshot rather than a restore.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">layers</p>
    <h2>Three layers, and who is allowed into each</h2>
    <p>The layer boundary and the permission boundary are the same line. That is the only reason the policy stays small enough to read in one sitting.</p>
    <DataTable :columns="layerTable.columns" :rows="layerTable.rows" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">flow · two</p>
    <h2>Quality, enforced by contract rather than by hope</h2>
    <p>A data contract is an agreement between whoever produces data and whoever depends on it: the shape, the meaning, who owns it, and how fresh it will be. Writing it down turns "the data looks wrong" into "the contract was broken, here, by this producer".</p>
    <FlowChain
      title="Data quality and contracts"
      desc="A producer emits records. A contract check validates shape and required fields before anything is accepted into the raw layer. A quality gate checks volume, nulls, ranges and freshness before promotion to the curated layer. Both gates enforce the same data contract, and both send rejected records to a quarantine that attributes them back to the producer."
      :stages="contract"
      :lanes="contractLanes"
      :legend="[
        { color: '#9C8FB5', label: 'data, one direction' },
        { color: '#A3E635', dash: true, label: 'the contract both gates enforce' },
        { color: '#F87171', dash: true, label: 'rejected, and attributed' },
      ]"
    />
    <div class="prose spaced">
      <p>Two gates, one contract. The first asks whether a record is even the thing it claims to be — right fields, right types, nothing required missing. The second asks whether the batch as a whole is plausible: the volume it should be, nulls within tolerance, values in range, arriving when it promised to.</p>
      <p>The part that matters most is the bottom lane. Rejected records are <strong>quarantined and attributed</strong>, never silently dropped — because a pipeline that quietly discards ten percent of its input still produces a dashboard, and that dashboard is confidently wrong. The producer owns the fix, which is the whole point of writing down who owns what.</p>
      <p>The failure mode I care about: a check that only warns is a check nobody reads. A failed gate has to stop the promotion, or within a month it is decoration.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">flow · three</p>
    <h2>Schema, between a publisher and a consumer who never meet</h2>
    <p>The hardest part of a stream is that the two ends are deployed at different times by different people. A registry makes the schema a versioned artefact both sides agree on, instead of a shape everyone assumes and nobody states.</p>
    <FlowChain
      title="Schema validation between publisher and consumer"
      desc="A publisher writes a record. A compatibility check asks whether the new schema version may replace the previous one, and a breaking change is rejected before publishing. Accepted records carry a schema id alongside the payload. The consumer resolves that id against the registry and reads using the writer's schema, so it does not need redeploying when the schema moves."
      :stages="schema"
      :lanes="schemaLanes"
      :legend="[
        { color: '#9C8FB5', label: 'data, one direction' },
        { color: '#8B5CF6', dash: true, label: 'the registry both sides resolve against' },
        { color: '#FBBF24', dash: true, label: 'what a new version may change' },
        { color: '#F87171', dash: true, label: 'breaking change, rejected at publish' },
      ]"
    />
    <div class="prose spaced">
      <p>The record carries a schema id rather than a copy of the schema. That keeps the payload small and, more usefully, means a consumer reading last year's records resolves last year's schema and still gets sensible fields.</p>
      <p>Compatibility direction is the decision people skip. <strong>Backward</strong> compatibility means a new consumer can read old data — adding an optional field is fine, removing a required one is not. <strong>Forward</strong> means an old consumer can read new data, which is what you want when consumers are deployed on somebody else's schedule. <strong>Full</strong> is both and constrains the publisher most.</p>
      <p>The rejection lane is the feature. A breaking change is caught at publish time, where one team is looking at one change — rather than at read time, in a consumer, at three in the morning, belonging to someone who was not in the room.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">honestly</p>
    <h2>This is a great deal of machinery for a household</h2>
    <div class="prose">
      <p>It is. A lake with governance, contracts and a schema registry on it is enormously more structure than a few million sensor readings need, and a single database would serve the actual data volume here without complaint.</p>
      <p>It exists because these are the patterns I want to be fluent in, and a lake with real governance is not something you get to practise at small scale anywhere else. Same argument as the rest of the <NuxtLink to="/about">practice rack</NuxtLink> — the difference is that here I am explicit that proportionality was never the goal.</p>
      <p>The tools currently filling each of these roles are on the <NuxtLink to="/radar">tech radar</NuxtLink>, with the parts that bite.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
