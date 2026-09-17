// ============================================================
//  THE TECH RADAR
//
//  Rings say how much I trust a thing. Quadrants say what part
//  of the rack it belongs to. Everything here is a tool I
//  actually touch, or one I am deliberately not touching.
//
//  Adding an entry is adding an object to `radarEntries` — the
//  chart geometry, the numbering and the detail page all follow
//  from it. Blip positions are derived from the slug, so they
//  are stable across builds: an entry does not move on the
//  chart unless its ring or quadrant changes.
// ============================================================

export type RingId = 'adopt' | 'trial' | 'assess' | 'hold'

/** none: unchanged. new: first appearance. in/out: moved toward or away from adopt. */
export type Movement = 'none' | 'new' | 'in' | 'out'

export interface RadarRing {
  id: RingId
  name: string
  blurb: string
}

export interface RadarQuadrant {
  id: string
  name: string
  blurb: string
  /** A zone colour token from the stylesheet: prod, stage, mgmt, ceph, dmz. */
  zone: string
}

export interface RadarLink {
  label: string
  href: string
}

export interface RadarEntry {
  slug: string
  name: string
  quadrant: string
  ring: RingId
  movement: Movement
  /** When it landed in the rack, or when I last moved it a ring. */
  since: string
  tagline: string
  /** What the thing actually is, for someone who has not met it. */
  what: string
  /** What it does here specifically, and why it beat the alternative. */
  why: string
  /** The parts that bite. An entry with an empty list is an entry I have not used hard enough. */
  watch: string[]
  links: RadarLink[]
  related?: string[]
}

export const radarRings: RadarRing[] = [
  {
    id: 'adopt',
    name: 'Adopt',
    blurb: 'Running in production in the rack. I would rebuild the lab around it tomorrow.',
  },
  {
    id: 'trial',
    name: 'Trial',
    blurb: 'Running for real, but not yet load-bearing. Staging has it; production is waiting.',
  },
  {
    id: 'assess',
    name: 'Assess',
    blurb: 'Read the docs, maybe built a toy. No opinion I would defend yet.',
  },
  {
    id: 'hold',
    name: 'Hold',
    blurb: 'Not starting anything new with it. Either it is on its way out, or it lost a bake-off.',
  },
]

export const radarQuadrants: RadarQuadrant[] = [
  {
    id: 'platform',
    name: 'Platform & Compute',
    blurb: 'What schedules the work and what the nodes boot into.',
    zone: 'prod',
  },
  {
    id: 'storage',
    name: 'Storage & Data',
    blurb: 'Where the bytes live, and how many copies of them exist.',
    zone: 'ceph',
  },
  {
    id: 'network',
    name: 'Network & Security',
    blurb: 'Routing, names, secrets, and everything in the cleaning zone.',
    zone: 'dmz',
  },
  {
    id: 'operations',
    name: 'Operations & Workloads',
    blurb: 'How changes ship, how I find out it broke, and what it all runs for.',
    zone: 'stage',
  },
]

