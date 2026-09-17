<script setup lang="ts">
useSeoMeta({
  title: 'The rack — the spooky cluster',
  description: 'Full 42U front and rear elevation of the Spooky Cluster rack, with cabling and airflow notes.',
})

/** Front elevation, top to bottom. `tag` is the short zone class; `x` means empty. */
const elevation = [
  { u: 'U42', name: '— reserved for exhaust —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U41', name: '— reserved for exhaust —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U40', name: 'obelisk', detail: 'OPNsense · N100 · 4× 2.5GbE · 16 GB', tag: 'd', label: 'edge' },
  { u: 'U39', name: 'patch-01', detail: '24-port Cat6A keystone panel', tag: 'm', label: 'passive' },
  { u: 'U38', name: 'switchboard', detail: 'MikroTik CRS326 · 24× GbE · 2× SFP+', tag: 'm', label: 'net' },
  { u: 'U37', name: 'brush', detail: '1U cable management brush panel', tag: 'm', label: 'passive' },
  { u: 'U36', name: '— airflow gap —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U35', name: '— airflow gap —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U33–34', name: 'crypt-01', detail: 'Dell R640 · 2× Xeon 6248 · 384 GB · 2× 960 GB NVMe', tag: 'p', label: 'k8s prod' },
  { u: 'U31–32', name: 'crypt-02', detail: 'Dell R640 · 2× Xeon 6248 · 384 GB · 2× 960 GB NVMe', tag: 'p', label: 'k8s prod' },
  { u: 'U29–30', name: 'crypt-03', detail: 'Dell R640 · 2× Xeon 6248 · 384 GB · 2× 960 GB NVMe', tag: 'p', label: 'k8s prod' },
  { u: 'U28', name: '— reserved: crypt-04 —', detail: 'when prod memory passes 80%', tag: 'x', empty: true },
  { u: 'U27', name: '— reserved: crypt-04 —', detail: 'when prod memory passes 80%', tag: 'x', empty: true },
  { u: 'U25–26', name: 'rehearsal-01', detail: 'Dell R630 · 2× Xeon E5-2680v4 · 128 GB', tag: 's', label: 'k8s stage' },
  { u: 'U23–24', name: 'rehearsal-02', detail: 'Dell R630 · 2× Xeon E5-2680v4 · 128 GB', tag: 's', label: 'k8s stage' },
  { u: 'U22', name: '— airflow gap —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U21', name: 'séance', detail: '3× NUC 13 Pro on a 1U shelf · Talos', tag: 'm', label: 'k8s mgmt' },
  { u: 'U20', name: 'shelf', detail: '1U vented shelf · spare NUC, label printer', tag: 'm', label: 'passive' },
  { u: 'U19', name: '— airflow gap —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U18', name: '— airflow gap —', detail: 'blanking panel', tag: 'x', empty: true },
  { u: 'U14–17', name: 'ossuary-01', detail: 'Supermicro 846 · 12× 8 TB · 2× NVMe WAL · 64 GB', tag: 'c', label: 'ceph osd' },
  { u: 'U10–13', name: 'ossuary-02', detail: 'Supermicro 846 · 12× 8 TB · 2× NVMe WAL · 64 GB', tag: 'c', label: 'ceph osd' },
  { u: 'U06–09', name: 'ossuary-03', detail: 'Supermicro 846 · 12× 8 TB · 2× NVMe WAL · 64 GB', tag: 'c', label: 'ceph osd' },
  { u: 'U05', name: '— reserved: ossuary-04 —', detail: 'when the pool passes 70%', tag: 'x', empty: true },
  { u: 'U03–04', name: 'lifeline', detail: 'APC SMT3000RMI · 3 kVA · ~28 min hold', tag: 'm', label: 'power' },
  { u: 'U02', name: 'pdu-a', detail: 'Switched PDU · 8× C13 · per-outlet metering', tag: 'm', label: 'power' },
  { u: 'U01', name: 'pdu-b', detail: 'Switched PDU · 8× C13 · per-outlet metering', tag: 'm', label: 'power' },
]
</script>

<template>
  <PageHead
    crumb="rack"
    heading="One cabinet, 42 slots, 12 of them empty"
    lede="A second-hand APC AR3100 that came out of an office move for the price of collecting it. Bottom-heavy on purpose: storage carries the weight, the loudest fans sit as far from the ceiling as possible, and the top 8U stay empty because hot air has to go somewhere."
  >
    <template #ghost><GhostRack /></template>
    <template #tags>
      <ZoneChip zone="m">42u</ZoneChip>
      <ZoneChip zone="p">30u used</ZoneChip>
      <ZoneChip zone="s">1.4 kW peak</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">front elevation · top to bottom</p>
    <h2>What's in it right now</h2>
    <p>Everything is on rails except the switch, which sits on a shelf because I bought the wrong mounting ears and have not felt strongly enough about it since.</p>
    <div class="rows">
      <div v-for="slot in elevation" :key="slot.u" class="row" :class="{ empty: slot.empty }">
        <span class="u">{{ slot.u }}</span>
        <span class="n">{{ slot.name }}</span>
        <span class="d">{{ slot.detail }}</span>
        <span class="t" :class="slot.tag">{{ slot.label ?? 'empty' }}</span>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">rear</p>
    <h2>The back, which is where it goes wrong</h2>
    <div class="prose">
      <p>The rear is divided into three vertical runs so I can trace a cable without unracking anything. Power on the right, copper down the middle, fibre on the left with a generous bend radius. Every cable is labelled at both ends with a printed wrap, not a marker pen, because marker pen lasts about four months in a warm cabinet.</p>
      <ul>
        <li><strong>Left run</strong> — 2× OM4 LC-LC from the switch SFP+ cage to ossuary-01 and 02. Nothing else touches this channel.</li>
        <li><strong>Middle run</strong> — 26 Cat6A patch leads, colour-coded by VLAN: cyan for prod, lime for stage, amber for management, red for the DMZ.</li>
        <li><strong>Right run</strong> — C13 to C14 from both PDUs. Dual-PSU machines take one feed from each PDU so I can power-cycle a whole rail without dropping a node.</li>
      </ul>
      <p>IPMI and iDRAC sit on their own VLAN with no route off the rack. If I need them from outside the house, I go through the management cluster first — see the <NuxtLink to="/network">network page</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">airflow and noise</p>
    <h2>Heat, and the neighbours</h2>
    <div class="prose">
      <p>Cold aisle at the front, hot aisle behind, and every unused U filled with a blanking panel — without them, hot exhaust loops back over the top of the servers and the R640 fans spin up to compensate. Filling the gaps dropped intake temperature by about 4 °C and took roughly 200 kr of plastic.</p>
      <p>The garage is unheated, which does most of the work for eight months of the year. In July it does not, and the rack idles around 27 °C intake with the door propped open. A proper intake duct is on the list.</p>
      <p>Noise is the real constraint. The Supermicro chassis shipped with fans that sound like a hand dryer; they now run Noctua NF-A8 industrials on a fan-curve script tied to drive temperature. It costs about 3 °C on the disks and buys back roughly 20 dB, which is the difference between a garage I can work in and one I can't.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
