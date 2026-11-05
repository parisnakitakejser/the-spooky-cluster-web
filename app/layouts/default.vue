<template>
  <a class="skip" href="#main">Skip to content</a>

  <RackRail />

  <div class="shell">
    <SiteHeader />

    <main id="main" class="wrap">
      <SectionBar />
      <slot />
    </main>
  </div>
</template>
