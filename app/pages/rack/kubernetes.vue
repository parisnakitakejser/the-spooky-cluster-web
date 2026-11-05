<script setup lang="ts">
usePageSeo({
  title: 'Kubernetes hardware — the rack — the spooky cluster',
  description: 'Eight machines running three separate Kubernetes clusters, and why that is three clusters rather than three namespaces.',
})

const kit = {
  columns: ['Group', 'Machines', 'Each one', 'Cluster'],
  rows: [
    ['crypt', '3 × 2U', '2× Xeon Gold 6248 · 384 GB · 2× 960 GB NVMe', 'Production'],
    ['rehearsal', '2 × 2U', '2× Xeon E5-2680v4 · 128 GB', 'Staging'],
    ['séance', '3 × mini PC on a shelf', 'NUC 13 Pro · Talos', 'Management'],
  ],
}

const totals = [
  { value: '8', label: 'machines' },
  { value: '176', label: 'vCPU' },
  { value: '1.4 TB', label: 'memory' },
  { value: '~310 W', label: 'idle draw' },
]
</script>

<template>
  <PageHead
    crumb="kubernetes"
    heading="Eight machines, three clusters, one reason"
    lede="Production and staging are physically separate because a shared API server is a shared outage. That costs more hardware and more maintenance than namespace isolation, and it settled an argument that had already cost me a production evening."
  >
    <template #ghost><GhostCompute /></template>
    <template #tags>
      <ZoneChip zone="p">prod · 3</ZoneChip>
      <ZoneChip zone="s">stage · 2</ZoneChip>
      <ZoneChip zone="m">mgmt · 3</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the hardware</p>
    <h2>Used enterprise gear, bought slowly</h2>
    <StatGrid :items="totals" zone="p" />
    <div style="height:22px" />
    <DataTable :columns="kit.columns" :rows="kit.rows" />
    <div class="prose spaced">
      <p>Two generations of second-hand server and three mini PCs. The older pair carry staging precisely because they are older: staging exists to fail first, and hardware that is one generation behind fails in interesting ways that teach you something before production meets them.</p>
      <p>The management cluster is three small machines rather than one, because the thing that deploys everything else should survive losing a node. It runs <NuxtLink to="/radar/talos-linux">Talos</NuxtLink>, which has no shell and no package manager — a dead node is a reinstall from a versioned config rather than an archaeology project.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">why this shape</p>
    <h2>Three nodes is the number that makes quorum boring</h2>
    <div class="prose">
      <p>Each production node is both control plane and worker, which is not best practice and is correct for three machines. Dedicating nodes to the control plane at this size means buying three more servers to run a component that idles.</p>
      <p>Three is also the smallest number that tolerates losing one without losing quorum. Two nodes is a cluster that cannot survive a reboot; four is three plus an expense.</p>
      <p>What actually runs on these clusters is on the <NuxtLink to="/compute">compute page</NuxtLink>; the networks they sit on are on the <NuxtLink to="/network/production">production</NuxtLink> and <NuxtLink to="/network/staging">staging</NuxtLink> area pages.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the trade</p>
    <h2>What eight machines cost</h2>
    <div class="prose">
      <ul>
        <li><strong>Three clusters is three upgrade cycles.</strong> The work scales with cluster count, not node count, and this is the largest ongoing cost of the decision.</li>
        <li><strong>Idle draw is most of the power bill.</strong> Xeons from this era idle high; a modern single socket would do the same work for less, and replacing working hardware to save watts has never quite penciled out.</li>
        <li><strong>Memory is the constraint that will move first.</strong> There is spare capacity reserved for a fourth production node, and the trigger is production memory passing 80%.</li>
        <li><strong>Anti-affinity rules quietly become unschedulable</strong> at this node count. Worth knowing before you write one.</li>
      </ul>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
