<script setup lang="ts">
usePageSeo({
  title: 'Data lake — the spooky cluster',
  description: 'Three flows, drawn without product names: how a row moves through the layers, how a data contract keeps quality honest, and how schema stays compatible between publisher and consumer.',
})

const flows = [
  {
    to: '/ai-data/data-lake/layers',
    zone: 'mgmt',
    title: 'Layers and the stream',
    body: 'How a row gets from a sensor to a dashboard: a replayable buffer, three table layers, and the two lanes that move data between them.',
    meta: 'buffer · raw · cleaned · curated',
  },
  {
    to: '/ai-data/data-lake/contracts',
    zone: 'prod',
    title: 'Quality and contracts',
    body: 'Two gates enforcing one written agreement, and a quarantine that attributes what it rejects instead of dropping it.',
    meta: 'contract · gates · rejects',
  },
  {
    to: '/ai-data/data-lake/schema',
    zone: 'ceph',
    title: 'Schema between publisher and consumer',
    body: 'A versioned registry both ends resolve against, and a breaking change caught at publish rather than at read.',
    meta: 'registry · compatibility',
  },
]
</script>

<template>
  <PageHead
    crumb="data lake"
    heading="Three flows, because the layers are the boring part"
    lede="What makes a lake work is not the layers, it is what governs each hop between them. Each flow below is one diagram and the argument behind it — drawn without product names, because the shape outlives whichever engine is currently filling each role."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="m">3 layers</ZoneChip>
      <ZoneChip zone="p">contract first</ZoneChip>
      <ZoneChip zone="c">schema versioned</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the three</p>
    <h2>Read them in order the first time</h2>
    <p>They build on each other: the layers give you somewhere to put data, contracts decide what is allowed in, and the schema registry keeps the two ends of a stream agreeing about shape while both are being changed by different people.</p>
    <div class="deck">
      <NuxtLink
        v-for="flow in flows"
        :key="flow.to"
        class="card"
        :to="flow.to"
        :style="`--zc:var(--${flow.zone})`"
      >
        <h3>{{ flow.title }}</h3>
        <p>{{ flow.body }}</p>
        <span class="meta">{{ flow.meta }}</span>
      </NuxtLink>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the substrate</p>
    <h2>One table format under all of it</h2>
    <div class="prose">
      <p>Everything from the raw layer onward is the same kind of table in the same object store: an open table format over files, tracked by metadata that records which files belong to a table at each snapshot. That buys atomic commits, schema evolution and time travel at every stage rather than only at the end.</p>
      <p>The practical consequence is the one worth remembering: a bad transformation is a rollback to yesterday's snapshot, not a restore from backup. That difference is what makes it reasonable to run transformations at all without being frightened of them.</p>
      <p>Which engines, formats and registries currently fill these roles is on the <NuxtLink to="/radar">tech radar</NuxtLink>, deliberately kept off the diagrams.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">honestly</p>
    <h2>This is a great deal of machinery for a household</h2>
    <div class="prose">
      <p>It is. A lake with governance, contracts and a schema registry on it is enormously more structure than a few million sensor readings need, and a single database would serve the actual data volume here without complaint.</p>
      <p>It exists because these are the patterns I want to be fluent in, and a lake with real governance is not something you get to practise at small scale anywhere else. Same argument as the rest of the <NuxtLink to="/about">practice rack</NuxtLink> — the difference is that here I am explicit that proportionality was never the goal.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
