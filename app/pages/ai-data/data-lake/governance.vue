<script setup lang="ts">
usePageSeo({
  title: 'Governance and sovereignty — the spooky cluster',
  description: 'Who owns a dataset, who may read it, where it is physically allowed to live, and who holds the keys — the lifecycle of a dataset rather than the flow of a row.',
})

/** This chain is a dataset's life, not a row's journey. */
const life: ChainStage[] = [
  { title: 'Registered', lines: ['it has an owner', 'and a definition'] },
  { title: 'Classified', lines: ['how sensitive', 'who may see it'], color: '#FBBF24' },
  { title: 'Placed', lines: ['which storage, whose keys', 'which jurisdiction'], color: '#22D3EE' },
  { title: 'Used', lines: ['every read authorised', 'purpose recorded'], color: '#A3E635' },
  { title: 'Retired', lines: ['retention expires', 'deletion is real'], color: '#8B5CF6' },
]

const lifeLanes: ChainLane[] = [
  { side: 'top', title: 'Catalogue', note: 'owner · definition · lineage', color: '#A3E635', stages: [0, 1] },
  { side: 'top', title: 'Sovereignty rules', note: 'jurisdiction · key custody · no third-party processing', color: '#22D3EE', stages: [2, 3] },
  { side: 'bottom', title: 'Audit trail', note: 'every decision, including the denials', color: '#F87171', stages: [0, 1, 2, 3, 4], direction: 'from' },
]

const catalogue = {
  columns: ['Recorded', 'Why it is worth the effort', 'Filled in by'],
  rows: [
    ['Owner', 'A dataset with no owner has no one to ask and no one to fix it', 'Whoever registers it'],
    ['Definition', 'What a field means, in words, not just its type', 'The owner'],
    ['Classification', 'Decides the policy, the placement and the retention at once', 'The owner, reviewed by me'],
    ['Lineage', 'Which tables it was derived from, so a bad source can be traced forward', 'Derived from the jobs'],
    ['Retention', 'When it stops being kept, decided before it is collected', 'The owner'],
  ],
}

const sovereignty = {
  columns: ['Copy', 'Where it physically is', 'Who holds the key', 'Who could compel access'],
  rows: [
    ['Live', 'The rack, in a garage near Aarhus', 'Me', 'Danish law, with me in the loop'],
    ['Off-site', "A mini PC at my parents', 40 km away", 'Me — encrypted before it leaves', 'Same, and the copy is unreadable there'],
    ['Cloud', 'A third-party object store', 'Me — encrypted before it leaves', 'Their jurisdiction, but only over ciphertext'],
    ['Processing', 'Nowhere else. There is no fourth copy', '—', '—'],
  ],
}

const questions = [
  { zone: 'prod', title: 'Who can read it without asking me?', body: 'Nobody, for anything that matters. The cloud copy is encrypted before it leaves and the provider holds no key, so a subpoena served on them produces ciphertext and a shrug.' },
  { zone: 'stage', title: 'What happens if a provider changes terms?', body: 'The third copy is replaceable in an afternoon, because it holds encrypted archives in an open format rather than anything proprietary. That is the whole reason it is shaped that way.' },
  { zone: 'mgmt', title: 'Can I leave?', body: 'The tables are an open format over plain files in object storage. Any engine that speaks it can read them, and moving means copying files — not exporting from a product.' },
  { zone: 'dmz', title: 'What if the house burns down?', body: 'Two copies survive, one of them in another building and one in another country. This is the question sovereignty people forget: control is worth nothing if the data is gone.' },
]
</script>

