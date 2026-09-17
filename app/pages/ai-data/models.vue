<script setup lang="ts">
usePageSeo({
  title: 'Local models — the spooky cluster',
  description: 'What is loaded on the rack, what quantisation costs, and why the GPU slot is still empty.',
})

const models = {
  columns: ['Model', 'Size on disk', 'Runs on', 'What it does here'],
  rows: [
    ['Llama 3.1 8B (Q4)', '4.7 GB', 'crypt, CPU', 'General chat through the web front end'],
    ['Qwen2.5 Coder 7B (Q4)', '4.4 GB', 'crypt, CPU', 'Shell and YAML questions, offline'],
    ['nomic-embed-text', '274 MB', 'crypt, CPU', 'Embeddings for document search'],
    ['faster-whisper small', '484 MB', 'crypt, CPU', 'Transcription, under evaluation'],
  ],
}
</script>

<template>
  <PageHead
    crumb="local models"
    heading="Four models, no accelerator, and a reserved U"
    lede="Quantised open-weight models on Xeon cores. Fine for a summary or a shell question, a test of patience for anything that needs to think."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="p">4 models</ZoneChip>
      <ZoneChip zone="m">cpu only</ZoneChip>
      <ZoneChip zone="d">0 gpus</ZoneChip>
    </template>
  </PageHead>

  <SectionNav :hub="{ to: '/ai-data', label: 'Overview' }" :links="aiDataPages" />

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
      <p>Weights live on CephFS and are deliberately <strong>not</strong> in the backup set. They are gigabytes each and they are re-downloadable — losing them costs a download, not a memory.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the missing part</p>
    <h2>The GPU slot is still a slot</h2>
    <div class="prose">
      <p>U27 and U28 are held for the next compute node. Whether that node is <code>crypt-04</code> or something with a card in it is the open question on the <NuxtLink to="/log">build log</NuxtLink>, and the answer decides several entries on the <NuxtLink to="/radar">radar</NuxtLink> at once — <NuxtLink to="/radar/faster-whisper">faster-whisper</NuxtLink> for voice, larger models for anything reasoning-shaped, and image work that is currently not attempted at all.</p>
      <p>The honest position: CPU inference proved the plumbing and the privacy argument. It has not proved the models are good enough to rely on, and it cannot until the hardware changes.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">what I gave up</p>
    <h2>The parts that are worse than the hosted version</h2>
    <div class="prose">
      <ul>
        <li><strong>It is slower.</strong> Meaningfully. A hosted frontier model answers before a local 8B has finished thinking, and no amount of quantisation closes that gap on CPU.</li>
        <li><strong>The models are smaller and it shows.</strong> For summarising a document or answering a shell question they are fine. For anything needing real reasoning, they are not the same tool.</li>
        <li><strong>Transcription accuracy drops off</strong> for accents and for Danish, which is most of the voices in this house.</li>
        <li><strong>It is one more thing to patch.</strong> An inference server with an HTTP API is an internet-facing-shaped service even when it is not on the internet.</li>
      </ul>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
