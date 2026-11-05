<script setup lang="ts">
usePageSeo({
  title: 'Schema registry — the spooky cluster',
  description: 'Schema between a publisher and a consumer who never meet: a versioned registry both ends resolve against, and a breaking change rejected at publish rather than discovered at read.',
})

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

const compat = {
  columns: ['Mode', 'What it guarantees', 'Adding a field', 'Removing a required field'],
  rows: [
    ['Backward', 'A new consumer can read old data', 'Fine, if it has a default', 'Fine'],
    ['Forward', 'An old consumer can read new data', 'Fine', 'Breaks'],
    ['Full', 'Both, in either direction', 'Fine, with a default', 'Breaks'],
    ['None', 'Nothing. Every change is allowed', 'Fine', 'Fine, and something will break later'],
  ],
}
</script>

<template>
  <PageHead
    crumb="schema"
    heading="Schema, between two ends that never meet"
    lede="The hardest part of a stream is that the publisher and the consumer are deployed at different times by different people. A registry makes the schema a versioned artefact both sides agree on, instead of a shape everyone assumes and nobody states."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="c">versioned subjects</ZoneChip>
      <ZoneChip zone="m">checked at publish</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">the flow</p>
    <h2>The check happens before the write, not after the read</h2>
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
      <p>The record carries a schema <em>id</em> rather than a copy of the schema. That keeps the payload small and, more usefully, means a consumer reading last year's records resolves last year's schema and still gets sensible fields — rather than trying to read old bytes through a new definition.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the policy</p>
    <h2>Which direction you protect is the decision people skip</h2>
    <p>Compatibility is not one setting, it is a choice about who you are protecting from whom.</p>
    <DataTable :columns="compat.columns" :rows="compat.rows" />
    <div class="prose spaced">
      <p><strong>Backward</strong> protects the reader of history: a new consumer can still read everything already written. <strong>Forward</strong> protects the consumer you do not control: an old consumer keeps working when the publisher moves first, which is what you want when the two are deployed on different schedules by different people. <strong>Full</strong> is both, and constrains the publisher most.</p>
      <p>In a house where I am both ends, forward compatibility is still the one that matters — because "both ends" means "me, and me in six months, having forgotten".</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the rejection</p>
    <h2>Fail at publish, where somebody is looking</h2>
    <div class="prose">
      <p>The rejection lane is the feature, not a safety net. A breaking change caught at publish time is one person, looking at one change, with the context of having just made it. The same break discovered at read time is a consumer failing at three in the morning, belonging to someone who was not in the room and has no idea what changed.</p>
      <p>That is the same argument as the <NuxtLink to="/ai-data/data-lake/contracts">quality gates</NuxtLink> one page back, applied to shape rather than content — and the same argument as every other gate in this rack. Fail early, fail where the change was made, and make the failure name who can fix it.</p>
      <p>Which registry, format and engines fill these roles is on the <NuxtLink to="/radar">tech radar</NuxtLink>.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
