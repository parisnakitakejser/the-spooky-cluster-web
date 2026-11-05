<script setup lang="ts">
usePageSeo({
  title: 'Agents — the spooky cluster',
  description: 'Loops that call tools on my behalf: what they are allowed to touch, how they are contained, and what happens when one is confidently wrong.',
})

const loop = [
  { zone: 'prod', title: '1. It is given a goal', body: 'A sentence, not a script. Everything after this is the model deciding what to do next, which is the entire appeal and the entire problem.' },
  { zone: 'mgmt', title: '2. It picks a tool', body: 'From a list it was handed. It does not discover tools it was not given, which is why the list is the security boundary.' },
  { zone: 'stage', title: '3. Something actually happens', body: 'A query runs, a file is written, an API is called. This is the step that is not reversible by apologising.' },
  { zone: 'ceph', title: '4. It reads the result and loops', body: 'Right up until it decides it is finished, hits a step limit, or something stops it. Two of those three are mine to set.' },
]

const rules = {
  columns: ['Rule', 'Why', 'What it costs'],
  rows: [
    ['Read-only by default', 'Most useful agent work is finding something, not changing it', 'A second agent for the write half'],
    ['One scope per agent', 'A general-purpose agent has a general-purpose blast radius', 'More agents, each less capable'],
    ['Destructive steps need me', 'Deleting and sending are the two that cannot be undone by re-running', 'It stops and waits, which is the point'],
    ['Its own credentials', 'So the audit log says which agent, not which human', 'Credential management per agent'],
    ['A step limit', 'A loop that cannot end is the default failure, not a rare one', 'Occasionally it stops just short'],
    ['Everything logged', 'The tool calls are the only record of what it decided', 'Storage, and reading them'],
  ],
}
</script>

<template>
  <PageHead
    crumb="agents"
    heading="A loop with a credential is a different thing from a chatbot"
    lede="An agent is a model in a loop that can call tools. That one change — from producing text to taking actions — is what makes it useful and what makes it a security question rather than a product question."
  >
    <template #ghost><GhostAi /></template>
    <template #tags>
      <ZoneChip zone="p">read-only default</ZoneChip>
      <ZoneChip zone="m">scoped tools</ZoneChip>
      <ZoneChip zone="d">step limits</ZoneChip>
    </template>
  </PageHead>


  <section class="unit" data-zone="prod">
    <p class="u-slot">the loop</p>
    <h2>Four steps, and only one of them is reversible</h2>
    <p>Stripped of the vocabulary, every agent is this. The interesting engineering is entirely in what step two is allowed to reach.</p>
    <div class="flow">
      <div v-for="step in loop" :key="step.title" class="zone" :style="`--zc:var(--${step.zone})`">
        <h3>{{ step.title }}</h3>
        <p>{{ step.body }}</p>
      </div>
    </div>
    <div class="prose spaced">
      <p>The models running here are small enough that the loop goes wrong reasonably often — a tool called with the wrong argument, a result misread, a plan that made sense two steps ago. That is not a reason to avoid agents. It is a reason to assume the loop will be wrong and design for what happens then.</p>
    </div>
  </section>

  <section class="unit" data-zone="dmz">
    <p class="u-slot">containment</p>
    <h2>The rules I run them under</h2>
    <p>These are the same instincts as the <NuxtLink to="/security">security zones</NuxtLink>, applied to something that improvises. Default deny, small scopes, and nothing irreversible without a human.</p>
    <DataTable :columns="rules.columns" :rows="rules.rows" />
    <div class="prose spaced">
      <p>The one that took longest to accept was <strong>one scope per agent</strong>. It is tempting to build a single agent that can do everything, because then you only build it once — and then its credential can do everything too, and a single confused step reaches the whole rack.</p>
      <p>Read-only being the default matters more than it sounds. In practice most of the useful work is retrieval: find the log line, find which service changed, find the document. An agent that can only read can still be badly wrong, but being wrong costs a wasted answer rather than a restore.</p>
    </div>
  </section>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">where they run</p>
    <h2>On the inside, with no way out</h2>
    <div class="prose">
      <p>Agents run in the secure zone against the local models on the <NuxtLink to="/ai-data/models">models page</NuxtLink>. They have no outbound internet route — the same egress denial the rest of the rack runs under — which removes an entire family of problems: an agent that cannot reach the internet cannot exfiltrate anything to it, however it was persuaded to try.</p>
      <p>Their tools arrive over <NuxtLink to="/ai-data/mcp">MCP</NuxtLink>, which is what the next page is about. A tool list is a permission set, and treating it as anything less casual than a firewall rule is a mistake.</p>
    </div>
  </section>

  <section class="unit" data-zone="stage">
    <p class="u-slot">honestly</p>
    <h2>What I would not let one near</h2>
    <div class="prose">
      <ul>
        <li><strong>Anything that sends.</strong> Email, messages, anything that leaves the house and cannot be recalled. A wrong message is not a wrong answer, it is a wrong action somebody else received.</li>
        <li><strong>The password store.</strong> Obviously, and worth stating anyway.</li>
        <li><strong>Infrastructure changes without review.</strong> An agent can open a pull request. Argo CD applies what is merged, and merging is mine.</li>
        <li><strong>Anything where I could not tell afterwards what it did.</strong> If the tool call is not logged, the tool is not offered.</li>
      </ul>
      <p>And the honest limitation: small local models are noticeably worse at multi-step reasoning than the hosted frontier ones. Agents here work best on narrow, well-shaped tasks and disappoint on open-ended ones — which, given the containment rules above, is a trade I am comfortable with.</p>
    </div>
  </section>

  <SitePager />
  <SiteFooter />
</template>
