<script setup lang="ts">
usePageSeo({
  title: 'The rack — the spooky cluster',
  description: 'One 42U cabinet described by what each group of hardware does: the edge, the clusters, the storage, the switching and the power behind them.',
})

const glance = [
  { value: '42U', label: 'cabinet' },
  { value: '31U', label: 'in use' },
  { value: '612 W', label: 'idle draw' },
  { value: '1.4 kW', label: 'under load' },
]

const summary = {
  columns: ['Group', 'What it is for', 'Units', 'Idle draw'],
  rows: rackGroups.map(g => [g.name, g.purpose, g.units, g.draw]),
}
</script>

<template>
  <PageHead
    crumb="rack"
    heading="One cabinet, five jobs"
    lede="A second-hand 42U cabinet that came out of an office move for the price of collecting it. What follows is what is in it and why, grouped by the job each part does rather than by where it sits."
  >
    <template #ghost><GhostRack /></template>
    <template #tags>
      <ZoneChip zone="m">42u</ZoneChip>
      <ZoneChip zone="p">31u used</ZoneChip>
      <ZoneChip zone="s">1.4 kW peak</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">at a glance</p>
    <h2>Roughly three quarters full</h2>
    <p>The spare capacity is not an accident. Empty slots are where growth goes, and the ones that will stay empty are doing thermal work.</p>
    <StatGrid :items="glance" zone="m" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the groups</p>
    <h2>Five groups, each with a page</h2>
    <p>Split this way because the interesting question about a rack is never "what is in slot 19" — it is what each part is for, what it costs to run, and what I would buy differently.</p>
    <div class="deck">
      <NuxtLink
        v-for="group in rackGroups"
        :key="group.slug"
        class="card"
        :to="`/rack/${group.slug}`"
        :style="`--zc:var(--${group.zone})`"
      >
        <h3>{{ group.name }}</h3>
        <p>{{ group.purpose }}</p>
        <span class="meta">{{ group.units }} · {{ group.draw }}</span>
      </NuxtLink>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">the whole cabinet</p>
    <h2>What is in it, in one table</h2>
    <DataTable :columns="summary.columns" :rows="summary.rows" />
    <div class="prose spaced">
      <p>Weight goes low and noise goes low with it: storage at the bottom, compute in the middle, the quiet things at the top. That ordering is the only placement detail worth stating, because it is the one that generalises — everything else about where a given machine sits is specific to this cabinet and useful to nobody but me.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">airflow</p>
    <h2>Heat, and the neighbours</h2>
    <div class="prose">
      <p>Cold aisle at the front, hot aisle behind, and <strong>every unused slot filled with a blanking panel</strong>. Without them, hot exhaust loops back over the top of the servers and the fans spin up to compensate. Filling the gaps dropped intake temperature by about 4 °C and cost roughly 200 kr of plastic — the best value thermal upgrade I have made, and I ignored it for a year.</p>
      <p>The room is unheated, which does most of the work for eight months of the year. In July it does not, and intake sits around 27 °C with the door propped open. A proper intake duct is on the list.</p>
      <p>Noise is the real constraint, not heat. The storage chassis shipped with fans that sound like a hand dryer; they now run quiet industrials on a fan curve tied to drive temperature. It costs about 3 °C on the disks and buys back roughly 20 dB, which is the difference between a room I can work in and one I cannot.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">what is not here</p>
    <h2>Two things I have left out</h2>
    <div class="prose">
      <p>This site is public, so a couple of details are deliberately missing and it seems more honest to say which than to let you assume completeness.</p>
      <ul>
        <li><strong>The slot-by-slot elevation.</strong> A map of exactly which machine sits where is useful to precisely one kind of reader, and it is not the kind this site is written for. Counts, models and power figures are all here; the floor plan is not.</li>
        <li><strong>The out-of-band recovery path.</strong> Described on the <NuxtLink to="/network">network page</NuxtLink> as existing, and deliberately not described further.</li>
      </ul>
      <p>Everything else is as it actually is. Where a number is estimated rather than measured, the page it is on says so.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
