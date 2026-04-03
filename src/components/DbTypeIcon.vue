<template>
  <svg
    class="db-type-icon"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- MySQL - Blue rounded rectangle with stylized lines -->
    <template v-if="type === 'mysql'">
      <rect x="2" y="6" width="22" height="20" rx="3" fill="#00758F"/>
      <rect x="2" y="6" width="22" height="8" rx="3" fill="#4479A1"/>
      <rect x="6" y="10" width="14" height="2" rx="1" fill="rgba(255,255,255,0.9)"/>
      <rect x="6" y="14" width="10" height="2" rx="1" fill="rgba(255,255,255,0.6)"/>
      <rect x="6" y="18" width="12" height="2" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="6" y="22" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
      <path d="M26 12C28 12 30 14 30 17C30 20 28 22 26 22C24 22 23 20 24 18L26 16L25 15L26 12Z" fill="#F29111"/>
      <path d="M24.5 17C24.5 17 24 17.5 24 18C24 18.5 25 19.5 25.5 20C25.8 20.3 26 21 26 21.5" stroke="#F29111" stroke-width="1" stroke-linecap="round"/>
    </template>

    <!-- ClickHouse - Orange hexagon with stylized K -->
    <template v-else-if="type === 'clickhouse'">
      <path d="M16 3L27 10V22L16 29L5 22V10L16 3Z" fill="#FF9900"/>
      <path d="M16 3L27 10L16 17L5 10L16 3Z" fill="#FFCC00"/>
      <path d="M16 17V29L27 22V10L16 17Z" fill="rgba(0,0,0,0.12)"/>
      <path d="M21 11V21M21 11L14 16L21 21M21 11L15 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </template>

    <!-- MongoDB - Green leaf shape -->
    <template v-else-if="type === 'mongodb'">
      <path d="M16 2C8 2 2 8 2 16C2 20 4 24 8 26C10 27 12 27 14 26L18 22C20 20 20 18 20 16C20 14 20 12 18 10C16 8 14 7 14 7C14 7 14 5 16 4C17 3 16 2 16 2Z" fill="#47A248"/>
      <path d="M16 4C18 5 19 7 20 9C20 9 21 11 20 14C19 17 17 19 16 20C15 19 14 17 14 15C14 13 15 11 16 10" fill="#00ED64"/>
      <path d="M10 26C12 27 14 28 16 28C22 28 27 24 29 18C25 20 21 18 18 14" stroke="#00684A" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
    </template>

    <!-- Redis - Red rounded square with R -->
    <template v-else-if="type === 'redis'">
      <rect x="2" y="4" width="28" height="24" rx="5" fill="#DC382D"/>
      <rect x="2" y="4" width="28" height="8" rx="5" fill="#E85A4F"/>
      <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">R</text>
      <circle cx="10" cy="6" r="2" fill="#FF6B6B" opacity="0.8"/>
      <circle cx="22" cy="6" r="2" fill="#FF6B6B" opacity="0.8"/>
    </template>

    <!-- Default -->
    <template v-else>
      <rect x="4" y="6" width="24" height="20" rx="3" fill="#6B7280"/>
      <rect x="8" y="10" width="16" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
      <rect x="8" y="14" width="12" height="2" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="8" y="18" width="14" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type: string
  size?: number
}>(), {
  size: 32
})
</script>

<style scoped>
.db-type-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s ease;
}

.db-type-icon:hover {
  transform: scale(1.1);
}
</style>