<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const item = computed(() => project(slug.value))

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: `No project: ${slug.value}`, fatal: true })
}

const meta = computed(() => projectStatuses[item.value!.status])
const zone = computed(() => statusZone[item.value!.status])

/** A stack entry that matches a radar slug links to it; the rest are plain. */
const stack = computed(() =>
  (item.value!.stack ?? []).map(s => ({ slug: s, entry: radarEntry(s) })),
)

const related = computed(() =>
  (item.value!.related ?? []).map(s => project(s)).filter(Boolean) as Project[],
)

/** True while the entry is still mostly a stub. */
const thin = computed(() => !item.value!.what && !item.value!.why)

usePageSeo({
  title: () => `${item.value?.name} — projects — the spooky cluster`,
  description: () => item.value?.tagline ?? '',
})
</script>

<template>
  <div v-if="item">
    <div class="phead">
      <GhostProjects />
      <p class="crumb">
        <NuxtLink to="/">home</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink to="/projects">projects</NuxtLink>
        <span class="sep">/</span>
        {{ item.slug }}
      </p>
      <h1>{{ item.name }}</h1>
      <p class="lede">{{ item.tagline }}</p>
      <div class="tagline">
        <ZoneChip :zone="zoneChip(zone)">{{ meta.label }}</ZoneChip>
        <span v-if="item.since" class="chip">since {{ item.since }}</span>
        <span v-if="item.runsOn" class="chip">{{ item.runsOn }}</span>
      </div>
    </div>

    <section v-if="item.what || thin" class="unit" :data-zone="zone">
      <p class="u-slot">what it is</p>
      <h2>The thing itself</h2>
      <div class="prose">
        <p v-if="item.what">{{ item.what }}</p>
        <p v-else class="edit-slot">
          <strong>Description pending.</strong>
          Set <code>what</code> on the <code>{{ item.slug }}</code> entry in
          <code>app/utils/projects.ts</code>. This section disappears once it is filled in.
        </p>
      </div>
    </section>

    <section v-if="item.why" class="unit" data-zone="prod">
      <p class="u-slot">why it exists</p>
      <h2>The reason it beat doing nothing</h2>
      <div class="prose">
        <p>{{ item.why }}</p>
      </div>
    </section>

    <section v-if="stack.length || item.runsOn" class="unit" data-zone="ceph">
      <p class="u-slot">what it is built with</p>
      <h2>The stack</h2>
      <p v-if="item.runsOn">Runs on {{ item.runsOn }}.</p>
      <div v-if="stack.length" class="chip-wrap">
        <NuxtLink
          v-for="s in stack"
          :key="s.slug"
          class="chip"
          :to="s.entry ? `/radar/${s.slug}` : '/radar'"
          :style="`--zc:var(--${radarQuadrant(s.entry?.quadrant ?? '')?.zone ?? 'prod'})`"
        >{{ s.entry?.name ?? s.slug }}</NuxtLink>
      </div>
      <div class="prose spaced">
        <p>Each of these has an entry on the <NuxtLink to="/radar">tech radar</NuxtLink> with what it is and the parts that bite.</p>
      </div>
    </section>

    <section v-if="item.notes?.length" class="unit" data-zone="dmz">
      <p class="u-slot">notes</p>
      <h2>Decisions, and what building it taught me</h2>
      <div class="prose">
        <ul>
          <li v-for="(note, i) in item.notes" :key="i">{{ note }}</li>
        </ul>
      </div>
    </section>

    <section v-if="item.links?.length || related.length" class="unit" data-zone="mgmt">
      <p class="u-slot">elsewhere</p>
      <h2>Links</h2>
      <div v-if="item.links?.length" class="prose">
        <ul>
          <li v-for="link in item.links" :key="link.href">
            <a :href="link.href" rel="noopener noreferrer external">{{ link.label }}</a>
          </li>
        </ul>
      </div>

      <template v-if="related.length">
        <h3>Related projects</h3>
        <div class="deck">
          <NuxtLink
            v-for="r in related"
            :key="r.slug"
            class="card"
            :to="`/projects/${r.slug}`"
            :style="`--zc:var(--${statusZone[r.status]})`"
          >
            <h3>{{ r.name }}</h3>
            <p>{{ r.tagline }}</p>
            <span class="meta">{{ r.status }}</span>
          </NuxtLink>
        </div>
      </template>
    </section>

    <nav class="pager" aria-label="Pagination">
      <NuxtLink to="/projects"><span>back</span>All projects</NuxtLink>
      <NuxtLink to="/rack"><span>next</span>The rack</NuxtLink>
    </nav>

    <SiteFooter />
  </div>
</template>
