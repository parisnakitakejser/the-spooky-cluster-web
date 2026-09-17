<template>
  <header class="top">
    <div class="top-in">
      <GhostMini />
      <NuxtLink class="top-name" to="/">{{ siteName }}</NuxtLink>
      <nav class="top-scroll" aria-label="Main">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          class="top-link"
          :to="link.to"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
