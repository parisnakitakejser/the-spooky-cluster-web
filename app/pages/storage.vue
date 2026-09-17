<script setup lang="ts">
usePageSeo({
  title: 'Storage — the spooky cluster',
  description: 'A three-node Ceph cluster across 36 disks: OSD layout, pools, CRUSH rules and the backup that isn\'t Ceph.',
})

const capacity = [
  { value: '288 TB', label: 'raw' },
  { value: '96 TB', label: 'after 3× replication' },
  { value: '94 TB', label: 'usable target' },
  { value: '61 TB', label: 'currently stored' },
  { value: '0', label: 'disks lost so far' },
]

const chassis = {
  columns: ['Node', 'Chassis', 'Data disks', 'WAL / DB', 'Network'],
  rows: [
    ['ossuary-01', 'Supermicro 846 · 24-bay', '12× 8 TB SAS 7.2k', '2× 480 GB NVMe', '10G SFP+'],
    ['ossuary-02', 'Supermicro 846 · 24-bay', '12× 8 TB SAS 7.2k', '2× 480 GB NVMe', '10G SFP+'],
    ['ossuary-03', 'Supermicro 846 · 24-bay', '12× 8 TB SAS 7.2k', '2× 480 GB NVMe', '2× 1G LACP'],
  ],
}

const pools = {
  columns: ['Pool', 'Type', 'Replication', 'Used', 'Serves'],
  rows: [
    ['k8s-rbd', 'RBD block', '3×', '14 TB', 'All Kubernetes persistent volumes'],
    ['media-fs', 'CephFS', '3×', '43 TB', 'Jellyfin library, photo originals'],
    ['backup-rgw', 'S3 object', '3×', '4 TB', 'Restic targets from outside the rack'],
  ],
}
</script>

<template>
  <PageHead
    crumb="storage"
    heading="Ceph, three replicas, no regrets"
    lede="Thirty-six spinning disks across three chassis, with NVMe carrying the write-ahead log. Replication instead of erasure coding — it costs two thirds of the raw capacity, and it buys rebuilds that are dull. Dull is what you want at three in the morning."
  >
    <template #ghost><GhostStorage /></template>
    <template #tags>
      <ZoneChip zone="c">36 osds</ZoneChip>
      <ZoneChip zone="c">94 tb usable</ZoneChip>
      <ZoneChip zone="c">3× replication</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">the pool</p>
    <h2>Where the capacity actually goes</h2>
    <p>Raw capacity is a marketing number. After replication and the 15% I keep free so a full node failure can re-balance without wedging the cluster, this is what's left.</p>
    <StatGrid :items="capacity" zone="c" />
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">hardware</p>
    <h2>Three chassis, twelve disks each</h2>
    <DataTable :columns="chassis.columns" :rows="chassis.rows" />
    <div class="prose spaced">
      <p>Yes, ossuary-03 is on gigabit. The switch has two SFP+ ports and I have three storage nodes, which is the kind of arithmetic you only do once. It re-balances more slowly than the other two and it has not yet caused a problem, but it is the next thing I'm fixing.</p>
      <p>Each chassis has 12 empty bays. Expansion is buying disks, not buying servers, which is the reason I bought 24-bay chassis for a 12-disk workload in the first place.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">layout</p>
    <h2>Pools and CRUSH</h2>
    <p>The failure domain is the host, not the disk. Three replicas across three hosts means any one chassis can go offline — planned or otherwise — without a single degraded object going unreadable.</p>
    <DataTable :columns="pools.columns" :rows="pools.rows" />
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">backups</p>
    <h2>Ceph is not a backup</h2>
    <div class="prose">
      <p>Replication protects against a disk dying. It does nothing about a bad <code>rm</code>, a ransomware event, or a fire in the garage. So there are three copies of anything I would actually miss, and only one of them is Ceph.</p>
      <ul>
        <li><strong>Copy one</strong> — the live Ceph pool, replicated three ways inside the rack.</li>
        <li><strong>Copy two</strong> — nightly Restic snapshots to a mini PC at my parents' house, 40 km away, over WireGuard. Encrypted before it leaves; they hold no key.</li>
        <li><strong>Copy three</strong> — monthly Restic snapshot to Backblaze B2, same encryption, different credentials, and an append-only application key so a compromised cluster cannot delete history.</li>
      </ul>
      <p>Restores are tested on the first Sunday of each month by pulling one random file and one whole volume. An untested backup is a rumour.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
