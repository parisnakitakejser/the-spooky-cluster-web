# the spooky cluster

A site documenting a 42U homelab near Aarhus: the rack, three Kubernetes
clusters, a Ceph pool, and the security zones everything has to pass through.

Nuxt 4 with Sass. Every page is pre-rendered at build time and served by
Nitro's own node server, so there is no web server config anywhere — routing,
404s, headers and caching are all decided in `nuxt.config.ts`.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, hot reload
./serve.sh         # the same thing
```

To run exactly what the container runs:

```bash
npm run build      # writes .output
npm start          # node .output/server/index.mjs, port 3000 (PORT to change)
./serve.sh --built # both of the above, on port 8080
```

`npm run generate` still works if you want a folder of plain files for a static
host instead.

---

## Deploy it

### Into the cluster (the obvious home for it)

```bash
docker build -t registry.local/spooky-cluster:1.0.0 .
docker push registry.local/spooky-cluster:1.0.0

helm upgrade --install spooky-cluster-site charts/spooky-cluster-site \
  --namespace spooky-site --create-namespace \
  --set image.repository=registry.local/spooky-cluster
```

The image is two stages: node builds the site, then a bare node image runs
`.output/server/index.mjs`. `.output` is self-contained, so the runtime image
carries no `node_modules`.

The chart renders a Deployment, a Service, a ServiceAccount, an HTTPRoute, a
NetworkPolicy and a PodDisruptionBudget; an HPA is behind a flag. The image tag
defaults to the chart's `appVersion`, so either tag the image to match, pass
`--set image.tag=...`, or pin a digest with `--set image.digest=sha256:...`.

The namespace is not a template — `--create-namespace` handles it, so Helm
never owns a namespace it would delete on uninstall.

#### Routing

Traffic arrives through Gateway API, not an Ingress. The chart only renders the
HTTPRoute that attaches the site to a Gateway you already run; the listener,
the certificate and the TLS config all belong to that Gateway.

Two things have to line up outside this chart:

- the Gateway's listener must allow routes from this namespace
  (`spec.listeners[].allowedRoutes.namespaces`), or the route is rejected;
- `networkPolicy.allowFrom` must name the namespace the gateway runs in, or
  the route attaches and then times out.

```bash
kubectl -n spooky-site get httproute spooky-cluster-site \
  -o jsonpath='{.status.parents[*].conditions[*].reason}{"\n"}'
