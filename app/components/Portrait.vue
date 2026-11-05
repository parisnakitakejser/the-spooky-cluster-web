<script setup lang="ts">
defineProps<{
  /** File in public/photos/. Empty renders a blank ring rather than a broken image. */
  file?: string
  alt: string
  caption?: string
}>()
</script>

<template>
  <figure class="portrait">
    <div class="portrait-ring" :class="{ empty: !file }">
      <img
        v-if="file"
        :src="`/photos/${file}`"
        :alt="alt"
        width="360"
        height="360"
        loading="lazy"
        decoding="async"
      >
      <!-- Until there is a photo, the ghost sits in for you. -->
      <svg v-else viewBox="0 0 100 100" class="portrait-ghost" role="img" :aria-label="alt">
        <path
          d="M 26,76 V 50 A 24 24 0 0 1 74,50 V 76 l -6,5 l -6,-5 l -6,5 l -6,-5 l -6,5 l -6,-5 l -6,5 l -6,-5 Z"
          fill="currentColor"
        />
        <circle cx="41" cy="46" r="5.5" fill="#0B0715" />
        <circle cx="59" cy="46" r="5.5" fill="#0B0715" />
        <circle cx="41" cy="46" r="2.2" fill="#22D3EE" />
        <circle cx="59" cy="46" r="2.2" fill="#22D3EE" />
      </svg>
    </div>
    <figcaption v-if="caption || !file">
      {{ caption ?? 'public/photos/portrait.jpg' }}
    </figcaption>
  </figure>
</template>
