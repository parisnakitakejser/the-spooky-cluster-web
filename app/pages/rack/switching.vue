<script setup lang="ts">
usePageSeo({
  title: 'Switching — the rack — the spooky cluster',
  description: 'One switch, one patch panel, and the cable discipline that makes everything else debuggable.',
})

const kit = {
  columns: ['Item', 'What it is', 'What it does'],
  rows: [
    ['switchboard', 'MikroTik CRS326-24G-2S+', '24 gigabit ports, 2 × 10G SFP+, VLAN filtering, QoS'],
    ['patch-01', '24-port Cat6A keystone panel', 'Every run terminates here rather than at a device'],
    ['brush', '1U brush panel', 'Cable pass-through, so the door closes and the bend radius survives'],
  ],
}
</script>

<template>
  <PageHead
    crumb="switching"
    heading="Two 10G ports that shaped everything else"
    lede="One switch carries every VLAN in the rack. Its two 10G ports are the constraint that decided how the storage tier is laid out, which is a good illustration of how a cheap component picks your architecture for you."
  >
    <template #ghost><GhostNetwork /></template>
    <template #tags>
      <ZoneChip zone="s">24 × 1G</ZoneChip>
      <ZoneChip zone="p">2 × 10G</ZoneChip>
      <ZoneChip zone="m">3u</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the hardware</p>
    <h2>One switch, one patch panel, one brush</h2>
    <DataTable :columns="kit.columns" :rows="kit.rows" />
    <div class="prose spaced">
      <p>Everything terminates at the patch panel rather than running device to device. It costs an extra connector per run and it means a machine can be swapped without tracing a cable to the other end of the cabinet — which is worth far more than the couple of decibels of signal it costs.</p>
      <p>The switch sits on a shelf rather than on rails, because I bought the wrong mounting ears and have not felt strongly enough about it since. That is the most honest sentence on this page.</p>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">cabling</p>
    <h2>Three runs, and a label at both ends</h2>
    <div class="prose">
      <p>The rear is divided into three vertical runs so a cable can be traced without unracking anything: power on one side, copper down the middle, fibre on the other with a generous bend radius.</p>
      <ul>
        <li><strong>Copper is colour-coded by VLAN</strong> — the same colours this site uses for its zones, which is either disciplined or a symptom.</li>
        <li><strong>Fibre gets its own channel</strong> and nothing else touches it. Bend radius is not a suggestion.</li>
        <li><strong>Dual-PSU machines take one feed from each PDU</strong>, so a whole power rail can be cycled without dropping a node.</li>
        <li><strong>Every cable is labelled at both ends</strong> with a printed wrap, not a marker pen. Marker pen lasts about four months in a warm cabinet.</li>
      </ul>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the trade</p>
    <h2>One switch is one switch</h2>
    <div class="prose">
      <p>Everything in the rack meets on a single fabric. There is no second switch, so a switch failure is a rack failure — the same accepted single point as the <NuxtLink to="/rack/safeguard">edge</NuxtLink>, for the same reason: redundancy that doubles cost and complexity to guard against something that has not happened yet.</p>
      <p>What it does buy is that storage replication and cluster traffic share a fabric but not a VLAN, with priority queueing on the storage side. During a re-balance that queueing is doing real work rather than sitting in the config as decoration.</p>
      <p>The VLAN plan itself is on the <NuxtLink to="/network">network page</NuxtLink>.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
