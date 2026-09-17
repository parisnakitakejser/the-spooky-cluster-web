<script setup lang="ts">
import type { NuxtError } from '#app'

// error.vue renders outside the layout system, so the shell is repeated here.
const props = defineProps<{ error: NuxtError }>()

useSeoMeta({ title: `${props.error.statusCode} — the spooky cluster` })
</script>

<template>
  <div>
    <a class="skip" href="#main">Skip to content</a>

    <RackRail />

    <div class="shell">
      <SiteHeader />

      <main id="main" class="wrap">
        <SiteError :status-code="Number(error.statusCode) || 500" />
      </main>
    </div>
  </div>
</template>
