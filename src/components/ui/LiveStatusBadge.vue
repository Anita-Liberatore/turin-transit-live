<template>
  <div class="live-badge" :class="`live-badge--${state}`">
    <span v-if="state === 'connecting'" class="live-badge__spinner"></span>
    <span v-else-if="state === 'live'" class="live-badge__dot"></span>
    <span class="live-badge__text">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  connected:  { type: Boolean, default: false },
  connecting: { type: Boolean, default: false },
  count:      { type: Number,  default: null }
})

const state = computed(() => {
  if (props.connecting) return 'connecting'
  if (props.connected)  return 'live'
  return 'offline'
})

const label = computed(() => {
  if (props.connecting) return 'Connessione in corso…'
  if (props.connected)  return props.count != null ? `LIVE · ${props.count} mezzi` : 'LIVE'
  return 'Non connesso'
})
</script>

<style scoped>
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-base);
}

.live-badge--connecting {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  color: var(--color-text-muted);
}

.live-badge--live {
  background: rgba(39, 174, 96, 0.1);
  border-color: rgba(39, 174, 96, 0.3);
  color: var(--color-success);
}

.live-badge--offline {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  color: var(--color-text-muted);
}

.live-badge__dot {
  width: 8px;
  height: 8px;
  background: var(--color-realtime);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.live-badge__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-text-secondary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
</style>
