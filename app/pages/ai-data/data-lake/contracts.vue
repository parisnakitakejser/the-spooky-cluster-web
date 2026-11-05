<script setup lang="ts">
usePageSeo({
  title: 'Data contracts — the spooky cluster',
  description: 'Quality enforced by a written agreement rather than by hope: two gates, one contract, and a quarantine that attributes what it rejects instead of silently dropping it.',
})

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

const terms = {
  columns: ['What the contract states', 'Who it binds', 'How it is checked'],
  rows: [
    ['Field names, types, which are required', 'The producer', 'At ingest, per record'],
    ['What a field means, and its units', 'Both sides', 'Nothing automatic — this is the human half'],
    ['Who owns it and who to ask', 'The producer', 'Named in the rejection, so it reaches someone'],
    ['How fresh it will be', 'The producer', 'A freshness check that fails on staleness'],
    ['Plausible volume and value ranges', 'The producer', 'At promotion, per batch'],
  ],
}
</script>

<template>
  <PageHead
    crumb="contracts"
    heading="Quality, enforced by contract rather than by hope"
    lede="A data contract is an agreement between whoever produces data and whoever depends on it: the shape, the meaning, who owns it, and how fresh it will be. Writing it down turns “the data looks wrong” into “the contract was broken, here, by this producer”."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="s">one contract</ZoneChip>
      <ZoneChip zone="p">two gates</ZoneChip>
      <ZoneChip zone="d">nothing dropped</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the flow</p>
    <h2>Two gates, one contract</h2>
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
      <p>The first gate asks whether a record is even the thing it claims to be — right fields, right types, nothing required missing. The second asks whether the batch as a whole is plausible: the volume it should be, nulls within tolerance, values in range, arriving when it promised to. A record can pass the first and a batch still fail the second, which is exactly the point of having both.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the agreement</p>
    <h2>What is actually written down</h2>
    <p>Half of a contract is machine-checkable and half is not. Writing the second half down anyway is what makes the data usable by someone who was not there when it was designed.</p>
    <DataTable :columns="terms.columns" :rows="terms.rows" />
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the bottom lane</p>
    <h2>Rejected is not the same as deleted</h2>
    <div class="prose">
      <p>This is the part of the diagram that matters most, and the part most pipelines get wrong. Records that fail are <strong>quarantined and attributed</strong>, never silently discarded — because a pipeline that quietly drops a tenth of its input still produces a dashboard, and that dashboard is confidently wrong. Nobody investigates a number that looks plausible.</p>
      <p>Attribution is what makes the quarantine useful rather than a graveyard. A rejection carries which contract term failed, which producer sent it, and when — so the fix has an owner. That owner is the producer, which is the whole reason ownership is a contract term in the first place.</p>
      <p>The failure mode I care about most: <strong>a check that only warns is a check nobody reads.</strong> A failed gate has to stop the promotion, or within a month it is decoration and the data is worse than if there were no checks at all — because now there is a green tick next to it.</p>
      <p>Next: keeping the shape stable while both ends change — <NuxtLink to="/ai-data/data-lake/schema">the schema registry</NuxtLink>.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
