<script setup lang="ts">
usePageSeo({
  title: 'AI & Data — the spooky cluster',
  description: 'Local models, the databases underneath them, and the rule that nothing in the house has to phone anyone to answer a question.',
})

const glance = [
  { value: '0', label: 'GPUs, currently' },
  { value: '4', label: 'models pulled' },
  { value: '3', label: 'databases to back up' },
  { value: '3', label: 'lake layers' },
  { value: '3', label: 'query engines' },
  { value: '14 TB', label: 'on the k8s-rbd pool' },
]

const models = {
  columns: ['Model', 'Size on disk', 'Runs on', 'What it does here'],
  rows: [
    ['Llama 3.1 8B (Q4)', '4.7 GB', 'crypt, CPU', 'General chat through Open WebUI'],
    ['Qwen2.5 Coder 7B (Q4)', '4.4 GB', 'crypt, CPU', 'Shell and YAML questions, offline'],
    ['nomic-embed-text', '274 MB', 'crypt, CPU', 'Embeddings for document search'],
    ['faster-whisper small', '484 MB', 'crypt, CPU', 'Transcription, under evaluation'],
  ],
}

const stores = {
  columns: ['Store', 'Runs on', 'Holds', 'Backed up'],
  rows: [
    ['PostgreSQL', 'crypt · RBD volume', 'Immich, Paperless, Forgejo, Open WebUI', 'Nightly dump, all three copies'],
    ['Valkey', 'crypt · memory', 'Caches and job queues', 'No — it is a cache, on purpose'],
    ['Mosquitto', 'crypt · small RBD volume', 'The MQTT bus for sensors and Frigate', 'Config only; messages are transient'],
    ['Ceph RBD', 'ossuary', 'Every persistent volume above', '3× replication, plus Restic off-site'],
    ['Model weights', 'ossuary · CephFS', 'Ollama model files', 'No — they are re-downloadable'],
  ],
}

const layers = {
  columns: ['Layer', 'What lands there', 'Written by', 'Who may read it'],
  rows: [
    ['Bronze', 'Raw records exactly as they arrived, nothing dropped', 'Flink from Kafka, PyIceberg for batch', 'Me only'],
    ['Silver', 'Typed, deduplicated, late-arriving rows resolved', 'PyIceberg, Spark when it is large', 'Me, and the gold jobs'],
    ['Gold', 'Modelled tables built for a question someone asks', 'Spark, gated by Soda before promotion', 'Dashboards and notebooks'],
  ],
}

const pipeline = [
  { zone: 'dmz', title: 'It arrives', body: 'A photo, a scan or a recording lands in the DMZ and is handed to the quarantine zone before anything else can read it.' },
  { zone: 'mgmt', title: 'It gets looked at', body: 'Quarantine scans it. Only after a clean verdict does it move to the secure zone, and only then does any model see it.' },
  { zone: 'prod', title: 'It gets turned into numbers', body: 'The app stores the original on Ceph and, where it is useful, an embedding next to the row it describes in Postgres.' },
  { zone: 'ceph', title: 'It stays here', body: 'Originals replicate three ways in the rack and leave encrypted to two off-site copies. Nothing is sent anywhere to be processed.' },
]
</script>

