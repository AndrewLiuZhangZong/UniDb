<template>
  <svg
    class="db-type-icon"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <template v-if="type === 'mysql'">
      <!-- MySQL Icon - Blue Dolphin inspired -->
      <defs>
        <linearGradient id="mysqlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="24" height="16" rx="2" fill="url(#mysqlGrad)" />
      <ellipse cx="16" cy="12" rx="8" ry="2" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="16" cy="16" rx="8" ry="2" fill="rgba(255,255,255,0.2)" />
      <ellipse cx="16" cy="20" rx="8" ry="2" fill="rgba(255,255,255,0.1)" />
      <path d="M10 14h12M10 18h12" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
    </template>

    <template v-else-if="type === 'clickhouse'">
      <!-- ClickHouse Icon - Orange/Yellow hexagon -->
      <defs>
        <linearGradient id="chGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <path
        d="M16 4L26 10V22L16 28L6 22V10L16 4Z"
        fill="url(#chGrad)"
      />
      <path d="M16 4L26 10L16 16L6 10L16 4Z" fill="rgba(255,255,255,0.2)" />
      <path d="M16 16V28L26 22V10L16 16Z" fill="rgba(0,0,0,0.15)" />
      <circle cx="16" cy="14" r="3" fill="rgba(255,255,255,0.9)" />
      <path d="M13 20h6M13 23h4" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <template v-else-if="type === 'mongodb'">
      <!-- MongoDB Icon - Green leaf/seed shape -->
      <defs>
        <linearGradient id="mongoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <path
        d="M20 6C14 6 8 10 8 16C8 22 14 26 20 26C22 26 24 25 25 24L20 19L16 23C14 25 12 26 10 26C10 26 10 25 10 24C10 23 12 22 14 21L18 17L22 21C24 23 24 25 24 25C24 24 24 23 24 22C24 19 22 17 20 16L24 12C26 10 28 8 28 8C28 7 27 6 26 6C24 6 22 6 20 6Z"
        fill="url(#mongoGrad)"
      />
      <ellipse cx="14" cy="14" rx="2" ry="3" fill="rgba(255,255,255,0.4)" transform="rotate(-30 14 14)" />
    </template>

    <template v-else-if="type === 'redis'">
      <!-- Redis Icon - Red/Orange redis logo style -->
      <defs>
        <linearGradient id="redisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" fill="url(#redisGrad)" />
      <path
        d="M16 8C12 8 9 11 9 15C9 19 12 22 16 22"
        stroke="rgba(255,255,255,0.3)"
        stroke-width="2"
        fill="none"
      />
      <path
        d="M16 8C20 8 23 11 23 15C23 19 20 22 16 22"
        stroke="rgba(255,255,255,0.8)"
        stroke-width="2"
        fill="none"
      />
      <circle cx="12" cy="13" r="1.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="16" cy="11" r="1.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="20" cy="13" r="1.5" fill="rgba(255,255,255,0.9)" />
    </template>

    <template v-else>
      <!-- Default database icon -->
      <defs>
        <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="10" rx="10" ry="4" fill="url(#defaultGrad)" />
      <path d="M6 10V22C6 23.657 10.477 25 16 25C21.523 25 26 23.657 26 22V10" fill="url(#defaultGrad)" opacity="0.8" />
      <ellipse cx="16" cy="16" rx="10" ry="4" fill="rgba(255,255,255,0.1)" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type: string
  size?: number
}>(), {
  size: 32
})

// Color palettes for each database type
const colorMap: Record<string, [string, string]> = {
  mysql: ['#00758F', '#F29111'],      // Teal to Orange
  clickhouse: ['#FF9900', '#FFCC00'],   // Orange to Yellow
  mongodb: ['#47A248', '#00ED64'],      // Forest green to bright green
  redis: ['#DC382D', '#FF6B6B']         // Deep red to light red
}

const colors = computed(() => colorMap[props.type] || ['#6B7280', '#9CA3AF'])
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
