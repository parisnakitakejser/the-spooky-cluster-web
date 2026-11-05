<script setup lang="ts">
usePageSeo({
  title: 'Storage hardware — the rack — the spooky cluster',
  description: 'Three chassis, thirty-six spinning disks, NVMe carrying the write-ahead log, and half the bays left empty on purpose.',
})

const kit = {
  columns: ['Group', 'Chassis', 'Data disks', 'Write-ahead log', 'Link'],
  rows: [
    ['ossuary-01', '24-bay 4U', '12 × 8 TB SAS 7.2k', '2 × 480 GB NVMe', '10G'],
    ['ossuary-02', '24-bay 4U', '12 × 8 TB SAS 7.2k', '2 × 480 GB NVMe', '10G'],
    ['ossuary-03', '24-bay 4U', '12 × 8 TB SAS 7.2k', '2 × 480 GB NVMe', '2 × 1G bonded'],
  ],
}

const totals = [
  { value: '36', label: 'spinning disks' },
  { value: '288 TB', label: 'raw' },
  { value: '94 TB', label: 'usable' },
  { value: '36', label: 'bays still empty' },
]
</script>

<template>
  <PageHead
    crumb="storage"
    heading="Half the bays are empty, and that was the point"
    lede="Three 24-bay chassis holding twelve disks each. Buying twice the chassis for the disks I had means expansion is buying disks rather than buying servers — which is the only part of this design I got right first time."
  >
    <template #ghost><GhostStorage /></template>
    <template #tags>
      <ZoneChip zone="c">36 disks</ZoneChip>
      <ZoneChip zone="p">3× replication</ZoneChip>
      <ZoneChip zone="m">12u</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">the hardware</p>
    <h2>Three chassis, twelve disks each</h2>
    <StatGrid :items="totals" zone="c" />
    <div style="height:22px" />
    <DataTable :columns="kit.columns" :rows="kit.rows" />
    <div class="prose spaced">
      <p>Spinning disks for bulk, NVMe for the write-ahead log. That split is what makes a cluster of slow disks feel acceptable: the latency-sensitive metadata writes land on flash, and the platters do what platters are good at, which is holding a great deal of data cheaply.</p>
      <p>The failure domain is the host, not the disk. Three replicas across three chassis means any one of them can go offline — planned or otherwise — without a single object becoming unreadable.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the mistake</p>
    <h2>One node is on the wrong link speed</h2>
    <div class="prose">
      <p>The switch has two 10G ports and there are three storage nodes. That is the kind of arithmetic you only do once, and I did it after buying the switch.</p>
      <p>The third node runs on a bonded gigabit pair. It works, it re-balances more slowly than the other two, and it was invisible until I pulled a disk to test replacement — at which point the recovery ran at line rate over the slow link and the media server buffered for two hours. Nothing was at risk; it simply made the problem impossible to keep ignoring.</p>
      <p>The fix is a switch with four 10G ports, or a direct-attach mesh between the three storage nodes. It is the top item on the <NuxtLink to="/log">build log</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the trade</p>
    <h2>Replication instead of erasure coding</h2>
    <div class="prose">
      <p>Three-way replication costs two thirds of the raw capacity. Erasure coding would give back most of that, and I chose not to.</p>
      <ul>
        <li><strong>Rebuilds are dull.</strong> A replicated rebuild is a copy. An erasure-coded rebuild is arithmetic across every surviving node, and it is slower and heavier exactly when the cluster is already unhappy.</li>
        <li><strong>Dull is what you want at three in the morning</strong>, which is when you find out which one you picked.</li>
        <li><strong>Capacity is the cheap axis here.</strong> Thirty-six empty bays means the answer to running out is a disk order, not a redesign.</li>
      </ul>
      <p>What the pools hold and how the backups work is on the <NuxtLink to="/storage">storage page</NuxtLink>.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
