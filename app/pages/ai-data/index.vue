<script setup lang="ts">
usePageSeo({
  title: 'AI & Data — the spooky cluster',
  description: 'Local models, a data lake, agents and MCP servers — all of it running on hardware in a garage, because the rule is that nothing leaves the house to be processed.',
})

const glance = [
  { value: '0', label: 'GPUs, currently' },
  { value: '4', label: 'models pulled' },
  { value: '3', label: 'lake layers' },
  { value: '3', label: 'databases to back up' },
]

const sections = [
  { to: '/ai-data/models', zone: 'prod', title: 'Local models', body: 'What is actually loaded, what quantisation costs, and why the first number on this page is zero.', meta: 'inference · quantisation · the GPU slot' },
  { to: '/ai-data/data-lake', zone: 'mgmt', title: 'Data lake', body: 'Three diagrams: how a row moves through the layers, how quality is enforced by contract, and how schema stays compatible.', meta: 'layers · contracts · schema' },
  { to: '/ai-data/agents', zone: 'stage', title: 'Agents', body: 'Loops that call tools on my behalf. What they are allowed to touch, and what happens when one is wrong.', meta: 'loops · tools · blast radius' },
  { to: '/ai-data/mcp', zone: 'ceph', title: 'MCP', body: 'The protocol that hands a model a tool. A useful standard and a genuinely new attack surface.', meta: 'servers · scopes · injection' },
  { to: '/ai-data/stores', zone: 'dmz', title: 'Data stores', body: 'The databases and the bus underneath all of it, and which of them are worth backing up.', meta: 'postgres · cache · mqtt' },
]
</script>

<template>
  <PageHead
    crumb="ai & data"
    heading="Models that run here, or not at all"
    lede="The rule is simple and occasionally expensive: a microphone, a camera or a document in this house does not become a request to somebody else's API. Everything in this section follows from that, including the parts that are slower than the hosted alternative."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="m">local only</ZoneChip>
      <ZoneChip zone="p">cpu inference</ZoneChip>
      <ZoneChip zone="c">open table format</ZoneChip>
    </template>
  </PageHead>

  <SectionNav :hub="{ to: '/ai-data', label: 'Overview' }" :links="aiDataPages" />

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">at a glance</p>
    <h2>The honest headline is the first number</h2>
    <p>There is no accelerator in the rack yet. Everything here runs on Xeon cores, which works for small models and is a test of patience for anything larger.</p>
    <StatGrid :items="glance" zone="m" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the section</p>
    <h2>Five things, which used to be one very long page</h2>
    <p>This grew past what one page could hold, so it is split by the question each part answers.</p>
    <div class="deck">
      <NuxtLink
        v-for="section in sections"
        :key="section.to"
        class="card"
        :to="section.to"
        :style="`--zc:var(--${section.zone})`"
      >
        <h3>{{ section.title }}</h3>
        <p>{{ section.body }}</p>
        <span class="meta">{{ section.meta }}</span>
      </NuxtLink>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the rule</p>
    <h2>Why any of this is here rather than rented</h2>
    <div class="prose">
      <p>Running this locally is not free, and pretending otherwise would make the rest of this site less useful. It is slower. The models are smaller and it shows. It is one more stack to patch, and an inference server with an HTTP API is an internet-facing-shaped service even when it is not on the internet.</p>
      <p>What it buys is a single sentence: nothing said, photographed or written in this house is processed by anyone else. For this lab that has been worth every one of those trade-offs — but it is a trade, and each page in this section tries to state what it costs.</p>
      <p>Everything named across these pages has an entry on the <NuxtLink to="/radar">tech radar</NuxtLink>, with what it is and the parts that bite.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