<template>
  <PageHead
    crumb="ai & data"
    heading="Models that run here, or not at all"
    lede="The rule is simple and occasionally expensive: a microphone, a camera or a document in this house does not become a request to somebody else's API. Everything below follows from that, including the parts that are slower than the hosted alternative."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="m">local only</ZoneChip>
      <ZoneChip zone="p">cpu inference</ZoneChip>
      <ZoneChip zone="c">postgres · valkey · mqtt</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">at a glance</p>
    <h2>The honest headline is the first number</h2>
    <p>There is no accelerator in the rack yet. Everything here runs on Xeon cores, which works for small models and is a test of patience for anything larger.</p>
    <StatGrid :items="glance" zone="m" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">inference</p>
    <h2>What is actually loaded</h2>
    <p>
      <NuxtLink to="/radar/ollama">Ollama</NuxtLink> pulls and serves the weights;
      <NuxtLink to="/radar/open-webui">Open WebUI</NuxtLink> is the part anyone else in the
      house will touch. Both sit on the production cluster, reachable from the LAN and from
      nowhere else — there is no route to them from the DMZ.
    </p>
    <DataTable :columns="models.columns" :rows="models.rows" />
    <div class="prose spaced">
      <p>Quantised to roughly four bits, because the trade is worth it: a 7B model at Q4 fits in memory with room to spare and answers a short prompt in seconds rather than minutes. Anything above about 14B is currently a thought experiment.</p>
      <p>The fix is a GPU, and the slot is already reserved — U27 and U28 are held for the next compute node, and whether that node is <code>crypt-04</code> or something with a card in it is the open question on the <NuxtLink to="/log">build log</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">state</p>
    <h2>Where the data actually lives</h2>
    <p>Three data stores, and only one of them is precious. Knowing which is which is what makes the backup plan short.</p>
    <DataTable :columns="stores.columns" :rows="stores.rows" />
    <div class="prose spaced">
      <p>One database engine rather than four was a deliberate choice: <NuxtLink to="/radar/postgresql">PostgreSQL</NuxtLink> backs every app that needs one, so there is a single dump to test restoring and a single major-version upgrade to schedule. Embeddings go in the same database through <NuxtLink to="/radar/pgvector">pgvector</NuxtLink>, next to the rows they describe, which means search results and their source stay in one backup.</p>
      <p>Model weights are the exception that proves the rule. They are gigabytes each, they sit on CephFS, and they are deliberately not in the backup set — losing them costs a download, not a memory.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the lake</p>
    <h2>How a row gets from a sensor to a dashboard</h2>
    <p>Same shape as the <NuxtLink to="/security">security chain</NuxtLink>, and for the same reason: the interesting part is not the stages, it is what governs each hop between them. Data runs left to right, policy and quality come down, and the engines that do the work come up from below.</p>
    <DataLakeChain />
    <div class="prose spaced">
      <p>Everything in the middle row is the same kind of table in the same object store — <NuxtLink to="/radar/apache-iceberg">Apache Iceberg</NuxtLink> on top of Ceph's S3 gateway, which is what makes snapshots, schema evolution and time travel available at every stage rather than only at the end. A bad transformation is a rollback to yesterday's snapshot, not a restore.</p>
      <p>The reason bronze exists at all is that cleaning is a guess. Keeping the raw record means a wrong guess costs a re-run rather than a re-collection — and sensor data cannot be re-collected. The <NuxtLink to="/radar/apache-kafka">Kafka</NuxtLink> buffer in front of it is the same argument one step earlier: a replay window means an ingest job can fail for an afternoon without losing the afternoon.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">layers</p>
    <h2>Three layers, and who is allowed into each</h2>
    <p>The layer boundary and the permission boundary are the same line, which is the only reason the policy stays small enough to read.</p>
    <DataTable :columns="layers.columns" :rows="layers.rows" />
    <div class="prose spaced">
      <p><NuxtLink to="/radar/apache-ranger"><strong>Ranger</strong></NuxtLink> holds that policy in one place instead of in each engine's own config. It does row filtering and column masking, so a table with a sensor location in it can be readable without the location being readable — and every access is audited whether it was allowed or denied.</p>
      <p><NuxtLink to="/radar/apache-airflow"><strong>Airflow</strong></NuxtLink> owns one DAG per hop rather than one enormous pipeline. A failed silver job does not block a bronze ingest, backfilling a single day is a task re-run rather than a replay of everything, and the dependency graph is the documentation. It decides <em>when</em>; it does not do the work.</p>
      <p><strong>The engines do the work</strong>, and which one depends on the shape of the hop. <NuxtLink to="/radar/apache-flink">Flink</NuxtLink> handles the streaming ingest off Kafka, where the job never finishes and state has to survive a restart. <NuxtLink to="/radar/apache-spark">Spark</NuxtLink> takes the heavy batch rewrites and the compaction. <NuxtLink to="/radar/pyiceberg">PyIceberg</NuxtLink> takes everything else — and "everything else" turned out to be most of it, because at this scale a Python process that talks to the catalogue directly beats standing up a cluster to move four hundred megabytes.</p>
      <p><NuxtLink to="/radar/soda"><strong>Soda</strong></NuxtLink> is the gate between layers. Checks run against the output of a hop before it is promoted, so a null flood or a schema drift fails the run rather than quietly becoming gold-layer truth. This is the piece I most wish I had added first: without it, bad data is discovered by a dashboard looking wrong, which is weeks later and much harder to trace.</p>
      <p>What I gave up: this is a lot of machinery for a household's worth of data. It exists because the patterns are the ones I want to be fluent in, and a lake with real governance on it is not something you get to practise at small scale anywhere else — the same argument as the rest of the <NuxtLink to="/about">practice rack</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the path in</p>
    <h2>What happens to a file before a model sees it</h2>
    <p>The same cleaning zone every other inbound thing goes through, described on the <NuxtLink to="/security">security page</NuxtLink>. Nothing about a model changes the order.</p>
    <div class="flow">
      <div
        v-for="(step, i) in pipeline"
        :key="step.title"
        class="zone"
        :style="`--zc:var(--${step.zone})`"
      >
        <h3>{{ i + 1 }}. {{ step.title }}</h3>
        <p>{{ step.body }}</p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the house</p>
    <h2>The data that never leaves in the first place</h2>
    <div class="prose">
      <p><NuxtLink to="/radar/mosquitto">Mosquitto</NuxtLink> is the bus everything sensory meets on. Sensors publish, <NuxtLink to="/radar/frigate">Frigate</NuxtLink> publishes detection events, and <NuxtLink to="/radar/home-assistant">Home Assistant</NuxtLink> subscribes and decides what to do. Keeping the broker separate from the automation platform means I can restart Home Assistant without every sensor losing its place.</p>
      <ul>
        <li><strong>Cameras are on their own VLAN with no route out.</strong> Not to the internet, not to the DMZ. Frigate reaches them; nothing reaches Frigate from outside the LAN.</li>
        <li><strong>Detection happens on-site.</strong> A clip is kept because something was recognised here, not because a vendor's cloud decided it was interesting.</li>
        <li><strong>Retained MQTT messages outlive their sender.</strong> A stale retained value looks exactly like a working sensor, which has cost me an evening more than once.</li>
      </ul>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">what I gave up</p>
    <h2>The parts that are worse than the hosted version</h2>
    <div class="prose">
      <p>Running this locally is not free, and pretending otherwise would make the rest of this site less useful.</p>
      <ul>
        <li><strong>It is slower.</strong> Meaningfully. A hosted frontier model answers before a local 8B has finished thinking, and no amount of quantisation closes that gap on CPU.</li>
        <li><strong>The models are smaller and they show it.</strong> For summarising a document or answering a shell question they are fine. For anything needing real reasoning, they are not the same tool.</li>
        <li><strong>Transcription accuracy drops off</strong> for accents and for Danish, which is most of the voices in this house. That is the main reason <NuxtLink to="/radar/faster-whisper">faster-whisper</NuxtLink> is still in Research rather than in use.</li>
        <li><strong>It is one more thing to patch.</strong> An inference server with an HTTP API is an internet-facing-shaped service even when it is not on the internet.</li>
      </ul>
      <p>What it buys is a single sentence: nothing said, photographed or written in this house is processed by anyone else. For this lab that has been worth every one of those trade-offs — but it is a trade, and the numbers above are what it costs.</p>
      <p>Every tool named on this page has its own entry on the <NuxtLink to="/radar">tech radar</NuxtLink>, with what it is, why it is here and the parts that bite.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
