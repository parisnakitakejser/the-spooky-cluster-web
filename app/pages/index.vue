<script setup lang="ts">
useSeoMeta({
  title: 'the spooky cluster — homelab',
  description: 'A 42U homelab near Aarhus running Kubernetes, Ceph and a segmented security zone. Hardware, topology and numbers.',
})

/** Each tile carries its own zone colour, so `zone` rides along with the number. */
const headline = [
  { value: '8', label: 'physical nodes', zone: 'p' },
  { value: '1.4 TB', label: 'total memory', zone: 'p' },
  { value: '94 TB', label: 'usable storage', zone: 'c' },
  { value: '84', label: 'workloads', zone: 'm' },
  { value: '612 W', label: 'idle draw', zone: 's' },
  { value: '7', label: 'network zones', zone: 'd' },
]

const cards = [
  { to: '/rack', zone: 'mgmt', title: 'The rack', body: 'All 42U, front and back, including the empty slots and what I\'m saving them for.', meta: 'elevation · cabling · airflow' },
  { to: '/compute', zone: 'prod', title: 'Compute', body: 'Three separate Kubernetes clusters and why they aren\'t three namespaces.', meta: 'prod · stage · management' },
  { to: '/storage', zone: 'ceph', title: 'Storage', body: 'Ceph across 36 disks, the CRUSH layout, and the backup that isn\'t Ceph.', meta: 'osds · pools · backups' },
  { to: '/security', zone: 'dmz', title: 'Security', body: 'The cleaning zone: DMZ, quarantine, secure, SIEM, and the rules between them.', meta: 'zones · policy · detection' },
  { to: '/network', zone: 'stage', title: 'Network', body: 'VLANs, routing, DNS, and the decision to run 10G only where it earns its heat.', meta: 'vlans · routing · dns' },
  { to: '/radar', zone: 'mgmt', title: 'Tech radar', body: 'Every tool in the rack, ringed by how much I trust it — and a page of detail on each one.', meta: 'adopt · trial · assess · hold' },
  { to: '/log', zone: 'pink', title: 'Build log', body: 'What changed, what broke, and what I\'d do differently. Newest first.', meta: 'changes · incidents' },
]
</script>

<template>
  <section class="hero">
    <GhostEmblem />

    <div>
      <h1>the spooky cluster</h1>
      <p>One 42U rack in a garage outside Aarhus. Three Kubernetes clusters, a Ceph pool, and everything from the internet forced through a cleaning zone before it touches anything that matters. Hardware, topology and the numbers I'm not proud of.</p>
      <div class="hero-strip">
        <ZoneChip zone="p" to="/compute">prod</ZoneChip>
        <ZoneChip zone="s" to="/compute">stage</ZoneChip>
        <ZoneChip zone="m" to="/compute">mgmt</ZoneChip>
        <ZoneChip zone="c" to="/storage">ceph</ZoneChip>
        <ZoneChip zone="d" to="/security">dmz</ZoneChip>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">at a glance</p>
    <h2>The whole lab in six numbers</h2>
    <p>Everything below is measured, not estimated. Where I've guessed, it says so on the page.</p>
    <div class="stats">
      <div v-for="stat in headline" :key="stat.label" class="stat" :class="stat.zone">
        <b>{{ stat.value }}</b>
        <span>{{ stat.label }}</span>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the rest of the site</p>
    <h2>Where to go next</h2>
    <p>Each section stands alone. If you only read one, read the security page — it's the part that took longest and the part most homelab write-ups skip.</p>
    <div class="deck">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        class="card"
        :to="card.to"
        :style="`--zc:var(--${card.zone})`"
      >
        <h3>{{ card.title }}</h3>
        <p>{{ card.body }}</p>
        <span class="meta">{{ card.meta }}</span>
      </NuxtLink>
    </div>
  </section>

  <SiteFooter>
    <NuxtLink to="/log">Build log</NuxtLink>
    <a href="#main">Back to top</a>
  </SiteFooter>
</template>
