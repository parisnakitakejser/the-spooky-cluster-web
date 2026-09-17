// ============================================================
//  PROJECTS
//
//  Things I am building, as opposed to things I am running.
//  Adding one is adding an object to `projects` — the index
//  page, the cards and the detail page at /projects/<slug> all
//  follow from it.
//
//  Every field except slug, name, status and tagline is
//  optional. A half-filled entry renders as a shorter page
//  rather than a broken one, so a project can go up the day it
//  starts and grow later.
// ============================================================

export type ProjectStatus = 'live' | 'building' | 'paused' | 'archived'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  slug: string
  name: string
  status: ProjectStatus
  /** One line. Shown on the card and under the heading. */
  tagline: string
  /** When I started it. */
  since?: string
  /** What it is, for someone who has never heard of it. */
  what?: string
  /** Why it exists — the itch, the gap, the reason it beat doing nothing. */
  why?: string
  /** What it is built with. Slugs here that match a radar entry become links. */
  stack?: string[]
  /** Where it runs, if it runs in the rack. */
  runsOn?: string
  /** Notable decisions, or what building it taught me. */
  notes?: string[]
  links?: ProjectLink[]
  /** Other project slugs. */
  related?: string[]
}

export const projectStatuses: Record<ProjectStatus, { label: string, blurb: string }> = {
  live: { label: 'live', blurb: 'In use, by me or by other people.' },
  building: { label: 'building', blurb: 'Actively being worked on. Expect it to change under you.' },
  paused: { label: 'paused', blurb: 'Not dead, not being touched. Waiting on time or on a decision.' },
  archived: { label: 'archived', blurb: 'Finished or abandoned. Left up because the writing is still useful.' },
}

export const projects: Project[] = [
  {
    slug: 'astrona',
    name: 'Astrona',
    status: 'building',
    tagline: 'Hands-on technical courses, with labs that grade themselves.',
    since: '2025',
    // EDIT ME — the description below is a placeholder. Replace `what`, `why`
    // and `notes` with your own; the page renders whatever is filled in.
    why: 'Written by someone who learned this the hard way and would like the next person to have a shorter road.',
    stack: ['kubernetes', 'postgresql', 'forgejo'],
    runsOn: 'crypt (production cluster)',
    notes: [],
    links: [],
    related: ['jubelio'],
  },
  {
    slug: 'jubelio',
    name: 'Jubelio',
    status: 'building',
    tagline: 'PLACEHOLDER — one line about what Jubelio is.',
    since: '2025',
    // EDIT ME — I do not know what this one is, so I have left it empty
    // rather than invent it. Fill in `what`, `why` and `tagline`.
    stack: [],
    notes: [],
    links: [],
    related: ['astrona'],
  },
]

export function project(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

/** Live first, then building, then the quiet ones. */
export const projectOrder: ProjectStatus[] = ['live', 'building', 'paused', 'archived']

export function projectsByStatus() {
  return projectOrder
    .map(status => ({
      status,
      meta: projectStatuses[status],
      items: projects.filter(p => p.status === status),
    }))
    .filter(group => group.items.length)
}

/** Zone colour per status, so the cards read at a glance. */
export const statusZone: Record<ProjectStatus, string> = {
  live: 'stage',
  building: 'mgmt',
  paused: 'ceph',
  archived: 'dmz',
}
