// ============================================================
//  NETWORK AREAS
//
//  One entry per broadcast domain. Adding an area is adding an
//  object — the hub table, the cards, the section bar and the
//  page at /network/<slug> all follow from it.
//
//  `reaches` and `reachedBy` are the firewall policy restated
//  from each side. Keeping both means a mistake shows up as a
//  disagreement between two pages rather than as a hole.
// ============================================================

export interface NetworkArea {
  slug: string
  name: string
  /** Tag number, or undefined for the untagged native network. */
  vlan?: number
  subnet: string
  /** Zone colour token: prod, stage, mgmt, ceph, dmz, pink. */
  zone: string
  /** One line. Shown on the card and under the heading. */
  purpose: string
  egress: string
  dhcp: string
  /** What lives in here. */
  what: string
  /** Why it is its own area rather than part of another. */
  why: string
  /** Outbound: what this area may open a connection to. */
  reaches: { to: string, ports: string, note: string }[]
  /** Inbound: what may open a connection to this area. */
  reachedBy: { from: string, ports: string, note: string }[]
  notes: string[]
}

export const networkAreas: NetworkArea[] = [
  {
    slug: 'management',
    name: 'Management',
    vlan: 10,
    subnet: '10.10.0.0/24',
    zone: 'mgmt',
    purpose: 'Out-of-band access to hardware that can power-cycle the rack.',
    egress: 'none',
    dhcp: 'static only',
    what: 'IPMI and iDRAC on every server, the switch management interface, the router management interface, and the PDU outlets. Everything here can turn something off.',
    why: 'These interfaces are firmware written by hardware vendors and updated rarely. Assuming any of them is robust against a hostile network is optimism, so the design assumes they are the weakest software in the rack and gives them a network with no way out.',
    reaches: [],
    reachedBy: [
      { from: 'Home LAN', ports: '443, 623', note: 'Second hop, deliberately — a stolen laptop is not instantly iDRAC access' },
    ],
    notes: [
      'No egress at all. A compromised BMC cannot phone home, which is the single most valuable property of this area.',
      'No route off the rack. Reaching it from outside the house means WireGuard to the LAN first, then a second hop.',
      'Per-outlet PDU metering lives here too, which is why the power numbers on this site exist.',
    ],
  },
  {
    slug: 'production',
    name: 'Kubernetes production',
    vlan: 20,
    subnet: '10.20.0.0/22',
    zone: 'prod',
    purpose: 'The only cluster anything outside the house can reach, and then only through the proxy.',
    egress: 'proxy allowlist',
    dhcp: 'static only',
    what: 'The three crypt nodes, their pod and service networks, and everything the household actually uses — photos, media, passwords, home automation.',
    why: 'A /22 because pod networks are hungrier than you expect, and separate from staging because a shared API server is a shared outage. That lesson cost a production evening and settled the argument.',
    reaches: [
      { to: 'Storage', ports: '6789, 3300, 6800-7300', note: 'Ceph RBD and CephFS for every persistent volume' },
      { to: 'SIEM', ports: '514, 1514', note: 'One way, and it never comes back' },
      { to: 'Internet', ports: '443', note: 'Image pulls and updates, through a proxy allowlist' },
    ],
    reachedBy: [
      { from: 'DMZ', ports: '8080', note: 'Proxied application traffic, one upstream per host' },
      { from: 'Quarantine', ports: '8080', note: 'Only after a clean scan verdict' },
      { from: 'Home LAN', ports: '443, 6443', note: 'My own machines, on-site or over WireGuard' },
    ],
    notes: [
      'The egress allowlist is the part people skip. A cluster that can reach anything is a cluster that can be told to reach anything.',
      'Nothing here writes to local disk except container images and the kubelet, so a node is replaceable rather than precious.',
    ],
  },
  {
    slug: 'staging',
    name: 'Kubernetes staging',
    vlan: 30,
    subnet: '10.30.0.0/22',
    zone: 'stage',
    purpose: 'The cluster whose job is to fail first.',
    egress: 'proxy allowlist',
    dhcp: 'static only',
    what: 'The two rehearsal nodes, running the same Kubernetes version and the same manifests as production with a quarter of the memory and none of the real data.',
    why: 'Physically separate rather than a namespace, because the thing I actually need to test is the upgrade of the control plane itself — and you cannot test that on the control plane you are relying on.',
    reaches: [
      { to: 'Storage', ports: '6789, 3300, 6800-7300', note: 'Its own pools, separate from production' },
      { to: 'SIEM', ports: '514, 1514', note: 'One way' },
      { to: 'Internet', ports: '443', note: 'Image pulls, same allowlist' },
    ],
    reachedBy: [
      { from: 'Home LAN', ports: '443, 6443', note: 'Me only. Nothing outside the house reaches staging at all' },
    ],
    notes: [
      'Torn down and rebuilt from Git roughly monthly, which is the only way to know the bootstrap still works.',
      'No path from the DMZ. Staging is not exposed, so a half-finished experiment cannot become a public service by accident.',
    ],
  },
  {
    slug: 'storage',
    name: 'Storage',
    vlan: 35,
    subnet: '10.35.0.0/24',
    zone: 'ceph',
    purpose: 'Ceph public and cluster traffic, kept off everything else.',
    egress: 'none',
    dhcp: 'static only',
    what: 'The three ossuary nodes: client traffic on the public side, and replication and recovery between OSDs on the cluster side.',
    why: 'Replication traffic is bursty and enormous — a re-balance will saturate whatever it is given. Keeping it in its own area means that when it does, it saturates a link nothing else is depending on.',
    reaches: [
      { to: 'SIEM', ports: '514, 1514', note: 'One way' },
    ],
    reachedBy: [
      { from: 'Kubernetes production', ports: '6789, 3300, 6800-7300', note: 'Persistent volumes' },
      { from: 'Kubernetes staging', ports: '6789, 3300, 6800-7300', note: 'Separate pools' },
    ],
    notes: [
      'No egress, no internet, no reason for either. Storage talks to the clusters and to nothing else.',
      'Two of the three nodes are on 10G and the third is on a bonded gigabit pair, which is arithmetic you only do once. It re-balances more slowly and it is the next thing being fixed.',
      'Priority queueing on the switch is doing real work here rather than sitting in the config as decoration.',
    ],
  },
  {
    slug: 'dmz',
    name: 'DMZ',
    vlan: 40,
    subnet: '10.40.0.0/24',
    zone: 'dmz',
    purpose: 'Where the internet is allowed to arrive, and where it stops.',
    egress: 'internet',
    dhcp: 'static only',
    what: 'The reverse proxy and the web application firewall. Nothing stateful, and nothing holding a credential worth stealing.',
    why: 'Something has to be reachable from the internet. Making that something small, stateless and separate means a compromise here is a compromise of a proxy — and the blast radius is the DMZ.',
    reaches: [
      { to: 'Kubernetes production', ports: '8080', note: 'One upstream per host, never a wildcard' },
      { to: 'Quarantine', ports: '9000', note: 'File hand-off for scanning' },
      { to: 'SIEM', ports: '514, 1514', note: 'One way' },
    ],
    reachedBy: [
      { from: 'Internet', ports: '443', note: 'HTTPS only, rate limited at the edge' },
    ],
    notes: [
      'No path to management, staging or storage. The proxy can reach exactly the application ports it proxies.',
      'Suricata mirrors this segment, so everything arriving here is inspected as well as filtered.',
      'This site is the only thing served from here.',
    ],
  },
  {
    slug: 'quarantine',
    name: 'Quarantine',
    vlan: 50,
    subnet: '10.50.0.0/24',
    zone: 'mgmt',
    purpose: 'Where untrusted files are opened first, by something that can reach nothing.',
    egress: 'none',
    dhcp: 'static only',
    what: 'Scanning workers. Uploads and inbound documents land here and are examined before anything else is allowed to read them.',
    why: 'Parsing a file someone else made is the classic way to be compromised, and the parsers are exactly the software you least want to trust. So the parsing happens somewhere with no outbound route, where a successful exploit finds itself in a room with no doors.',
    reaches: [
      { to: 'Kubernetes production', ports: '8080', note: 'Only after a clean verdict, and only the cleaned artefact' },
      { to: 'SIEM', ports: '514, 1514', note: 'One way' },
    ],
    reachedBy: [
      { from: 'DMZ', ports: '9000', note: 'File hand-off' },
    ],
    notes: [
      'No outbound internet. This is the entire point of the area.',
      'Adds roughly 400ms to a photo upload and removes a whole category of thing I would rather not think about.',
      'A scan verdict is what opens the path onward, not the arrival of the file.',
    ],
  },
  {
    slug: 'siem',
    name: 'SIEM collection',
    vlan: 99,
    subnet: '10.99.0.0/24',
    zone: 'ceph',
    purpose: 'Receives from everywhere and initiates nothing.',
    egress: 'none',
    dhcp: 'static only',
    what: 'Log collection, intrusion detection alerting and the agent manager. The searchable record of what happened.',
    why: 'Logs are only evidence if they are somewhere the thing that generated them cannot edit. An area that only ever receives is an area that cannot be used as a route back into anything.',
    reaches: [],
    reachedBy: [
      { from: 'Every other area', ports: '514, 1514', note: 'Syslog and agent traffic, one direction only' },
    ],
    notes: [
      'It initiates no connection of its own. Not to the internet, not to the clusters, not to the alert destination — that goes out through a separate path.',
      'A compromise of a monitored host cannot delete the evidence of the compromise, which is the whole design.',
    ],
  },
  {
    slug: 'home-lan',
    name: 'Home LAN',
    subnet: '10.0.0.0/24',
    zone: 'pink',
    purpose: 'People, their devices, and where a VPN peer lands.',
    egress: 'internet',
    dhcp: 'yes, and the only area that has it',
    what: 'Phones, laptops, a television, the things guests bring. Also where WireGuard peers arrive, which makes it the front door for remote access.',
    why: 'The untagged native network, and deliberately the least trusted area with people in it. Devices here are not managed, not patched on my schedule, and sometimes not mine at all — so it gets access to services and no access to infrastructure.',
    reaches: [
      { to: 'Kubernetes production', ports: '443, 6443', note: 'Services, and the API server for my own machines' },
      { to: 'Kubernetes staging', ports: '443, 6443', note: 'Me only' },
      { to: 'Management', ports: '443, 623', note: 'The second hop, and only from my machines' },
      { to: 'Internet', ports: 'any', note: 'It is the household network' },
    ],
    reachedBy: [
      { from: 'WireGuard peers', ports: '—', note: 'Remote devices land here rather than on management' },
    ],
    notes: [
      'A VPN peer landing here rather than on the management VLAN is deliberate: a stolen laptop reaches what a laptop at home reaches, and nothing more.',
      'The only area running DHCP. Everything else is static, because an address that never changes is an address a firewall rule can name.',
      'Guest devices are the honest weak point. They are on the same untagged network as mine, and splitting them out is on the list.',
    ],
  },
]

export function networkArea(slug: string): NetworkArea | undefined {
  return networkAreas.find(a => a.slug === slug)
}
