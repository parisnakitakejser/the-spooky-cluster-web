<script setup lang="ts">
useSeoMeta({
  title: 'Security — the spooky cluster',
  description: 'The cleaning zone: DMZ, quarantine, secure and SIEM, the rules between them, and what gets logged.',
})

const zones = [
  { zone: 'dmz', title: 'DMZ', body: 'Public ingress, reverse proxy, WAF. Nothing stateful lives here and nothing here holds a credential worth stealing.', vlan: 'vlan 40' },
  { zone: 'mgmt', title: 'Quarantine', body: 'Uploads and untrusted files land here first and get scanned before anything else can read them. No outbound internet.', vlan: 'vlan 50' },
  { zone: 'prod', title: 'Secure', body: 'The cluster and storage networks. Reachable from the proxy, never from the internet, never from quarantine.', vlan: 'vlan 20 · 30 · 35' },
  { zone: 'ceph', title: 'SIEM', body: 'Wazuh, Suricata and Loki. Receives from every zone and initiates no connection of its own.', vlan: 'vlan 99' },
]

const policy = {
  columns: ['From', 'To', 'Ports', 'Notes'],
  rows: [
    ['internet', 'dmz', '443', 'HTTPS only, rate limited at the edge'],
    ['dmz', 'secure', '8080', 'Proxied app traffic, single upstream per host'],
    ['dmz', 'quarantine', '9000', 'File hand-off for scanning'],
    ['quarantine', 'secure', '8080', 'Only after a clean scan verdict'],
    ['lan', 'secure', '443, 6443', 'My own machines, WireGuard or on-site'],
    ['all zones', 'siem', '514, 1514', 'Syslog and agent traffic, one way'],
    ['secure', 'internet', '443', 'Image pulls and updates, through a proxy allowlist'],
  ],
}
</script>

<template>
  <PageHead
    crumb="security"
    heading="Nothing reaches the clusters unwashed"
    lede="Inbound traffic takes the long way round. Each zone is its own VLAN with its own firewall policy, and traffic only ever moves in one direction through the chain. If something in the DMZ is compromised, the blast radius is the DMZ."
  >
    <template #ghost><GhostSecurity /></template>
    <template #tags>
      <ZoneChip zone="d">dmz</ZoneChip>
      <ZoneChip zone="m">quarantine</ZoneChip>
      <ZoneChip zone="p">secure</ZoneChip>
      <ZoneChip zone="c">siem</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the chain</p>
    <h2>How a request gets in</h2>
    <p>Solid lines are traffic. Dashed lines are logs, and they only ever point one way — into the SIEM, never back out.</p>
    <SecurityChain />
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">zones</p>
    <h2>What each zone is allowed to do</h2>
    <div class="flow">
      <div v-for="zone in zones" :key="zone.title" class="zone" :style="`--zc:var(--${zone.zone})`">
        <h3>{{ zone.title }}</h3>
        <p>{{ zone.body }} <code>{{ zone.vlan }}</code></p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">policy</p>
    <h2>The rules, in full</h2>
    <p>Default deny in both directions. These are the only accepts, and the list fitting on one screen is deliberate — if I can't read the whole policy at once, I can't reason about it.</p>
    <DataTable :columns="policy.columns" :rows="policy.rows" />
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">detection and honesty</p>
    <h2>What I'd still lose</h2>
    <div class="prose">
      <p>Suricata runs inline at the edge on the WAN interface and mirrors the DMZ segment. Wazuh agents sit on every node, watching file integrity on the Kubernetes config paths and shipping auth logs. Alerts go to a private Matrix room, and anything above medium severity also rings my phone.</p>
      <p>The part most homelab write-ups leave out: this design assumes the attacker comes from the internet. It does very little about a malicious container image I pulled myself, and nothing at all about someone with physical access to the garage. Renovate pinning digests helps with the first. The second is a lock and a hope.</p>
      <p>The other honest gap is that I am one person. There's no rotation, no second pair of eyes on a firewall change, and if I'm on holiday when something fires, it fires into an empty room until I land.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