export const radarEntries: RadarEntry[] = [
  // ---------- platform & compute ----------
  {
    slug: 'kubernetes',
    name: 'Kubernetes',
    quadrant: 'platform',
    ring: 'adopt',
    movement: 'none',
    since: '2024-03',
    tagline: 'The scheduler everything else in the rack assumes.',
    what: 'A container orchestrator: you describe the desired state of a workload and a control loop keeps the cluster matching it. The API is declarative and extensible, which is why so much of the ecosystem is written as controllers rather than scripts.',
    why: 'Three separate clusters here — production, staging and management — rather than three namespaces on one, because a shared API server is a shared outage. Every node is both control plane and worker, which is not best practice and is correct for three machines.',
    watch: [
      'Three clusters is three upgrade cycles. The work scales with cluster count, not node count.',
      'Etcd wants low-latency disks. Putting it on the same spindles as bulk storage is a lesson you only need once.',
      'A single-digit node count means pod anti-affinity rules quietly become unschedulable constraints.',
    ],
    links: [
      { label: 'kubernetes.io', href: 'https://kubernetes.io/docs/home/' },
      { label: 'Production-readiness checklist', href: 'https://kubernetes.io/docs/setup/production-environment/' },
    ],
    related: ['talos-linux', 'helm', 'argo-cd'],
  },
  {
    slug: 'talos-linux',
    name: 'Talos Linux',
    quadrant: 'platform',
    ring: 'adopt',
    movement: 'none',
    since: '2024-03',
    tagline: 'A Linux with no shell, which is the entire point.',
    what: 'An immutable, API-driven OS built only to run Kubernetes. There is no SSH, no package manager and no shell — you configure it by applying a machine config and talk to it over a gRPC API with mutual TLS.',
    why: 'The management cluster runs it on three NUCs. A dead node is a reinstall from a versioned machine config rather than an archaeology project, and there is no drift to discover because there is nowhere to make an undocumented change.',
    watch: [
      'Debugging without a shell is a different skill. Learn `talosctl logs` and `talosctl dmesg` before you need them at 2am.',
      'The machine config is the node. Lose it and you are reinstalling from memory — keep it in Git with everything else.',
      'Upgrades are the whole OS at once. That is the feature, but it means a bad release is a bad node.',
    ],
    links: [
      { label: 'talos.dev', href: 'https://www.talos.dev/' },
      { label: 'Machine configuration reference', href: 'https://www.talos.dev/latest/reference/configuration/' },
    ],
    related: ['kubernetes', 'argo-cd'],
  },
  {
    slug: 'helm',
    name: 'Helm',
    quadrant: 'platform',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'Templated YAML with a release history. Still the least-bad option.',
    what: 'A package manager for Kubernetes. A chart is templates plus a values file; installing one renders the templates and records a release, so upgrades and rollbacks are tracked rather than reconstructed.',
    why: 'Everything third-party arrives as a chart, pinned by digest, with values in plain YAML. This site ships as a chart too — including a values schema that refuses settings which would weaken the pod security context.',
    watch: [
      'Go templating over YAML means whitespace bugs that only appear with certain values. `helm template` is not optional.',
      'A values.schema.json is the difference between a typo being caught at template time and being caught in production.',
      'Charts that hide a StatefulSet behind forty toggles are harder to reason about than the manifests they replaced.',
    ],
    links: [
      { label: 'helm.sh', href: 'https://helm.sh/docs/' },
      { label: 'Chart best practices', href: 'https://helm.sh/docs/chart_best_practices/' },
    ],
    related: ['kubernetes', 'argo-cd', 'kustomize'],
  },
  {
    slug: 'containerd',
    name: 'containerd',
    quadrant: 'platform',
    ring: 'adopt',
    movement: 'none',
    since: '2024-03',
    tagline: 'The runtime you should never have to think about.',
    what: 'The container runtime Kubernetes actually talks to via CRI. It pulls images, manages snapshots and hands containers to runc. Docker uses it underneath too.',
    why: 'It is what Talos ships and what the clusters use. It earns its Adopt ring by being invisible: in two years the only time it has come up was configuring a registry mirror.',
    watch: [
      'Image garbage collection is kubelet policy, not containerd policy. Nodes fill up quietly if you never set it.',
      'Registry mirror config lives in the node config, so it is a machine-config change, not a cluster change.',
    ],
    links: [
      { label: 'containerd.io', href: 'https://containerd.io/docs/' },
    ],
    related: ['kubernetes', 'talos-linux'],
  },
  {
    slug: 'kustomize',
    name: 'Kustomize',
    quadrant: 'platform',
    ring: 'trial',
    movement: 'in',
    since: '2026-05',
    tagline: 'Patching YAML without templating it.',
    what: 'Overlays plain manifests with patches instead of rendering templates. A base directory holds real YAML; overlays layer environment-specific changes on top. Built into kubectl.',
    why: 'Used for the handful of things I wrote myself, where a chart would be ceremony around four resources. The manifests stay valid YAML you can read and apply directly, which is worth a lot when something is broken.',
    watch: [
      'Strategic merge patches on lists are surprising. Learn which list fields are keyed before patching one.',
      'Two ways to deploy in one repo is a tax. Pick a boundary — I use "did I write it or did someone else" — and hold it.',
    ],
    links: [
      { label: 'kustomize.io', href: 'https://kustomize.io/' },
    ],
    related: ['helm', 'argo-cd'],
  },
  {
    slug: 'cilium',
    name: 'Cilium',
    quadrant: 'platform',
    ring: 'assess',
    movement: 'new',
    since: '2026-08',
    tagline: 'eBPF networking, and a NetworkPolicy I could actually debug.',
    what: 'A CNI plugin that implements pod networking, load balancing and network policy with eBPF programs in the kernel rather than iptables rules. Hubble, its observability layer, shows flows and policy verdicts live.',
    why: 'Assessing it because "the NetworkPolicy is correct" is currently something I believe rather than something I can watch. Hubble turning a denied flow into a visible event is the entire attraction.',
    watch: [
      'It wants a recent kernel. Check what Talos ships before planning the migration.',
      'Swapping CNI on a running cluster is a rebuild in practice. Staging first, and expect to do it twice.',
      'The feature surface is enormous. Turning all of it on is how a homelab becomes a second job.',
    ],
    links: [
      { label: 'cilium.io', href: 'https://cilium.io/' },
      { label: 'Hubble', href: 'https://docs.cilium.io/en/stable/overview/intro/' },
    ],
    related: ['kubernetes', 'gateway-api'],
  },
  {
    slug: 'kubevirt',
    name: 'KubeVirt',
    quadrant: 'platform',
    ring: 'assess',
    movement: 'none',
    since: '2026-06',
    tagline: 'For the two things that refuse to be a container.',
    what: 'Runs virtual machines as Kubernetes resources, so a VM is scheduled, networked and backed by storage the same way a pod is.',
    why: 'There are always one or two appliances that ship as a disk image and nothing else. Assessing whether one control plane for both is better than keeping a hypervisor around for them.',
    watch: [
      'Live migration needs shared storage — that means the Ceph RBD path, and it means testing it.',
      'Adding VMs to a cluster adds a blast radius that Kubernetes upgrades now touch.',
    ],
    links: [
      { label: 'kubevirt.io', href: 'https://kubevirt.io/' },
    ],
    related: ['kubernetes', 'ceph'],
  },
  {
    slug: 'docker-compose',
    name: 'Docker Compose',
    quadrant: 'platform',
    ring: 'hold',
    movement: 'out',
    since: '2024-03',
    tagline: 'How the lab started. Not how it continues.',
    what: 'Declares a set of containers, networks and volumes for a single host in one YAML file, and brings them up together.',
    why: 'Everything here began as compose files on one box. Hold rather than retired: it is still the fastest way to try something on a laptop, and nothing new in the rack is built on it.',
    watch: [
      'The single host is the whole problem — no rescheduling, and updates are downtime.',
      'Compose files rot into undocumented state on disk. That drift is exactly what the GitOps setup exists to prevent.',
    ],
    links: [
      { label: 'Compose specification', href: 'https://docs.docker.com/compose/' },
    ],
    related: ['kubernetes'],
  },

  // ---------- storage & data ----------
  {
    slug: 'ceph',
    name: 'Ceph',
    quadrant: 'storage',
    ring: 'adopt',
    movement: 'none',
    since: '2024-05',
    tagline: 'Thirty-six disks pretending to be one very calm disk.',
    what: 'A distributed storage system providing block (RBD), filesystem (CephFS) and S3-compatible object (RGW) storage from one cluster of OSDs. CRUSH decides placement algorithmically, so there is no metadata server in the data path for block storage.',
    why: 'Three chassis, twelve disks each, NVMe carrying the write-ahead log. Three-way replication instead of erasure coding: it costs two thirds of raw capacity and buys rebuilds that are dull, which is what you want at three in the morning.',
    watch: [
      'The failure domain is the host, not the disk. Getting that wrong in the CRUSH map is a silent single point of failure.',
      'Re-balancing saturates whatever link it is given — a node on a slower link is a node that holds up recovery.',
      'Keep real headroom free. A pool near full during a node failure is a pool that wedges.',
    ],
    links: [
      { label: 'ceph.io docs', href: 'https://docs.ceph.com/en/latest/' },
      { label: 'CRUSH maps', href: 'https://docs.ceph.com/en/latest/rados/operations/crush-map/' },
    ],
    related: ['rook', 'restic', 'kubernetes'],
  },
  {
    slug: 'restic',
    name: 'Restic',
    quadrant: 'storage',
    ring: 'adopt',
    movement: 'none',
    since: '2024-06',
    tagline: 'Encrypted, deduplicated, and boring in the right way.',
    what: 'A backup program that encrypts client-side, deduplicates by content, and stores snapshots in a repository on local disk, SFTP, S3 and others. Restores are file-level out of any snapshot.',
    why: 'Copy two goes nightly over WireGuard to a mini PC 40 km away; copy three goes monthly to Backblaze B2. Encrypted before it leaves, so neither destination holds a key.',
    watch: [
      'An untested backup is a rumour. Restores are tested monthly here: one random file, one whole volume.',
      'Pruning is the slow operation, not backing up. Schedule it where you will not notice.',
      'Lose the repository password and the backup is indistinguishable from noise. That is the design.',
    ],
    links: [
      { label: 'restic.net', href: 'https://restic.readthedocs.io/' },
    ],
    related: ['backblaze-b2', 'ceph', 'wireguard'],
  },
  {
    slug: 'backblaze-b2',
    name: 'Backblaze B2',
    quadrant: 'storage',
    ring: 'adopt',
    movement: 'none',
    since: '2026-01',
    tagline: 'The copy that is not in the same weather system.',
    what: 'S3-compatible object storage, priced for bulk. Application keys can be scoped per bucket and restricted to write-only or append-only behaviour.',
    why: 'Copy three of anything I would miss. The application key is append-only, so a compromised cluster can add history but cannot delete it — which is the difference between a backup and a synchronised mistake.',
    watch: [
      'Egress costs on a real restore are the number to check before you need one.',
      'Object lock and key scoping are the whole security story here. A full-access key makes this copy worthless against ransomware.',
    ],
    links: [
      { label: 'Backblaze B2 docs', href: 'https://www.backblaze.com/docs/cloud-storage' },
    ],
    related: ['restic'],
  },
  {
    slug: 'rook',
    name: 'Rook',
    quadrant: 'storage',
    ring: 'assess',
    movement: 'none',
    since: '2026-02',
    tagline: 'Ceph as a Kubernetes operator, if I ever want that.',
    what: 'An operator that deploys and manages Ceph inside Kubernetes: OSDs become pods, and cluster changes become custom resource edits.',
    why: 'The Ceph cluster here runs on its own hardware, outside Kubernetes, on purpose — storage that depends on the thing it stores for is a circular dependency at exactly the wrong moment. Assessing Rook for a future second pool, not for this one.',
    watch: [
      'Storage inside the cluster that the cluster needs to boot is a bootstrap problem. Think it through before migrating.',
      'The operator abstracts Ceph right up until something breaks, and then you need to know Ceph anyway.',
    ],
    links: [
      { label: 'rook.io', href: 'https://rook.io/docs/rook/latest-release/Getting-Started/intro/' },
    ],
    related: ['ceph', 'kubernetes'],
  },
  {
    slug: 'velero',
    name: 'Velero',
    quadrant: 'storage',
    ring: 'assess',
    movement: 'new',
    since: '2026-07',
    tagline: 'Backing up the cluster, not just the volumes.',
    what: 'Backs up Kubernetes API objects and persistent volumes to object storage, and restores them into the same or a different cluster.',
    why: 'Restic covers the data. Argo CD covers the manifests. What neither covers cleanly is the in-between — resources something created at runtime. Assessing whether that gap is real or imagined.',
    watch: [
      'If everything truly comes from Git, this is duplicated effort. Prove the gap before adding the tool.',
      'CSI snapshot support depends on the storage driver — check what the Ceph CSI driver actually implements.',
    ],
    links: [
      { label: 'velero.io', href: 'https://velero.io/docs/latest/' },
    ],
    related: ['restic', 'argo-cd', 'ceph'],
  },
  {
    slug: 'minio',
    name: 'MinIO',
    quadrant: 'storage',
    ring: 'hold',
    movement: 'out',
    since: '2025-11',
    tagline: 'Lost a bake-off to the S3 gateway already in the rack.',
    what: 'S3-compatible object storage, deployable as a single binary or a distributed cluster.',
    why: 'Ran it for a while as the S3 target for backups. Ceph already speaks S3 through RGW, and two object stores meant two sets of credentials and two capacity plans. Hold: nothing new points at it.',
    watch: [
      'Two storage systems for one job is one storage system too many in a lab this size.',
      'Check the licence terms for your use before building anything durable on it.',
    ],
    links: [
      { label: 'min.io', href: 'https://min.io/docs/minio/linux/index.html' },
    ],
    related: ['ceph'],
  },

  // ---------- network & security ----------
  {
    slug: 'opnsense',
    name: 'OPNsense',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-02',
    tagline: 'One small box doing routing, firewall and IDS at 9 W.',
    what: 'A FreeBSD-based firewall and routing platform with a web UI, built around pf. Handles VLANs, NAT, VPN termination and IDS through plugins.',
    why: 'Runs on an N100 with four 2.5GbE ports as the edge. Seven VLANs terminate here, default deny in both directions, and the accept list is short enough to read on one screen — deliberately, because a policy I cannot read at once is a policy I cannot reason about.',
    watch: [
      'Rule order matters and the UI makes it easy to lose track. Keep the list short enough to audit by eye.',
      'Upgrades occasionally reshuffle plugin behaviour. Take a config backup before every one.',
      'Inline IDS on the WAN costs throughput. Measure it rather than assuming the CPU is fine.',
    ],
    links: [
      { label: 'opnsense.org docs', href: 'https://docs.opnsense.org/' },
    ],
    related: ['suricata', 'wireguard'],
  },
  {
    slug: 'wireguard',
    name: 'WireGuard',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-02',
    tagline: 'One UDP port, peers pinned by key, nothing to brute force.',
    what: 'A VPN built into the Linux kernel, using a fixed modern cipher suite and public-key peer identity. No cipher negotiation, no user database, and the code is small enough to audit.',
    why: 'The only remote access path. Peers land on the LAN VLAN rather than the management one, so a stolen laptop is not instantly iDRAC access. No password path means no user enumeration and nothing to guess.',
    watch: [
      'Key management is manual. Removing a lost device means editing peers everywhere it was allowed.',
      'It does not hide that it is there so much as refuse to answer — an unauthenticated packet gets silence, which is the point.',
      'Split-horizon DNS plus a VPN is where an evening disappears. Decide which resolver a peer uses and write it down.',
    ],
    links: [
      { label: 'wireguard.com', href: 'https://www.wireguard.com/' },
    ],
    related: ['opnsense', 'restic', 'tailscale'],
  },
  {
    slug: 'mikrotik-routeros',
    name: 'MikroTik RouterOS',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-02',
    tagline: 'Twenty-four gigabit ports and two SFP+ that shaped the whole storage layout.',
    what: 'The OS on MikroTik switches and routers: VLANs, bridging, routing and QoS, configurable from a CLI, a web UI or its own API.',
    why: 'A CRS326 is the core switch. The two SFP+ ports are the reason the storage tier is laid out the way it is — two nodes on 10G, one on bonded gigabit, which is arithmetic you only do once.',
    watch: [
      'Bridge VLAN filtering config differs between hardware generations. Read the manual for your exact model.',
      'Priority queueing is doing real work during a Ceph re-balance. Verify it rather than trusting the config.',
      'Keep the management interface off any routable VLAN.',
    ],
    links: [
      { label: 'MikroTik documentation', href: 'https://help.mikrotik.com/docs/' },
    ],
    related: ['ceph', 'opnsense'],
  },
  {
    slug: 'vault',
    name: 'HashiCorp Vault',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-07',
    tagline: 'Secrets injected at sync time, never committed.',
    what: 'A secrets manager with pluggable auth and storage, dynamic credentials with leases, and an audit log. Everything is gated behind an unseal process after a restart.',
    why: 'Lives on the management cluster and feeds secrets into Argo CD at sync time, so the Git repo holds references rather than values. Auto-unseal is keyed to a UPS-backed node.',
    watch: [
      'Auto-unseal is a convenience that moves the trust, not a way to remove it. Know where your key actually lives.',
      'Recovery keys belong somewhere that survives the rack burning down.',
      'Check the licence terms for your usage — the project relicensed and the community fork is worth knowing about.',
    ],
    links: [
      { label: 'developer.hashicorp.com/vault', href: 'https://developer.hashicorp.com/vault/docs' },
    ],
    related: ['argo-cd', 'kubernetes'],
  },
  {
    slug: 'cert-manager',
    name: 'cert-manager',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'Certificates as Kubernetes resources, renewed without me.',
    what: 'A controller that issues and renews X.509 certificates from ACME and other issuers, storing them as Secrets and reissuing before expiry.',
    why: 'DNS-01 against Cloudflare, so nothing has to answer a challenge on port 80 and no certificate ever leaves the cluster. Renewal is a thing that happens rather than a thing I remember.',
    watch: [
      'DNS-01 means an API token that can edit your zone. Scope it to exactly that zone.',
      'Let\'s Encrypt rate limits are per registered domain — use the staging issuer while you are iterating.',
      'Certificate secrets are just Secrets. Whatever protects the rest of them protects these.',
    ],
    links: [
      { label: 'cert-manager.io', href: 'https://cert-manager.io/docs/' },
    ],
    related: ['gateway-api', 'cloudflare-dns'],
  },
  {
    slug: 'gateway-api',
    name: 'Gateway API',
    quadrant: 'network',
    ring: 'trial',
    movement: 'in',
    since: '2026-09',
    tagline: 'The successor to Ingress, and the routing model I am moving to.',
    what: 'A Kubernetes API for L4/L7 routing that splits responsibilities: a GatewayClass and Gateway are infrastructure, HTTPRoute is application. Cross-namespace attachment is explicit and permissioned, which Ingress never made possible.',
    why: 'This site ships an HTTPRoute rather than an Ingress. TLS and the listener belong to the Gateway, so the chart carries no certificate config at all — a smaller surface for the app to get wrong.',
    watch: [
      'A route attaches only if the Gateway listener allows routes from its namespace. Check route status, not just that you applied it.',
      'A route that attaches can still time out if a NetworkPolicy does not allow the gateway namespace. Two things must agree.',
      'Implementations vary in what they support. Read your controller\'s conformance report, not just the spec.',
    ],
    links: [
      { label: 'gateway-api.sigs.k8s.io', href: 'https://gateway-api.sigs.k8s.io/' },
      { label: 'Implementations and conformance', href: 'https://gateway-api.sigs.k8s.io/implementations/' },
    ],
    related: ['ingress-nginx', 'cert-manager', 'cilium'],
  },
  {
    slug: 'ingress-nginx',
    name: 'ingress-nginx',
    quadrant: 'network',
    ring: 'hold',
    movement: 'out',
    since: '2024-04',
    tagline: 'Served me well. Being replaced by Gateway API.',
    what: 'The nginx-based Ingress controller: it watches Ingress resources and renders an nginx config from them, with per-controller behaviour extended through annotations.',
    why: 'Ran the public ingress path for two years without complaint. On Hold because routing is moving to Gateway API, where the app/infrastructure split is explicit and behaviour is not smuggled through annotation strings.',
    watch: [
      'Annotations are the extension mechanism, which means portability is a polite fiction.',
      'Snippet annotations are a config injection surface. Know whether yours are enabled.',
      'Nothing is wrong with it — this is a migration, not a rescue.',
    ],
    links: [
      { label: 'kubernetes.github.io/ingress-nginx', href: 'https://kubernetes.github.io/ingress-nginx/' },
    ],
    related: ['gateway-api'],
  },
  {
    slug: 'suricata',
    name: 'Suricata',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-09',
    tagline: 'Inline at the edge, mirroring the DMZ.',
    what: 'A network IDS/IPS that inspects traffic against signature rules, does protocol parsing and can extract files. Runs inline as an IPS or out-of-band on a mirror.',
    why: 'Inline on the WAN interface and mirroring the DMZ segment. It is the part of the cleaning zone that notices something rather than merely blocking it.',
    watch: [
      'Inline means a rule mistake is an outage, not just a false positive.',
      'Rule sets need curating or the alert volume trains you to ignore them.',
      'Encrypted traffic limits what signatures can see. It is not the whole detection story.',
    ],
    links: [
      { label: 'suricata.io docs', href: 'https://docs.suricata.io/' },
    ],
    related: ['wazuh', 'opnsense', 'loki'],
  },
  {
    slug: 'wazuh',
    name: 'Wazuh',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-10',
    tagline: 'Agents on every node, watching files that should not change.',
    what: 'A security platform combining host agents with a manager: file integrity monitoring, log analysis, rootkit checks and alerting, with a searchable index behind it.',
    why: 'Agents on every node watch file integrity on the Kubernetes config paths and ship auth logs into the SIEM VLAN. Alerts go to a private Matrix room; anything above medium severity rings my phone.',
    watch: [
      'The indexer is the heavy component. Budget memory for it before installing.',
      'Default rules generate noise on a homelab. Tune, or you will stop reading alerts.',
      'It assumes the attacker came from outside. It does very little about an image you pulled yourself.',
    ],
    links: [
      { label: 'wazuh.com docs', href: 'https://documentation.wazuh.com/' },
    ],
    related: ['suricata', 'loki'],
  },
  {
    slug: 'adguard-home',
    name: 'AdGuard Home',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'The resolver everything in the house points at.',
    what: 'A self-hosted DNS server with filtering, per-client rules and query logging, forwarding upstream over plain DNS, DoT or DoH.',
    why: 'A pair on the management cluster, forwarding to Unbound with DNSSEC. The query log is genuinely the first place I look when something "cannot reach" something else.',
    watch: [
      'Two instances or no instances — DNS is the outage that looks like every other outage.',
      'Blocklists break things eventually, and the breakage never looks like DNS at first.',
      'Query logs are a record of everything everyone in the house visits. Decide the retention on purpose.',
    ],
    links: [
      { label: 'AdGuard Home wiki', href: 'https://github.com/AdguardTeam/AdGuardHome/wiki' },
    ],
    related: ['unbound'],
  },
  {
    slug: 'unbound',
    name: 'Unbound',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'Validating resolver, so DNSSEC is checked here rather than trusted.',
    what: 'A validating, recursive, caching DNS resolver. It can resolve from the root servers itself and verifies DNSSEC signatures rather than taking an upstream resolver\'s word.',
    why: 'Sits behind AdGuard as the upstream. Recursing locally means no third party sees every query the house makes, and validation happens where I control it.',
    watch: [
      'Recursing from root is slower cold. The cache does the work — do not undersize it.',
      'A misconfigured local zone plus split-horizon is the classic afternoon-eating bug in this rack.',
    ],
    links: [
      { label: 'nlnetlabs.nl/unbound', href: 'https://nlnetlabs.nl/documentation/unbound/' },
    ],
    related: ['adguard-home'],
  },
  {
    slug: 'cloudflare-dns',
    name: 'Cloudflare DNS',
    quadrant: 'network',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'The public zone, and the ACME challenge target.',
    what: 'Authoritative DNS hosting with an API, used here for the public zone rather than for proxying traffic.',
    why: 'cert-manager solves DNS-01 challenges against it, which is what keeps port 80 closed. The public half of the split-horizon setup lives here.',
    watch: [
      'Split-horizon is the single most confusing thing in the lab when something breaks. Check resolution first, always.',
      'The API token for ACME should be scoped to the one zone and nothing else.',
    ],
    links: [
      { label: 'Cloudflare DNS docs', href: 'https://developers.cloudflare.com/dns/' },
    ],
    related: ['cert-manager', 'unbound'],
  },
  {
    slug: 'tailscale',
    name: 'Tailscale',
    quadrant: 'network',
    ring: 'assess',
    movement: 'none',
    since: '2026-03',
    tagline: 'Tempting, and it moves trust somewhere I do not control.',
    what: 'A mesh VPN built on WireGuard with a hosted coordination plane handling key distribution, NAT traversal and ACLs. Headscale is an open-source control server for the same clients.',
    why: 'Plain WireGuard works and costs nothing but manual key management. Assessing whether the convenience is worth a third party in the identity path — and whether Headscale removes that objection.',
    watch: [
      'The coordination server decides who is in your network. That is the whole trade.',
      'Subnet routers and exit nodes quietly widen what a compromised device reaches.',
    ],
    links: [
      { label: 'tailscale.com docs', href: 'https://tailscale.com/kb' },
      { label: 'Headscale', href: 'https://headscale.net/' },
    ],
    related: ['wireguard'],
  },

  // ---------- operations & workloads ----------
  {
    slug: 'argo-cd',
    name: 'Argo CD',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-04',
    tagline: 'There is no kubectl apply from my laptop.',
    what: 'A GitOps controller: it compares a Git repository against live cluster state, shows the diff, and reconciles the cluster back to what the repo says. It renders Helm and Kustomize itself rather than shelling out to a pipeline.',
    why: 'Deploys all three clusters from one repo. A change is a pull request; if a cluster drifts, Argo puts it back. Less convenient than it sounds, and it has saved me twice — both times at an hour when I was not thinking clearly.',
    watch: [
      'Auto-sync with prune is correct right up to the moment a bad repo state deletes something. Know which apps have it on.',
      'The controller lives on the management cluster, so that cluster is now a dependency of recovering the others.',
      'Secrets need a story before you start — here that story is Vault at sync time.',
    ],
    links: [
      { label: 'argo-cd.readthedocs.io', href: 'https://argo-cd.readthedocs.io/' },
    ],
    related: ['helm', 'vault', 'renovate', 'flux'],
  },
  {
    slug: 'renovate',
    name: 'Renovate',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-08',
    tagline: 'Opens the pull request so I only have to decide.',
    what: 'A dependency bot that scans a repository for container images, Helm charts, language dependencies and more, then opens pull requests when new versions appear. Grouping, scheduling and automerge are all configurable.',
    why: 'Pins here are digests, which is only sustainable if something else does the bumping. Renovate turns "is anything out of date" from a task into a queue of reviewable changes.',
    watch: [
      'Without grouping it will drown you. Tune the schedule before you tune anything else.',
      'Automerge is only safe where staging genuinely catches breakage first.',
      'It is a bot with write access to the repo that deploys everything. Scope its token accordingly.',
    ],
    links: [
      { label: 'docs.renovatebot.com', href: 'https://docs.renovatebot.com/' },
    ],
    related: ['argo-cd', 'forgejo'],
  },
  {
    slug: 'prometheus',
    name: 'Prometheus',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-05',
    tagline: 'Scrapes every node, cluster and PDU outlet.',
    what: 'A metrics database that pulls time series from HTTP endpoints, stores them locally, and queries them with PromQL. Alerting rules are evaluated against the same queries.',
    why: 'The source of every number on this site, including the per-outlet power draw. Pulling rather than pushing means a target that disappears is itself a signal.',
    watch: [
      'Retention is local disk. Decide the window before the disk decides it for you.',
      'Cardinality is the failure mode: one label with unbounded values will eat the instance.',
      'It scrapes the clusters it monitors, so it belongs outside them — here, on the management cluster.',
    ],
    links: [
      { label: 'prometheus.io docs', href: 'https://prometheus.io/docs/introduction/overview/' },
    ],
    related: ['grafana', 'loki', 'opentelemetry'],
  },
  {
    slug: 'grafana',
    name: 'Grafana',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-05',
    tagline: 'The dashboards I stare at while something is on fire.',
    what: 'A dashboard and visualisation layer over many data sources — Prometheus and Loki among them — with alerting of its own.',
    why: 'One place to correlate metrics and logs, which matters more than either view alone. Dashboards live in Git and are provisioned, not clicked together and lost.',
    watch: [
      'Dashboards built in the UI and never exported are dashboards you will rebuild.',
      'Anonymous access is a decision, not a default. Make it deliberately.',
    ],
    links: [
      { label: 'grafana.com docs', href: 'https://grafana.com/docs/grafana/latest/' },
    ],
    related: ['prometheus', 'loki'],
  },
  {
    slug: 'loki',
    name: 'Loki',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-05',
    tagline: 'Logs indexed by label, not by content.',
    what: 'A log aggregation system that indexes only labels and stores the log lines compressed in object storage, which makes it far cheaper than a full-text index.',
    why: 'Thirty-day retention on Ceph, queried from the same Grafana as the metrics. Cheap enough to keep everything rather than deciding in advance what matters.',
    watch: [
      'Label cardinality is the whole performance story. A label per pod name is fine; a label per request is not.',
      'Querying without a label selector is a full scan. It will feel broken; it is working as designed.',
    ],
    links: [
      { label: 'grafana.com/docs/loki', href: 'https://grafana.com/docs/loki/latest/' },
    ],
    related: ['grafana', 'prometheus', 'wazuh'],
  },
  {
    slug: 'forgejo',
    name: 'Forgejo',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2025-02',
    tagline: 'The repository the clusters deploy from, self-hosted.',
    what: 'A self-hosted Git forge — a community fork of Gitea — with issues, pull requests, a package registry and CI runners, in one Go binary.',
    why: 'Holds the repo Argo CD reconciles from. Self-hosting the thing that deploys everything is a circular dependency worth being honest about, which is why a clone lives off-site.',
    watch: [
      'If the forge is down, GitOps is down. Keep a mirror somewhere you can reach without it.',
      'It is an internet-facing app with accounts. Patch it like one.',
    ],
    links: [
      { label: 'forgejo.org docs', href: 'https://forgejo.org/docs/latest/' },
    ],
    related: ['argo-cd', 'renovate'],
  },
  {
    slug: 'flux',
    name: 'Flux CD',
    quadrant: 'operations',
    ring: 'assess',
    movement: 'none',
    since: '2025-06',
    tagline: 'The other GitOps answer. Still curious.',
    what: 'A set of GitOps controllers built as composable Kubernetes resources, with no UI of its own and first-class Helm and Kustomize reconciliation.',
    why: 'Argo CD works and the web UI earns its keep during an incident. Assessing Flux because the controller-per-concern model is cleaner and because knowing both makes the choice informed rather than habitual.',
    watch: [
      'Migrating GitOps tools mid-flight means two controllers briefly believe they own the same resources.',
      'No UI is a feature until you are debugging at 2am on a phone.',
    ],
    links: [
      { label: 'fluxcd.io docs', href: 'https://fluxcd.io/flux/' },
    ],
    related: ['argo-cd'],
  },
  {
    slug: 'opentelemetry',
    name: 'OpenTelemetry',
    quadrant: 'operations',
    ring: 'assess',
    movement: 'new',
    since: '2026-08',
    tagline: 'Traces are the gap between the metrics and the logs.',
    what: 'A vendor-neutral standard and toolkit for traces, metrics and logs, with a collector that receives, processes and exports telemetry to whatever backend you run.',
    why: 'Metrics say something is slow and logs say what it printed. Neither says where the time went across services. Assessing the collector first, because that part is useful even before anything emits a trace.',
    watch: [
      'Tracing is only worth it if something actually emits spans — instrumenting the apps is the real work.',
      'The collector becomes a dependency of everything that reports to it. Size and monitor it like one.',
    ],
    links: [
      { label: 'opentelemetry.io docs', href: 'https://opentelemetry.io/docs/' },
    ],
    related: ['prometheus', 'loki', 'grafana'],
  },
  {
    slug: 'home-assistant',
    name: 'Home Assistant',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-06',
    tagline: 'The workload with the least tolerance for downtime.',
    what: 'A local-first home automation platform with a large integration ecosystem, running automations on-premises rather than in a vendor cloud.',
    why: 'Runs on the production cluster. It is the service the rest of the house notices immediately, which makes it the honest test of whether an upgrade went well.',
    watch: [
      'Frequent releases with occasional breaking integration changes. Read the notes; this is not one to automerge.',
      'It ends up holding a lot about when people are home. Treat that data accordingly.',
    ],
    links: [
      { label: 'home-assistant.io docs', href: 'https://www.home-assistant.io/docs/' },
    ],
    related: ['kubernetes'],
  },
  {
    slug: 'immich',
    name: 'Immich',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'in',
    since: '2025-04',
    tagline: 'The photo library that finally replaced the cloud one.',
    what: 'A self-hosted photo and video backup service with mobile apps, timeline browsing and on-device-style search powered by local machine learning models.',
    why: 'Originals live on CephFS, backed up by Restic like everything else. Moved inward once a full restore from backup was tested rather than assumed.',
    watch: [
      'Still moving fast — read release notes before upgrading, and take the database backup first.',
      'The ML container is the heavy one. Keep it off the nodes you care about latency on.',
      'Uploads land in the quarantine zone and get scanned before anything else can read them.',
    ],
    links: [
      { label: 'immich.app docs', href: 'https://immich.app/docs/overview/introduction' },
    ],
    related: ['ceph', 'restic'],
  },
  {
    slug: 'jellyfin',
    name: 'Jellyfin',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-06',
    tagline: 'Media, and the workload that notices a slow re-balance.',
    what: 'A self-hosted media server with no account requirement and no upsell, transcoding on the fly when a client needs it.',
    why: 'Library sits on CephFS. It is also an accidental storage benchmark: when Jellyfin buffers, the storage tier is telling me something.',
    watch: [
      'Hardware transcoding needs the right device exposed to the pod — plan it before you need it.',
      'Read throughput matters more than IOPS here, and a re-balance eats exactly that.',
    ],
    links: [
      { label: 'jellyfin.org docs', href: 'https://jellyfin.org/docs/' },
    ],
    related: ['ceph'],
  },
  {
    slug: 'vaultwarden',
    name: 'Vaultwarden',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'none',
    since: '2024-06',
    tagline: 'Small, and holding the most valuable data in the rack.',
    what: 'A lightweight server implementing the Bitwarden client API in Rust, so the official clients work against a self-hosted backend.',
    why: 'Self-hosted because the vault is the one thing I want on my own disks. The data is small; the consequence of losing it is not.',
    watch: [
      'Restores here get tested more often than anywhere else, because this is the one that cannot be re-downloaded.',
      'Keep the admin page disabled unless you are actively using it.',
      'Vaults are encrypted client-side, but availability is still entirely your problem.',
    ],
    links: [
      { label: 'Vaultwarden wiki', href: 'https://github.com/dani-garcia/vaultwarden/wiki' },
    ],
    related: ['restic', 'vault'],
  },
  {
    slug: 'nuxt',
    name: 'Nuxt',
    quadrant: 'operations',
    ring: 'adopt',
    movement: 'new',
    since: '2026-09',
    tagline: 'What this site is built with, pre-rendered to plain files.',
    what: 'A Vue framework with file-based routing, auto-imported components and a Nitro server layer that can pre-render every route at build time.',
    why: 'This site was seven hand-written HTML files. It is now pages plus components with the repetitive markup — rack elevations, tables, this radar — living as data. Nitro serves the pre-rendered output, so the container needs no web server config.',
    watch: [
      'Pre-rendering means a content change is a rebuild. For a site that changes weekly, that is the right trade.',
      'Auto-imports are convenient and make "where does this come from" a genuine question for newcomers.',
    ],
    links: [
      { label: 'nuxt.com docs', href: 'https://nuxt.com/docs' },
    ],
    related: ['forgejo', 'helm'],
  },
]

