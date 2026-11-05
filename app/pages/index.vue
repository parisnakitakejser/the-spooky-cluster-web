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
      <p>One big homelab somewhere in Denmark — a playground to build, break, and learn infrastructure, networking, Kubernetes, storage, security, AI, data, and everything in between.</p>
      <p>Everything coming from the internet is forced through a cleaning zone before it reaches the network that matters.</p>
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
    <p>Six numbers to give you a feel for the lab — the hardware, the infrastructure, and the scale of what’s running.</p>
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
