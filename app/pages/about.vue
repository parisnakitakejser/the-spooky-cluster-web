<script setup lang="ts">
usePageSeo({
  title: 'About — the spooky cluster',
  description: 'Who runs this rack, how it started, what it hosts, and the rules it follows.',
})

// ---------------------------------------------------------------
//  Drop files into public/photos/ and set `file` to the filename.
//  A slot with no file renders as a blank panel rather than a
//  broken image, so the page is presentable before the photos are.
// ---------------------------------------------------------------
const photos: Photo[] = [
  { file: '', alt: 'Rack front', caption: 'The front of the cabinet, doors open. Storage at the bottom, compute in the middle, network at the top.', wide: true },
  { file: '', alt: 'Rack rear cabling', caption: 'The back, and the three vertical runs: fibre left, copper middle, power right.' },
  { file: '', alt: 'Ossuary chassis', caption: 'One of the Supermicro chassis with the lid off. Twelve disks in, twelve bays spare.' },
  { file: '', alt: 'Seance NUCs', caption: 'The management cluster: three NUCs on a vented shelf, running Talos.' },
  { file: '', alt: 'The garage', caption: 'The room it all lives in. Unheated, which does most of the cooling for eight months of the year.' },
]

const projects = [
  { name: 'Photos', zone: 'prod', what: 'Immich, with the originals on CephFS and phones backing up over WireGuard.', who: 'Household' },
  { name: 'Media', zone: 'prod', what: 'Jellyfin against the media pool. The workload that notices a slow re-balance first.', who: 'Household' },
  { name: 'Files & documents', zone: 'ceph', what: 'Nextcloud for shared files, Paperless for anything that arrives on paper and gets scanned.', who: 'Household' },
  { name: 'Passwords', zone: 'dmz', what: 'Vaultwarden. Small, and the one dataset that cannot be re-downloaded.', who: 'Household' },
  { name: 'The house itself', zone: 'mgmt', what: 'Home Assistant, Mosquitto and Frigate — sensors, automations and camera detection, all local.', who: 'Household' },
  { name: 'Code', zone: 'stage', what: 'Forgejo holds the repositories, including the one that deploys all three clusters.', who: 'Me' },
  { name: 'This site', zone: 'pink', what: 'Nuxt, pre-rendered, served by Nitro and deployed by the same Helm and Argo CD path as everything else.', who: 'Public' },
  { name: 'Local models', zone: 'mgmt', what: 'Ollama and Open WebUI, so nothing said or written here becomes somebody else\'s API call.', who: 'Household' },
]

const rules = [
  { title: 'It runs here or not at all', body: 'If a service needs somebody else\'s cloud to work, it does not get installed. The exceptions are DNS and the third backup copy, and both are listed on the pages that cover them.' },
  { title: 'If it is not in Git, it does not exist', body: 'No kubectl apply from a laptop. A change is a pull request, Argo CD reconciles it, and drift gets put back.' },
  { title: 'Three copies or it is not backed up', body: 'One live, one 40 km away, one in object storage with an append-only key. Restores are tested monthly, because an untested backup is a rumour.' },
  { title: 'Write down what broke', body: 'The build log has the incidents in it alongside the upgrades. A homelab write-up that only lists successes is a brochure.' },
]
</script>

<template>
  <PageHead
    crumb="about"
    heading="One person, one rack, one garage"
    lede="This site exists because I kept answering the same questions twice — once for a friend, once for myself six months later when I had forgotten why I did it that way. Writing it down turned out to be the cheapest documentation I have ever maintained."
  >
    <template #ghost><GhostAbout /></template>
    <template #tags>
      <ZoneChip zone="s">aarhus, denmark</ZoneChip>
      <ZoneChip zone="m">42u, since 2024</ZoneChip>
      <ZoneChip zone="p">one operator</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="stage">
    <p class="u-slot">who</p>
    <h2>Hello</h2>
    <div class="intro">
      <Portrait file="" alt="Portrait" />
      <div class="prose">
        <!-- Replace this section with your own. Everything else on the page
             works without it; this is the part only you can write. -->
        <p>I am Paris, and this rack is mine. It lives in a garage outside Aarhus, it draws about 612 W doing nothing, and it has taught me more than any course I have paid for.</p>
        <p>I am not a data centre. There is no rotation, no second pair of eyes on a firewall change, and no SLA. What there is instead is a set of rules I actually follow, written down below, and a habit of recording the mistakes as carefully as the successes.</p>
        <p>The pages on this site are the documentation I wanted to find when I was starting: specific hardware, real numbers, and the parts that went wrong. If something here saves you an evening, that is the whole point.</p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the room</p>
    <h2>What it actually looks like</h2>
    <p>Photographs, because a rack elevation diagram is accurate and tells you nothing about the noise, the cable slack or how cold the floor is in February.</p>
    <PhotoGrid :photos="photos" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">how it started</p>
    <h2>It began as one mini PC and got out of hand</h2>
    <div class="prose">
      <p>The first version was a single machine under a desk running a stack of Docker Compose files. It worked, right up until it did not: an update meant downtime, a disk meant a rebuild, and every change was a command typed on a Tuesday and forgotten by Thursday.</p>
      <p>The cabinet came second-hand out of an office move for the price of collecting it. The servers followed the way used enterprise hardware always does — slowly, then all at once, and always heavier than expected. The three Kubernetes clusters came last, and only after a staging upgrade took production down with it, which settled the namespace-versus-cluster argument in one evening.</p>
      <p>The arc, honestly, is this: every layer in the rack exists because something simpler broke in a way I did not enjoy. The <NuxtLink to="/log">build log</NuxtLink> has the specifics, incidents included.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">what it hosts</p>
    <h2>What the whole thing is actually for</h2>
    <p>All of it is the point. The clusters, the Ceph pool and the cleaning zone exist to keep this list running and private.</p>
    <div class="deck">
      <div
        v-for="project in projects"
        :key="project.name"
        class="card static"
        :style="`--zc:var(--${project.zone})`"
      >
        <h3>{{ project.name }}</h3>
        <p>{{ project.what }}</p>
        <span class="meta">{{ project.who }}</span>
      </div>
    </div>
    <div class="prose spaced">
      <p>Only this site is reachable from the internet. Everything else answers on the LAN or over WireGuard, which is a deliberate limit rather than a missing feature — see the <NuxtLink to="/security">security page</NuxtLink> for the rules between the zones.</p>
      <p>What each service runs on is on the <NuxtLink to="/compute">compute page</NuxtLink>, and every tool behind them has an entry on the <NuxtLink to="/radar">tech radar</NuxtLink>.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the rules</p>
    <h2>Four rules, and they are the reason for most of the rest</h2>
    <div class="flow">
      <div
        v-for="(rule, i) in rules"
        :key="rule.title"
        class="zone"
        :style="`--zc:var(--${['prod', 'stage', 'ceph', 'mgmt'][i]})`"
      >
        <h3>{{ rule.title }}</h3>
        <p>{{ rule.body }}</p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the site itself</p>
    <h2>How this page reaches you</h2>
    <div class="prose">
      <p>It is a Nuxt site, pre-rendered to plain files at build time and served by a small node process in the same cluster as everything else. It ships as a Helm chart with the pod locked down to the restricted Pod Security Standard, no egress and no service account token — a static site needs none of those things, so it has none of them.</p>
      <p>There is no analytics, no tracker and no third-party script. The only outbound request your browser makes is for the fonts, and the whole thing is a few hundred kilobytes.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