// ------------------------------------------------------------
//  Geometry
// ------------------------------------------------------------

export const radarGeometry = {
  size: 880,
  get center() { return this.size / 2 },
  /** Outer edge of each ring, as a fraction of the radius. */
  ringStops: [0.31, 0.56, 0.79, 1] as const,
  radius: 396,
  blipRadius: 9,
  /** Keep blips off the ring and quadrant boundaries. */
  padding: 15,
  /** The innermost ring starts here, not at the centre. */
  innerHole: 0.1,
  /** Minimum centre-to-centre distance between two blips. */
  minGap: 25,
}

export interface PlacedBlip {
  entry: RadarEntry
  /** 1-based, and the number shown on the chart and in the legend. */
  n: number
  x: number
  y: number
  quadrant: RadarQuadrant
  ring: RadarRing
}

/** FNV-1a. Small, dependency-free, and the same everywhere — which is what matters. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Two stable floats in [0,1) from one string. */
function randoms(seed: string): [number, number] {
  const a = hash(seed)
  const b = hash(`${seed}:${a}`)
  return [a / 0x100000000, b / 0x100000000]
}

function ringBand(ring: RingId) {
  const { radius, ringStops, innerHole } = radarGeometry
  const i = radarRings.findIndex(r => r.id === ring)
  // The innermost ring starts at a hole rather than the centre: a sector
  // narrows to nothing at the origin, and blips crowd there.
  const inner = i === 0 ? innerHole * radius : ringStops[i - 1]! * radius
  return { inner, outer: ringStops[i]! * radius }
}