<template>
  <PageHead
    crumb="governance"
    heading="Who owns it, who may read it, and where it is allowed to be"
    lede="The other three flows follow a row through the lake. This one follows a dataset through its life — registered, classified, placed, used, retired — because the interesting governance questions are about the dataset, not the row."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="s">owner required</ZoneChip>
      <ZoneChip zone="p">keys held here</ZoneChip>
      <ZoneChip zone="d">every read audited</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="stage">
    <p class="u-slot">the flow</p>
    <h2>A dataset's life, and what governs each step of it</h2>
    <FlowChain
      title="Governance and sovereignty"
      desc="A dataset is registered with an owner and a definition, classified for sensitivity, placed on storage in a chosen jurisdiction under known keys, used under authorisation, and eventually retired when its retention expires. A catalogue governs registration and classification. Sovereignty rules govern placement and use. Every step writes to an audit trail, which receives and never initiates."
      :stages="life"
      :lanes="lifeLanes"
      :legend="[
        { color: '#9C8FB5', label: 'a dataset\'s life, one direction' },
        { color: '#A3E635', dash: true, label: 'what the catalogue records' },
        { color: '#22D3EE', dash: true, label: 'where it is allowed to be' },
        { color: '#F87171', dash: true, label: 'audit, receives only' },
      ]"
    />
    <div class="prose spaced">
      <p>The audit lane points the same way as the SIEM on the <NuxtLink to="/security">security page</NuxtLink>, and for the same reason: something that only ever receives cannot be used as a route back in. It records the denials as well as the grants, which is the half people skip — a refused read tells you more than a successful one.</p>
      <p>Classification is the load-bearing step. Getting it right decides the access policy, the placement and the retention in one go; getting it wrong means every downstream rule is enforcing the wrong answer precisely.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">governance</p>
    <h2>What the catalogue actually records</h2>
    <p>Governance in a house of one is mostly writing down what I would otherwise have to remember. The value shows up six months later, which is exactly when I would have forgotten.</p>
    <DataTable :columns="catalogue.columns" :rows="catalogue.rows" />
    <div class="prose spaced">
      <p>The entry that earns its keep most often is <strong>retention</strong>, because it is decided before collection rather than after. "How long do we keep this" asked up front is a design question with a clear answer; asked two years later about forty gigabytes of sensor history, it becomes a decision nobody wants to make and the default is to keep everything forever.</p>
      <p>Lineage comes from the jobs rather than being written by hand, which is the only reason it stays true. A hand-maintained lineage diagram is accurate on the day it is drawn.</p>
    </div>
  </section>

  <section class="unit" data-zone="prod">
    <p class="u-slot">sovereignty</p>
    <h2>Three copies, three jurisdictions, one key holder</h2>
    <p>Sovereignty is not a feeling about clouds. It is a set of answerable questions about where bytes physically are and who can be compelled to hand them over.</p>
    <DataTable :columns="sovereignty.columns" :rows="sovereignty.rows" />
    <div class="prose spaced">
      <p>The important row is the last one. There is no copy that exists purely so something else can process it — no data sent anywhere to be embedded, transcribed, classified or summarised. That is the same rule the <NuxtLink to="/ai-data/models">local models</NuxtLink> exist to keep, stated as a property of the data rather than of the software.</p>
      <p>Encryption before departure is what makes the other rows survivable. A provider that holds only ciphertext is a storage bill, not a party to my data — and that turns a jurisdiction question into an availability question, which is a much easier one.</p>
    </div>
  </section>

  <section class="unit" data-zone="ceph">
    <p class="u-slot">the four questions</p>
    <h2>What sovereignty is actually for</h2>
    <div class="flow">
      <div v-for="q in questions" :key="q.title" class="zone" :style="`--zc:var(--${q.zone})`">
        <h3>{{ q.title }}</h3>
        <p>{{ q.body }}</p>
      </div>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">the tension nobody mentions</p>
    <h2>Time travel and deletion want opposite things</h2>
    <div class="prose">
      <p>This is the sharpest edge in the whole section, and it comes directly from the substrate the <NuxtLink to="/ai-data/data-lake/layers">layers</NuxtLink> sit on. Snapshots are what make a bad transformation a rollback instead of a restore — and they are also what makes deleting a record genuinely difficult, because the record still exists in every snapshot taken before the delete.</p>
      <p>Deleting a row from the current table is easy. Deleting it from history means expiring every snapshot that contains it and rewriting the files those snapshots referenced. If your retention policy says ninety days of snapshots, then "deleted" honestly means "gone in ninety days" — and saying so out loud is better than implying otherwise.</p>
      <p>The practical resolution here: anything that might need real erasure is classified so that it never enters a snapshotted table in the first place. It lives in the operational database, which deletes the way people expect, and only aggregates cross into the lake. That is a constraint the classification step exists to enforce, which is why it is the second box in the diagram rather than an afterthought.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">honestly</p>
    <h2>The governance function here is one person</h2>
    <div class="prose">
      <ul>
        <li><strong>Classification is manual and therefore inconsistent.</strong> I decide, on the day, with whatever attention I have. There is no second reviewer, and the catalogue records the decision but not the reasoning.</li>
        <li><strong>An owner of "me" is not really ownership.</strong> The field exists so the habit is in place, and because the day something has a different owner, the structure is already there.</li>
        <li><strong>Audit logs nobody reads are a receipt, not a control.</strong> Mine are queried when something has already gone wrong. Alerting on denials would make them preventative, and that is on the list.</li>
        <li><strong>Retention is set and rarely revisited.</strong> Deciding up front is better than not deciding, but a policy that is never reviewed is just an older guess.</li>
      </ul>
      <p>None of that makes the structure pointless. It makes it practice — which is the <NuxtLink to="/about">honest description</NuxtLink> of most of this rack.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
