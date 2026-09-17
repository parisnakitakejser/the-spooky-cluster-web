<script setup lang="ts">
usePageSeo({
  title: 'Data stores — the spooky cluster',
  description: 'The databases and the message bus under everything else: what holds what, which are worth backing up, and the path a file takes before anything reads it.',
})

const stores = {
  columns: ['Store', 'Runs on', 'Holds', 'Backed up'],
  rows: [
    ['PostgreSQL', 'crypt · RBD volume', 'Photos, documents, code forge, chat history', 'Nightly dump, all three copies'],
    ['Valkey', 'crypt · memory', 'Caches and job queues', 'No — it is a cache, on purpose'],
    ['Mosquitto', 'crypt · small RBD volume', 'The MQTT bus for sensors and cameras', 'Config only; messages are transient'],
    ['Ceph RBD', 'ossuary', 'Every persistent volume above', '3× replication, plus off-site snapshots'],
    ['Object store', 'ossuary · RGW', 'Lake tables, and the model weights', 'Tables yes, weights no'],
  ],
}

const pipeline = [
  { zone: 'dmz', title: 'It arrives', body: 'A photo, a scan or a recording lands in the DMZ and is handed to the quarantine zone before anything else can read it.' },
  { zone: 'mgmt', title: 'It gets looked at', body: 'Quarantine scans it. Only after a clean verdict does it move to the secure zone, and only then does any model see it.' },
  { zone: 'prod', title: 'It gets turned into numbers', body: 'The app stores the original and, where it is useful, an embedding next to the row it describes.' },
  { zone: 'ceph', title: 'It stays here', body: 'Originals replicate three ways in the rack and leave encrypted to two off-site copies. Nothing is sent anywhere to be processed.' },
]
</script>

<template>
  <PageHead
    crumb="data stores"
    heading="Three data stores, and only one of them is precious"
    lede="Knowing which is which is what keeps the backup plan short. One database engine rather than four was a deliberate choice, and the cache is deliberately disposable."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="c">one sql engine</ZoneChip>
      <ZoneChip zone="s">one cache</ZoneChip>
      <ZoneChip zone="m">one bus</ZoneChip>
    </template>
  </PageHead>

  <SectionNav :hub="{ to: '/ai-data', label: 'Overview' }" :links="aiDataPages" />

  <section class="unit" data-zone="ceph">
    <p class="u-slot">state</p>
    <h2>Where the data actually lives</h2>
    <DataTable :columns="stores.columns" :rows="stores.rows" />
    <div class="prose spaced">
      <p>One database engine rather than four was deliberate: <NuxtLink to="/radar/postgresql">PostgreSQL</NuxtLink> backs every app that needs one, so there is a single dump to test restoring and a single major-version upgrade to schedule. Embeddings go in the same database through <NuxtLink to="/radar/pgvector">pgvector</NuxtLink>, next to the rows they describe, which means a search result and its source stay in one backup.</p>
      <p>Model weights are the exception that proves the rule. Gigabytes each, sitting on CephFS, and deliberately not in the backup set — losing them costs a download, not a memory.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the bus</p>
    <h2>The data that never leaves in the first place</h2>
    <div class="prose">
      <p><NuxtLink to="/radar/mosquitto">Mosquitto</NuxtLink> is where everything sensory meets. Sensors publish, <NuxtLink to="/radar/frigate">Frigate</NuxtLink> publishes detection events, and <NuxtLink to="/radar/home-assistant">Home Assistant</NuxtLink> subscribes and decides what to do. Keeping the broker separate from the automation platform means Home Assistant can restart without every sensor losing its place.</p>
      <ul>
        <li><strong>Cameras are on their own VLAN with no route out.</strong> Not to the internet, not to the DMZ.</li>
        <li><strong>Detection happens on-site.</strong> A clip is kept because something was recognised here, not because a vendor's cloud found it interesting.</li>
        <li><strong>Retained messages outlive their sender.</strong> A stale retained value looks exactly like a working sensor, which has cost me an evening more than once.</li>
      </ul>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the path in</p>
    <h2>What happens to a file before anything reads it</h2>
    <p>The same cleaning zone every other inbound thing goes through, described on the <NuxtLink to="/security">security page</NuxtLink>. Nothing about a model changes the order.</p>
    <div class="flow">
      <div v-for="(step, i) in pipeline" :key="step.title" class="zone" :style="`--zc:var(--${step.zone})`">
        <h3>{{ i + 1 }}. {{ step.title }}</h3>
        <p>{{ step.body }}</p>
      </div>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