/**
 * Lay the blips out. Positions come from the slug, so they are identical on
 * the server and in the browser and stable between builds — an entry only
 * moves when its ring or quadrant changes.
 */
interface Seeded extends PlacedBlip {
  band: { inner: number, outer: number }
  /** Start angle of this blip's quadrant. */
  from: number
}

export function placeBlips(entries: RadarEntry[] = radarEntries): PlacedBlip[] {
  const { center, padding, minGap } = radarGeometry
  const slice = (Math.PI * 2) / radarQuadrants.length
  const placed: Seeded[] = []

  const ordered = radarQuadrants.flatMap(quadrant =>
    radarRings.flatMap(ring =>
      entries
        .filter(e => e.quadrant === quadrant.id && e.ring === ring.id)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => ({ entry, quadrant, ring })),
    ),
  )

  ordered.forEach(({ entry, quadrant, ring }, i) => {
    const qi = radarQuadrants.indexOf(quadrant)
    const band = ringBand(ring.id)
    // Start at 12 o'clock and run clockwise.
    const from = -Math.PI / 2 + qi * slice
    // Angular padding shrinks with radius, so blips near the centre stay inside.
    let x = 0
    let y = 0

    // Try candidates and keep the roomiest. Giving up on the last one tried
    // is how blips end up on top of each other in a crowded ring.
    let best = -Infinity

    for (let attempt = 0; attempt < 400; attempt++) {
      const [ra, rr] = randoms(`${entry.slug}#${attempt}`)
      const r = band.inner + padding + rr * Math.max(1, band.outer - band.inner - padding * 2)
      const angularPad = Math.min(slice * 0.3, (padding * 1.4) / Math.max(r, 1))
      const angle = from + angularPad + ra * (slice - angularPad * 2)
      const cx = center + r * Math.cos(angle)
      const cy = center + r * Math.sin(angle)
      const nearest = placed.reduce(
        (min, p) => Math.min(min, Math.hypot(p.x - cx, p.y - cy)),
        Infinity,
      )
      if (nearest > best) {
        best = nearest
        x = cx
        y = cy
      }
      if (nearest >= minGap) break
    }

    placed.push({ entry, n: i + 1, x, y, quadrant, ring, band, from })
  })

  // Relaxation. Seeding alone leaves overlaps in a crowded ring, so push
  // colliding pairs apart and clamp each one back inside its own sector and
  // ring band. Deterministic: same input, same number of passes, same output.
  for (let pass = 0; pass < 120; pass++) {
    let moved = false

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!
        const b = placed[j]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 0.01
        if (d >= minGap) continue

        const push = (minGap - d) / 2
        const ux = (dx / d) * push
        const uy = (dy / d) * push
        a.x -= ux
        a.y -= uy
        b.x += ux
        b.y += uy
        moved = true
      }
    }

    for (const p of placed) clamp(p, slice)
    if (!moved) break
  }

  return placed.map(p => ({ ...p, x: +p.x.toFixed(2), y: +p.y.toFixed(2) }))
}

