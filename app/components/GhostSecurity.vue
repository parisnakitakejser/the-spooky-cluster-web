<template>
  <svg class="pgh" viewBox="0 0 100 100" role="img" aria-label="Security ghost, a scan line sweeping across a keyhole">
    <defs>
      <clipPath id="clip-sec">
        <path d="M 22,78 V 48 A 28 28 0 0 1 78,48 V 78 l -7,6 l -7,-6 l -7,6 l -7,-6 l -7,6 l -7,-6 l -7,6 l -7,-6 Z" />
      </clipPath>
    </defs>
    <path d="M 22,78 V 48 A 28 28 0 0 1 78,48 V 78 l -7,6 l -7,-6 l -7,6 l -7,-6 l -7,6 l -7,-6 l -7,6 l -7,-6 Z" fill="#F87171" />
    <g class="eyes">
      <circle cx="39" cy="42" r="6" fill="#150E28" /><circle cx="61" cy="42" r="6" fill="#150E28" />
      <circle cx="39" cy="42" r="2.5" fill="#CFFAFE" /><circle cx="61" cy="42" r="2.5" fill="#CFFAFE" />
    </g>
    <circle cx="50" cy="63" r="6" fill="#150E28" />
    <path d="M 47,63 L 53,63 L 55,76 L 45,76 Z" fill="#150E28" />
    <g clip-path="url(#clip-sec)">
      <rect class="scan" x="18" y="52" width="64" height="4" rx="2" fill="#150E28" />
    </g>
  </svg>
</template>
