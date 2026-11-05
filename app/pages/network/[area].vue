<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.area))
const area = computed(() => networkArea(slug.value))

if (!area.value) {
  throw createError({ statusCode: 404, statusMessage: `No network area: ${slug.value}`, fatal: true })
}

usePageSeo({
  title: () => `${area.value?.name} — network — the spooky cluster`,
  description: () => area.value?.purpose ?? '',
})

const reaches = computed(() => ({
  columns: ['May open a connection to', 'Ports', 'What for'],
  rows: area.value!.reaches.map(r => [r.to, r.ports, r.note]),
}))

const reachedBy = computed(() => ({
  columns: ['May be reached from', 'Ports', 'What for'],
  rows: area.value!.reachedBy.map(r => [r.from, r.ports, r.note]),
}))

/** The other areas, for moving sideways without going back to the hub. */
const others = computed(() => networkAreas.filter(a => a.slug !== slug.value))
</script>

<template>
  <div v-if="area">
    <PageHead
      :crumb="area.slug"
      :heading="area.name"
      :lede="area.purpose"
    >
      <template #ghost><GhostNetwork /></template>
      <template #tags>
        <span class="chip">{{ area.vlan ? `vlan ${area.vlan}` : 'untagged' }}</span>
        <span class="chip">{{ area.subnet }}</span>
        <ZoneChip :zone="zoneChip(area.zone)">egress {{ area.egress }}</ZoneChip>
      </template>
    </PageHead>

    <section class="unit" :data-zone="area.zone">
      <p class="u-slot">what is in here</p>
      <h2>What lives on it</h2>
      <div class="prose">
        <p>{{ area.what }}</p>
      </div>
    </section>

    <section class="unit" data-zone="prod">
      <p class="u-slot">why it is separate</p>
      <h2>The reason this is its own area</h2>
      <div class="prose">
        <p>{{ area.why }}</p>
      </div>
    </section>

    <section class="unit" data-zone="dmz">
      <p class="u-slot">the policy, from both sides</p>
      <h2>What it can reach, and what can reach it</h2>
      <p>Default deny in both directions. These are the only accepts, written from each side so a mistake shows up as a disagreement rather than a hole.</p>

      <h3>Outbound</h3>
      <DataTable v-if="area.reaches.length" :columns="reaches.columns" :rows="reaches.rows" />
      <div v-else class="prose">
        <p><strong>Nothing.</strong> This area opens no connections at all — not to the internet, not to another area. That is the property it exists for.</p>
      </div>

      <h3>Inbound</h3>
      <DataTable v-if="area.reachedBy.length" :columns="reachedBy.columns" :rows="reachedBy.rows" />
      <div v-else class="prose">
        <p><strong>Nothing.</strong> No other area may open a connection into it.</p>
      </div>
    </section>

    <section v-if="area.notes.length" class="unit" data-zone="mgmt">
      <p class="u-slot">notes</p>
      <h2>The parts worth knowing</h2>
      <div class="prose">
        <ul>
          <li v-for="(note, i) in area.notes" :key="i">{{ note }}</li>
        </ul>
      </div>
    </section>

    <section class="unit" data-zone="stage">
      <p class="u-slot">the rest</p>
      <h2>The other areas</h2>
      <p>The whole policy, in one table, is on the <NuxtLink to="/security">security page</NuxtLink>.</p>
      <div class="chip-wrap">
        <NuxtLink
          v-for="other in others"
          :key="other.slug"
          class="chip"
          :to="`/network/${other.slug}`"
          :style="`--zc:var(--${other.zone})`"
        >{{ other.name }}</NuxtLink>
      </div>
    </section>

    <SitePager />
    <SiteFooter />
  </div>
</template>