/** Pull a blip back inside its ring band and its quadrant's arc. */
function clamp(p: Seeded, slice: number) {
  const { center, padding } = radarGeometry
  const dx = p.x - center
  const dy = p.y - center
  const r = Math.hypot(dx, dy) || 0.01
  let angle = Math.atan2(dy, dx)

  const lo = p.band.inner + padding
  const hi = Math.max(lo, p.band.outer - padding)
  const clampedR = Math.min(hi, Math.max(lo, r))

  // Unwrap the angle into the same turn as the sector before comparing.
  const angularPad = Math.min(slice * 0.3, (padding * 1.4) / clampedR)
  const from = p.from + angularPad
  const to = p.from + slice - angularPad
  while (angle < from - Math.PI) angle += Math.PI * 2
  while (angle > from + Math.PI) angle -= Math.PI * 2
  const clampedA = Math.min(to, Math.max(from, angle))

  p.x = center + clampedR * Math.cos(clampedA)
  p.y = center + clampedR * Math.sin(clampedA)
}

// ------------------------------------------------------------
//  Lookups
// ------------------------------------------------------------

export function radarEntry(slug: string): RadarEntry | undefined {
  return radarEntries.find(e => e.slug === slug)
}

export function radarQuadrant(id: string): RadarQuadrant | undefined {
  return radarQuadrants.find(q => q.id === id)
}

export function radarRing(id: RingId): RadarRing | undefined {
  return radarRings.find(r => r.id === id)
}

export function radarCounts() {
  return radarRings.map(ring => ({
    ring,
    count: radarEntries.filter(e => e.ring === ring.id).length,
  }))
}
