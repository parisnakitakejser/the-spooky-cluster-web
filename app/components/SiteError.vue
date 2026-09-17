<script setup lang="ts">
const props = defineProps<{ statusCode: number }>()

const is404 = computed(() => props.statusCode === 404)
</script>

<template>
  <PageHead
    :crumb="String(statusCode)"
    :heading="is404 ? 'That U is empty' : 'Something in the rack fell over'"
    :lede="is404
      ? 'Nothing is racked at this address. The slot may have been blanked off, or the URL is a typo.'
      : 'The server hit an error serving this page. The build log is the most likely place to find out why.'"
  >
    <template #ghost><GhostLog /></template>
    <template #tags>
      <ZoneChip zone="d">{{ statusCode }}</ZoneChip>
    </template>
  </PageHead>

  <section class="unit" data-zone="mgmt">
    <p class="u-slot">where to go</p>
    <h2>Back to something that exists</h2>
    <div class="prose">
      <ul>
        <li v-for="link in readingOrder" :key="link.to">
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </section>

  <SiteFooter />
</template>
