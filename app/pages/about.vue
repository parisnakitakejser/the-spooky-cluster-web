<script setup lang="ts">
usePageSeo({
  title: 'About — the spooky cluster',
  description: 'A homelab built as deliberate practice, the internal tools the household now depends on, and the rules the rack follows.',
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

/**
 * The day job. Left empty on purpose — it is the one thing on this site I
 * could not write without guessing, and guessing at somebody's employment is
 * not a thing to publish. Fill both in and the paragraph writes itself; leave
 * them and the page shows an edit slot instead.
 */
const work = {
  role: '',     // e.g. 'platform engineer'
  context: '',  // e.g. 'at a managed services company'
}

/**
 * What the lab is deliberately practice for. These are the things I wanted
 * to be better at, and the rack is where being wrong is cheap.
 */
const practice = [
  {
    zone: 'prod',
    title: 'Upgrades that do not frighten me',
    body: 'Three clusters exist so staging can fail first. Every version lands there for a week before production sees it, and rehearsal gets rebuilt from Git monthly to prove that it can be.',
  },
  {
    zone: 'stage',
    title: 'GitOps discipline',
    body: 'No kubectl apply from a laptop, even when that would be faster. Learning to reach for a pull request when something is broken at midnight is the actual skill.',
  },
  {
    zone: 'ceph',
    title: 'Storage failure, on purpose',
    body: 'Pulling a disk to watch a re-balance is a thing you can only do somewhere the consequences are yours. That is how I found out one node was on the wrong link speed.',
  },
  {
    zone: 'dmz',
    title: 'Segmentation that is real',
    body: 'Default deny in both directions, a cleaning zone every inbound thing passes through, and a policy short enough to read in one go. Writing rules is easy; living with them is the lesson.',
  },
  {
    zone: 'mgmt',
    title: 'Noticing before being told',
    body: 'Alerting tuned until four pages in ninety days feels right. Too few means I am not watching; too many and I stop reading them.',
  },
  {
    zone: 'prod',
    title: 'Whatever is next',
    body: 'Right now that is Gateway API replacing Ingress, hardening the chart to the restricted Pod Security Standard, and working out whether local models are useful or just interesting.',
  },
]

/**
 * What the household actually uses. `status` separates the things people
 * depend on from the things we are still trying out.
 */
const projects = [
  { name: 'Photos', zone: 'prod', status: 'daily', what: 'Immich, with the originals on CephFS and phones backing up over WireGuard. It replaced a paid cloud plan, which was the test it had to pass.', who: 'Household' },
  { name: 'Media', zone: 'prod', status: 'daily', what: 'Jellyfin against the media pool. The workload that notices a slow re-balance before I do.', who: 'Household' },
  { name: 'Passwords', zone: 'dmz', status: 'daily', what: 'Vaultwarden. Small, and the one dataset that cannot be re-downloaded if I get it wrong.', who: 'Household' },
  { name: 'The house itself', zone: 'mgmt', status: 'daily', what: 'Home Assistant and Mosquitto: sensors, automations, and the lights that everyone notices the moment they stop working.', who: 'Household' },
  { name: 'Files & documents', zone: 'ceph', status: 'testing', what: 'Nextcloud for shared files, Paperless for anything that arrives on paper. Still being judged on whether anyone but me opens them.', who: 'Household' },
  { name: 'Cameras', zone: 'mgmt', status: 'testing', what: 'Frigate doing object detection locally, publishing events to the same MQTT bus. On its own VLAN with no route out.', who: 'Household' },
  { name: 'Local models', zone: 'mgmt', status: 'testing', what: 'Ollama and Open WebUI, so nothing said or written here becomes somebody else\'s API call. Slower than the hosted thing, and that is the trade.', who: 'Household' },
  { name: 'Code', zone: 'stage', status: 'mine', what: 'Forgejo holds the repositories, including the one that deploys all three clusters. Mirrored off-site, because a forge that deploys itself is a circular dependency.', who: 'Me' },
  { name: 'This site', zone: 'pink', status: 'mine', what: 'Nuxt, pre-rendered, shipped by the same Helm and Argo CD path as everything else. The only thing here the internet can reach.', who: 'Public' },
]

const statusLabel: Record<string, string> = {
  daily: 'relied on',
  testing: 'trialling',
  mine: 'just me',
}

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
    heading="A practice rack that the family accidentally depends on"
    lede="It started as somewhere to learn things properly — the kind of learning you only get from running something for two years and living with the decisions. Then the household started using it, which turned a lab into an obligation, which turned out to be the most useful thing about it."
  >
    <template #ghost><GhostAbout /></template>
    <template #tags>
      <ZoneChip zone="s">aarhus, denmark</ZoneChip>
      <ZoneChip zone="m">42u, since 2024</ZoneChip>
      <ZoneChip zone="p">learning by running it</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="stage">
    <p class="u-slot">who</p>
    <h2>Hello</h2>
    <div class="intro">
      <Portrait file="" alt="Portrait" />
      <div class="prose">
        <p v-if="work.role">
          I am Paris. By day I work as a {{ work.role }}<template v-if="work.context"> {{ work.context }}</template>,
          and this rack is what I do when I want to understand something rather than
          just ship it.
        </p>
        <p v-else class="edit-slot">
          <strong>Day job goes here.</strong>
          Set <code>work.role</code> and <code>work.context</code> at the top of
          <code>app/pages/about.vue</code> and this paragraph writes itself. I left it
          empty rather than guess.
        </p>
        <p>The lab is deliberate practice. Work gives you production systems you are quite rightly not allowed to break; this gives me systems I am allowed to break, at a scale small enough that the consequences are mine and large enough that the lessons transfer. Almost everything I know about Kubernetes, Ceph and network segmentation I learned here first and used at work second.</p>
        <p>Then it stopped being only mine. Photos, media, passwords and the lights all run on it now, which means the family notices when I get something wrong. That is the best thing that ever happened to it — an outage with an audience teaches you more than a hundred green dashboards.</p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">why it exists</p>
    <h2>What I am actually practising</h2>
    <p>Six things the rack exists to teach me. Each one is somewhere I wanted to be better, and each one has cost me at least one evening — which is the point.</p>
    <div class="flow">
      <div
        v-for="item in practice"
        :key="item.title"
        class="zone"
        :style="`--zc:var(--${item.zone})`"
      >
        <h3>{{ item.title }}</h3>
        <p>{{ item.body }}</p>
      </div>
    </div>
    <div class="prose spaced">
      <p>The <NuxtLink to="/radar">tech radar</NuxtLink> is the same idea written down per tool: what I trust, what I am still trying, and what I have read about but not run. The <NuxtLink to="/log">build log</NuxtLink> is where the mistakes live.</p>
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
      <p>Every layer exists because something simpler broke in a way I did not enjoy, and each break taught me the thing the next layer is made of. That is the honest description of how anyone learns this: not by reading the documentation first, but by needing it at eleven at night and remembering it forever afterwards.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">what the family uses</p>
    <h2>Internal tools, and which ones are still on trial</h2>
    <p>Everything below runs for the household, not for the internet. Some of it has been relied on for years; some of it is being tried out and will be removed without ceremony if nobody uses it after a month.</p>
    <div class="deck">
      <div
        v-for="project in projects"
        :key="project.name"
        class="card static"
        :style="`--zc:var(--${project.zone})`"
      >
        <h3>
          {{ project.name }}
          <span class="pill" :data-status="project.status">{{ statusLabel[project.status] }}</span>
        </h3>
        <p>{{ project.what }}</p>
        <span class="meta">{{ project.who }}</span>
      </div>
    </div>
    <div class="prose spaced">
      <p>The trialling ones are the interesting half. A tool earns "relied on" by surviving a month of someone who is not me trying to use it on a phone, in a hurry, without being told how — which is a far harder test than anything I would design.</p>
      <p>Only this site is reachable from the internet. Everything else answers on the LAN or over WireGuard, which is a deliberate limit rather than a missing feature — see the <NuxtLink to="/security">security page</NuxtLink> for the rules between the zones, and the <NuxtLink to="/compute">compute page</NuxtLink> for what each service runs on.</p>
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
