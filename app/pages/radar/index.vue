<script setup lang="ts">
useSeoMeta({
  title: 'Tech radar — the spooky cluster',
  description: 'Every tool in the rack, placed on a radar: what I have adopted, what is on trial, what I am researching, and what I am no longer starting anything new with.',
})

const active = ref<string | null>(null)
const blips = computed(() => placeBlips())

/** Grouped for the text version, which is the one that works without the chart. */
const byQuadrant = computed(() =>
  radarQuadrants.map(quadrant => ({
    quadrant,
    rings: radarRings
      .map(ring => ({
        ring,
        blips: blips.value.filter(b => b.quadrant.id === quadrant.id && b.ring.id === ring.id),
      }))
      .filter(r => r.blips.length),
  })),
)

const counts = radarCounts()

function toggle(id: string) {
  active.value = active.value === id ? null : id
}
</script>

<template>
  <PageHead
    crumb="tech radar"
    heading="Everything in the rack, and how much I trust it"
    lede="Rings say how much I trust a thing; sectors say what part of the rack it belongs to. Every blip opens a page with what it is, what it does here, and the parts that bite — including the ones I got wrong."
  >
    <template #ghost><GhostRadar /></template>
    <template #tags>
      <ZoneChip v-for="c in counts" :key="c.ring.id" :zone="zoneChip(ringZone[c.ring.id])">
        {{ c.count }} {{ c.ring.name.toLowerCase() }}
      </ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the chart</p>
    <h2>{{ radarEntries.length }} tools, {{ radarQuadrants.length }} {{ sectorNoun }}, {{ radarRings.length }} rings</h2>
    <p>Adopt is at the centre. A blip only moves when I change my mind about it, so position within a ring means nothing — it is there to stop the labels colliding.</p>

    <div class="radar-filter">
      <button
        v-for="q in radarQuadrants"
        :key="q.id"
        type="button"
        class="chip"
        :class="{ on: active === q.id }"
        :style="`--zc:var(--${q.zone})`"
        :aria-pressed="active === q.id"
        @click="toggle(q.id)"
      >
        <i />{{ q.name }}
      </button>
      <button
        v-if="active"
        type="button"
        class="chip clear"
        @click="active = null"
      >show all</button>
    </div>

    <RadarChart :active="active" />
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">what the rings mean</p>
    <h2>Four rings, and what putting something in one commits me to</h2>
    <div class="flow">
      <div
        v-for="ring in radarRings"
        :key="ring.id"
        class="zone"
        :style="`--zc:var(--${ringZone[ring.id] ?? 'faint'})`"
      >
        <h3>{{ ring.name }}</h3>
        <p>{{ ring.blurb }}</p>
      </div>
    </div>
  </section>

  <section
    v-for="group in byQuadrant"
    :key="group.quadrant.id"
    class="unit"
    :data-zone="group.quadrant.zone"
  >
    <p class="u-slot">{{ group.quadrant.id }}</p>
    <h2>{{ group.quadrant.name }}</h2>
    <p>{{ group.quadrant.blurb }}</p>
    <template v-for="r in group.rings" :key="r.ring.id">
      <h3>{{ r.ring.name }}</h3>
      <RadarLegend :blips="r.blips" />
    </template>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">how to read it</p>
    <h2>The honest caveats</h2>
    <div class="prose">
      <p>A radar is a snapshot of one person's opinion on one rack. Nothing here is a recommendation for your setup, and half of these choices are downstream of constraints you do not have — a garage in Denmark, a gigabit line, and exactly two SFP+ ports.</p>
      <ul>
        <li><strong>Adopt does not mean best.</strong> It means I run it, I have restored from it or rebuilt it, and I would do so again.</li>
        <li><strong>Hold is rarely an insult.</strong> Most things land there because something else won a bake-off, or because a migration is underway. The entry says which.</li>
        <li><strong>Research means I have read the docs</strong> and maybe built a toy. Nothing is running. Treat those opinions as cheap.</li>
        <li><strong>Dates are when it last moved</strong>, not when I first heard of it.</li>
      </ul>
      <p>Entries live in <code>app/utils/radar.ts</code>. Adding one is adding an object — the chart, the numbering and the detail page all follow from it.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
