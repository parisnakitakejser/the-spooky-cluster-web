<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const entry = computed(() => radarEntry(slug.value))

if (!entry.value) {
  throw createError({ statusCode: 404, statusMessage: `No radar entry: ${slug.value}`, fatal: true })
}

const quadrant = computed(() => radarQuadrant(entry.value!.quadrant)!)
const ring = computed(() => radarRing(entry.value!.ring)!)
const related = computed(() =>
  (entry.value!.related ?? []).map(s => radarEntry(s)).filter(Boolean) as RadarEntry[],
)

/** Everything else in the same ring, as a "what else do I trust this much" list. */
const sameRing = computed(() =>
  radarEntries.filter(e => e.ring === entry.value!.ring && e.slug !== entry.value!.slug),
)

const movementLabel: Record<Movement, string> = {
  none: 'no change',
  new: 'new entry',
  in: 'moved inward',
  out: 'moved outward',
}

useSeoMeta({
  title: () => `${entry.value?.name} — tech radar — the spooky cluster`,
  description: () => entry.value?.tagline,
})
</script>

<template>
  <div v-if="entry">
    <div class="phead">
      <GhostRadar />
      <p class="crumb">
        <NuxtLink to="/">home</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink to="/radar">tech radar</NuxtLink>
        <span class="sep">/</span>
        {{ entry.slug }}
      </p>
      <h1>{{ entry.name }}</h1>
      <p class="lede">{{ entry.tagline }}</p>
      <div class="tagline">
        <ZoneChip :zone="ring.id === 'adopt' ? 'p' : ring.id === 'trial' ? 's' : ring.id === 'assess' ? 'm' : 'd'">
          {{ ring.name }}
        </ZoneChip>
        <ZoneChip
          :zone="{ prod: 'p', stage: 's', mgmt: 'm', ceph: 'c', dmz: 'd' }[quadrant.zone] ?? 'p'"
          to="/radar"
        >
          {{ quadrant.name }}
        </ZoneChip>
        <span class="chip">since {{ entry.since }}</span>
        <span v-if="entry.movement !== 'none'" class="chip">{{ movementLabel[entry.movement] }}</span>
      </div>
    </div>

    <section class="unit" :data-zone="quadrant.zone">
      <p class="u-slot">what it is</p>
      <h2>The thing itself</h2>
      <div class="prose">
        <p>{{ entry.what }}</p>
      </div>
    </section>

    <section class="unit" data-zone="prod">
      <p class="u-slot">why it is in the rack</p>
      <h2>What it does here</h2>
      <div class="prose">
        <p>{{ entry.why }}</p>
        <p>
          It sits in <strong>{{ ring.name }}</strong> — {{ ring.blurb.toLowerCase() }}
        </p>
      </div>
    </section>

    <section v-if="entry.watch.length" class="unit" data-zone="dmz">
      <p class="u-slot">the parts that bite</p>
      <h2>What I would watch</h2>
      <div class="prose">
        <ul>
          <li v-for="(w, i) in entry.watch" :key="i">{{ w }}</li>
        </ul>
      </div>
    </section>

    <section class="unit" data-zone="mgmt">
      <p class="u-slot">going deeper</p>
      <h2>Read more</h2>
      <div class="prose">
        <ul>
          <li v-for="link in entry.links" :key="link.href">
            <a :href="link.href" rel="noopener noreferrer external">{{ link.label }}</a>
          </li>
        </ul>
      </div>

      <template v-if="related.length">
        <h3>Related in this rack</h3>
        <div class="deck">
          <NuxtLink
            v-for="r in related"
            :key="r.slug"
            class="card"
            :to="`/radar/${r.slug}`"
            :style="`--zc:var(--${radarQuadrant(r.quadrant)?.zone})`"
          >
            <h3>{{ r.name }}</h3>
            <p>{{ r.tagline }}</p>
            <span class="meta">{{ radarRing(r.ring)?.name }} · {{ radarQuadrant(r.quadrant)?.name }}</span>
          </NuxtLink>
        </div>
      </template>
    </section>

    <section class="unit" data-zone="stage">
      <p class="u-slot">the same ring</p>
      <h2>What else I trust this much</h2>
      <p>Everything else sitting in {{ ring.name }}, for whatever that comparison is worth.</p>
      <div class="chip-wrap">
        <NuxtLink
          v-for="e in sameRing"
          :key="e.slug"
          class="chip"
          :to="`/radar/${e.slug}`"
          :style="`--zc:var(--${radarQuadrant(e.quadrant)?.zone})`"
        >{{ e.name }}</NuxtLink>
      </div>
    </section>

    <nav class="pager" aria-label="Pagination">
      <NuxtLink to="/radar"><span>back</span>The whole radar</NuxtLink>
      <NuxtLink to="/log"><span>next</span>Build log</NuxtLink>
    </nav>

    <SiteFooter />
  </div>
</template>
