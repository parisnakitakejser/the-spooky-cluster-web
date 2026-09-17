// ============================================================
//  RACK GROUPS
//
//  The cabinet described by what each group of hardware is for,
//  rather than by where it physically sits. Slot positions and
//  the elevation map are deliberately not published: they are
//  useful to exactly one kind of reader, and it is not the kind
//  this site is written for.
// ============================================================

export interface RackGroup {
  slug: string
  name: string
  /** Zone colour token. */
  zone: string
  /** One line, shown on the card and under the heading. */
  purpose: string
  /** Rack units consumed — capacity, not position. */
  units: string
  draw: string
}

export const rackGroups: RackGroup[] = [
  {
    slug: 'safeguard',
    name: 'Safeguard',
    zone: 'dmz',
    purpose: 'The edge: everything arriving from the internet meets this first, and most of it stops here.',
    units: '1U',
    draw: '~9 W',
  },
  {
    slug: 'kubernetes',
    name: 'Kubernetes',
    zone: 'prod',
    purpose: 'Three clusters on eight machines: production, staging, and the management cluster that deploys both.',
    units: '11U',
    draw: '~310 W idle',
  },
  {
    slug: 'storage',
    name: 'Storage',
    zone: 'ceph',
    purpose: 'Three chassis, thirty-six spinning disks, and the write-ahead log that keeps them usable.',
    units: '12U',
    draw: '~240 W idle',
  },
  {
    slug: 'switching',
    name: 'Switching',
    zone: 'stage',
    purpose: 'One switch, one patch panel, and the cable discipline that makes the other four groups debuggable.',
    units: '3U',
    draw: '~35 W',
  },
  {
    slug: 'power',
    name: 'Power',
    zone: 'mgmt',
    purpose: 'A UPS and two metered PDUs — the reason every number on this site exists.',
    units: '4U',
    draw: '~18 W overhead',
  },
]

export function rackGroup(slug: string): RackGroup | undefined {
  return rackGroups.find(g => g.slug === slug)
}
