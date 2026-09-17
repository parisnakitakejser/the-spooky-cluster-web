<script setup lang="ts">
usePageSeo({
  title: 'Build log — the spooky cluster',
  description: 'What changed, what broke, and what I\'d do differently. Newest first.',
})

const power = [
  { value: '612 W', label: 'idle draw' },
  { value: '1.4 kW', label: 'under load' },
  { value: '27 °C', label: 'intake, summer' },
  { value: '~980 kr', label: 'per month' },
]

/** Newest first. `date` is the machine-readable value; `label` is what's shown. */
const entries = [
  {
    date: '2026-08-30',
    label: '30 Aug',
    title: 'Filled every empty U with blanking panels',
    body: 'Intake temperature dropped about 4 °C and the R640 fans stopped cycling. Two hundred kroner of plastic, the best thermal upgrade I have made, and I had been ignoring it for a year.',
  },
  {
    date: '2026-07-14',
    label: '14 Jul',
    title: 'Incident: Ceph re-balance saturated the gigabit node',
    body: 'Pulled a disk from ossuary-03 to test replacement. The re-balance ran at line rate over its 1G LACP pair and Jellyfin buffered for two hours. Nothing was at risk, but it exposed that one third of the storage tier is on the wrong link speed. Fix is a 10G card and a switch with more SFP+ ports.',
  },
  {
    date: '2026-06-02',
    label: '2 Jun',
    title: 'Moved staging onto its own cluster',
    body: 'It used to be a namespace. An upgrade test took the shared API server down and production went with it, which was the whole argument settled in one evening.',
  },
  {
    date: '2026-04-19',
    label: '19 Apr',
    title: 'Quarantine VLAN added',
    body: 'Uploads used to go straight from the proxy to the app. Now they land in a zone with no outbound route, get scanned, and only then move on. Adds about 400ms to a photo upload and removes a whole category of thing I\'d rather not think about.',
  },
  {
    date: '2026-02-08',
    label: '8 Feb',
    title: 'Incident: split-horizon DNS ate an afternoon',
    body: 'A service was unreachable from inside the house but fine from outside. Three hours of firewall archaeology later, it was a stale internal DNS record. Now logged here specifically so future me checks resolution first.',
  },
  {
    date: '2026-01-11',
    label: '11 Jan',
    title: 'Third off-site backup copy added',
    body: 'Monthly Restic to Backblaze B2 with an append-only application key. Two copies in Denmark is not the same as two copies in two buildings, and the mini PC at my parents\' is still in the same weather system as the rack.',
  },
]
</script>

<template>
  <PageHead
    crumb="build log"
    heading="What changed, what broke"
    lede="Newest first. Incidents are in here alongside the upgrades, because a homelab write-up that only lists successes is a brochure."
  >
    <template #ghost><GhostLog /></template>
  </PageHead>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the boring numbers</p>
    <h2>Power, heat and what it costs</h2>
    <p>Measured at the UPS, averaged over the last thirty days, at current Danish rates. Updated when I remember to.</p>
    <StatGrid :items="power" zone="s" />
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">entries</p>
    <h2>2026</h2>
    <div class="log">
      <article v-for="entry in entries" :key="entry.date" class="entry">
        <time :datetime="entry.date">{{ entry.label }}</time>
        <div>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.body }}</p>
        </div>
      </article>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">what's next</p>
    <h2>On the list</h2>
    <div class="prose">
      <ul>
        <li><strong>Fix ossuary-03's link speed.</strong> A switch with four SFP+ ports, or a direct-attach mesh between the storage nodes.</li>
        <li><strong>Intake ducting.</strong> The garage handles cooling for eight months a year. July needs help.</li>
        <li><strong>Second pair of eyes on firewall changes.</strong> No idea how to solve this as one person, but writing it down is a start.</li>
        <li><strong>Live status on this site.</strong> Pull real cluster state from Prometheus so the numbers here stop being a snapshot I typed by hand.</li>
      </ul>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
