<script setup lang="ts">
usePageSeo({
  title: 'Safeguard — the rack — the spooky cluster',
  description: 'The edge of the rack: one small box doing routing, firewalling and intrusion detection at nine watts.',
})

const kit = {
  columns: ['Machine', 'What it is', 'What it does'],
  rows: [
    ['obelisk', 'Intel N100 · 4× 2.5GbE · 16 GB · fanless', 'Routing, firewall, VPN termination, inline IDS'],
  ],
}
</script>

<template>
  <PageHead
    crumb="safeguard"
    heading="Everything arrives here first, and most of it stops"
    lede="One fanless box between the internet and everything else. It routes, it filters, it inspects, and it draws about as much power as a light bulb doing it."
  >
    <template #ghost><GhostSecurity /></template>
    <template #tags>
      <ZoneChip zone="d">1u</ZoneChip>
      <ZoneChip zone="p">~9 w</ZoneChip>
      <ZoneChip zone="m">default deny</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the hardware</p>
    <h2>One box, and why it is small on purpose</h2>
    <DataTable :columns="kit.columns" :rows="kit.rows" />
    <div class="prose spaced">
      <p>A fanless N100 routes a gigabit line without breathing hard, and a box with no moving parts is a box with nothing to fail mechanically. The temptation with an edge device is to buy something with headroom for a line speed you will never have; what you actually want is something quiet, cheap to run, and boring enough that you forget it exists.</p>
      <p>It runs <NuxtLink to="/radar/opnsense">OPNsense</NuxtLink>, with <NuxtLink to="/radar/suricata">Suricata</NuxtLink> inline on the WAN interface and mirroring the DMZ segment, and <NuxtLink to="/radar/wireguard">WireGuard</NuxtLink> terminating on a single UDP port.</p>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">what it enforces</p>
    <h2>Default deny, in both directions</h2>
    <div class="prose">
      <p>The important property is not what it blocks but how short the accept list is. Seven rules, and they fit on one screen deliberately — a policy I cannot read in one sitting is a policy I cannot reason about, and a policy I cannot reason about is one I will eventually widen "just for now".</p>
      <p>Outbound matters as much as inbound. A cluster that can reach anything is a cluster that can be told to reach anything, so egress is an allowlist through a proxy and most areas have none at all.</p>
      <p>The full rule set and the zone chain it enforces are on the <NuxtLink to="/security">security page</NuxtLink>; what each area may reach is on its own <NuxtLink to="/network">network page</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the trade</p>
    <h2>What one box costs me</h2>
    <div class="prose">
      <ul>
        <li><strong>It is a single point of failure</strong>, and I have accepted that. A second unit in failover would double the cost and the maintenance to protect against a failure mode that has not happened — but it does mean a dead edge is a dead house.</li>
        <li><strong>Inline inspection costs throughput.</strong> Measured rather than assumed, and it has not been the bottleneck on a gigabit line. It would be on a faster one.</li>
        <li><strong>Upgrades occasionally reshuffle plugin behaviour.</strong> Config backup before every one, without exception.</li>
        <li><strong>Rule order is easy to lose track of.</strong> Keeping the list short is the mitigation, and it is the only one that has worked.</li>
      </ul>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
