<script setup lang="ts">
withDefaults(defineProps<{ home?: boolean }>(), { home: true })
</script>

<template>
  <footer class="foot">
    <span>{{ footerLine }}</span>
    <slot>
      <NuxtLink v-if="home" to="/">Home</NuxtLink>
    </slot>
  </footer>
</template>
