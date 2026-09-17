<script setup lang="ts">
export interface Photo {
  /** File in public/photos/. Leave empty and the slot renders as a blank panel. */
  file?: string
  alt: string
  caption: string
  /** Intrinsic size, so the page does not jump while the image loads. */
  width?: number
  height?: number
  /** Let a photo take the full row. */
  wide?: boolean
}

defineProps<{ photos: Photo[] }>()
</script>

<template>
  <div class="shots">
    <figure
      v-for="photo in photos"
      :key="photo.caption"
      class="shot"
      :class="{ wide: photo.wide }"
    >
      <img
        v-if="photo.file"
        :src="`/photos/${photo.file}`"
        :alt="photo.alt"
        :width="photo.width"
        :height="photo.height"
        loading="lazy"
        decoding="async"
      >
      <!-- Same idea as a blanking panel: an empty slot should look deliberate. -->
      <div v-else class="shot-empty" aria-hidden="true">
        <span>photo slot</span>
        <code>public/photos/{{ photo.alt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28) }}.jpg</code>
      </div>
      <figcaption>{{ photo.caption }}</figcaption>
    </figure>
  </div>
</template>
