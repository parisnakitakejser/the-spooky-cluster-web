<script setup lang="ts">
usePageSeo({
  title: 'Network — the spooky cluster',
  description: 'Seven VLANs and an untagged household network, each with a purpose, an egress rule and a page of its own.',
})

const plan = {
  columns: ['VLAN', 'Subnet', 'Area', 'Egress', 'DHCP'],
  rows: networkAreas.map(a => [
    a.vlan ? String(a.vlan) : 'untagged',
    a.subnet,
    a.name,
    a.egress,
    a.dhcp,
  ]),
}

const devices = {
  columns: ['Device', 'Model', 'Role', 'Notes'],
  rows: [
    ['obelisk', 'Intel N100 · 4× 2.5GbE · 16 GB', 'Router, firewall, IDS', 'Idles at 9 W and routes a gigabit line without breathing hard.'],
    ['switchboard', 'MikroTik CRS326-24G-2S+', 'Core switch', '24 gigabit ports, 2 SFP+. The two 10G ports are the whole reason storage is laid out the way it is.'],
  ],
}
</script>

<template>
  <PageHead
    crumb="network"
    heading="Flat enough to debug, segmented enough to survive"
    lede="Seven VLANs and one untagged household network, one router, one switch. Each area exists because something in it should not be able to reach something else — and each has a page saying what and why."
  >
    <template #ghost><GhostNetwork /></template>
    <template #tags>
      <ZoneChip zone="m">7 vlans</ZoneChip>
      <ZoneChip zone="p">2× 10g</ZoneChip>
      <ZoneChip zone="s">1 gbit uplink</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">addressing</p>
    <h2>The plan, on one screen</h2>
    <p>Numbered so the second digit hints at the zone, which sounds clever and mostly just means I stop mistyping subnets at 2am. Everything is static except the household network, because an address that never changes is an address a firewall rule can name.</p>
    <DataTable :columns="plan.columns" :rows="plan.rows" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the areas</p>
    <h2>Eight areas, each with one job</h2>
    <p>Segmentation is only worth the trouble if each boundary has a reason you can state. These are the reasons.</p>
    <div class="deck">
      <NuxtLink
        v-for="area in networkAreas"
        :key="area.slug"
        class="card"
        :to="`/network/${area.slug}`"
        :style="`--zc:var(--${area.zone})`"
      >
        <h3>{{ area.name }}</h3>
        <p>{{ area.purpose }}</p>
        <span class="meta">
          {{ area.vlan ? `vlan ${area.vlan}` : 'untagged' }} · egress {{ area.egress }}
        </span>
      </NuxtLink>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">hardware</p>
    <h2>Two boxes do all of it</h2>
    <DataTable :columns="devices.columns" :rows="devices.rows" />
    <div class="prose spaced">
      <p>Storage replication and Kubernetes traffic share the same switch fabric but not the same VLAN, and storage gets priority queueing. During a re-balance the cluster will happily saturate a gigabit link, so QoS is doing real work rather than sitting in the config as decoration.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">names</p>
    <h2>DNS, and one split-horizon regret</h2>
    <div class="prose">
      <p>Internal names resolve through a pair of <NuxtLink to="/radar/adguard-home">AdGuard Home</NuxtLink> instances on the management cluster, forwarding to <NuxtLink to="/radar/unbound">Unbound</NuxtLink> with DNSSEC. The public zone is hosted externally, and cert-manager solves DNS-01 challenges against it, so no service ever needs to answer on port 80.</p>
      <p>Split-horizon means <code>photos.spooky.rest</code> resolves to a private address inside the house and a public one outside. It works, and it is the single most confusing thing in the lab whenever something breaks — half of all my debugging false starts have been a stale DNS answer rather than the thing I was actually chasing. I would probably use distinct internal names if I started again.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">remote access</p>
    <h2>Getting in from outside</h2>
    <div class="prose">
      <p>There is no VPN concentrator exposed on the edge and no open management port. <NuxtLink to="/radar/wireguard">WireGuard</NuxtLink> runs on the router, listening on a single UDP port, with peers pinned by public key — no password path, no user enumeration, nothing to brute force.</p>
      <ul>
        <li><strong>Phone and laptop</strong> — peers that land on the <NuxtLink to="/network/home-lan">household network</NuxtLink>, not the <NuxtLink to="/network/management">management one</NuxtLink>.</li>
        <li><strong>Management access</strong> — a second hop from there, so a stolen laptop is not instantly iDRAC access.</li>
        <li><strong>Emergency</strong> — a serial console on the router reachable from a cheap LTE-connected Pi that can only do one thing: power-cycle the router and open a console.</li>
      </ul>
      <p>The Pi is the piece I am least happy with. It is a second way in, which is the definition of a second way in for someone else too. It is on its own VLAN with no route anywhere, and I still think about it.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
