<script setup lang="ts">
usePageSeo({
  title: 'Observability — the spooky cluster',
  description: 'Metrics, logs and the handful of alerts that have actually fired: what gets watched in the rack, what wakes me, and what still goes unnoticed.',
})

const glance = [
  { value: '41', label: 'scrape targets' },
  { value: '30 d', label: 'log retention' },
  { value: '23', label: 'alert rules' },
  { value: '4', label: 'pages in 90 days' },
]

const stack = {
  columns: ['Component', 'Job', 'Runs on', 'Why there'],
  rows: [
    ['Prometheus', 'Scrapes and stores metrics', 'séance (mgmt)', 'Outside the clusters it watches'],
    ['Alertmanager', 'Groups, silences and routes alerts', 'séance (mgmt)', 'Same failure domain as Prometheus'],
    ['Grafana', 'Dashboards over metrics and logs', 'séance (mgmt)', 'One place to correlate both'],
    ['Loki', 'Log aggregation, 30-day retention', 'séance (mgmt)', 'Cheap enough to keep everything'],
    ['node_exporter', 'Host metrics on every machine', 'all nodes', 'Where the real alerts come from'],
    ['Uptime Kuma', 'External checks on key endpoints', "parents' house", 'The one thing not in this rack'],
  ],
}

const alerts = {
  columns: ['What fires', 'The condition', 'Where it goes'],
  rows: [
    ['Disk filling', 'Predicted full within 4 hours, not a flat 85%', 'Phone'],
    ['Ceph health', 'Anything other than HEALTH_OK for 10 minutes', 'Phone'],
    ['Node down', 'Scrape failing for 3 minutes, inhibits everything on it', 'Phone'],
    ['Intake temperature', 'Above 30 °C for 15 minutes', 'Phone'],
    ['Backup age', 'No successful Restic snapshot in 36 hours', 'Phone'],
    ['Certificate expiry', 'Under 14 days and cert-manager has not renewed', 'Matrix'],
    ['Pod restart loop', 'More than 5 restarts in 15 minutes', 'Matrix'],
    ['Power draw', 'Sustained above 1.6 kW, which means something is stuck', 'Matrix'],
  ],
}
</script>

<template>
  <PageHead
    crumb="observability"
    heading="Finding out before the house does"
    lede="Every number on this site comes from here. So does the answer to the only question that matters during an incident: is this thing broken, or is the thing watching it broken?"
  >
    <template #ghost><GhostObservability /></template>
    <template #tags>
      <ZoneChip zone="k">41 targets</ZoneChip>
      <ZoneChip zone="c">30-day logs</ZoneChip>
      <ZoneChip zone="d">23 rules</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="pink">
    <p class="u-slot">at a glance</p>
    <h2>Four numbers, one of them the point</h2>
    <p>Four pages in ninety days is the number I actually tune for. Fewer would mean I am not watching enough; many more would mean I had stopped reading them.</p>
    <StatGrid :items="glance" zone="c" />
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">the stack</p>
    <h2>What runs, and the one rule about where</h2>
    <p>All of it lives on the management cluster, not on the clusters it watches. A monitoring stack that dies with the thing it monitors tells you nothing at the exact moment you need it.</p>
    <DataTable :columns="stack.columns" :rows="stack.rows" />
    <div class="prose spaced">
      <p><NuxtLink to="/radar/prometheus">Prometheus</NuxtLink> pulls rather than receives, which means a target that vanishes is itself a signal — a push-based system just goes quiet and quiet looks like healthy. <NuxtLink to="/radar/loki">Loki</NuxtLink> indexes labels rather than log content, so keeping thirty days of everything costs disk rather than a small fortune in index.</p>
      <p>The exception to the rule is deliberate: <NuxtLink to="/radar/uptime-kuma">Uptime Kuma</NuxtLink> runs on the backup mini PC 40 km away. Prometheus cannot tell me the management cluster is unreachable, because it would be unreachable too.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">alerting</p>
    <h2>The rules that are allowed to wake me</h2>
    <p>Eight of the twenty-three page or notify; the rest are recording rules and dashboard fuel. An alert earns the phone by being both urgent and actionable — if I cannot do anything about it at 3am, it goes to Matrix and waits.</p>
    <DataTable :columns="alerts.columns" :rows="alerts.rows" />
    <div class="prose spaced">
      <p>Two things do most of the work here. <NuxtLink to="/radar/alertmanager">Alertmanager</NuxtLink> inhibition means a dead node produces one page rather than thirty — everything scheduled on it is suppressed by the node alert. And every rule carries a runbook link in its annotations, so the notification says what to check rather than only what broke.</p>
      <p>Disk alerts predict rather than threshold. "Full in four hours" is something I can act on; "85% used" is something I learn to swipe away.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">dashboards</p>
    <h2>Three screens, and the rest on demand</h2>
    <div class="prose">
      <p>Dashboards live in Git and are provisioned, not clicked together — a dashboard built in the UI and never exported is a dashboard I will rebuild after the next restore.</p>
      <ul>
        <li><strong>Rack overview</strong> — power per outlet, intake and exhaust temperature, fan curves, UPS runtime. The one that runs on the wall display.</li>
        <li><strong>Cluster health</strong> — node pressure, pod restarts, scheduling failures, and control-plane latency across all three clusters on one screen.</li>
        <li><strong>Ceph</strong> — OSD latency, pool usage, and re-balance progress. Watched closely during any disk work, ignored the rest of the time.</li>
      </ul>
      <p>Everything else is a query written when something is wrong and thrown away afterwards. Not every question deserves a permanent panel.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">what it has caught</p>
    <h2>The alerts that earned their keep</h2>
    <div class="prose">
      <p>Worth writing down, because the useful alerts turned out not to be the clever ones.</p>
      <ul>
        <li><strong>Intake temperature in July</strong> — which is how the blanking-panel project started, and it is in the <NuxtLink to="/log">build log</NuxtLink> as the best thermal upgrade I have made.</li>
        <li><strong>A disk filling on the management cluster</strong> — image garbage collection was never configured. Caught four hours out, fixed in ten minutes.</li>
        <li><strong>Backup age</strong> — a Restic job failed silently for two nights after a credential rotation. Nothing else would have noticed until a restore.</li>
        <li><strong>Ceph degraded during a re-balance</strong> — expected, but the alert is how I learned that one storage node is on the wrong link speed.</li>
      </ul>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">the gaps</p>
    <h2>What I still would not find out about</h2>
    <div class="prose">
      <p>The honest half. This stack is good at telling me a machine is unhappy and bad at almost everything else.</p>
      <ul>
        <li><strong>No tracing.</strong> Metrics say a request was slow and logs say what it printed; nothing says where the time went. <NuxtLink to="/radar/opentelemetry">OpenTelemetry</NuxtLink> is in Research for exactly this, and the real work is instrumenting the apps, not running the collector.</li>
        <li><strong>No one is on call.</strong> There is one person. If something fires while I am on a plane, it fires into an empty room until I land — and no rotation tool fixes a rotation of one.</li>
        <li><strong>Silent corruption.</strong> Ceph scrubbing catches disk-level rot. An application writing wrong-but-valid data would be backed up faithfully three times over and noticed by nobody.</li>
        <li><strong>The watcher is unwatched</strong>, mostly. Uptime Kuma checks that the stack answers; nothing checks that the alert path itself still delivers. A quarterly test alert is on the list.</li>
      </ul>
      <p>Each tool named here has an entry on the <NuxtLink to="/radar">tech radar</NuxtLink>, with the parts that bite.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
