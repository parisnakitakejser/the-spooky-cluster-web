<script setup lang="ts">
usePageSeo({
  title: 'Power — the rack — the spooky cluster',
  description: 'A UPS and two metered PDUs: where every power number on this site comes from, and how long the rack survives without mains.',
})

const kit = {
  columns: ['Item', 'What it is', 'What it gives me'],
  rows: [
    ['lifeline', '3 kVA rack UPS, line-interactive', '~28 minutes at idle draw, and clean power'],
    ['pdu-a', 'Switched PDU · 8 × C13 · per-outlet metering', 'Per-device power figures, and remote power cycling'],
    ['pdu-b', 'Switched PDU · 8 × C13 · per-outlet metering', 'The second feed, for dual-PSU machines'],
  ],
}

const numbers = [
  { value: '612 W', label: 'idle draw' },
  { value: '1.4 kW', label: 'under load' },
  { value: '~28 min', label: 'on battery' },
  { value: '~980 kr', label: 'per month' },
]
</script>

<template>
  <PageHead
    crumb="power"
    heading="Where every number on this site comes from"
    lede="Two metered PDUs and a UPS. The metering is the part that matters — without per-outlet figures, every power claim on this site would be an estimate with a confident tone."
  >
    <template #ghost><GhostRack /></template>
    <template #tags>
      <ZoneChip zone="m">3 kVA</ZoneChip>
      <ZoneChip zone="s">612 w idle</ZoneChip>
      <ZoneChip zone="d">~28 min hold</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the hardware</p>
    <h2>One UPS, two PDUs, sixteen metered outlets</h2>
    <StatGrid :items="numbers" zone="s" />
    <div style="height:22px" />
    <DataTable :columns="kit.columns" :rows="kit.rows" />
    <div class="prose spaced">
      <p>Per-outlet metering turns power from a monthly bill into a per-service number. It is how I know what the storage tier costs versus the clusters, and it is why the figures on this site are measured rather than estimated. It is also the cheapest observability in the rack — the exporter scrapes the PDUs alongside everything else.</p>
      <p>Two PDUs rather than one so dual-PSU machines can take a feed from each. A whole rail can then be powered down without dropping a node, which turns a maintenance window into a normal afternoon.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">what the battery is for</p>
    <h2>Twenty-eight minutes is not uptime</h2>
    <div class="prose">
      <p>The UPS is not there to keep the rack running through an outage. It is there to make shutdown a decision rather than an event: ride out the brief cuts, and shut down cleanly on the long ones before the battery runs out.</p>
      <ul>
        <li><strong>Twenty-eight minutes at idle</strong>, and considerably less under load. Long enough for the common case, nowhere near long enough to be a generator.</li>
        <li><strong>Clean power matters more than runtime.</strong> Line-interactive regulation means brownouts and sags stop being events the hardware has to survive.</li>
        <li><strong>The shutdown has to be tested</strong>, and it is the test people skip. A UPS whose signalling does not trigger a shutdown is a battery that delays the crash.</li>
        <li><strong>Battery health degrades quietly.</strong> Runtime is monitored and alerted on, because a UPS that reports "ready" with a tired battery is worse than no UPS — it is a false sense of a plan.</li>
      </ul>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the trade</p>
    <h2>What it costs to leave on</h2>
    <div class="prose">
      <p>612 W idle is the number I would most like to improve, and the honest position is that most of it is second-hand Xeons idling high. Replacing working hardware to save power has never quite penciled out, and every year that calculation gets closer.</p>
      <p>The monthly figure moves with electricity prices rather than with anything I do, which makes it the one number on this site I have the least control over.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
