<script setup lang="ts">
usePageSeo({
  title: 'the spooky cluster — homelab',
  description: 'A 42U homelab running Kubernetes, Ceph and a segmented security zone. Hardware, topology and numbers.',
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

</script>

<template>
  <section class="hero">
    <GhostEmblem />

    <div>
      <h1>the spooky cluster</h1>
      <p>One 42U rack in a garage somewhere in Denmark. Three Kubernetes clusters, a Ceph pool, and everything from the internet forced through a cleaning zone before it touches anything that matters. Hardware, topology and the numbers I'm not proud of.</p>
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

  <SiteFooter>
    <NuxtLink to="/log">Build log</NuxtLink>
    <a href="#main">Back to top</a>
  </SiteFooter>
</template>
