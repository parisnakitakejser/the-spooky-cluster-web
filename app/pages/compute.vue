<script setup lang="ts">
usePageSeo({
  title: 'Compute — the spooky cluster',
  description: 'Three separate Kubernetes clusters — production, staging and management — their nodes, versions and workloads.',
})

const prodStats = [
  { value: '3', label: 'nodes' },
  { value: '120', label: 'vCPU' },
  { value: '1.1 TB', label: 'memory' },
  { value: '52', label: 'pods running' },
]

const prodNodes = {
  columns: ['Node', 'CPU', 'Memory', 'Local disk', 'Role'],
  rows: [
    ['crypt-01', '2× Xeon Gold 6248', '384 GB', '2× 960 GB NVMe', 'control + worker'],
    ['crypt-02', '2× Xeon Gold 6248', '384 GB', '2× 960 GB NVMe', 'control + worker'],
    ['crypt-03', '2× Xeon Gold 6248', '384 GB', '2× 960 GB NVMe', 'control + worker'],
  ],
}

const stageStats = [
  { value: '2', label: 'nodes' },
  { value: '56', label: 'vCPU' },
  { value: '256 GB', label: 'memory' },
  { value: '~30 min', label: 'rebuild from scratch' },
]

const mgmtWorkloads = {
  columns: ['Service', 'Job', 'Reachable from'],
  rows: [
    ['Argo CD', 'Deploys all three clusters from one Git repo', 'mgmt vlan'],
    ['Vault', 'Secrets, auto-unseal via a key on the UPS-backed NUC', 'mgmt vlan'],
    ['Prometheus', 'Scrapes every node, cluster and PDU outlet', 'mgmt vlan'],
    ['Grafana', 'Dashboards, and the source of the numbers on this site', 'mgmt vlan'],
    ['Loki', 'Log aggregation, 30-day retention on Ceph', 'mgmt vlan'],
    ['Renovate', 'Opens pull requests when container images move', 'mgmt vlan'],
  ],
}
</script>

<template>
  <PageHead
    crumb="compute"
    heading="Three clusters, not three namespaces"
    lede="Production and staging run as physically separate Kubernetes clusters. It costs more hardware and more maintenance than namespace isolation, and I did it anyway, because I have broken staging enough times to know that a shared API server is a shared outage."
  >
    <template #ghost><GhostCompute /></template>
    <template #tags>
      <ZoneChip zone="p">prod · 3 nodes</ZoneChip>
      <ZoneChip zone="s">stage · 2 nodes</ZoneChip>
      <ZoneChip zone="m">mgmt · 3 nodes</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="prod">
    <p class="u-slot">production</p>
    <h2>crypt</h2>
    <p>The only cluster anything outside the house can reach, and then only through the reverse proxy in the DMZ. Three nodes, each both control plane and worker, which is not best practice and is correct for three machines.</p>
    <StatGrid :items="prodStats" zone="p" />
    <h3>Nodes</h3>
    <DataTable :columns="prodNodes.columns" :rows="prodNodes.rows" />
    <h3>What runs here</h3>
    <div class="prose">
      <p>Nextcloud, Immich, Paperless, Home Assistant, Vaultwarden, Jellyfin, Forgejo, and a handful of small services I wrote myself. Persistent volumes come from Ceph over RBD; nothing writes to local disk except container images and the kubelet.</p>
      <p>Ingress is <code>ingress-nginx</code> with cert-manager doing DNS-01 against Cloudflare, so no port 80 challenge and no certificate ever leaves the cluster.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">staging</p>
    <h2>rehearsal</h2>
    <p>Same Kubernetes version, same manifests, a quarter of the memory and none of the real data. Its job is to fail first. Every upgrade lands here for at least a week before production sees it, and the cluster gets torn down and rebuilt from Git roughly once a month to prove that it can be.</p>
    <StatGrid :items="stageStats" zone="s" />
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">management</p>
    <h2>séance</h2>
    <p>Three NUCs running Talos, which has no shell and no package manager, which is the point. This cluster holds the things that must keep working when the other two don't: GitOps, secrets, metrics and the dashboards I stare at while something is on fire.</p>
    <h3>Workloads</h3>
    <DataTable :columns="mgmtWorkloads.columns" :rows="mgmtWorkloads.rows" />
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">how it's deployed</p>
    <h2>Everything comes from one repository</h2>
    <div class="prose">
      <p>There is no <code>kubectl apply</code> from my laptop. A change is a pull request; Argo CD reconciles it; if the cluster drifts, Argo puts it back. This is less convenient than it sounds and has saved me twice, both times at an hour when I was not thinking clearly.</p>
      <ul>
        <li><strong>Cluster bootstrap</strong> — Talos machine configs, versioned, so a dead node is a reinstall and not an archaeology project.</li>
        <li><strong>Applications</strong> — Helm charts pinned by digest, values in plain YAML, secrets injected from Vault at sync time.</li>
        <li><strong>Promotion</strong> — staging tracks the <code>main</code> branch; production tracks tags. Promoting is moving a tag.</li>
      </ul>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
