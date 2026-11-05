<script setup lang="ts">
usePageSeo({
  title: 'Projects — the spooky cluster',
  description: 'Things I am building, as opposed to things I am running: what each one is, why it exists, and what it runs on.',
})

const groups = projectsByStatus()
const counts = projectOrder
  .map(status => ({ status, meta: projectStatuses[status], n: projects.filter(p => p.status === status).length }))
  .filter(c => c.n)
</script>

<template>
  <PageHead
    crumb="projects"
    heading="Things I am building, not just running"
    lede="The rest of this site is about the rack. This is about what gets made on it — side projects, tools that outgrew a script, and the occasional thing that turned into something other people use."
  >
    <template #ghost><GhostProjects /></template>
    <template #tags>
      <ZoneChip
        v-for="c in counts"
        :key="c.status"
        :zone="zoneChip(statusZone[c.status])"
      >{{ c.n }} {{ c.meta.label }}</ZoneChip>
    </template>
  </PageHead>

  <section
    v-for="group in groups"
    :key="group.status"
    class="unit"
    :data-zone="statusZone[group.status]"
  >
    <p class="u-slot">{{ group.meta.label }}</p>
    <h2>{{ group.meta.blurb }}</h2>
    <div class="deck">
      <NuxtLink
        v-for="item in group.items"
        :key="item.slug"
        class="card"
        :to="`/projects/${item.slug}`"
        :style="`--zc:var(--${statusZone[item.status]})`"
      >
        <h3>{{ item.name }}</h3>
        <p>{{ item.tagline }}</p>
        <span class="meta">
          <template v-if="item.since">since {{ item.since }} · </template>{{ item.status }}
        </span>
      </NuxtLink>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">how this list works</p>
    <h2>Adding one is adding an object</h2>
    <div class="prose">
      <p>Projects live in <code>app/utils/projects.ts</code>. Everything except the name, the status and a one-line tagline is optional, so a project can go up the day it starts with almost nothing filled in and grow a page as it earns one.</p>
      <ul>
        <li v-for="status in projectOrder" :key="status">
          <strong>{{ projectStatuses[status].label }}</strong> — {{ projectStatuses[status].blurb }}
        </li>
      </ul>
      <p>Anything in the <code>stack</code> list that matches a <NuxtLink to="/radar">tech radar</NuxtLink> entry becomes a link to it, so the tooling story and the project story stay joined up.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