```

`backendRefs` default to this chart's Service, so a rule only needs `matches`.

#### Values worth knowing

| Value | Default | Why |
| --- | --- | --- |
| `image.repository` | `registry.local/spooky-cluster` | change this first |
| `image.tag` | `""` → `appVersion` | pin the deployed build |
| `image.digest` | `""` | stronger than a tag; wins over it |
| `httpRoute.parentRefs` | `public` in `gateway` | the Gateway to attach to |
| `httpRoute.hostnames` | `spooky.example.dk` | change this |
| `networkPolicy.allowFrom` | `[{namespace: gateway}]` | must match the gateway's namespace |
| `networkPolicy.denyEgress` | `true` | the pod calls nothing, DNS included |
| `replicaCount` | `2` | ignored when `autoscaling.enabled` |

To see what would be applied without a cluster:

```bash
helm lint charts/spooky-cluster-site --strict
helm template spooky-cluster-site charts/spooky-cluster-site -n spooky-site
```

---

## Hardening

The site reads nothing, writes nothing and calls nothing, so the chart is
locked down to match rather than left open for a workload that might one day
need more. The rendered pod satisfies the Pod Security Standards `restricted`
profile.

**Process**

- non-root `uid`/`gid` 1000, `runAsNonRoot` enforced at pod *and* container
  level, because a container context silently overrides the pod one;
- `allowPrivilegeEscalation: false`, `privileged: false`, every capability
  dropped — the listener is on 8080 so `NET_BIND_SERVICE` is never needed;
- `seccompProfile: RuntimeDefault`, and `appArmorProfile: RuntimeDefault` on
  Kubernetes 1.30+;
- `hostNetwork`, `hostPID` and `hostIPC` stated as false rather than defaulted;
- `pod.hostUsers: false` is available on 1.33+ so uid 1000 in the pod is not
  uid 1000 on the node. Left unset by default.

**Filesystem**

- read-only root filesystem; `/tmp` is the only writable path, a memory-backed
  `emptyDir` capped at 16Mi so a runaway write cannot fill the node;
- `ephemeral-storage` requested and limited alongside CPU and memory.

**Identity**

- its own ServiceAccount rather than the namespace `default`, with
  `automountServiceAccountToken: false` on both the account and the pod;
- `enableServiceLinks: false`, so the pod gets no env vars describing every
  other Service in the namespace.

**Network**

- ingress restricted to the gateway's namespace, and optionally to selected
  pods within it via `networkPolicy.allowFrom[].podSelector`;
- egress denied outright, DNS included — nothing to reach means no reverse
  shell, no pivot, no exfiltration path. `allowDNS: true` opens only port 53
  to `kube-dns` if you ever need it.

**Guard rails**

`values.schema.json` makes the security-relevant fields refuse to be weakened
by accident — `readOnlyRootFilesystem: false`, `runAsUser: 0`, a privileged
port, an added capability or a mounted token are all rejected at `helm
template` time, before anything reaches a cluster. Deliberately loosening one
means editing the schema, which is a visible change in review.

**Not done by the chart**

Pod Security Admission is a namespace label, and the chart does not own the
namespace:

```bash
kubectl label --overwrite ns spooky-site \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/enforce-version=latest
```

### Anywhere else

`npm run generate` and upload `.output/public`. GitHub Pages, Netlify,
Cloudflare Pages, an S3 bucket, a Raspberry Pi — it is static files. Note that
`/healthz` and the response headers come from the node server, so a plain
static host will not have them.

---

## Layout

```
nuxt.config.ts         prerender + preset, route rules, Sass setup, fonts
server/routes/         healthz, for the Kubernetes probes
app/
  app.vue              root, hands off to the layout
  error.vue            themed 404 and 500
  layouts/default.vue  skip link, rack rail, header, <main>
  pages/
    index.vue          home — the animated emblem, headline numbers, links out
    rack.vue           42U front elevation, rear cabling, airflow
    compute.vue        prod / stage / management clusters, GitOps
    storage.vue        Ceph OSDs, pools, CRUSH, backups
    security.vue       zone chain diagram, firewall policy, detection
    network.vue        VLANs, hardware, DNS, remote access
    ai-data.vue        local models, the databases under them, the data path
    observability.vue  metrics, logs, and the rules allowed to wake me
    radar/index.vue    the tech radar chart and the text version of it
    radar/[slug].vue   one page per tool, pre-rendered from the data
    log.vue            build log and incidents, newest first
  components/
    SiteHeader/SiteFooter/SitePager/RackRail   chrome
    PageHead ZoneChip StatGrid DataTable       content blocks
    GhostEmblem GhostMini Ghost<Page>          the SVG ghosts
    SecurityChain                              the zone diagram
    RadarChart RadarLegend                     the radar and its numbered list
    SiteError                                  the 404 / 500 body
  utils/site.ts        nav links and reading order
  utils/radar.ts       radar entries, geometry and blip placement
  assets/scss/         every style on the site
public/favicon.svg     the ghost
Dockerfile             node build, node runtime, unprivileged, port 8080
charts/spooky-cluster-site/
  Chart.yaml
  values.yaml
  values.schema.json     refuses values that weaken the hardening
  templates/
    _helpers.tpl         names, labels, image reference
    deployment.yaml
    service.yaml
    serviceaccount.yaml  serviceAccount.create
    httproute.yaml       Gateway API — httpRoute.enabled
    networkpolicy.yaml   networkPolicy.enabled
    poddisruptionbudget.yaml
    hpa.yaml             autoscaling.enabled
    NOTES.txt            printed after install
