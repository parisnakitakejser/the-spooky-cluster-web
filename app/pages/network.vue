<script setup lang="ts">
useSeoMeta({
  title: 'Network — the spooky cluster',
  description: 'VLAN plan, routing, DNS and remote access for a 42U homelab near Aarhus.',
})

const vlans = {
  columns: ['VLAN', 'Subnet', 'Purpose', 'Egress', 'DHCP'],
  rows: [
    ['10', '10.10.0.0/24', 'Management, IPMI, iDRAC', 'none', 'static only'],
    ['20', '10.20.0.0/22', 'Kubernetes production', 'proxy allowlist', 'static only'],
    ['30', '10.30.0.0/22', 'Kubernetes staging', 'proxy allowlist', 'static only'],
    ['35', '10.35.0.0/24', 'Ceph public and cluster', 'none', 'static only'],
    ['40', '10.40.0.0/24', 'DMZ', 'internet', 'static only'],
    ['50', '10.50.0.0/24', 'Quarantine', 'none', 'static only'],
    ['99', '10.99.0.0/24', 'SIEM collection', 'none', 'static only'],
  ],
}

const devices = {
  columns: ['Device', 'Model', 'Role', 'Notes'],
  rows: [
    ['obelisk', 'Intel N100 · 4× 2.5GbE · 16 GB', 'Router, firewall, IDS', 'OPNsense. Idles at 9 W and routes a gigabit line without breathing hard.'],
    ['switchboard', 'MikroTik CRS326-24G-2S+', 'Core switch', '24 gigabit ports, 2 SFP+. The two 10G ports are the whole reason storage is laid out the way it is.'],
  ],
}
</script>

<template>
  <PageHead
    crumb="network"
    heading="Flat enough to debug, segmented enough to survive"
    lede="Seven VLANs, one router, one switch. Ten gigabit exists only where it earns its heat, which turns out to be exactly two links. Everything else is gigabit and has never once been the bottleneck."
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
    <h2>The VLAN plan</h2>
    <p>Numbered so the second digit hints at the zone, which sounds clever and mostly just means I stop mistyping subnets at 2am.</p>
    <DataTable :columns="vlans.columns" :rows="vlans.rows" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">hardware</p>
    <h2>Two boxes do all of it</h2>
    <DataTable :columns="devices.columns" :rows="devices.rows" />
    <div class="prose spaced">
      <p>Ceph replication traffic and Kubernetes traffic share the same switch fabric but not the same VLAN, and storage gets priority queueing. During a re-balance the cluster will happily saturate a gigabit link, so QoS is doing real work rather than sitting in the config as decoration.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">names</p>
    <h2>DNS, and one split-horizon regret</h2>
    <div class="prose">
      <p>Internal names resolve through a pair of AdGuard Home instances on the management cluster, forwarding to Unbound with DNSSEC. The public zone is on Cloudflare, and cert-manager uses DNS-01 against it, so no service ever needs to answer a challenge on port 80.</p>
      <p>Split-horizon means <code>photos.spooky.example</code> resolves to a private address inside the house and a public one outside. It works, and it is the single most confusing thing in the lab whenever something breaks — half of all my debugging false starts have been a stale DNS answer rather than the thing I was actually chasing. I'd probably use distinct internal names if I started again.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">remote access</p>
    <h2>Getting in from outside</h2>
    <div class="prose">
      <p>There is no VPN concentrator exposed on the edge and no open management port. WireGuard runs on the router, listening on a single UDP port, with peers pinned by public key — no password path, no user enumeration, nothing to brute force.</p>
      <ul>
        <li><strong>Phone and laptop</strong> — WireGuard peers that land on the LAN VLAN, not the management one.</li>
        <li><strong>Management access</strong> — from LAN, a second hop to the management VLAN, so a stolen laptop is not instantly iDRAC access.</li>
        <li><strong>Emergency</strong> — a serial console on the router reachable from a cheap LTE-connected Pi that can only do one thing: power-cycle the router and open a console.</li>
      </ul>
      <p>The Pi is the piece I'm least happy with. It is a second way in, which is the definition of a second way in for someone else too. It is on its own VLAN with no route anywhere, and I still think about it.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
