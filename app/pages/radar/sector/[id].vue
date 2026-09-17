<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))
const sector = computed(() => radarQuadrant(id.value))

if (!sector.value) {
  throw createError({ statusCode: 404, statusMessage: `No radar sector: ${id.value}`, fatal: true })
}

usePageSeo({
  title: () => `${sector.value?.name} — tech radar — the spooky cluster`,
  description: () => sector.value?.blurb ?? '',
})

/** Placement is global, so the blips sit exactly where they do on the full chart. */
const blips = computed(() => placeBlips().filter(b => b.quadrant.id === id.value))

const byRing = computed(() =>
  radarRings
    .map(ring => ({ ring, items: blips.value.filter(b => b.ring.id === ring.id) }))
    .filter(r => r.items.length),
)

const others = computed(() => radarQuadrants.filter(q => q.id !== id.value))
</script>

<template>
  <div v-if="sector">
    <PageHead
      :crumb="sector.id"
      :heading="sector.name"
      :lede="sector.blurb"
    >
      <template #ghost><GhostRadar /></template>
      <template #tags>
        <ZoneChip :zone="zoneChip(sector.zone)">{{ blips.length }} tools</ZoneChip>
        <ZoneChip
          v-for="r in byRing"
          :key="r.ring.id"
          :zone="zoneChip(ringZone[r.ring.id])"
        >{{ r.items.length }} {{ r.ring.name.toLowerCase() }}</ZoneChip>
      </template>
    </PageHead>

    <section class="unit" :data-zone="sector.zone">
      <p class="u-slot">in context</p>
      <h2>This slice of the whole radar</h2>
      <p>The rest is dimmed rather than removed, because where a sector sits relative to the others is part of what the chart is for.</p>
      <RadarBoard :active="sector.id" :show-key="false" />
    </section>

    <section
      v-for="r in byRing"
      :key="r.ring.id"
      class="unit"
      :data-zone="ringZone[r.ring.id]"
    >
      <p class="u-slot">{{ r.ring.name.toLowerCase() }}</p>
      <h2>{{ r.ring.blurb }}</h2>
      <RadarLegend :blips="r.items" />
    </section>

    <section class="unit" data-zone="prod">
      <p class="u-slot">the other sectors</p>
      <h2>Elsewhere on the radar</h2>
      <div class="deck">
        <NuxtLink
          v-for="other in others"
          :key="other.id"
          class="card"
          :to="`/radar/sector/${other.id}`"
          :style="`--zc:var(--${other.zone})`"
        >
          <h3>{{ other.name }}</h3>
          <p>{{ other.blurb }}</p>
          <span class="meta">{{ radarEntries.filter(e => e.quadrant === other.id).length }} tools</span>
        </NuxtLink>
      </div>
    </section>

    <SitePager />
    <SiteFooter />
  </div>
</template>