serve.sh
```

Components and `app/utils/site.ts` are auto-imported — there are no `import`
lines for them anywhere, and that is Nuxt doing it, not a missing edit.

---

## Changing things

### Colours

Zone colours live in one Sass map at the top of `app/assets/scss/_tokens.scss`.
The radar has six sectors and there are five zones, so the sixth sector uses
the ghost's own pink through the `.chip.k` and `[data-zone="pink"]` rules:

```scss
$zones: (
  p: (name: prod,  color: #22D3EE),   // production      — cyan
  s: (name: stage, color: #A3E635),   // staging         — lime
  m: (name: mgmt,  color: #FBBF24),   // management      — amber
  c: (name: ceph,  color: #8B5CF6),   // storage         — purple
  d: (name: dmz,   color: #F87171),   // dmz / security  — red
);
$pink: #FF4FA3;                        // the ghost itself
```

The map generates the `--prod`/`--stage`/… custom properties *and* every
`.chip.p`, `.stat.c`, `.t.d` and `.unit[data-zone=…]` rule, so one edit moves
all of them. The per-page ghost SVGs still carry their colour inline, so those
are the one place you also have to edit the component.

### Content

Everything is placeholder — assume every hostname, capacity and wattage is
invented. Page content lives as plain arrays in each page's `<script setup>`
(the rack elevation, the tables, the log entries), so adding a row is adding an
object, not copying markup. The node names are themed (crypt, ossuary, séance,
obelisk, lifeline) — replace them with your real ones or commit to them, but
don't do half and half.

### The tech radar

Entries live in `app/utils/radar.ts`. Adding a tool is adding one object to
`radarEntries` — the chart, the numbering, the legend and the pre-rendered
detail page at `/radar/<slug>` all follow from it.

```ts
{
  slug: 'cilium',
  name: 'Cilium',
  quadrant: 'platform',        // radarQuadrants[].id — six of them
  ring: 'research',            // adopt | trial | research | hold
  movement: 'new',             // none | new | in | out
  since: '2026-08',
  tagline: '...',              // one line, shown in the legend
  what: '...',                 // what the tool is
  why: '...',                  // what it does in this rack
  watch: ['...'],              // the parts that bite
  links: [{ label: '...', href: 'https://...' }],
  related: ['kubernetes'],     // other slugs
}
```

Sectors and rings are data too. The chart divides the circle by however many
sectors are declared — there are six — and `radarGeometry.ringStops` sets where
each ring ends as a fraction of the radius. Adopt holds most of the entries, so
it gets the widest band.

The rings are Adopt, Trial, Research and Hold. Research is the usual radar's
Assess: read the docs, maybe built a toy, nothing running.

Blip positions are derived from the slug with a small FNV-1a hash, then
relaxed apart until no two are closer than `radarGeometry.minGap`, clamping
each back inside its own ring band and sector arc. That means
positions are identical on the server and in the browser, stable between
builds, and an entry only moves when its ring or quadrant changes. Position
*within* a ring carries no meaning — it exists so the labels do not collide.

### Navigation

`app/utils/site.ts` holds two lists: `navLinks` for the top bar and
`readingOrder` for the back/next pager. The pager works out both arrows from the
current route, so pages carry no link tables of their own.

### Animation

The emblem draws itself once on load, then hands over to a permanent idle loop
at 4.6s. The timings are in `app/assets/scss/_animation.scss` under "idle
loops". Every animation is disabled under `prefers-reduced-motion`.

The ring dots are generated in `GhostEmblem.vue` from `RING_DOTS`. If you change
that count, change the chase spacing with it: `duration / dot count` must equal
the per-dot delay, or the lap visibly stutters where it restarts. Currently 2.4s
across 20 dots at 120ms.

---

## What's not done yet

- Numbers are typed by hand. Pulling them from Prometheus would make the hero
  chips reflect real cluster state.
- The security diagram scrolls horizontally below 660px instead of reflowing.
- No dark/light toggle — the site is dark only, deliberately.
